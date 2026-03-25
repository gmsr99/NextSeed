import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "geral@nextseed.pt";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
const ADMIN_EMAIL_2 = Deno.env.get("ADMIN_EMAIL_2");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, familyName, weekLabel, scheduleB64, guideB64, scheduleName, guideName } =
      await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [
          to,
          ...(ADMIN_EMAIL && ADMIN_EMAIL !== to ? [ADMIN_EMAIL] : []),
          ...(ADMIN_EMAIL_2 && ADMIN_EMAIL_2 !== to ? [ADMIN_EMAIL_2] : []),
        ],
        subject: `NexSeed — Plano da semana de ${weekLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h1 style="color:#2D4A2D;">NexSeed 🌱</h1>
            <p>Olá, <strong>${familyName}</strong>!</p>
            <p>O plano da semana de <strong>${weekLabel}</strong> está pronto.</p>
            <p>Em anexo encontras:</p>
            <ul>
              <li><strong>Horário Semanal</strong> — blocos de tempo e atividades de cada dia</li>
              <li><strong>Guia de Atividades</strong> — descrição passo a passo e lista de materiais</li>
            </ul>
            <p style="color:#6B7280;font-size:14px;">Bom trabalho esta semana! 🌿</p>
            <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
            <p style="color:#9CA3AF;font-size:12px;">NexSeed · Plataforma de Homeschooling</p>
          </div>
        `,
        attachments: [
          { filename: scheduleName, content: scheduleB64 },
          { filename: guideName, content: guideB64 },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
