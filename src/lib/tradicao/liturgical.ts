// Tradição da família (I-08, fase 1): ano litúrgico católico, calculado.
// Sem IA e sem dados pessoais. Os tempos e as festas móveis vêm da data da
// Páscoa (cálculo gregoriano). Dois calendários: o atual e o tradicional (1962).

export type LiturgicalCalendar = "atual" | "tradicional";
export type Season =
  | "advento" | "natal" | "depois_epifania" | "septuagesima" | "quaresma" | "semana_santa" | "pascoa" | "comum";

const DAY = 86_400_000;
function at(y: number, m: number, d: number): Date { return new Date(y, m - 1, d, 12); }
function addDays(d: Date, n: number): Date { return new Date(d.getTime() + n * DAY); }
function noon(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); }
function daysBetween(a: Date, b: Date): number { return Math.round((noon(b).getTime() - noon(a).getTime()) / DAY); }

/** Domingo de Páscoa (calendário gregoriano, algoritmo anónimo). */
export function easter(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return at(year, month, day);
}

/** 1.º domingo do Advento: o quarto domingo antes do Natal. */
export function adventStart(year: number): Date {
  const christmas = at(year, 12, 25);
  const lastSunday = addDays(christmas, -(christmas.getDay() === 0 ? 7 : christmas.getDay()));
  return addDays(lastSunday, -21);
}

/** Epifania: em Portugal, no calendário atual, o domingo entre 2 e 8 de janeiro; no de 1962, 6 de janeiro. */
export function epiphany(year: number, cal: LiturgicalCalendar): Date {
  if (cal === "tradicional") return at(year, 1, 6);
  const jan2 = at(year, 1, 2);
  return addDays(jan2, (7 - jan2.getDay()) % 7);
}

/** Batismo do Senhor: fim do tempo do Natal. */
export function baptism(year: number, cal: LiturgicalCalendar): Date {
  if (cal === "tradicional") return at(year, 1, 13);
  const ep = epiphany(year, cal);
  // Epifania a 7 ou 8 de janeiro: o Batismo passa para segunda-feira
  return ep.getDate() >= 7 ? addDays(ep, 1) : addDays(ep, 7);
}

function ordinal(n: number): string { return `${n}.ª`; }

export interface LiturgicalDay {
  season: Season;
  /** Ex.: "2.ª semana do Advento", "Tempo do Natal", "Tempo Comum" */
  label: string;
  /** Antífona mariana do tempo (só o nome) ou null no Tríduo */
  antiphon: string | null;
}

export function liturgicalDay(date: Date, cal: LiturgicalCalendar = "atual"): LiturgicalDay {
  const d = noon(date);
  const y = d.getFullYear();
  const advent = adventStart(y);
  const eas = easter(y);
  const ash = addDays(eas, -46);
  const palm = addDays(eas, -7);
  const holyThu = addDays(eas, -3);
  const pentecost = addDays(eas, 49);
  const antiphon = marianAntiphon(d, cal);

  if (d >= advent && d < at(y, 12, 25)) {
    return { season: "advento", label: `${ordinal(Math.floor(daysBetween(advent, d) / 7) + 1)} semana do Advento`, antiphon };
  }
  // Tempo do Natal: de 25 de dezembro ao Batismo do Senhor (no ano seguinte)
  if (d >= at(y, 12, 25) || d <= baptism(y, cal)) {
    return { season: "natal", label: "Tempo do Natal", antiphon };
  }
  if (d >= palm && d < eas) return { season: "semana_santa", label: d >= holyThu ? "Tríduo Pascal" : "Semana Santa", antiphon };
  if (d >= ash && d < palm) {
    const firstSunday = addDays(eas, -42);
    const label = d < firstSunday ? "Quaresma: Quarta-feira de Cinzas" : `${ordinal(Math.floor(daysBetween(firstSunday, d) / 7) + 1)} semana da Quaresma`;
    return { season: "quaresma", label, antiphon };
  }
  if (d >= eas && d <= pentecost) {
    return { season: "pascoa", label: d.getTime() === pentecost.getTime() ? "Pentecostes" : `${ordinal(Math.floor(daysBetween(eas, d) / 7) + 1)} semana da Páscoa`, antiphon };
  }
  if (cal === "tradicional") {
    const septuagesima = addDays(eas, -63);
    if (d >= septuagesima && d < ash) return { season: "septuagesima", label: "Tempo da Septuagésima", antiphon };
    if (d > baptism(y, cal) && d < septuagesima) return { season: "depois_epifania", label: "Tempo depois da Epifania", antiphon };
    return { season: "comum", label: "Tempo depois do Pentecostes", antiphon };
  }
  return { season: "comum", label: "Tempo Comum", antiphon };
}

/**
 * Antífona mariana (só o nome; o texto fica com a família):
 * Alma Redemptoris Mater do Advento até 2 de fevereiro; Ave Regina Caelorum até
 * Quarta-feira Santa; nenhuma no Tríduo; Regina Caeli no tempo pascal (no de
 * 1962, até ao sábado depois do Pentecostes); Salve Rainha no resto do ano.
 */
export function marianAntiphon(date: Date, cal: LiturgicalCalendar = "atual"): string | null {
  const d = noon(date);
  const y = d.getFullYear();
  const eas = easter(y);
  if (d >= adventStart(y) || d <= at(y, 2, 2)) return "Alma Redemptoris Mater";
  if (d < addDays(eas, -3)) return "Ave Regina Caelorum";
  if (d < eas) return null;
  const end = cal === "tradicional" ? addDays(eas, 55) : addDays(eas, 49);
  if (d <= end) return "Regina Caeli";
  return "Salve Rainha";
}

/** Semana (segunda a domingo) que começa nesta segunda-feira: o que vale para ela. */
export function liturgicalWeek(monday: Date, cal: LiturgicalCalendar = "atual"): LiturgicalDay {
  return liturgicalDay(monday, cal);
}

/**
 * Pausas sugeridas, em que "a liturgia é o currículo" (como no plano da F-01):
 * - Natal: da segunda-feira da semana do Natal ao domingo a seguir ao Ano Novo;
 * - Semana Santa e Oitava: da segunda-feira Santa ao domingo a seguir à Páscoa.
 * `schoolYearStart` é o ano em que o ano letivo começa (setembro).
 */
export function traditionBreaks(schoolYearStart: number): { label: string; from: string; to: string }[] {
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const xmas = at(schoolYearStart, 12, 25);
  const xmasMonday = addDays(xmas, -((xmas.getDay() + 6) % 7));
  const jan2 = at(schoolYearStart + 1, 1, 2);
  const sundayAfterNewYear = addDays(jan2, (7 - jan2.getDay()) % 7);
  const eas = easter(schoolYearStart + 1);
  return [
    { label: "Natal", from: iso(xmasMonday), to: iso(sundayAfterNewYear) },
    { label: "Semana Santa e Oitava da Páscoa", from: iso(addDays(eas, -6)), to: iso(addDays(eas, 7)) },
  ];
}
