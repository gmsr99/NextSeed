// Catecismo em família (I-08, fase 2; migração 038). Vive dentro da linha da
// Tradição da família: desligar a tradição apaga também o catecismo. Sem a
// migração aplicada, available=false e o resto da tradição funciona como antes.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { normalizeCatechism, type CatechismQuestion, type FamilyCatechism } from "@/lib/tradicao/catechism";

type Result = { available: boolean; catechism: FamilyCatechism | null };

async function load(familyId: string): Promise<Result> {
  const { data, error } = await supabase
    .from("family_traditions")
    .select("catechism_name, catechism_questions, catechism_pos")
    .eq("family_id", familyId)
    .maybeSingle();
  if (error) return { available: false, catechism: null };
  if (!data) return { available: true, catechism: null };
  const row = data as { catechism_name: unknown; catechism_questions: unknown; catechism_pos: unknown };
  const c = normalizeCatechism(row.catechism_name, row.catechism_questions, row.catechism_pos);
  return { available: true, catechism: c.questions.length ? c : null };
}

/** Para usar fora de componentes (PDF do plano). */
export async function fetchFamilyCatechism(familyId: string): Promise<FamilyCatechism | null> {
  return (await load(familyId)).catechism;
}

export function useFamilyCatechism(enabled = true) {
  const { family } = useAuth();
  const qc = useQueryClient();
  const key = ["family-catechism", family?.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!family && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: () => load(family!.id),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  // A linha da tradição já existe (só se mostra com a tradição ligada): atualiza-se
  const update = async (patch: Record<string, unknown>) => {
    const { error } = await supabase
      .from("family_traditions")
      .update({ ...patch, updated_at: new Date().toISOString() } as never)
      .eq("family_id", family!.id);
    if (error) throw error;
  };

  const save = useMutation({
    mutationFn: (c: { name: string; questions: CatechismQuestion[]; pos: number }) =>
      update({ catechism_name: c.name.trim() || null, catechism_questions: c.questions, catechism_pos: Math.max(0, c.pos) }),
    onSuccess: invalidate,
  });

  /** "Já sabem de cor": passa à pergunta seguinte (ou volta atrás, com -1). */
  const step = useMutation({
    mutationFn: (delta: 1 | -1) => {
      const c = data?.catechism;
      if (!c) return Promise.resolve();
      const pos = Math.min(c.questions.length, Math.max(0, c.pos + delta));
      return update({ catechism_pos: pos });
    },
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: () => update({ catechism_name: null, catechism_questions: [], catechism_pos: 0 }),
    onSuccess: invalidate,
  });

  return { catechism: data?.catechism ?? null, available: !!data?.available, isLoading, save, step, clear };
}
