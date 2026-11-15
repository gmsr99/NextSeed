// Fecho da semana e ritmo do ano (P-14, P-19, P-20).
//
// Regra de atraso sem culpa: o que ficou "em progresso" volta nas semanas
// seguintes, ao lado dos conteúdos novos da semana, no máximo dois por
// disciplina. Nada se acumula como dívida.
import type { AnnualContent, AnnualPlan } from "./annualPlan";
import { mondayOf, planWeekFor } from "./annualPlan";

export const MAX_CARRY_OVER = 2;

/**
 * Conteúdos a enviar ao plano: os da semana (rumo) e, por cima, até dois por
 * disciplina que ficaram por consolidar. Sem foco (pausas, balanço), só os
 * que ficaram por consolidar.
 */
export function mergeWeekContents(
  focus: Record<string, string[]> | null | undefined,
  inProgress: Record<string, string[]>,
  max = MAX_CARRY_OVER,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [d, list] of Object.entries(focus ?? {})) out[d] = list.map((c) => `[a aprender] ${c}`);
  for (const [d, list] of Object.entries(inProgress)) {
    const already = new Set(focus?.[d] ?? []);
    const extra = list.filter((c) => !already.has(c)).slice(0, max).map((c) => `[retomar] ${c}`);
    if (extra.length) out[d] = [...(out[d] ?? []), ...extra];
  }
  return out;
}

export interface Pace {
  /** Conteúdos do currículo previstos até à semana anterior à de referência */
  planned: number;
  mastered: number;
  /** Previstos e marcados como "em progresso" */
  inProgress: number;
}

/** Ritmo do ano até à semana de uma data (sem contar essa semana nem os manuais). */
export function paceUntil(plan: AnnualPlan, date: Date, status: Record<string, string>): Pace {
  const t = mondayOf(date).getTime();
  const past: AnnualContent[] = plan.weeks
    .filter((w) => w.monday.getTime() < t)
    .flatMap((w) => Object.values(w.byDiscipline).flat())
    .filter((c) => !c.fromManual);
  return {
    planned: past.length,
    mastered: past.filter((c) => status[c.id] === "dominado").length,
    inProgress: past.filter((c) => status[c.id] === "em_progresso").length,
  };
}

/** Conteúdos do currículo previstos numa semana (sem manuais). */
export function weekContents(plan: AnnualPlan | undefined, date: Date): AnnualContent[] {
  const week = plan ? planWeekFor(plan, date) : null;
  if (!week) return [];
  return Object.values(week.byDiscipline).flat().filter((c) => !c.fromManual);
}

export const WEEK_CLOSE_TITLE = "Fecho da semana";

/** Texto da entrada do Diário com os ganhos e as dificuldades; null se vazio. */
export function weekCloseNote(gains: string, hard: string): string | null {
  const parts = [gains.trim() && `O que ganhou: ${gains.trim()}`, hard.trim() && `Onde teve dificuldade: ${hard.trim()}`].filter(Boolean);
  return parts.length ? parts.join("\n") : null;
}
