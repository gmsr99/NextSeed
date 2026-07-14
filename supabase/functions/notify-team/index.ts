import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Notifica a equipa (email via Resend) sobre eventos de feedback urgentes:
//   - Instrumento A: alerta de fricção (falhou o 1.º plano na 1.ª semana)
//   - Instrumento D: cada submissão do botão «Conta-nos»
//
// Segurança: o cliente envia apenas { submissionId }. A função carrega a
// submissão com a service role e valida que pertence ao utilizador do JWT — o
// conteúdo do email nunca vem do cliente. verify_jwt=true.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "geral@nexseed.pt";
const TEAM_EMAIL = Deno.env.get("TEAM_EMAIL") ?? "geral@nexseed.pt";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://nexseed.pt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Torna um valor jsonb de resposta legível em texto.
function renderValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value !== "object") return esc(value);
  const v = value as Record<string, unknown>;
  if (typeof v.text === "string") return esc(v.text);
  if (typeof v.choice === "string") return esc(v.choice);
  if (Array.isArray(v.choices)) {
    const base = v.choices.map(esc).join(", ");
    return v.other ? `${base} (Outra: ${esc(v.other)})` : base;
  }
  if (typeof v.number === "number") return `${v.number} €`;
  if (typeof v.screenshot_path === "string") return "[screenshot em anexo]";
  return esc(JSON.stringify(value));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const submissionId = typeof body?.submissionId === "string" ? body.submissionId : null;
    if (!submissionId) {
      return new Response(JSON.stringify({ error: "submissionId em falta" }), { status: 400, headers: corsHeaders });
    }

    // Service role: lê a submissão + respostas e VALIDA a posse.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: submission, error: subErr } = await admin
      .from("feedback_submissions")
      .select("id, user_id, instrument, ecra_origem, app_version, evento_gatilho, created_at")
      .eq("id", submissionId)
      .maybeSingle();

    if (subErr || !submission) {
      return new Response(JSON.stringify({ error: "Submissão não encontrada" }), { status: 404, headers: corsHeaders });
    }
    if (submission.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { data: answers } = await admin
      .from("feedback_answers")
      .select("question_key, value")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true });

    const answerRows = answers ?? [];
    const byKey = new Map(answerRows.map((a) => [a.question_key, a.value]));

    // Signed URL para o screenshot do Instrumento D, se existir.
    let screenshotUrl: string | null = null;
    const shot = byKey.get("D_screenshot") as { screenshot_path?: string } | undefined;
    if (shot?.screenshot_path) {
      const { data: signed } = await admin.storage
        .from("feedback-screenshots")
        .createSignedUrl(shot.screenshot_path, 604800); // 7 dias
      screenshotUrl = signed?.signedUrl ?? null;
    }

    const isFrictionAlert = submission.instrument === "A";
    const tipo = renderValue(byKey.get("D_tipo"));
    const subject = isFrictionAlert
      ? "⚠️ Alerta de fricção — 1.ª semana (NexSeed)"
      : `💬 Novo feedback (Conta-nos): ${tipo}`;

    const rowsHtml = answerRows
      .filter((a) => a.question_key !== "D_screenshot")
      .map(
        (a) => `<tr>
          <td style="padding:6px 10px;border:1px solid #E5E7EB;color:#6B7280;font-size:13px;vertical-align:top;">${esc(a.question_key)}</td>
          <td style="padding:6px 10px;border:1px solid #E5E7EB;color:#1f2937;font-size:14px;">${renderValue(a.value)}</td>
        </tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#1f2937;">
        <h2 style="color:#2D4A2D;">${isFrictionAlert ? "Alerta de fricção" : "Novo feedback"}</h2>
        <p style="color:#6B7280;font-size:14px;">
          Instrumento <strong>${esc(submission.instrument)}</strong> ·
          ${esc(user.email ?? "utilizador")} ·
          ${esc(submission.created_at)}
        </p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          ${rowsHtml || '<tr><td style="padding:6px 10px;">(sem respostas)</td></tr>'}
        </table>
        ${screenshotUrl ? `<p><a href="${screenshotUrl}" style="color:#2D4A2D;">Ver screenshot anexado</a> (link válido 7 dias)</p>` : ""}
        <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0;" />
        <p style="color:#9CA3AF;font-size:12px;">
          Ecrã: ${esc(submission.ecra_origem ?? "—")} · Versão: ${esc(submission.app_version ?? "—")} ·
          Gatilho: ${esc(submission.evento_gatilho ?? "—")}<br/>
          Dashboard: <a href="${SITE_URL}/admin/feedback" style="color:#2D4A2D;">${SITE_URL}/admin/feedback</a>
        </p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [TEAM_EMAIL], subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
