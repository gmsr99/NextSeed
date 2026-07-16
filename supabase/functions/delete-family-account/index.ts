import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Eliminação de conta RGPD-completa (FASE 4.5).
// - Dono da família: apaga ficheiros do Storage (fotos de atividades da família
//   + screenshots de feedback de todos os membros) e depois os utilizadores
//   auth (membros e dono). O FK families.user_id → auth.users ON DELETE CASCADE
//   arrasta a família e, em cascata, todos os dados (children, plans, activities…).
// - Membro convidado: apaga apenas os seus screenshots e o seu utilizador auth
//   (a linha em family_members cai em cascata); os dados da família ficam.
// verify_jwt=true — só utilizadores autenticados chegam aqui.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// deno-lint-ignore no-explicit-any
async function listAllFiles(admin: any, bucket: string, prefix: string): Promise<string[]> {
  const files: string[] = [];
  const stack = [prefix];
  while (stack.length) {
    const cur = stack.pop()!;
    const { data } = await admin.storage.from(bucket).list(cur, { limit: 1000 });
    for (const entry of data ?? []) {
      const path = cur ? `${cur}/${entry.name}` : entry.name;
      // Ficheiros têm `id`; entradas de "pasta" (prefixos) não
      if (entry.id) files.push(path);
      else stack.push(path);
    }
  }
  return files;
}

// deno-lint-ignore no-explicit-any
async function removePrefix(admin: any, bucket: string, prefix: string) {
  const files = await listAllFiles(admin, bucket, prefix);
  if (files.length) await admin.storage.from(bucket).remove(files);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  // Cliente com o JWT do utilizador — identifica quem pede
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "Sessão inválida" }, 401);

  // Cliente service role — operações administrativas
  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const { data: family } = await admin
      .from("families")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (family) {
      // ── Dono: eliminação total da família ──────────────────────────────
      const { data: members } = await admin
        .from("family_members")
        .select("user_id")
        .eq("family_id", family.id);
      const memberIds: string[] = (members ?? [])
        .map((m: { user_id: string }) => m.user_id)
        .filter((id: string) => id !== user.id);

      // Storage primeiro (depois de apagar os users deixava de haver referência)
      await removePrefix(admin, "activity-photos", family.id);
      for (const uid of [...memberIds, user.id]) {
        await removePrefix(admin, "feedback-screenshots", uid);
      }

      // Membros primeiro, dono no fim — a família cai em cascata com o dono
      for (const uid of memberIds) {
        await admin.auth.admin.deleteUser(uid);
      }
      await admin.auth.admin.deleteUser(user.id);
      return json({ ok: true, scope: "family" }, 200);
    }

    // ── Membro convidado: apaga só a própria conta ────────────────────────
    await removePrefix(admin, "feedback-screenshots", user.id);
    await admin.auth.admin.deleteUser(user.id);
    return json({ ok: true, scope: "member" }, 200);
  } catch (e) {
    return json({ error: `Falha ao eliminar a conta: ${String((e as Error)?.message ?? e)}` }, 500);
  }
});
