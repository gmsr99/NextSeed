import { supabase } from "@/lib/supabase";
import type { TriggerState } from "@/lib/feedback/engine";
import { DAY_MS } from "@/lib/feedback/time";

// Acesso à tabela feedback_trigger_state e feedback_config.
// A RLS restringe tudo ao utilizador autenticado.

/** Lê todo o estado de gatilhos do utilizador, indexado por key. */
export async function fetchAllTriggerState(): Promise<Record<string, TriggerState>> {
  const { data } = await supabase
    .from("feedback_trigger_state")
    .select("key, counter, shown_count, last_shown_at, scheduled_for, consumed");
  const out: Record<string, TriggerState> = {};
  for (const row of data ?? []) out[row.key] = row;
  return out;
}

/** Incremento atómico de um contador; devolve o novo valor (0 em erro). */
export async function bumpCounter(key: string): Promise<number> {
  const { data, error } = await supabase.rpc("bump_trigger_counter", { p_key: key });
  if (error || typeof data !== "number") return 0;
  return data;
}

/** Marca uma linha como mostrada agora (shown_count+1, last_shown_at=now). */
export async function markShown(key: string): Promise<void> {
  const existing = await supabase
    .from("feedback_trigger_state")
    .select("shown_count")
    .eq("key", key)
    .maybeSingle();
  const shown = (existing.data?.shown_count ?? 0) + 1;
  await supabase
    .from("feedback_trigger_state")
    .upsert(
      { key, shown_count: shown, last_shown_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" },
    );
}

/** Marca uma linha como consumida para sempre (Instrumento A, C_Q7). */
export async function markConsumed(key: string): Promise<void> {
  await supabase
    .from("feedback_trigger_state")
    .upsert(
      { key, consumed: true, shown_count: 1, last_shown_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" },
    );
}

/** Agenda o Instrumento B2 para 7 dias depois (o plano mais recente ganha). */
export async function scheduleB2(planId: string | null): Promise<void> {
  await supabase
    .from("feedback_trigger_state")
    .upsert(
      {
        key: "B2",
        scheduled_for: new Date(Date.now() + 7 * DAY_MS).toISOString(),
        meta: planId ? { plan_id: planId } : {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" },
    );
}

/** Limpa o agendamento do B2 (após mostrar). */
export async function clearB2Schedule(): Promise<void> {
  await supabase
    .from("feedback_trigger_state")
    .update({ scheduled_for: null, updated_at: new Date().toISOString() })
    .eq("key", "B2");
}

/** Conjunto de flags de config ativas (value === true). */
export async function fetchActiveConfigFlags(): Promise<Set<string>> {
  const { data } = await supabase.from("feedback_config").select("key, value");
  const flags = new Set<string>();
  for (const row of data ?? []) {
    if (row.value === true) flags.add(row.key);
  }
  return flags;
}
