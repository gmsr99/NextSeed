// A nossa semana (P-18, versão mínima do P-04): como é a semana de estudo de
// cada família. Para cada dia, de segunda a sexta: dia completo, dia curto
// (cerca de 1 hora, só a manhã) ou sem estudo; e se há saída "Ver Mundo" à
// sexta. Sem configuração, fica a semana de sempre.

export type DayMode = "full" | "short" | "off";

export interface WeekRoutine {
  /** Segunda a sexta */
  days: DayMode[];
  /** Saída "Ver Mundo" à sexta */
  outing: boolean;
}

export const DEFAULT_ROUTINE: WeekRoutine = { days: ["full", "full", "full", "full", "full"], outing: true };

export const DAY_MODE_LABELS: Record<DayMode, string> = {
  full: "Dia completo",
  short: "Dia curto (cerca de 1 hora)",
  off: "Sem estudo",
};

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

/** Um dia curto fica com o que começa antes desta hora: português e matemática da manhã. */
const SHORT_DAY_CUTOFF = "10:42";

/** Lê o que vem da base de dados; qualquer valor estranho volta ao de sempre. */
export function normalizeRoutine(days: unknown, outing: unknown): WeekRoutine {
  const valid = (d: unknown): d is DayMode => d === "full" || d === "short" || d === "off";
  const list = Array.isArray(days) && days.length === 5 && days.every(valid) ? (days as DayMode[]) : DEFAULT_ROUTINE.days;
  return { days: [...list], outing: typeof outing === "boolean" ? outing : true };
}

export function isDefaultRoutine(r: WeekRoutine | null | undefined): boolean {
  return !r || (r.outing && r.days.every((d) => d === "full"));
}

/** Há saída esta semana? (pedida e a sexta não está sem estudo) */
export function hasOuting(r: WeekRoutine | null | undefined): boolean {
  return !r || (r.outing && r.days[4] !== "off");
}

/** Dias com estudo (1 = segunda … 5 = sexta). */
export function studyDays(r: WeekRoutine | null | undefined): number[] {
  return [1, 2, 3, 4, 5].filter((d) => (r ? r.days[d - 1] !== "off" : true));
}

/** Resumo curto: "Segunda a quinta, sexta curta, sem saída". */
export function routineSummary(r: WeekRoutine | null | undefined): string {
  if (isDefaultRoutine(r)) return "Segunda a sexta, com saída à sexta";
  const rt = r!;
  const full = rt.days.map((d, i) => (d === "full" ? i : -1)).filter((i) => i >= 0);
  const parts: string[] = [];
  // Dias completos seguidos em intervalo ("segunda a quinta"); senão, lista
  const contiguous = full.length > 1 && full.every((d, k) => k === 0 || d === full[k - 1] + 1);
  if (full.length === 1) parts.push(WEEKDAYS[full[0]]);
  else if (contiguous) parts.push(`${WEEKDAYS[full[0]]} a ${WEEKDAYS[full[full.length - 1]].toLowerCase()}`);
  else if (full.length > 1) parts.push(full.map((i) => WEEKDAYS[i]).join(", "));
  const short = rt.days.map((d, i) => (d === "short" ? WEEKDAYS[i].toLowerCase() : "")).filter(Boolean);
  if (short.length) parts.push(`${short.join(", ")} ${short.length === 1 ? "curta" : "curtas"}`);
  const off = rt.days.map((d, i) => (d === "off" ? WEEKDAYS[i].toLowerCase() : "")).filter(Boolean);
  if (off.length && full.length + short.length > 0 && off.length < 5) parts.push(`sem estudo à ${off.join(", à ")}`);
  if (off.length === 5) return "Sem dias de estudo";
  parts.push(hasOuting(rt) ? "com saída à sexta" : "sem saída");
  const text = parts.join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface RoutineItem {
  day_of_week: number;
  discipline: string;
  is_friday_world: boolean;
  time_slot: string;
  episode?: number;
}

/**
 * Aplica a semana da família a uma lista de blocos (esqueleto do plano,
 * atividades geradas ou blocos fixos do horário):
 * - sexta sem saída e com estudo: a sexta passa a ser um dia de estudo igual
 *   à segunda (sem o episódio de leitura);
 * - dias sem estudo saem; dias curtos ficam só com a manhã (antes das 10:42).
 * Com a semana de sempre, devolve a lista tal como está.
 */
export function applyWeekRoutine<T extends RoutineItem>(items: T[], r: WeekRoutine | null | undefined): T[] {
  if (!r || isDefaultRoutine(r)) return items;
  let out = items;
  if (!r.outing && r.days[4] !== "off") {
    const monday = items.filter((i) => i.day_of_week === 1 && i.discipline !== "reading");
    out = [
      ...items.filter((i) => i.day_of_week !== 5),
      ...monday.map((i) => {
        const { episode: _episode, ...rest } = i;
        return { ...rest, day_of_week: 5, is_friday_world: false } as T;
      }),
    ];
  }
  return out.filter((i) => {
    const mode = r.days[i.day_of_week - 1] ?? "full";
    if (mode === "off") return false;
    if (mode === "short") return i.time_slot.slice(0, 5) < SHORT_DAY_CUTOFF;
    return true;
  });
}

/** Renumera os episódios de leitura que ficaram (1…N por criança). Devolve N. */
export function renumberEpisodes<T extends { child_id: string; day_of_week: number; episode?: number }>(items: T[]): number {
  const byChild = new Map<string, T[]>();
  for (const i of items) if (i.episode) (byChild.get(i.child_id) ?? byChild.set(i.child_id, []).get(i.child_id)!).push(i);
  let max = 0;
  for (const list of byChild.values()) {
    list.sort((a, b) => a.day_of_week - b.day_of_week).forEach((i, k) => { i.episode = k + 1; });
    max = Math.max(max, list.length);
  }
  return max;
}
