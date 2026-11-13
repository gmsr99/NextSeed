// Dados do "Rumo do ano" (P-13 fase 1): conteúdos do currículo por ano de
// escolaridade e progresso por criança. O plano em si é calculado em
// src/lib/annualPlan.ts; aqui só se vai buscar o que ele precisa.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { YEAR_MAP } from "@/lib/gcConstants";
import type { Child } from "@/lib/types";
import { useChildManuals } from "@/hooks/useChildManuals";
import {
  buildAnnualPlan, planWeekFor, weekFocus, schoolYearStartFor,
  type AnnualContent, type AnnualPlan, type PlanWeek,
} from "@/lib/annualPlan";

type ContentRow = AnnualContent & { school_year: string };

/** Conteúdos do currículo, agrupados por ano de escolaridade ("1" a "4"). */
export function useAnnualContents(dbYears: string[]) {
  const years = [...new Set(dbYears)].sort();
  return useQuery({
    queryKey: ["annual-contents", years],
    enabled: years.length > 0,
    staleTime: 24 * 60 * 60 * 1000, // dados estáticos
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_contents")
        .select("id, school_year, discipline, period, domain, content, sort_order")
        .in("school_year", years);
      if (error) throw error;
      const byYear: Record<string, AnnualContent[]> = {};
      for (const row of (data ?? []) as ContentRow[]) (byYear[row.school_year] ??= []).push(row);
      return byYear;
    },
  });
}

/** Estado de cada conteúdo, por criança: childId → contentId → estado. */
export function useChildrenProgress(childIds: string[]) {
  const ids = [...childIds].sort();
  return useQuery({
    queryKey: ["children-progress", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_content_progress")
        .select("child_id, content_id, status")
        .in("child_id", ids);
      if (error) throw error;
      const byChild: Record<string, Record<string, string>> = {};
      for (const r of data ?? []) (byChild[r.child_id] ??= {})[r.content_id] = r.status;
      return byChild;
    },
  });
}

export interface ChildWeekFocus {
  week: PlanWeek;
  totalWeeks: number;
  focus: Record<string, AnnualContent[]>;
}

/**
 * Plano anual de cada criança, para o ano letivo de uma data. Parte do currículo
 * (1.º ao 4.º ano) e, nas disciplinas com manual, do índice do manual. Uma
 * criança sem currículo carregado tem rumo desde que tenha um manual.
 */
export function useAnnualPlans(children: Child[], date: Date) {
  const withCurriculum = children.filter((c) => YEAR_MAP[c.school_year] && YEAR_MAP[c.school_year] !== "pre");
  const contents = useAnnualContents(withCurriculum.map((c) => YEAR_MAP[c.school_year]));
  const progress = useChildrenProgress(withCurriculum.map((c) => c.id));
  const { manuals, isLoading: loadingManuals } = useChildManuals();
  const start = schoolYearStartFor(date);
  const waitingContents = withCurriculum.length > 0 && !contents.data;

  const plans = useMemo(() => {
    const out: Record<string, AnnualPlan> = {};
    if (waitingContents) return out;
    const byYear: Record<string, AnnualPlan> = {};
    for (const child of children) {
      const y = YEAR_MAP[child.school_year];
      const list = (y && contents.data?.[y]) || [];
      const mine = manuals.filter((m) => m.child_id === child.id && m.entries.length > 0);
      if (list.length === 0 && mine.length === 0) continue;
      out[child.id] = mine.length > 0
        ? buildAnnualPlan(list, start, mine)
        : (byYear[y] ??= buildAnnualPlan(list, start));
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contents.data, waitingContents, manuals, start, children.map((c) => `${c.id}:${c.school_year}`).join(",")]);

  return {
    plans,
    progress: progress.data ?? {},
    isLoading: contents.isLoading || progress.isLoading || loadingManuals,
  };
}

/** Conteúdos em foco numa semana, por criança (só as que têm semana no rumo). */
export function useWeekFocus(children: Child[], weekStart: Date): Record<string, ChildWeekFocus> {
  const { plans, progress } = useAnnualPlans(children, weekStart);
  const t = weekStart.getTime();
  return useMemo(() => {
    const out: Record<string, ChildWeekFocus> = {};
    for (const [childId, plan] of Object.entries(plans)) {
      const date = new Date(t);
      const week = planWeekFor(plan, date);
      const focus = weekFocus(plan, date, (id) => progress[childId]?.[id] === "dominado");
      if (week && focus) out[childId] = { week, totalWeeks: plan.weeks.length, focus };
    }
    return out;
  }, [plans, progress, t]);
}
