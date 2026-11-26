// A nossa semana (P-18, versão mínima do P-04): como é a semana de estudo de
// cada família. Para cada dia, de segunda a sexta: dia completo, dia curto
// (cerca de 1 hora, só a manhã), dia livre (P-29: sem currículo, só o bloco da
// manhã e a leitura em voz alta, como no plano da F-01) ou sem estudo; e as
// saídas (visitas, idas a uma comunidade): em qualquer dia, as vezes que
// quiserem, de manhã, à tarde ou o dia todo. A saída de sexta o dia todo é a
// "Ver Mundo" que a IA prepara; as outras ficam no horário como "Saída", e
// essa parte do dia fica sem currículo. Sem configuração, fica a semana de sempre.
//
// Guarda-se sem migração: em family_week_routines.days (jsonb, 5 posições) um
// dia com saída fica {"m": modo, "o": parte}; sem saída, só o modo (texto).
// A coluna outing continua a dizer se há "Ver Mundo" à sexta.

export type DayMode = "full" | "short" | "free" | "off";
/** Saída nesse dia: nenhuma, de manhã, à tarde ou o dia todo. */
export type OutingPart = "none" | "morning" | "afternoon" | "day";

export interface WeekRoutine {
  /** Segunda a sexta */
  days: DayMode[];
  /** Saída "Ver Mundo" à sexta (o dia todo, preparada pela IA) */
  outing: boolean;
  /** Saídas de segunda a sexta. A da sexta "day" é a "Ver Mundo" (igual a outing). */
  outings?: OutingPart[];
  /** P-27: mostrar horas no horário (por omissão, não: só a ordem e a duração) */
  hours?: boolean;
}

export const DEFAULT_ROUTINE: WeekRoutine = {
  days: ["full", "full", "full", "full", "full"], outing: true, outings: ["none", "none", "none", "none", "day"],
};

export const OUTING_LABELS: Record<OutingPart, string> = {
  none: "Sem saída",
  morning: "Saída de manhã",
  afternoon: "Saída à tarde",
  day: "Saída o dia todo",
};

/** Horas dos blocos de saída no horário (a hora real é a da família). */
const OUTING_SLOTS: Record<Exclude<OutingPart, "none">, string> = {
  morning: "09:30-12:30",
  afternoon: "14:00-16:30",
  day: "09:30-16:30",
};
const MORNING_END = "12:30";
const AFTERNOON_START = "14:00";

export const DAY_MODE_LABELS: Record<DayMode, string> = {
  full: "Dia completo",
  short: "Dia curto (cerca de 1 hora)",
  free: "Dia livre (só a manhã em família e a leitura)",
  off: "Sem estudo",
};

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

/** Um dia curto fica com o que começa antes desta hora: português e matemática da manhã. */
const SHORT_DAY_CUTOFF = "10:42";

/** P-29: o que fica num dia livre: o bloco da manhã (ou as orações, com a tradição), o almoço e a leitura. */
const FREE_DAY_KEEP = new Set(["ritual", "lunch", "reading"]);

/** Lê o que vem da base de dados; qualquer valor estranho volta ao de sempre. */
export function normalizeRoutine(days: unknown, outing: unknown, scheduleMode?: unknown): WeekRoutine {
  const valid = (d: unknown): d is DayMode => d === "full" || d === "short" || d === "free" || d === "off";
  const validPart = (o: unknown): o is OutingPart => o === "none" || o === "morning" || o === "afternoon" || o === "day";
  const fridayWorld = typeof outing === "boolean" ? outing : true;
  const parsed = Array.isArray(days) && days.length === 5
    ? days.map((d) => (valid(d) ? { m: d, o: null as OutingPart | null }
        : d && typeof d === "object" && valid((d as { m?: unknown }).m)
          ? { m: (d as { m: DayMode }).m, o: validPart((d as { o?: unknown }).o) ? (d as { o: OutingPart }).o : null }
          : null))
    : null;
  if (!parsed || parsed.some((x) => x === null)) {
    return { days: [...DEFAULT_ROUTINE.days], outing: fridayWorld, outings: ["none", "none", "none", "none", fridayWorld ? "day" : "none"], hours: scheduleMode === "horas" };
  }
  const list = parsed as { m: DayMode; o: OutingPart | null }[];
  const outings = list.map((x, i) => (x.o ?? (i === 4 && fridayWorld ? "day" : "none")));
  return { days: list.map((x) => x.m), outing: outings[4] === "day", outings, hours: scheduleMode === "horas" };
}

/** As saídas de cada dia (preenche a partir de outing, para rotinas antigas). */
export function routineOutings(r: WeekRoutine | null | undefined): OutingPart[] {
  if (!r) return [...DEFAULT_ROUTINE.outings!];
  if (r.outings?.length === 5) return r.outings.map((o, i) => (r.days[i] === "off" ? "none" : o));
  return ["none", "none", "none", "none", r.outing && r.days[4] !== "off" ? "day" : "none"];
}

/** Para guardar: dias com saída ficam {m, o}; os outros, só o modo. */
export function serializeRoutine(r: WeekRoutine): { days: (DayMode | { m: DayMode; o: OutingPart })[]; outing: boolean } {
  const o = routineOutings(r);
  return {
    days: r.days.map((m, i) => (o[i] !== "none" ? { m, o: o[i] } : m)),
    outing: o[4] === "day",
  };
}

/** P-27: o horário mostra horas? Por omissão (sem configuração), não. */
export const showsHours = (r: WeekRoutine | null | undefined) => r?.hours === true;

export function isDefaultRoutine(r: WeekRoutine | null | undefined): boolean {
  if (!r) return true;
  const o = routineOutings(r);
  return r.days.every((d) => d === "full") && o.slice(0, 4).every((x) => x === "none") && o[4] === "day";
}

/** Há "Ver Mundo" esta semana? (saída o dia todo à sexta, que não está sem estudo) */
export function hasOuting(r: WeekRoutine | null | undefined): boolean {
  return routineOutings(r)[4] === "day";
}

/** Outras saídas (fora a "Ver Mundo"): dia (1–5) e parte. */
export function otherOutings(r: WeekRoutine | null | undefined): { day: number; part: Exclude<OutingPart, "none"> }[] {
  const o = routineOutings(r);
  return o.flatMap((p, i) => (p === "none" || (i === 4 && p === "day") ? [] : [{ day: i + 1, part: p }]));
}

/** Blocos "Saída" para o horário (só visualização, como os outros blocos fixos). */
export function outingBlocks<T>(r: WeekRoutine | null | undefined, make: (day: number, slot: string, title: string) => T): T[] {
  return otherOutings(r).map(({ day, part }) =>
    make(day, OUTING_SLOTS[part], part === "morning" ? "Saída (manhã)" : part === "afternoon" ? "Saída (tarde)" : "Saída (dia todo)"));
}

/** P-29: dia livre (1 = segunda … 5 = sexta). */
export function isFreeDay(r: WeekRoutine | null | undefined, day: number): boolean {
  return !!r && r.days[day - 1] === "free";
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
  const free = rt.days.map((d, i) => (d === "free" ? WEEKDAYS[i].toLowerCase() : "")).filter(Boolean);
  if (free.length) parts.push(`${free.join(", ")} ${free.length === 1 ? "livre" : "livres"}`);
  const off = rt.days.map((d, i) => (d === "off" ? WEEKDAYS[i].toLowerCase() : "")).filter(Boolean);
  if (off.length && full.length + short.length + free.length > 0 && off.length < 5) parts.push(`sem estudo à ${off.join(", à ")}`);
  if (off.length === 5) return "Sem dias de estudo";
  const o = routineOutings(rt);
  const outs = o.flatMap((p, i) => (p === "none" ? [] : [`${WEEKDAYS[i].toLowerCase()}${p === "morning" ? " de manhã" : p === "afternoon" ? " à tarde" : ""}`]));
  parts.push(outs.length ? `${outs.length === 1 ? "saída" : "saídas"} à ${outs.join(", à ")}` : "sem saída");
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
 * - dias sem estudo saem; dias curtos ficam só com a manhã (antes das 10:42);
 * - dias livres ficam só com o bloco da manhã, o almoço e a leitura (P-29).
 * Com a semana de sempre, devolve a lista tal como está.
 */
export function applyWeekRoutine<T extends RoutineItem>(items: T[], r: WeekRoutine | null | undefined): T[] {
  if (!r || isDefaultRoutine(r)) return items;
  let out = items;
  const o = routineOutings(r);
  if (!hasOuting(r) && r.days[4] !== "off") {
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
    // Saídas (fora a "Ver Mundo"): essa parte do dia fica sem currículo
    const part = o[i.day_of_week - 1];
    const start = i.time_slot.slice(0, 5);
    if (!i.is_friday_world) {
      if (part === "day" && !(i.day_of_week === 5)) return false;
      if (part === "morning" && start < MORNING_END) return false;
      if (part === "afternoon" && start >= AFTERNOON_START) return false;
    }
    if (mode === "short") return start < SHORT_DAY_CUTOFF;
    if (mode === "free") return i.is_friday_world || FREE_DAY_KEEP.has(i.discipline);
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
