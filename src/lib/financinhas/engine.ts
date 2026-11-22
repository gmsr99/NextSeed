// Financinhas · motor de decisão (camada 2, determinístico, sem IA)
//
// Decide a próxima aula de uma criança:
//   · Trilho de Iniciação → a sessão seguinte, por ordem, sem saltar nenhuma
//   · Ciclo adaptativo    → o tema das skills mais frágeis (ou da skill pedida)
// e escolhe o modo de descoberta (nunca o da aula anterior, evitando os das
// últimas 3) e o protagonista (fictício, sem repetir, também entre irmãos).

import {
  ALL_PROTAGONISTS as ALL_NAMES, CALC_SKILLS, MODE_CODES, SKILL_CODES, THEMES, TRACK_SESSIONS,
  themeByNumber, trackSession, type Theme, type Tier,
} from "./catalog.ts";
import type { Levels } from "./levels.ts";

export type Stage = "trilho" | "ciclo";
export type LessonStatus = "por_dar" | "dada";

/** O mínimo que o motor precisa de saber de uma aula (dada ou por dar). */
export interface EngineLesson {
  id: string;
  status: LessonStatus;
  given_on: string | null;
  created_at: string;
  track_session: number | null;
  theme_numbers: number[] | null;
  skill_codes: string[] | null;
  discovery_mode: string | null;
  protagonist: string | null;
  module_week?: number | null;
}

export interface LessonPlan {
  kind: Stage;
  tier: Tier;
  trackSession: number | null;
  /** Aula já gerada e ainda por dar para esta proposta (não se gera outra). */
  existingLessonId: string | null;
  themeNumbers: number[];
  skills: string[];
  reinforce: string[];
  mode: string;
  previousMode: string | null;
  protagonist: string;
  moduleWeek: number;
  reasons: string[];
  /** Trilho com as 12 sessões dadas: pronto para avaliar a saída. */
  trackComplete: boolean;
}

export interface PlanInput {
  today: string; // AAAA-MM-DD
  tier: Tier;
  stage: Stage;
  lessons: EngineLesson[];
  levels: Levels;
  /** Aulas dos irmãos (para não repetir protagonistas na mesma altura). */
  siblingLessons?: EngineLesson[];
  /** Nomes das crianças da família (o protagonista nunca é uma delas). Ficam no dispositivo. */
  avoidNames?: string[];
  /** Ciclo: forçar a skill principal. */
  focusSkill?: string | null;
  /** Ciclo: continuar o módulo da última aula (máx. 3 semanas). */
  continueModule?: boolean;
}

// ─── Idade e escalão ────────────────────────────────────────────────────────

export function ageOn(birthDate: string, today: string): number {
  const [by, bm, bd] = birthDate.slice(0, 10).split("-").map(Number);
  const [ty, tm, td] = today.slice(0, 10).split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age--;
  return age;
}

/** Escalão da Financinhas, ou null fora dos 5–12 anos. */
export function tierForAge(age: number): Tier | null {
  if (age < 5 || age > 12) return null;
  if (age <= 6) return "5-6";
  if (age <= 8) return "7-8";
  return "9-12";
}

/** Semanada de referência: metade da idade, em euros (orientação, não regra). */
export function suggestedAllowanceCents(age: number): number {
  return Math.round(age * 50);
}

export function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

// ─── Utilitários do histórico ───────────────────────────────────────────────

export function lessonDate(l: Pick<EngineLesson, "given_on" | "created_at">): string {
  return (l.given_on ?? l.created_at ?? "").slice(0, 10);
}

/** Mais recente primeiro. As aulas por dar contam como as mais recentes. */
export function byRecency<T extends EngineLesson>(lessons: T[]): T[] {
  return [...lessons].sort((a, b) => {
    if (a.status !== b.status) return a.status === "por_dar" ? -1 : 1;
    const d = lessonDate(b).localeCompare(lessonDate(a));
    return d !== 0 ? d : String(b.created_at).localeCompare(String(a.created_at));
  });
}

/** Lê o código principal de um campo livre ("MD1 (+MD3 no remate)" → "MD1"). */
export function normalizeMode(text: string | null | undefined): string | null {
  const m = String(text ?? "").toUpperCase().match(/MD\s?([1-8])/);
  return m ? `MD${m[1]}` : null;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Modo de descoberta ─────────────────────────────────────────────────────

export function pickMode(opts: {
  lessons: EngineLesson[];
  skills: string[];
  preferred?: string | null;
}): { mode: string; previous: string | null } {
  const recent = byRecency(opts.lessons).map((l) => normalizeMode(l.discovery_mode)).filter(Boolean) as string[];
  const previous = recent[0] ?? null;
  const last3 = new Set(recent.slice(0, 3));

  if (opts.preferred && opts.preferred !== previous) return { mode: opts.preferred, previous };

  const usage = new Map<string, number>();
  for (const m of recent) usage.set(m, (usage.get(m) ?? 0) + 1);
  const isCalc = opts.skills.some((s) => CALC_SKILLS.includes(s));

  const candidates = MODE_CODES.filter((m) => m !== previous && (m !== "MD1" || isCalc));
  const pool = candidates.length ? candidates : MODE_CODES.filter((m) => m !== previous);
  const sorted = [...pool].sort((a, b) => {
    const r = Number(last3.has(a)) - Number(last3.has(b));
    if (r !== 0) return r;
    const u = (usage.get(a) ?? 0) - (usage.get(b) ?? 0);
    if (u !== 0) return u;
    return MODE_CODES.indexOf(a) - MODE_CODES.indexOf(b);
  });
  return { mode: sorted[0], previous };
}

// ─── Protagonista ───────────────────────────────────────────────────────────

/** Primeiro nome, sem acentos nem maiúsculas, para comparar nomes. */
function nameKey(name: string): string {
  return name.trim().split(/\s+/)[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function pickProtagonist(opts: {
  today: string;
  lessons: EngineLesson[];
  siblingLessons?: EngineLesson[];
  /** Nomes das crianças da família: o protagonista nunca é uma delas. */
  avoidNames?: string[];
}): string {
  const avoid = new Set((opts.avoidNames ?? []).filter(Boolean).map(nameKey));
  const ALL_PROTAGONISTS = ALL_NAMES.filter((p) => !avoid.has(nameKey(p)));
  const own = byRecency(opts.lessons).map((l) => l.protagonist).filter(Boolean) as string[];
  const since = addDays(opts.today, -28);
  const siblings = (opts.siblingLessons ?? [])
    .filter((l) => l.status === "por_dar" || lessonDate(l) >= since)
    .map((l) => l.protagonist)
    .filter(Boolean) as string[];
  const blocked = new Set([...own.slice(0, 8), ...siblings]);

  const free = ALL_PROTAGONISTS.filter((p) => !blocked.has(p));
  if (free.length) {
    const never = free.filter((p) => !own.includes(p));
    if (never.length) return never[0];
    // O que foi usado há mais tempo
    return [...free].sort((a, b) => own.indexOf(b) - own.indexOf(a))[0];
  }
  const notSibling = ALL_PROTAGONISTS.filter((p) => !siblings.includes(p));
  const pool = notSibling.length ? notSibling : ALL_PROTAGONISTS;
  return [...pool].sort((a, b) => own.indexOf(b) - own.indexOf(a))[0];
}

// ─── Trilho ─────────────────────────────────────────────────────────────────

/** Primeira sessão do trilho ainda não dada (nunca se salta nenhuma), ou null se estão todas. */
export function nextTrackSessionNumber(lessons: EngineLesson[]): number | null {
  const given = new Set(lessons.filter((l) => l.status === "dada" && l.track_session).map((l) => l.track_session));
  for (const s of TRACK_SESSIONS) if (!given.has(s.number)) return s.number;
  return null;
}

// ─── Ciclo adaptativo ───────────────────────────────────────────────────────

/** Sem avaliação, a skill fica entre o 1 e o 3: as já vistas como frágeis vêm primeiro. */
const UNKNOWN_PRIORITY = 2;

function lastWorked(lessons: EngineLesson[], skill: string): string {
  const dates = lessons.filter((l) => (l.skill_codes ?? []).includes(skill)).map(lessonDate);
  return dates.sort().pop() ?? "";
}

/** Skills por ordem de prioridade: nível mais baixo, depois a trabalhada há mais tempo. */
export function prioritizeSkills(levels: Levels, lessons: EngineLesson[]): string[] {
  return [...SKILL_CODES].sort((a, b) => {
    const la = levels[a] ?? UNKNOWN_PRIORITY;
    const lb = levels[b] ?? UNKNOWN_PRIORITY;
    if (la !== lb) return la - lb;
    const wa = lastWorked(lessons, a);
    const wb = lastWorked(lessons, b);
    if (wa !== wb) return wa.localeCompare(wb);
    return SKILL_CODES.indexOf(a) - SKILL_CODES.indexOf(b);
  });
}

function themeLastUsed(lessons: EngineLesson[], n: number): string {
  return lessons.filter((l) => (l.theme_numbers ?? []).includes(n)).map(lessonDate).sort().pop() ?? "";
}

/** Tema para uma skill: onde é principal, depois onde aparece; o usado há mais tempo. */
export function themeForSkill(skill: string, lessons: EngineLesson[]): Theme | null {
  const withSkill = THEMES.filter((t) => t.skills.includes(skill));
  if (!withSkill.length) return null;
  return [...withSkill].sort((a, b) => {
    const p = Number(b.primary === skill) - Number(a.primary === skill);
    if (p !== 0) return p;
    const u = themeLastUsed(lessons, a.number).localeCompare(themeLastUsed(lessons, b.number));
    if (u !== 0) return u;
    return a.number - b.number;
  })[0];
}

// ─── Proposta ───────────────────────────────────────────────────────────────

export function planNextLesson(input: PlanInput): LessonPlan {
  const lessons = input.lessons;
  const ordered = byRecency(lessons);
  const reasons: string[] = [];

  if (input.stage === "trilho") {
    // A aula por dar da sessão mais baixa (as importadas sem data podem ser várias)
    const pending = lessons
      .filter((l) => l.status === "por_dar" && l.track_session)
      .sort((a, b) => (a.track_session ?? 0) - (b.track_session ?? 0))[0];
    const number = pending?.track_session ?? nextTrackSessionNumber(lessons);
    if (number === null) {
      // Trilho completo: propõe-se o ciclo, e o ecrã mostra a fotografia de saída
      const plan = planNextLesson({ ...input, stage: "ciclo" });
      return { ...plan, trackComplete: true, reasons: ["As 12 sessões do trilho estão dadas: é altura da fotografia de saída e de passar ao ciclo semanal.", ...plan.reasons] };
    }
    const s = trackSession(number)!;
    const done = lessons.filter((l) => l.status === "dada" && l.track_session).length;
    const others = lessons.filter((l) => l.id !== pending?.id);
    const { mode, previous } = pending
      ? { mode: normalizeMode(pending.discovery_mode) ?? s.mode, previous: normalizeMode(byRecency(others)[0]?.discovery_mode) }
      : pickMode({ lessons, skills: s.skills, preferred: s.mode });
    reasons.push(`Trilho de Iniciação: sessão ${s.number} de 12 (${done} dada${done === 1 ? "" : "s"}). O trilho segue sempre pela ordem.`);
    if (mode !== s.mode) reasons.push(`O modo previsto para esta sessão foi o da aula anterior; usa-se outro para não repetir.`);
    return {
      kind: "trilho",
      tier: input.tier,
      trackSession: s.number,
      existingLessonId: pending?.id ?? null,
      themeNumbers: s.themes,
      skills: s.skills.slice(0, 2),
      reinforce: s.skills.slice(2),
      mode,
      previousMode: previous,
      protagonist: pending?.protagonist ?? pickProtagonist({ today: input.today, lessons: others, siblingLessons: input.siblingLessons, avoidNames: input.avoidNames }),
      moduleWeek: 1,
      reasons,
      trackComplete: false,
    };
  }

  // Ciclo adaptativo
  const pending = ordered.find((l) => l.status === "por_dar");
  const last = ordered.find((l) => l.status === "dada");

  if (pending) {
    reasons.push("Já há uma aula gerada e por dar. Dá-a primeiro, ou apaga-a para gerar outra.");
    const others = lessons.filter((l) => l.id !== pending.id);
    return {
      kind: "ciclo", tier: input.tier, trackSession: null, existingLessonId: pending.id,
      themeNumbers: pending.theme_numbers ?? [], skills: (pending.skill_codes ?? []).slice(0, 2),
      reinforce: (pending.skill_codes ?? []).slice(2),
      mode: normalizeMode(pending.discovery_mode) ?? "MD4",
      previousMode: normalizeMode(byRecency(others)[0]?.discovery_mode),
      protagonist: pending.protagonist ?? "Dinis", moduleWeek: pending.module_week ?? 1,
      reasons, trackComplete: false,
    };
  }

  // Continuar o módulo (mesmo tema e protagonista, até 3 semanas)
  if (input.continueModule && last && !last.track_session && (last.module_week ?? 1) < 3 && (last.theme_numbers ?? []).length) {
    const theme = themeByNumber(last.theme_numbers![0]);
    const skills = (last.skill_codes ?? []).slice(0, 2);
    const { mode, previous } = pickMode({ lessons, skills });
    const week = (last.module_week ?? 1) + 1;
    reasons.push(`Continuação do módulo "${theme?.title ?? "tema"}": semana ${week} de 3, com o mesmo protagonista e um modo de descoberta novo.`);
    return {
      kind: "ciclo", tier: input.tier, trackSession: null, existingLessonId: null,
      themeNumbers: last.theme_numbers!, skills, reinforce: (last.skill_codes ?? []).slice(2),
      mode, previousMode: previous, protagonist: last.protagonist ?? pickProtagonist({ today: input.today, lessons, siblingLessons: input.siblingLessons, avoidNames: input.avoidNames }),
      moduleWeek: week, reasons, trackComplete: false,
    };
  }

  const priority = prioritizeSkills(input.levels, lessons);
  const focus = input.focusSkill && SKILL_CODES.includes(input.focusSkill) ? input.focusSkill : null;
  const primary = focus ?? priority.find((s) => themeForSkill(s, lessons)) ?? "CP";
  const theme = themeForSkill(primary, lessons) ?? THEMES[0];
  const secondary = theme.skills.filter((s) => s !== primary).sort((a, b) => priority.indexOf(a) - priority.indexOf(b))[0];
  const skills = secondary ? [primary, secondary] : [primary];
  const lvl = input.levels[primary];

  reasons.push(
    focus
      ? `Pediste para trabalhar ${primary}.`
      : lvl === undefined
        ? `${primary} ainda não foi avaliada e é das que estão há mais tempo sem aula.`
        : `${primary} está no nível ${lvl}, dos mais baixos neste momento.`,
  );
  reasons.push(`Tema ${theme.number}: ${theme.title}.`);
  if (theme.status === "sem_recurso") reasons.push("Este tema ainda não tem história de referência: revê a aula com mais atenção.");

  const { mode, previous } = pickMode({ lessons, skills });
  return {
    kind: "ciclo", tier: input.tier, trackSession: null, existingLessonId: null,
    themeNumbers: [theme.number], skills, reinforce: theme.skills.filter((s) => !skills.includes(s)),
    mode, previousMode: previous,
    protagonist: pickProtagonist({ today: input.today, lessons, siblingLessons: input.siblingLessons, avoidNames: input.avoidNames }),
    moduleWeek: 1, reasons, trackComplete: false,
  };
}
