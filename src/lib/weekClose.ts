// Fecho da semana e ritmo do ano (P-14, P-19, P-20).
//
// Regra de atraso sem culpa: o que não foi dado volta na semana seguinte, ao
// lado dos conteúdos novos, no máximo dois por disciplina; o que ficou "precisa
// de mais" volta como revisão curta, no máximo duas por criança. Nada se
// acumula como dívida.
import type { AnnualContent, AnnualPlan } from "./annualPlan";
import { mondayOf, planWeekFor } from "./annualPlan";

export const MAX_CARRY_OVER = 2;
/** DASH fase 3: revisões curtas ("precisa de mais") por criança e por semana, no total. */
export const MAX_REVIEWS_PER_WEEK = 2;
export const REVIEW_PREFIX = "Rever · ";

/**
 * Conteúdos a enviar ao plano: os da semana (rumo) e, por cima, até dois por
 * disciplina que não chegaram a ser dados ([retomar]). Sem foco (pausas,
 * balanço), só esses.
 *
 * DASH fase 3: o que ficou "precisa de mais" (em progresso) volta como
 * revisão curta ([rever]), no máximo duas por criança na semana, uma por
 * disciplina de cada vez, para não encher o plano.
 */
export function mergeWeekContents(
  focus: Record<string, string[]> | null | undefined,
  inProgress: Record<string, string[]>,
  max = MAX_CARRY_OVER,
  reviews: Record<string, string[]> = {},
  maxReviews = MAX_REVIEWS_PER_WEEK,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [d, list] of Object.entries(focus ?? {})) out[d] = list.map((c) => `[a aprender] ${c}`);
  const picked = pickReviews(reviews, maxReviews, focus);
  for (const [d, list] of Object.entries(inProgress)) {
    const already = new Set([...(focus?.[d] ?? []), ...(picked[d] ?? [])]);
    const extra = list.filter((c) => !already.has(c)).slice(0, max).map((c) => `[retomar] ${c}`);
    if (extra.length) out[d] = [...(out[d] ?? []), ...extra];
  }
  for (const [d, list] of Object.entries(picked)) out[d] = [...(out[d] ?? []), ...list.map((c) => `[rever] ${c}`)];
  return out;
}

/** Até `max` revisões no total, alternando entre disciplinas (uma de cada vez). */
export function pickReviews(
  reviews: Record<string, string[]>,
  max = MAX_REVIEWS_PER_WEEK,
  exclude?: Record<string, string[]> | null,
): Record<string, string[]> {
  const queues = Object.entries(reviews)
    .map(([d, list]) => [d, [...new Set(list)].filter((c) => !(exclude?.[d] ?? []).includes(c))] as const)
    .filter(([, list]) => list.length > 0);
  const out: Record<string, string[]> = {};
  let n = 0;
  for (let round = 0; n < max; round++) {
    let any = false;
    for (const [d, list] of queues) {
      if (n >= max) break;
      if (round < list.length) { (out[d] ??= []).push(list[round]); n++; any = true; }
    }
    if (!any) break;
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
