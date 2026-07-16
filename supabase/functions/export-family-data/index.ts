import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Export de dados RGPD (FASE 4.5) — devolve um JSON com todos os dados da
// família. Usa o JWT do próprio utilizador, por isso a RLS garante que só
// saem dados a que ele tem acesso. verify_jwt=true.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Tabelas com dados da família/utilizador (a RLS filtra por família)
const TABLES = [
  "families",
  "family_members",
  "children",
  "weekly_plans",
  "weekly_plan_items",
  "activities",
  "projects",
  "curriculum_coverage",
  "child_milestones",
  "extracurricular_activities",
  "calendar_events",
  "world_missions",
  "mission_completions",
  "mission_rewards",
  "reward_redemptions",
  "literacy_progress",
  "child_content_progress",
  "family_methodologies",
  "feedback_submissions",
  "feedback_answers",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
  );

  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Sessão inválida" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const data: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    const { data: rows, error } = await userClient.from(table).select("*");
    // Best-effort por tabela: uma falha não deve impedir o resto do export
    data[table] = error ? [] : (rows ?? []);
  }

  const payload = {
    app: "NexSeed",
    exported_at: new Date().toISOString(),
    requested_by: user.email ?? user.id,
    data,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
