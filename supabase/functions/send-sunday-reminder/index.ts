import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Lembrete de domingo (DASH fase 5, P-26; migração 033).
// Chamado pelo pg_cron ao domingo às 19h e 20h UTC. Só envia quando em Lisboa
// são 20h, uma vez por família e semana, para o responsável da conta
// (families.email), se:
//   - a família não desligou o lembrete (family_notification_prefs);
//   - ainda não há plano para a semana que começa amanhã;
//   - a semana que vem não é pausa (calendário da família, ou as férias
//     habituais do Natal e do verão quando não há calendário);
//   - tem o arranque feito e pelo menos uma criança.
// Não envia nada sobre as crianças: nem nomes, nem conteúdos.
// verify_jwt=true; além disso, só aceita a service role key (o pedido do cron).

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "geral@nexseed.pt";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://nexseed.pt";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function lisbonNow(): { weekday: string; hour: number; date: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Lisbon", weekday: "short", hour: "2-digit", hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return { weekday: parts.weekday, hour: Number(parts.hour), date: `${parts.year}-${parts.month}-${parts.day}` };
}

function addDaysIso(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

type Break = { from: string; to: string };
type Calendar = { year_start: string; year_end: string; breaks: Break[] | null } | null;

/** A semana que começa nesta segunda é de pausa? */
function isPause(monday: string, cal: Calendar): boolean {
  const friday = addDaysIso(monday, 4);
  if (cal) {
    if (friday < cal.year_start || monday > cal.year_end) return true;
    // pausa se pelo menos 3 dos 5 dias estão numa pausa (como no rumo)
    let off = 0;
    for (let i = 0; i < 5; i++) {
      const d = addDaysIso(monday, i);
      if ((cal.breaks ?? []).some((b) => d >= b.from && d <= b.to)) off++;
    }
    return off >= 3;
  }
  const md = monday.slice(5);
  // Sem calendário próprio: férias do Natal e do verão do calendário escolar
  return md >= "12-20" || md <= "01-02" || (md >= "06-29" && md <= "09-07");
}

const html = () => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">
    <h1 style="color:#2D4A2D;font-size:22px;">NexSeed 🌱</h1>
    <p>A semana que vem já tem rumo.</p>
    <p>Quando tiverem dois minutos, geramos o plano juntos: a NexSeed parte do que o rumo traz e do que ficou desta semana.</p>
    <div style="margin:28px 0;">
      <a href="${SITE_URL}/weekly-planner"
        style="background:#2D4A2D;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
        Preparar a semana
      </a>
    </div>
    <p style="color:#6B7280;font-size:13px;">Se esta semana for de descanso, não precisam de fazer nada.</p>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
    <p style="color:#9CA3AF;font-size:12px;">
      Recebem este lembrete ao domingo, só quando a semana seguinte ainda não tem plano.
      Podem desligá-lo em <a href="${SITE_URL}/settings" style="color:#6B7280;">Definições</a>.
    </p>
  </div>`;

serve(async (req) => {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || token !== SERVICE_KEY) return json({ error: "Unauthorized" }, 401);

  const now = lisbonNow();
  // ?teste=<family_id>: envia já, só para essa família (para experimentar)
  const onlyFamily = new URL(req.url).searchParams.get("teste");
  if (!onlyFamily && (now.weekday !== "Sun" || now.hour !== 20)) return json({ ok: true, skipped: "fora de horas", now });

  const idx = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(now.weekday);
  const nextMonday = addDaysIso(now.date, 7 - idx);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, SERVICE_KEY);

  const [{ data: families }, { data: prefs }, { data: plans }, { data: sent }, { data: calendars }, { data: kids }] = await Promise.all([
    admin.from("families").select("id, email, onboarding_completed_at"),
    admin.from("family_notification_prefs").select("family_id, sunday_reminder"),
    admin.from("weekly_plans").select("family_id").eq("week_start", nextMonday),
    admin.from("sunday_reminders_sent").select("family_id").eq("week_start", nextMonday),
    admin.from("family_calendars").select("family_id, year_start, year_end, breaks"),
    admin.from("children").select("family_id"),
  ]);

  const off = new Set((prefs ?? []).filter((p) => p.sunday_reminder === false).map((p) => p.family_id));
  const planned = new Set((plans ?? []).map((p) => p.family_id));
  const already = new Set((sent ?? []).map((s) => s.family_id));
  const withKids = new Set((kids ?? []).map((k) => k.family_id));
  const calBy = new Map((calendars ?? []).map((c) => [c.family_id, c as Calendar]));

  const results: { family: string; result: string }[] = [];
  for (const f of families ?? []) {
    if (onlyFamily && f.id !== onlyFamily) continue;
    const skip =
      !f.email ? "sem email"
      : !f.onboarding_completed_at ? "arranque por fazer"
      : !withKids.has(f.id) ? "sem crianças"
      : off.has(f.id) ? "desligado"
      : planned.has(f.id) ? "já tem plano"
      : already.has(f.id) ? "já enviado"
      : isPause(nextMonday, calBy.get(f.id) ?? null) ? "pausa"
      : null;
    if (skip) { results.push({ family: f.id, result: skip }); continue; }

    // Regista antes de enviar: se o cron correr duas vezes, a segunda falha aqui
    const { error: logErr } = await admin.from("sunday_reminders_sent").insert({ family_id: f.id, week_start: nextMonday });
    if (logErr) { results.push({ family: f.id, result: "já enviado" }); continue; }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [f.email], subject: "A semana que vem já tem rumo 🌱", html: html() }),
    });
    if (!res.ok) {
      await admin.from("sunday_reminders_sent").delete().eq("family_id", f.id).eq("week_start", nextMonday);
      results.push({ family: f.id, result: `erro ${res.status}` });
    } else {
      results.push({ family: f.id, result: "enviado" });
    }
  }
  return json({ ok: true, week_start: nextMonday, results });
});
