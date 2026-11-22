// Ritmo do ano para o Início (DASH §7, fase 4). Junta o rumo de cada criança,
// o estado dos temas (com a data em que foram marcados, para o ritmo recente)
// e os manuais.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Child } from "@/lib/types";
import { useAnnualPlans } from "@/hooks/useAnnualPlan";
import { useChildManuals } from "@/hooks/useChildManuals";
import { disciplinePaces, sumSteps, yearClock, type DisciplinePace, type Steps, type YearClock } from "@/lib/dashboard";

export interface ChildYear {
  child: Child;
  disciplines: DisciplinePace[];
  steps: Steps;
}

export function useDashboardYear(children: Child[], today: Date) {
  const { plans, progress, isLoading } = useAnnualPlans(children, today);
  const { manuals } = useChildManuals();
  const ids = children.map((c) => c.id).sort();

  const { data: updatedAt = {} } = useQuery({
    queryKey: ["progress-dates", ids],
    enabled: ids.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_content_progress")
        .select("child_id, content_id, updated_at")
        .in("child_id", ids);
      if (error) return {};
      const out: Record<string, Record<string, string>> = {};
      for (const r of data ?? []) if (r.updated_at) (out[r.child_id] ??= {})[r.content_id] = r.updated_at;
      return out;
    },
  });

  return useMemo(() => {
    const rows: ChildYear[] = [];
    let clock: YearClock | null = null;
    for (const child of children) {
      const plan = plans[child.id];
      if (!plan) continue;
      clock ??= yearClock(plan, today);
      const mine = manuals.filter((m) => m.child_id === child.id && m.entries.length > 0);
      const disciplines = disciplinePaces(plan, progress[child.id] ?? {}, updatedAt[child.id] ?? {}, mine, today);
      if (disciplines.length > 0) rows.push({ child, disciplines, steps: sumSteps(disciplines) });
    }
    return { rows, clock, total: sumSteps(rows.map((r) => r.steps)), plans, progress, isLoading };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, progress, updatedAt, manuals, isLoading, today.toDateString(), ids.join(",")]);
}
