// A nossa semana (P-18). Tabela family_week_routines (migração 030).
// Sem linha (ou antes de a migração estar aplicada), fica a semana de sempre.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { normalizeRoutine, type WeekRoutine } from "@/lib/familyRoutine";

type Result = { available: boolean; routine: WeekRoutine | null };

async function load(familyId: string): Promise<Result> {
  const { data, error } = await supabase
    .from("family_week_routines")
    .select("days, outing")
    .eq("family_id", familyId)
    .maybeSingle();
  if (error) return { available: false, routine: null };
  if (!data) return { available: true, routine: null };
  return { available: true, routine: normalizeRoutine(data.days, data.outing) };
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
      const { error } = await supabase.from("family_week_routines").upsert(
        { family_id: family!.id, days: r.days, outing: r.outing, updated_at: new Date().toISOString() },
        { onConflict: "family_id" },
      );
      if (error) throw error;
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
