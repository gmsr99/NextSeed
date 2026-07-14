// Helpers de tempo puros para analytics e para o motor de gatilhos (FASE 5).
// Semântica deliberada: durações em UTC (ms), nunca comparações de calendário —
// evita casos-limite de fuso/DST. "7 dias" = 7×24h; "1 mês" = 30×24h.

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

/** Horas decorridas entre dois instantes (>= 0 se `now` for posterior). */
export function hoursSince(from: Date | string, now: Date = new Date()): number {
  const fromMs = (from instanceof Date ? from : new Date(from)).getTime();
  return (now.getTime() - fromMs) / HOUR_MS;
}

/** Dias decorridos (inteiros, arredondados para baixo). */
export function daysSince(from: Date | string, now: Date = new Date()): number {
  return Math.floor(hoursSince(from, now) / 24);
}

/** Dia da semana ISO: 1 = segunda … 7 = domingo. */
export function isoDayOfWeek(d: Date = new Date()): number {
  const js = d.getDay(); // 0 = domingo … 6 = sábado
  return js === 0 ? 7 : js;
}
