// Rumo do ano (backlog P-13 fase 1 e P-12, doc 10 INS-14).
//
// O plano anual é calculado, não guardado: parte dos conteúdos do currículo
// (curriculum_contents: período + domínio + ordem) e do calendário escolar, e
// distribui-os pelas semanas de cada período. O plano semanal vai depois buscar
// os conteúdos da semana, em vez de perguntar à família o que quer ensinar.
//
// Regras:
//  - cada domínio (ex.: Leitura, Gramática) avança ao seu ritmo ao longo do
//    período, por isso cada semana toca em vários domínios; a ordem dentro de
//    cada domínio é a do currículo;
//  - a última semana de cada período é de balanço: sem conteúdos novos;
//  - os conteúdos "ao longo do ano" não têm semana fixa.
//
// Hipótese (até haver calendário por família, P-04): calendário escolar oficial
// do 1.º ciclo, aproximado à semana. Só o Natal e a Páscoa contam como pausa.

import { distributeManual, hasNextLesson, indexEntries, isNextLesson, lessonDaysOf, lessonsPerWeekLabel, remainingEntries, sliceLabel, type Manual } from "./manualIndex";

export type Period = "1" | "2" | "3";

export interface AnnualContent {
  id: string;
  discipline: string;
  period: string; // "1" | "2" | "3" | "all"
  domain: string | null;
  content: string;
  sort_order: number | null;
  /** Vem do índice de um manual da família (não tem estado nas Áreas de Aprendizagem) */
  fromManual?: boolean;
}

export interface SchoolWeek {
  /** Número da semana no ano letivo (1 = primeira semana de setembro com aulas) */
  number: number;
  monday: Date;
  period: Period;
  /** Semana de balanço: rever, consolidar e arrumar o portefólio */
  isReview: boolean;
}

export interface PlanWeek extends SchoolWeek {
  byDiscipline: Record<string, AnnualContent[]>;
}

export interface AnnualPlan {
  weeks: PlanWeek[];
  /** Conteúdos trabalhados ao longo do ano, por disciplina */
  yearRound: Record<string, AnnualContent[]>;
}

const DAY = 24 * 60 * 60 * 1000;

function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Segunda-feira da semana de uma data. */
export function mondayOf(date: Date): Date {
  const d = atMidnight(date);
  const day = d.getDay(); // 0 = domingo
  return addDays(d, day === 0 ? -6 : 1 - day);
}

/** Primeira segunda-feira em ou depois da data. */
function mondayOnOrAfter(date: Date): Date {
  const m = mondayOf(date);
  return m.getTime() < atMidnight(date).getTime() ? addDays(m, 7) : m;
}

/**
 * Segunda-feira da semana que a família está a preparar. De segunda a sexta é
 * a semana em curso; ao sábado e ao domingo já é a semana seguinte (é quando
 * se prepara a semana nova). Evita que o tema seguinte caia na semana que acabou.
 */
export function planningMonday(date: Date): Date {
  const day = atMidnight(date).getDay(); // 0 = domingo, 6 = sábado
  return day === 0 || day === 6 ? mondayOnOrAfter(date) : mondayOf(date);
}

/** Domingo de Páscoa (algoritmo gregoriano anónimo). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = março
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Ano em que começa o ano letivo de uma data (setembro a agosto). */
export function schoolYearStartFor(date: Date): number {
  return date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
}

function weeksBetween(first: Date, last: Date): Date[] {
  const out: Date[] = [];
  for (let d = first; d.getTime() <= last.getTime(); d = addDays(d, 7)) out.push(d);
  return out;
}

/** Semanas com aulas de um ano letivo (segunda-feira de cada uma). */
export function schoolWeeks(schoolYearStart: number): SchoolWeek[] {
  const y = schoolYearStart;
  const easter = easterSunday(y + 1);
  const ranges: Array<[Period, Date, Date]> = [
    // 1.º período: da segunda-feira entre 11 e 17 de setembro até meados de dezembro
    ["1", mondayOnOrAfter(new Date(y, 8, 11)), mondayOf(new Date(y, 11, 13))],
    // 2.º período: de janeiro até duas semanas antes da Páscoa
    ["2", mondayOnOrAfter(new Date(y + 1, 0, 3)), addDays(easter, -13)],
    // 3.º período: da semana a seguir à Páscoa até ao fim de junho
    ["3", addDays(easter, 8), mondayOf(new Date(y + 1, 5, 28))],
  ];

  const weeks: SchoolWeek[] = [];
  for (const [period, first, last] of ranges) {
    const mondays = weeksBetween(first, last);
    mondays.forEach((monday, i) => {
      weeks.push({
        number: weeks.length + 1,
        monday,
        period,
        isReview: mondays.length >= 4 && i === mondays.length - 1,
      });
    });
  }
  return weeks;
}

// ─── Calendário da família (P-24) ─────────────────────────────────────────────
// A família pode dizer quando começa e acaba o seu ano e em que datas pára.
// Sem calendário próprio, vale o escolar oficial.

export interface CalendarBreak {
  from: string; // aaaa-mm-dd
  to: string;
}

export interface FamilyCalendar {
  year_start: string; // aaaa-mm-dd
  year_end: string;
  breaks: CalendarBreak[];
  /** Última semana de cada período sem conteúdos novos */
  review_weeks: boolean;
}

export const MAX_CALENDAR_WEEKS = 70;

export function parseDay(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** O calendário escolar oficial, no formato que a família pode ajustar. */
export function officialCalendar(schoolYearStart: number): FamilyCalendar {
  const weeks = schoolWeeks(schoolYearStart);
  const breaks: CalendarBreak[] = [];
  for (let i = 1; i < weeks.length; i++) {
    const gapStart = addDays(weeks[i - 1].monday, 7);
    if (weeks[i].monday.getTime() > gapStart.getTime()) {
      breaks.push({ from: isoDay(gapStart), to: isoDay(addDays(weeks[i].monday, -1)) });
    }
  }
  return {
    year_start: isoDay(weeks[0].monday),
    year_end: isoDay(addDays(weeks[weeks.length - 1].monday, 4)),
    breaks,
    review_weeks: true,
  };
}

export function isValidCalendar(cal: FamilyCalendar): boolean {
  const a = parseDay(cal.year_start).getTime();
  const b = parseDay(cal.year_end).getTime();
  if (!(a < b) || (b - a) / (7 * DAY) > MAX_CALENDAR_WEEKS) return false;
  return cal.breaks.every((br) => parseDay(br.from).getTime() <= parseDay(br.to).getTime());
}

/**
 * Semanas com aulas do calendário da família. Uma semana conta se tiver pelo
 * menos três dias úteis dentro do ano e fora das pausas.
 *
 * Períodos: num ano que começa entre agosto e outubro e dura até 12 meses,
 * seguem as datas habituais (até dezembro, até à Páscoa, depois da Páscoa);
 * noutros casos (ex.: maio a julho do ano seguinte), o ano divide-se em três
 * partes iguais, para os conteúdos de cada período do currículo terem onde cair.
 */
export function familyWeeks(cal: FamilyCalendar): SchoolWeek[] {
  if (!isValidCalendar(cal)) return [];
  const start = parseDay(cal.year_start);
  const end = parseDay(cal.year_end);
  const breaks = cal.breaks.map((b) => [parseDay(b.from).getTime(), parseDay(b.to).getTime()] as const);
  const teachingDays = (monday: Date) => {
    let n = 0;
    for (let i = 0; i < 5; i++) {
      const t = addDays(monday, i).getTime();
      if (t < start.getTime() || t > end.getTime()) continue;
      if (breaks.some(([a, b]) => t >= a && t <= b)) continue;
      n++;
    }
    return n;
  };
  const mondays = weeksBetween(mondayOf(start), mondayOf(end)).filter((m) => teachingDays(m) >= 3);
  if (mondays.length === 0) return [];

  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  const byDate = start.getMonth() >= 7 && start.getMonth() <= 9 && months <= 12;
  const newYear = new Date(start.getFullYear() + 1, 0, 1).getTime();
  const afterEaster = addDays(easterSunday(start.getFullYear() + 1), 1).getTime();
  const periodOf = (m: Date, i: number): Period => {
    if (!byDate) return String(Math.min(2, Math.floor((i * 3) / mondays.length)) + 1) as Period;
    return m.getTime() < newYear ? "1" : m.getTime() < afterEaster ? "2" : "3";
  };

  const weeks: SchoolWeek[] = mondays.map((monday, i) => ({
    number: i + 1, monday, period: periodOf(monday, i), isReview: false,
  }));
  if (cal.review_weeks) {
    for (const p of ["1", "2", "3"] as Period[]) {
      const inPeriod = weeks.filter((w) => w.period === p);
      if (inPeriod.length >= 4) inPeriod[inPeriod.length - 1].isReview = true;
    }
  }
  return weeks;
}

/**
 * Semanas a usar para uma data: as do calendário da família, se ele cobrir essa
 * data (ou se o ano dele ainda não começou); senão, as do calendário escolar.
 */
export function weeksFor(date: Date, cal?: FamilyCalendar | null): SchoolWeek[] {
  if (cal && isValidCalendar(cal)) {
    const t = atMidnight(date).getTime();
    const from = addDays(parseDay(cal.year_start), -120).getTime();
    const to = addDays(parseDay(cal.year_end), 6).getTime();
    if (t >= from && t <= to) {
      const weeks = familyWeeks(cal);
      if (weeks.length > 0) return weeks;
    }
  }
  return schoolWeeks(schoolYearStartFor(date));
}

function bySortOrder(a: AnnualContent, b: AnnualContent): number {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
}

/**
 * Distribui os conteúdos de um ano de escolaridade pelas semanas do ano letivo.
 * Nas disciplinas em que a família tem um manual, o rumo segue o índice do
 * manual (ao longo do ano inteiro) em vez dos conteúdos do currículo.
 */
export function buildAnnualPlan(
  allContents: AnnualContent[],
  /** Ano em que começa o ano letivo (calendário escolar) ou as semanas do calendário da família */
  calendar: number | SchoolWeek[],
  manuals: Manual[] = [],
): AnnualPlan {
  const base = typeof calendar === "number" ? schoolWeeks(calendar) : calendar;
  const weeks: PlanWeek[] = base.map((w) => ({ ...w, byDiscipline: {} }));
  const yearRound: Record<string, AnnualContent[]> = {};

  const withManual = new Set(manuals.filter((m) => m.entries.length > 0).map((m) => m.discipline));
  const contents = allContents.filter((c) => !withManual.has(c.discipline));
  const teaching = weeks.filter((w) => !w.isReview);
  // Vários manuais na mesma disciplina (ex.: manual e caderno de fichas):
  // cada um segue o seu índice e o tema leva o nome do manual à frente
  const perDiscipline = new Map<string, number>();
  for (const m of manuals) if (m.entries.length > 0) perDiscipline.set(m.discipline, (perDiscipline.get(m.discipline) ?? 0) + 1);
  manuals.forEach((manual, k) => {
    if (!withManual.has(manual.discipline) || manual.entries.length === 0) return;
    const several = (perDiscipline.get(manual.discipline) ?? 0) > 1;
    // "Lição seguinte": todas as semanas de aulas, a partir de quando começam,
    // dizem só "lição seguinte". O livro marca onde ficaram; o plano não desatualiza.
    // Com "lição seguinte", cada semana diz quantas lições cabem (se souberem quanto leva uma)
    const perWeek = hasNextLesson(manual.entries) ? lessonsPerWeekLabel(lessonDaysOf(manual.entries)) : null;
    const nextLabel = `Lição seguinte${perWeek ? ` (${perWeek} esta semana)` : ""}`;
    if (isNextLesson(manual.entries)) {
      const from = manual.start_date ? planningMonday(new Date(`${manual.start_date}T12:00:00`)).getTime() : 0;
      teaching.filter((w) => w.monday.getTime() >= from).forEach((w, i) => {
        (w.byDiscipline[manual.discipline] ??= []).push({
          id: `manual:${manual.discipline}:${k}:next:${i}`,
          discipline: manual.discipline,
          period: w.period,
          domain: manual.title,
          content: several ? `${manual.title}: ${nextLabel.charAt(0).toLowerCase()}${nextLabel.slice(1)}` : nextLabel,
          sort_order: k * 1000,
          fromManual: true,
        });
      });
      return;
    }
    // Com índice e "lição seguinte": o índice reparte-se como sempre e cada semana
    // diz "lição seguinte" com a estimativa de onde devem andar
    const left = remainingEntries(indexEntries(manual.entries));
    const next = hasNextLesson(manual.entries);
    if (left.length === 0) return;
    // O manual reparte-se pelas semanas que faltam a partir da data em que a
    // família começa a usá-lo; se já não houver semanas, pelo ano inteiro.
    // Guardado ao fim de semana conta a partir da segunda seguinte (também
    // corrige os manuais que já foram guardados assim).
    const from = manual.start_date ? planningMonday(new Date(`${manual.start_date}T12:00:00`)).getTime() : 0;
    const remaining = teaching.filter((w) => w.monday.getTime() >= from);
    const span = remaining.length > 0 ? remaining : teaching;
    distributeManual(left.map((x) => x.entry), span.length).forEach((slices, i) => {
      if (slices.length === 0) return;
      const list = (span[i].byDiscipline[manual.discipline] ??= []);
      for (const s of slices) {
        const line = left[s.entryIndex].index;
        list.push({
          id: `manual:${manual.discipline}:${k}:${line}:${s.part ?? 1}`,
          discipline: manual.discipline,
          period: span[i].period,
          domain: manual.title,
          content: next
            ? `${several ? `${manual.title}: ` : ""}${nextLabel} · por esta altura: ${sliceLabel(s)}`
            : several ? `${manual.title}: ${sliceLabel(s)}` : sliceLabel(s),
          sort_order: k * 1000 + line,
          fromManual: true,
        });
      }
    });
  });

  // Agrupar por período → disciplina → domínio (cada domínio é um fio que avança)
  const strands = new Map<string, AnnualContent[]>();
  for (const c of contents) {
    if (c.period !== "1" && c.period !== "2" && c.period !== "3") {
      (yearRound[c.discipline] ??= []).push(c);
      continue;
    }
    const key = `${c.period}|${c.discipline}|${c.domain ?? ""}`;
    if (!strands.has(key)) strands.set(key, []);
    strands.get(key)!.push(c);
  }
  for (const list of Object.values(yearRound)) list.sort(bySortOrder);

  // Cada domínio arranca com um pequeno desfasamento em relação ao anterior,
  // para a primeira semana do período não levar o primeiro conteúdo de todos.
  const strandIndex = new Map<string, number>(); // por período + disciplina
  for (const key of [...strands.keys()].sort()) {
    const list = strands.get(key)!;
    const [period, discipline] = key.split("|");
    const slots = weeks.filter((w) => w.period === period && !w.isReview);
    if (slots.length === 0) continue;
    const n = strandIndex.get(`${period}|${discipline}`) ?? 0;
    strandIndex.set(`${period}|${discipline}`, n + 1);
    const offset = (n * 0.382) % 1;
    list.sort(bySortOrder);
    list.forEach((c, k) => {
      const week = slots[Math.floor(((k + offset) * slots.length) / list.length)];
      (week.byDiscipline[c.discipline] ??= []).push(c);
    });
  }

  return { weeks, yearRound };
}

/** Semana do plano que corresponde a uma data (null fora das semanas com aulas). */
export function planWeekFor(plan: AnnualPlan, date: Date): PlanWeek | null {
  const t = mondayOf(date).getTime();
  // Tolerância de umas horas por causa das mudanças de hora
  return plan.weeks.find((w) => Math.abs(w.monday.getTime() - t) < DAY / 2) ?? null;
}

/**
 * Conteúdos em foco numa semana, por disciplina, sem os que já estão dominados.
 * Devolve null quando a semana não tem conteúdos próprios (pausas, semanas de
 * balanço, fora do ano letivo): aí quem chama usa o período inteiro.
 *
 * Quando uma disciplina não tem conteúdo novo nessa semana (ou já está tudo
 * dominado), continua o último conteúdo por dominar do período, ou adianta o
 * seguinte. O plano é uma orientação, não uma dívida: não acumula atrasados.
 */
export function weekFocus(
  plan: AnnualPlan,
  date: Date,
  isMastered: (contentId: string) => boolean = () => false,
): Record<string, AnnualContent[]> | null {
  const week = planWeekFor(plan, date);
  if (!week || week.isReview) return null;

  const periodWeeks = plan.weeks.filter((w) => w.period === week.period && !w.isReview);
  const pos = periodWeeks.findIndex((w) => w.number === week.number);
  const disciplines = new Set<string>([
    ...periodWeeks.flatMap((w) => Object.keys(w.byDiscipline)),
    ...Object.keys(plan.yearRound),
  ]);

  const focus: Record<string, AnnualContent[]> = {};
  for (const d of disciplines) {
    const open = (w: PlanWeek) => (w.byDiscipline[d] ?? []).filter((c) => !isMastered(c.id));
    let picked = open(week);
    // Continuar o mais recente por dominar…
    for (let i = pos - 1; picked.length === 0 && i >= 0; i--) picked = open(periodWeeks[i]).slice(-1);
    // …ou adiantar o seguinte
    for (let i = pos + 1; picked.length === 0 && i < periodWeeks.length; i++) picked = open(periodWeeks[i]).slice(0, 1);

    // Conteúdos do ano todo: dois de cada vez, a rodar de semana para semana
    const all = (plan.yearRound[d] ?? []).filter((c) => !isMastered(c.id));
    if (picked.length === 0 && all.length > 0) {
      const start = ((week.number - 1) * 2) % all.length;
      picked = all.length <= 2 ? all : [all[start], all[(start + 1) % all.length]];
    }
    if (picked.length > 0) focus[d] = picked;
  }
  return Object.keys(focus).length > 0 ? focus : null;
}

export function formatWeekShort(monday: Date): string {
  const friday = addDays(monday, 4);
  const sameMonth = monday.getMonth() === friday.getMonth();
  const dm: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const start = sameMonth ? String(monday.getDate()) : monday.toLocaleDateString("pt-PT", dm);
  return `${start} a ${friday.toLocaleDateString("pt-PT", dm)}`;
}

/** Nome a mostrar para os manuais de uma disciplina ("Matemática 2 + Caderno de fichas"). */
export function manualLabel(list: AnnualContent[]): string {
  return [...new Set(list.filter((c) => c.fromManual).map((c) => c.domain).filter(Boolean))].join(" + ");
}
