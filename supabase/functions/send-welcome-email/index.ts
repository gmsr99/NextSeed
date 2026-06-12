import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Email de boas-vindas enviado após o registo. O destinatário vem do JWT do
// utilizador autenticado (não é falsificável). verify_jwt=true.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "geral@nexseed.pt";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://nexseed.pt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    if (userErr || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const familyName = typeof body?.familyName === "string" && body.familyName.trim()
      ? body.familyName.trim()
      : "a vossa família";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [user.email],
        subject: "Bem-vindos à NexSeed 🌱",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">
            <h1 style="color:#2D4A2D;">NexSeed 🌱</h1>
            <p>Olá, <strong>${familyName}</strong>!</p>
            <p>Que bom ter-vos aqui. A NexSeed é a vossa companheira de ensino doméstico: tratamos do planeamento pesado para que fiquem com a parte boa — aprender com os vossos filhos.</p>
            <p>Funciona em quatro passos simples:</p>
            <ul style="line-height:1.7;">
              <li><strong>Planear</strong> — geramos um plano semanal para cada criança.</li>
              <li><strong>Fazer</strong> — recebem-no em PDF, com horário e materiais.</li>
              <li><strong>Registar</strong> — anotam no Diário o que foram fazendo.</li>
              <li><strong>Provar</strong> — vira portfólio e relatórios para a escola, sem trabalho extra.</li>
            </ul>
            <div style="margin:32px 0;">
              <a href="${SITE_URL}/onboarding"
                style="background:#2D4A2D;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                Configurar a nossa família
              </a>
            </div>
            <p style="color:#6B7280;font-size:14px;">
              Têm dúvidas? O <a href="${SITE_URL}/ajuda" style="color:#2D4A2D;">Manual de Instruções</a> está sempre disponível dentro da app.
            </p>
            <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
            <p style="color:#9CA3AF;font-size:12px;">NexSeed · Plataforma de Homeschooling</p>
          </div>
        `,
      }),
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
