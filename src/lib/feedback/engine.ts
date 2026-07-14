import { hoursSince, daysSince } from "@/lib/feedback/time";
import type { Instrument, SurveyQuestion } from "@/lib/feedback/instruments";

// Motor de gatilhos de feedback — funções PURAS e unit-testáveis.
// Não tocam na rede nem no relógio do sistema (recebem `now` explícito).

/** Subconjunto de feedback_trigger_state relevante para a decisão. */
export interface TriggerState {
  counter?: number;
  shown_count?: number;
  last_shown_at?: string | null;
  scheduled_for?: string | null;
  consumed?: boolean;
}

// ─── Cadências dos micro-questionários (Instrumento B) ────────────────────────

/** B1: na 1.ª, 3.ª geração e depois a cada 5.ª → 1, 3, 8, 13, 18, … */
export function shouldShowB1(n: number): boolean {
  return n === 1 || n === 3 || (n > 3 && (n - 3) % 5 === 0);
}

/** B3: a cada geração de portefólio/relatório. */
export function shouldShowB3(n: number): boolean {
  return n >= 1;
}

/** B4: após 3 usos, depois a cada 10 → 3, 13, 23, … */
export function shouldShowB4(n: number): boolean {
  return n === 3 || (n > 3 && (n - 3) % 10 === 0);
}

// ─── Gatilhos na abertura da app (A, B2, C) ───────────────────────────────────

const WELCOME_MIN_HOURS = 7 * 24; // 7 dias
const MONTH_DAYS = 30;

/** Instrumento A: 7 dias após o registo, uma única vez por utilizador. */
export function isWelcomePulseDue(
  registeredAt: string | null,
  now: Date,
  state?: TriggerState,
): boolean {
  if (!registeredAt) return false;
  if (state?.consumed) return false;
  return hoursSince(registeredAt, now) >= WELCOME_MIN_HOURS;
}

/** Instrumento C: 1×/mês, a partir do 2.º mês de uso. */
export function isMonthlyPulseDue(
  registeredAt: string | null,
  now: Date,
  state?: TriggerState,
): boolean {
  if (!registeredAt) return false;
  if (daysSince(registeredAt, now) < MONTH_DAYS) return false; // só a partir do 2.º mês
  if (state?.last_shown_at && daysSince(state.last_shown_at, now) < MONTH_DAYS) return false;
  return true;
}

/** Instrumento B2: agendado 7 dias após gerar um plano. */
export function isB2Due(state: TriggerState | undefined, now: Date): boolean {
  if (!state?.scheduled_for) return false;
  return new Date(state.scheduled_for).getTime() <= now.getTime();
}

export type AppOpenSurvey = "A" | "B2" | "C";

export interface AppOpenInput {
  registeredAt: string | null;
  now: Date;
  states: Partial<Record<AppOpenSurvey, TriggerState>>;
  /** C só é considerado quando o pulso mensal está ativado (Passo 5.5). */
  monthlyEnabled: boolean;
}

/**
 * Escolhe, no máximo, um survey para mostrar na abertura da app.
 * Prioridade: A > B2 > C (Secção 0.2 da spec).
 */
export function pickAppOpenSurvey(input: AppOpenInput): AppOpenSurvey | null {
  if (isWelcomePulseDue(input.registeredAt, input.now, input.states.A)) return "A";
  if (isB2Due(input.states.B2, input.now)) return "B2";
  if (input.monthlyEnabled && isMonthlyPulseDue(input.registeredAt, input.now, input.states.C)) {
    return "C";
  }
  return null;
}

// ─── Navegação de perguntas (condicionais + gated) ────────────────────────────

export type AnswerMap = Record<string, string | string[] | number | null | undefined>;

/** True se a pergunta deve ser mostrada dado o estado atual de respostas. */
export function isQuestionVisible(
  q: SurveyQuestion,
  answers: AnswerMap,
  activeFlags: Set<string>,
): boolean {
  if (q.gatedByConfig && !activeFlags.has(q.gatedByConfig)) return false;
  if (q.showIf) {
    const source = answers[q.showIf.questionKey];
    if (typeof source !== "string" || !q.showIf.equalsAny.includes(source)) return false;
  }
  return true;
}

/**
 * Devolve a próxima pergunta visível ainda não visitada, ou null se o survey
 * está completo. `visited` = perguntas já respondidas/saltadas pelo utilizador.
 */
export function nextQuestion(
  instrument: Instrument,
  answers: AnswerMap,
  visited: Set<string>,
  activeFlags: Set<string> = new Set(),
): SurveyQuestion | null {
  for (const q of instrument.questions) {
    if (visited.has(q.key)) continue;
    if (!isQuestionVisible(q, answers, activeFlags)) continue;
    return q;
  }
  return null;
}
