// Índices de manuais da família (I-01). Tabela child_manuals (migração 026).
// Enquanto a migração não estiver publicada, `available` fica a false e a app
// continua a funcionar só com o currículo.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Manual, ManualEntry } from "@/lib/manualIndex";
import type { Json } from "@/lib/types";

export interface ChildManual extends Manual {
  id: string;
  child_id: string;
}

/** Lê os manuais da família; devolve null se a tabela ainda não existir. */
export async function fetchChildManuals(familyId: string): Promise<ChildManual[] | null> {
  const { data, error } = await supabase
    .from("child_manuals")
    .select("id, child_id, discipline, title, entries, start_date")
    .eq("family_id", familyId);
  if (error) return null;
  return (data ?? []).map((r) => ({ ...r, entries: Array.isArray(r.entries) ? (r.entries as unknown as ManualEntry[]) : [] }));
}

export function useChildManuals() {
  const { family } = useAuth();
  const qc = useQueryClient();
  const key = ["child-manuals", family?.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!family,
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchChildManuals(family!.id),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const save = useMutation({
    mutationFn: async (m: { child_id: string; discipline: string; title: string; entries: ManualEntry[]; start_date: string }) => {
      const { error } = await supabase
        .from("child_manuals")
        .upsert(
          { ...m, entries: m.entries as unknown as Json, family_id: family!.id, updated_at: new Date().toISOString() },
          { onConflict: "child_id,discipline" },
        );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("child_manuals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { manuals: data ?? [], available: data !== null && data !== undefined, isLoading, save, remove };
}
