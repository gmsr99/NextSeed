// Início (DASH, spec claude/DASH_Redesenho_Inicio.md v3.1): estado da semana e
// ritmo do ano. Funções puras, para testar sem base de dados.
//
// Dar e dominar são duas coisas (D-DASH-9): um tema "dado" conta para o ritmo.
// Na base de dados, com os estados que já existem nas Áreas de Aprendizagem:
//   dado (ok)              → "dominado"
//   dado + precisa de mais → "em_progresso" (a consolidar; volta nos planos)
// O ritmo conta os dois. "A consolidar" nunca muda a cor de uma disciplina.
import type { AnnualPlan } from "./annualPlan";
import { mondayOf, schoolYearStartFor } from "./annualPlan";
import { hasNextLesson, indexEntries, isNextLesson, type Manual } from "./manualIndex";

export const GIVEN_STATUSES = ["dominado", "em_progresso"] as const;
export const isGiven = (s: string | undefined) => s === "dominado" || s === "em_progresso";

// ─── A semana ────────────────────────────────────────────────────────────────

export type WeekState = "em_dia" | "quase" | "por_preparar" | "preparada";

export interface WeekItem {
  day_of_week: number; // 1 = segunda
  completed_at: string | null;
}

export interface WeekSummary {
  state: WeekState;
  done: number;
  total: number;
  /** Por dia (segunda a sexta): feitas / previstas */
  days: { day: number; done: number; total: number }[];
}

/**
 * Em dia: o que estava previsto até ontem está feito. Quase lá: ficou alguma
 * coisa para trás. Ao fim de semana olha para a semana seguinte: sem plano,
 * "por preparar"; com plano, "preparada".
 */
export function weekSummary(
  items: WeekItem[] | null,
  todayDow: number,
  nextWeekPlanned: boolean,
): WeekSummary {
  const list = items ?? [];
  const days = [1, 2, 3, 4, 5].map((day) => {
    const of = list.filter((i) => i.day_of_week === day);
    return { day, done: of.filter((i) => i.completed_at).length, total: of.length };
  });
  const done = list.filter((i) => i.completed_at).length;
  const base = { done, total: list.length, days };
  if (todayDow >= 6) return { ...base, state: nextWeekPlanned ? "preparada" : "por_preparar" };
  if (!items) return { ...base, state: "por_preparar" };
  const due = list.filter((i) => i.day_of_week < todayDow);
  const behind = due.some((i) => !i.completed_at);
  return { ...base, state: behind ? "quase" : "em_dia" };
}

// ─── O ano ───────────────────────────────────────────────────────────────────

export type PaceState = "bom" | "folga" | "ajuste" | "a_ganhar" | "sem_marcas";

export const PACE_LABEL: Record<PaceState, string> = {
  bom: "Bom ritmo",
  folga: "A usar a folga",
  ajuste: "Pede um ajuste",
  a_ganhar: "A ganhar ritmo",
  sem_marcas: "Por começar",
};

/** Semanas de folga depois de 30 de junho (até 31 de julho, D-DASH-4). */
export const SLACK_WEEKS = 4;
/** Antes disto não há cor: o ano ainda está a arrancar. */
export const MIN_WEEKS_FOR_COLOR = 4;

export interface Steps {
  /** Passos do ano (temas do rumo ou unidades do manual) */
  total: number;
  /** Dados (inclui os que estão a consolidar) */
  given: number;
  /** A consolidar (dados, mas a precisar de mais) */
  consolidating: number;
  /** Previstos no rumo até à semana anterior */
  plannedByNow: number;
  /** Dados nas últimas 4 semanas, quando se sabe */
  recent: number | null;
}

export interface DisciplinePace extends Steps {
  discipline: string;
  /** Nome do manual, quando a disciplina segue um */
  manual?: string;
}

export interface YearClock {
  /** Semanas com aulas já passadas (sem a atual) */
  elapsed: number;
  /** Semanas com aulas desta até 30 de junho (inclui a atual) */
  left: number;
  /** Número da semana atual no rumo (null em pausa ou fora do ano) */
  current: number | null;
  totalWeeks: number;
}

function deadline(today: Date): number {
  return new Date(schoolYearStartFor(today) + 1, 5, 30).getTime();
}

export function yearClock(plan: AnnualPlan, today: Date): YearClock {
  const t = mondayOf(today).getTime();
  const end = deadline(today);
  const teaching = plan.weeks.filter((w) => !w.isReview);
  const current = plan.weeks.find((w) => Math.abs(w.monday.getTime() - t) < 12 * 3600 * 1000);
  return {
    elapsed: teaching.filter((w) => w.monday.getTime() < t - 12 * 3600 * 1000).length,
    left: teaching.filter((w) => w.monday.getTime() >= t - 12 * 3600 * 1000 && w.monday.getTime() <= end).length,
    current: current?.number ?? null,
    totalWeeks: plan.weeks.length,
  };
}

const DAY = 24 * 3600 * 1000;

/**
 * Passos por disciplina de uma criança. Currículo: os temas distribuídos pelo
 * rumo (sem os do ano todo, que rodam). Manual: as unidades do índice; o modo
 * "lição seguinte" não tem fim conhecido e fica de fora.
 */
export function disciplinePaces(
  plan: AnnualPlan,
  status: Record<string, string>,
  updatedAt: Record<string, string>,
  manuals: Manual[],
  today: Date,
): DisciplinePace[] {
  const t = mondayOf(today).getTime() - 12 * 3600 * 1000;
  const recentFrom = today.getTime() - 28 * DAY;
  const out = new Map<string, DisciplinePace>();
  const get = (d: string) => {
    if (!out.has(d)) out.set(d, { discipline: d, total: 0, given: 0, consolidating: 0, plannedByNow: 0, recent: 0 });
    return out.get(d)!;
  };

  const seen = new Set<string>();
  for (const w of plan.weeks) {
    for (const [d, list] of Object.entries(w.byDiscipline)) {
      for (const c of list) {
        if (c.fromManual || seen.has(c.id)) continue;
        seen.add(c.id);
        const p = get(d);
        p.total++;
        const s = status[c.id];
        if (isGiven(s)) {
          p.given++;
          if (s === "em_progresso") p.consolidating++;
          const u = updatedAt[c.id];
          if (u && new Date(u).getTime() >= recentFrom && p.recent !== null) p.recent++;
        }
        if (w.monday.getTime() < t) p.plannedByNow++;
      }
    }
  }

  // Manuais: a posição no índice diz o que já foi dado
  const clock = yearClock(plan, today);
  const yearFrac = clock.elapsed + clock.left > 0 ? clock.elapsed / (clock.elapsed + clock.left) : 0;
  manuals.forEach((m, k) => {
    if (m.entries.length === 0 || isNextLesson(m.entries)) return;
    // Com manual, a disciplina não tem temas do currículo no rumo
    const p = get(m.discipline);
    const index = indexEntries(m.entries);
    if (index.length === 0) return;
    const given = index.filter((e) => e.done).length;
    const pastLines = new Set<string>();
    for (const w of plan.weeks) {
      if (w.monday.getTime() >= t) continue;
      for (const c of w.byDiscipline[m.discipline] ?? []) {
        const parts = c.id.split(":"); // manual:<disciplina>:<k>:<linha>:<parte>
        if (c.fromManual && parts[2] === String(k)) pastLines.add(parts[3]);
      }
    }
    p.total += index.length;
    p.given += given;
    // "Lição seguinte": o rumo reparte sempre a partir de hoje, por isso o
    // previsto até hoje é a parte do ano que já passou
    p.plannedByNow += hasNextLesson(m.entries) ? Math.round(index.length * yearFrac) : given + pastLines.size;
    p.recent = null; // as unidades do manual não guardam a data
    p.manual = p.manual ? `${p.manual} + ${m.title}` : m.title;
  });

  return [...out.values()].filter((p) => p.total > 0);
}

export function sumSteps(list: Steps[]): Steps {
  return list.reduce<Steps>(
    (a, p) => ({
      total: a.total + p.total,
      given: a.given + p.given,
      consolidating: a.consolidating + p.consolidating,
      plannedByNow: a.plannedByNow + p.plannedByNow,
      recent: a.recent === null || p.recent === null ? null : a.recent + p.recent,
    }),
    { total: 0, given: 0, consolidating: 0, plannedByNow: 0, recent: 0 },
  );
}

/** Passos por semana: o das últimas 4 semanas, ou a média do ano se não se souber. */
export function recentRate(s: Steps, clock: YearClock): number {
  if (s.recent !== null && s.recent > 0) return s.recent / 4;
  return clock.elapsed > 0 ? s.given / clock.elapsed : 0;
}

/**
 * Bom ritmo: em linha com o rumo, ou a projeção acaba até 30 de junho.
 * A usar a folga: acaba até 31 de julho. Pede um ajuste: depois disso.
 * Sem marcações ou com menos de 4 semanas, não há cor.
 */
export function paceState(s: Steps, clock: YearClock): PaceState {
  if (s.given === 0) return "sem_marcas";
  if (clock.elapsed < MIN_WEEKS_FOR_COLOR) return "a_ganhar";
  const left = s.total - s.given;
  if (left <= 0 || s.given >= s.plannedByNow) return "bom";
  const rate = recentRate(s, clock);
  if (rate <= 0) return "ajuste";
  const weeksNeeded = left / rate;
  if (weeksNeeded <= clock.left) return "bom";
  if (weeksNeeded <= clock.left + SLACK_WEEKS) return "folga";
  return "ajuste";
}

/** "Faltam 58 temas em 28 semanas: cerca de 2 por semana. Têm feito 3." */
export function paceSentence(s: Steps, clock: YearClock): string {
  const left = s.total - s.given;
  if (left <= 0) return "Os temas do ano estão todos dados.";
  if (clock.left <= 0) return `Faltam ${left} ${left === 1 ? "tema" : "temas"}. Julho fica de folga.`;
  const need = Math.max(1, Math.round(left / clock.left));
  const base = `Faltam ${left} ${left === 1 ? "tema" : "temas"} em ${clock.left} ${clock.left === 1 ? "semana" : "semanas"}: cerca de ${need} por semana.`;
  if (s.given === 0 || clock.elapsed === 0) return base;
  const rate = Math.round(recentRate(s, clock) * 10) / 10;
  const shown = rate >= 1 ? String(Math.round(rate)) : String(rate).replace(".", ",");
  return `${base} Têm feito ${shown}.`;
}

// ─── Fecho da semana ─────────────────────────────────────────────────────────

/** O que cada resposta do fecho grava (null = não mexe). */
export function closeStatus(
  given: boolean,
  needsMore: boolean,
  current: string | undefined,
): "dominado" | "em_progresso" | null {
  if (!given) return null; // não dado: fica como estava e o rumo volta a propô-lo
  if (needsMore) return "em_progresso";
  return current === "dominado" ? null : "dominado";
}

/** Resumo do fecho: "10 de 12 dados · 1 volta mais tarde · 2 passam para a semana que vem". */
export function closeSummary(total: number, given: number, needsMore: number): string {
  const parts = [`${given} de ${total} ${given === 1 ? "dado" : "dados"}`];
  if (needsMore > 0) parts.push(`${needsMore} ${needsMore === 1 ? "volta" : "voltam"} mais tarde para consolidar`);
  const left = total - given;
  if (left > 0) parts.push(`${left} ${left === 1 ? "passa" : "passam"} para a semana que vem`);
  return parts.join(" · ");
}

/** O popup de sexta aparece uma vez por semana, a partir das 12h. */
export function shouldOfferClose(now: Date, alreadyShown: boolean): boolean {
  return now.getDay() === 5 && now.getHours() >= 12 && !alreadyShown;
}
