// A nossa semana (P-18). Tabela family_week_routines (migração 030).
// Sem linha (ou antes de a migração estar aplicada), fica a semana de sempre.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { normalizeRoutine, serializeRoutine, type WeekRoutine } from "@/lib/familyRoutine";

type Result = { available: boolean; routine: WeekRoutine | null };

async function load(familyId: string): Promise<Result> {
  // P-27: schedule_mode vem com a migração 036; antes dela, lê-se sem a coluna
  let res = await supabase
    .from("family_week_routines")
    .select("days, outing, schedule_mode")
    .eq("family_id", familyId)
    .maybeSingle();
  if (res.error) {
    res = await supabase.from("family_week_routines").select("days, outing").eq("family_id", familyId).maybeSingle() as typeof res;
  }
  const { data, error } = res;
  if (error) return { available: false, routine: null };
  if (!data) return { available: true, routine: null };
  return { available: true, routine: normalizeRoutine(data.days, data.outing, (data as { schedule_mode?: string }).schedule_mode) };
}

/** Para usar fora de componentes (geração do plano). Null = semana de sempre. */
export async function fetchFamilyRoutine(familyId: string): Promise<WeekRoutine | null> {
  return (await load(familyId)).routine;
}

export function useFamilyRoutine() {
  const { family } = useAuth();
  const qc = useQueryClient();
  const key = ["family-routine", family?.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!family,
    staleTime: 5 * 60 * 1000,
    queryFn: () => load(family!.id),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const save = useMutation({
    mutationFn: async (r: WeekRoutine) => {
      // P-30: dias com saída guardam-se como {m, o} dentro de days (sem migração)
      const { days, outing } = serializeRoutine(r);
      const row = { family_id: family!.id, days, outing, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("family_week_routines").upsert(
        { ...row, schedule_mode: r.hours ? "horas" : "blocos" },
        { onConflict: "family_id" },
      );
      if (!error) return;
      // Antes da migração 036 não há schedule_mode: guarda o resto
      if (!/schedule_mode/.test(error.message ?? "")) throw error;
      const { error: e2 } = await supabase.from("family_week_routines").upsert(row, { onConflict: "family_id" });
      if (e2) throw e2;
      if (r.hours) throw new Error("A opção das horas fica disponível depois de uma atualização da base de dados.");
    },
    onSuccess: invalidate,
  });

  const reset = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("family_week_routines").delete().eq("family_id", family!.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { routine: data?.routine ?? null, available: !!data?.available, isLoading, save, reset };
}
