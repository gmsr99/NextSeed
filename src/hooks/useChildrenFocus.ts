import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { YEAR_MAP } from "@/lib/gcConstants";
import type { Child } from "@/lib/types";

/**
 * Crianças com currículo que ainda não têm nenhum conteúdo marcado como
 * "em progresso" nas Áreas de Aprendizagem (backlog P-02, doc 10 INS-06).
 * Sem marcação, o plano parte dos conteúdos do período atual (P-01); com ela,
 * parte do que a família está realmente a trabalhar.
 */
export function useChildrenWithoutFocus(children: Child[]) {
  const ids = children.filter((c) => YEAR_MAP[c.school_year]).map((c) => c.id);

  const { data: withFocus } = useQuery({
    queryKey: ["children-focus", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_content_progress")
        .select("child_id")
        .in("child_id", ids)
        .eq("status", "em_progresso");
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.child_id as string));
    },
  });

  // Enquanto carrega (ou se falhar), não mostra avisos: melhor nada do que um aviso errado.
  if (!withFocus) return new Set<string>();
  return new Set(ids.filter((id) => !withFocus.has(id)));
}
