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

import { distributeManual, sliceLabel, type Manual } from "./manualIndex";

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
  schoolYearStart: number;
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
  schoolYearStart: number,
  manuals: Manual[] = [],
): AnnualPlan {
  const weeks: PlanWeek[] = schoolWeeks(schoolYearStart).map((w) => ({ ...w, byDiscipline: {} }));
  const yearRound: Record<string, AnnualContent[]> = {};

  const withManual = new Set(manuals.filter((m) => m.entries.length > 0).map((m) => m.discipline));
  const contents = allContents.filter((c) => !withManual.has(c.discipline));
  const teaching = weeks.filter((w) => !w.isReview);
  for (const manual of manuals) {
    if (!withManual.has(manual.discipline)) continue;
    // O manual reparte-se pelas semanas que faltam a partir da data em que a
    // família começa a usá-lo; se já não houver semanas, pelo ano inteiro.
    const from = manual.start_date ? mondayOf(new Date(`${manual.start_date}T12:00:00`)).getTime() : 0;
    const remaining = teaching.filter((w) => w.monday.getTime() >= from);
    const span = remaining.length > 0 ? remaining : teaching;
    distributeManual(manual.entries, span.length).forEach((slices, i) => {
      if (slices.length === 0) return;
      span[i].byDiscipline[manual.discipline] = slices.map((s) => ({
        id: `manual:${manual.discipline}:${s.entryIndex}:${s.part ?? 1}`,
        discipline: manual.discipline,
        period: span[i].period,
        domain: manual.title,
        content: sliceLabel(s),
        sort_order: s.entryIndex,
        fromManual: true,
      }));
    });
  }

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

  return { schoolYearStart, weeks, yearRound };
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
