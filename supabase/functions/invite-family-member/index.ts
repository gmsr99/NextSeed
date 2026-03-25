import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "geral@nextseed.pt";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://nexseed.vercel.app";

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

    // Cliente com JWT do utilizador chamador
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Cliente admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verificar utilizador autenticado
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Obter family_id e nome da família
    const { data: familyId } = await supabaseUser.rpc("my_family_id");
    if (!familyId) {
      return new Response(JSON.stringify({ error: "Família não encontrada" }), { status: 404, headers: corsHeaders });
    }

    const { data: familyData } = await supabaseUser
      .from("families")
      .select("name")
      .eq("id", familyId)
      .single();
    const familyName = familyData?.name ?? "a família";

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email inválido" }), { status: 400, headers: corsHeaders });
    }

    // Gera o link de convite sem enviar email (Supabase Admin)
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        data: { family_id: familyId },
        redirectTo: `${SITE_URL}/accept-invite`,
      },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      return new Response(
        JSON.stringify({ error: linkErr?.message ?? "Não foi possível gerar o link de convite." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const inviteLink = linkData.properties.action_link;

    // Envia email via Resend com template branded
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Convite para juntar-te à família ${familyName} no NexSeed`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h1 style="color:#2D4A2D;">NexSeed 🌱</h1>
            <p>Olá!</p>
            <p>Foste convidado(a) para te juntares à família <strong>${familyName}</strong> no NexSeed — a plataforma de homeschooling.</p>
            <p>Clica no botão abaixo para criar a tua conta e começar:</p>
            <div style="margin:32px 0;">
              <a href="${inviteLink}"
                style="background:#2D4A2D;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                Aceitar convite
              </a>
            </div>
            <p style="color:#6B7280;font-size:13px;">
              Se não esperavas este convite, podes ignorar este email.
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

    // Regista o convite na tabela
    await supabaseAdmin.from("family_invites").upsert({
      family_id: familyId,
      email: email.toLowerCase(),
      invited_by: user.id,
      status: "pending",
    }, { onConflict: "family_id,email" });

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
