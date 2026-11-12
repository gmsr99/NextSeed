// Janela do currículo enviada ao Gemini (backlog P-01, docs 03 §5.3 e 10 INS-06).
//
// Antes: sem conteúdos marcados como "em progresso", o pedido levava o ano
// inteiro (114–153 conteúdos) duas vezes, como "a aprender" e como "ainda por
// dominar". O modelo não sabia por onde começar e gerava temas aleatórios.
//
// Agora:
//  - sem marcações, "a aprender" leva só o período atual (+ conteúdos do ano todo);
//  - "ainda por dominar" leva o período atual e o seguinte, como contexto;
//  - com marcações, nada muda: manda o que a família marcou.
//
// Hipótese (até haver ano letivo por família, P-04): o calendário escolar
// português, set–dez = 1.º período, jan–mar = 2.º, abr–ago = 3.º.

export type Period = "1" | "2" | "3";

/** Período letivo para uma data (calendário escolar português). */
export function currentPeriod(date: Date = new Date()): Period {
  const m = date.getMonth(); // 0 = janeiro
  if (m >= 8) return "1"; // setembro a dezembro
  if (m <= 2) return "2"; // janeiro a março
  return "3"; // abril a agosto
}

export function nextPeriod(p: Period): Period | null {
  return p === "1" ? "2" : p === "2" ? "3" : null;
}

/** O conteúdo pertence aos períodos indicados? "all" (ano todo) entra sempre. */
export function inPeriods(contentPeriod: string | null | undefined, periods: Period[]): boolean {
  if (!contentPeriod || contentPeriod === "all") return true;
  return periods.includes(contentPeriod as Period);
}

/** Períodos usados quando a criança não tem nada marcado como "em progresso". */
export function fallbackPeriods(date: Date = new Date()): Period[] {
  return [currentPeriod(date)];
}

/** Períodos usados para o contexto "ainda por dominar". */
export function contextPeriods(date: Date = new Date()): Period[] {
  const p = currentPeriod(date);
  const n = nextPeriod(p);
  return n ? [p, n] : [p];
}

export const PERIOD_LABEL: Record<Period, string> = {
  "1": "1.º período",
  "2": "2.º período",
  "3": "3.º período",
};
