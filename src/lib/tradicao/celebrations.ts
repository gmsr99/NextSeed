// Tradição da família (I-08, fase 1): celebrações do Advento ao Batismo do
// Senhor. Só nomes e datas; as fichas (2–3 linhas + desafio) são escritas e
// revistas por quem pratica (F-01 e amigas) e só aparecem com `revisto: true`.
// Nenhuma destas entradas está revista ainda: a app não mostra nenhuma até lá.
// Lista para rever no Sheet "Tradição da família | Fichas para rever" (Drive).
import { baptism, epiphany, type LiturgicalCalendar } from "./liturgical";

export interface Celebration {
  id: string;
  /** Nome no calendário escolhido */
  name: string;
  date: Date;
  /** Solenidade, festa, memória… (como no calendário) */
  rank: string;
  /** Próprio de Portugal */
  proprioPt?: boolean;
  ficha?: { texto: string; desafio: string };
  revisto: boolean;
}

type Rule =
  | { kind: "fixed"; month: number; day: number }
  | { kind: "range"; month: number; from: number; to: number }
  | { kind: "sagrada_familia" | "epifania" | "batismo" | "nome_jesus" };

interface Entry {
  id: string;
  atual?: { name: string; rank: string; rule: Rule };
  tradicional?: { name: string; rank: string; rule: Rule };
  proprioPt?: boolean;
  ficha?: { texto: string; desafio: string };
  revisto: boolean;
}

const fixed = (month: number, day: number): Rule => ({ kind: "fixed", month, day });

/** Primeiro lote (por confirmar com a F-01, sobretudo as diferenças entre calendários). */
const ENTRIES: Entry[] = [
  { id: "santo-andre", atual: { name: "Santo André, apóstolo", rank: "Festa", rule: fixed(11, 30) }, tradicional: { name: "Santo André, apóstolo", rank: "2.ª classe", rule: fixed(11, 30) }, revisto: false },
  { id: "s-francisco-xavier", atual: { name: "S. Francisco Xavier", rank: "Memória", rule: fixed(12, 3) }, tradicional: { name: "S. Francisco Xavier", rank: "3.ª classe", rule: fixed(12, 3) }, revisto: false },
  { id: "s-nicolau", atual: { name: "S. Nicolau", rank: "Memória facultativa", rule: fixed(12, 6) }, tradicional: { name: "S. Nicolau", rank: "3.ª classe", rule: fixed(12, 6) }, revisto: false },
  { id: "s-ambrosio", atual: { name: "S. Ambrósio", rank: "Memória", rule: fixed(12, 7) }, tradicional: { name: "S. Ambrósio", rank: "3.ª classe", rule: fixed(12, 7) }, revisto: false },
  { id: "imaculada-conceicao", atual: { name: "Imaculada Conceição da Virgem Santa Maria, padroeira de Portugal", rank: "Solenidade", rule: fixed(12, 8) }, tradicional: { name: "Imaculada Conceição da Virgem Santa Maria", rank: "1.ª classe", rule: fixed(12, 8) }, proprioPt: true, revisto: false },
  { id: "santa-luzia", atual: { name: "Santa Luzia", rank: "Memória", rule: fixed(12, 13) }, tradicional: { name: "Santa Luzia", rank: "3.ª classe", rule: fixed(12, 13) }, revisto: false },
  { id: "s-joao-da-cruz", atual: { name: "S. João da Cruz", rank: "Memória", rule: fixed(12, 14) }, tradicional: { name: "S. João da Cruz", rank: "3.ª classe", rule: fixed(11, 24) }, revisto: false },
  { id: "antifonas-o", atual: { name: "Antífonas «Ó» do Advento", rank: "Férias maiores do Advento", rule: { kind: "range", month: 12, from: 17, to: 23 } }, tradicional: { name: "Antífonas «Ó» do Advento", rank: "Férias maiores do Advento", rule: { kind: "range", month: 12, from: 17, to: 23 } }, revisto: false },
  { id: "natal", atual: { name: "Natal do Senhor", rank: "Solenidade", rule: fixed(12, 25) }, tradicional: { name: "Natal de Nosso Senhor Jesus Cristo", rank: "1.ª classe", rule: fixed(12, 25) }, revisto: false },
  { id: "santo-estevao", atual: { name: "Santo Estêvão, primeiro mártir", rank: "Festa", rule: fixed(12, 26) }, tradicional: { name: "Santo Estêvão, primeiro mártir", rank: "2.ª classe", rule: fixed(12, 26) }, revisto: false },
  { id: "s-joao-evangelista", atual: { name: "S. João, apóstolo e evangelista", rank: "Festa", rule: fixed(12, 27) }, tradicional: { name: "S. João, apóstolo e evangelista", rank: "2.ª classe", rule: fixed(12, 27) }, revisto: false },
  { id: "santos-inocentes", atual: { name: "Santos Inocentes, mártires", rank: "Festa", rule: fixed(12, 28) }, tradicional: { name: "Santos Inocentes, mártires", rank: "2.ª classe", rule: fixed(12, 28) }, revisto: false },
  { id: "sagrada-familia", atual: { name: "Sagrada Família de Jesus, Maria e José", rank: "Festa", rule: { kind: "sagrada_familia" } }, tradicional: { name: "Sagrada Família de Jesus, Maria e José", rank: "2.ª classe", rule: { kind: "sagrada_familia" } }, revisto: false },
  { id: "1-janeiro", atual: { name: "Santa Maria, Mãe de Deus", rank: "Solenidade", rule: fixed(1, 1) }, tradicional: { name: "Oitava do Natal", rank: "1.ª classe", rule: fixed(1, 1) }, revisto: false },
  { id: "nome-de-jesus", atual: { name: "Santíssimo Nome de Jesus", rank: "Memória facultativa", rule: fixed(1, 3) }, tradicional: { name: "Santíssimo Nome de Jesus", rank: "2.ª classe", rule: { kind: "nome_jesus" } }, revisto: false },
  { id: "epifania", atual: { name: "Epifania do Senhor", rank: "Solenidade", rule: { kind: "epifania" } }, tradicional: { name: "Epifania do Senhor", rank: "1.ª classe", rule: { kind: "epifania" } }, revisto: false },
  { id: "batismo", atual: { name: "Batismo do Senhor", rank: "Festa", rule: { kind: "batismo" } }, tradicional: { name: "Comemoração do Batismo do Senhor", rank: "2.ª classe", rule: { kind: "batismo" } }, revisto: false },
];

function at(y: number, m: number, d: number): Date { return new Date(y, m - 1, d, 12); }

/** Datas de uma regra num ano civil (uma regra "range" dá vários dias). */
function datesFor(rule: Rule, year: number, cal: LiturgicalCalendar): Date[] {
  switch (rule.kind) {
    case "fixed": return [at(year, rule.month, rule.day)];
    case "range": return Array.from({ length: rule.to - rule.from + 1 }, (_, i) => at(year, rule.month, rule.from + i));
    case "epifania": return [epiphany(year, cal)];
    case "batismo": return [baptism(year, cal)];
    case "nome_jesus": {
      // 1962: domingo entre 2 e 5 de janeiro; se não houver, 2 de janeiro
      for (let d = 2; d <= 5; d++) if (at(year, 1, d).getDay() === 0) return [at(year, 1, d)];
      return [at(year, 1, 2)];
    }
    case "sagrada_familia": {
      if (cal === "tradicional") {
        // Domingo depois da Epifania (7 a 13 de janeiro)
        for (let d = 7; d <= 13; d++) if (at(year, 1, d).getDay() === 0) return [at(year, 1, d)];
        return [];
      }
      // Domingo na oitava do Natal (26 a 31 de dezembro); se não houver, 30 de dezembro
      for (let d = 26; d <= 31; d++) if (at(year, 12, d).getDay() === 0) return [at(year, 12, d)];
      return [at(year, 12, 30)];
    }
  }
}

/** Todas as celebrações (revistas ou não) entre duas datas, inclusive. */
export function allCelebrations(from: Date, to: Date, cal: LiturgicalCalendar, proprioPt = true): Celebration[] {
  const out: Celebration[] = [];
  for (let y = from.getFullYear(); y <= to.getFullYear(); y++) {
    for (const e of ENTRIES) {
      const c = cal === "tradicional" ? e.tradicional : e.atual;
      if (!c) continue;
      for (const date of datesFor(c.rule, y, cal)) {
        const day = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
        if (day < new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0) || day > new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23)) continue;
        const name = !proprioPt && e.proprioPt ? c.name.replace(", padroeira de Portugal", "") : c.name;
        out.push({ id: e.id, name, date: day, rank: c.rank, proprioPt: e.proprioPt, ficha: e.ficha, revisto: e.revisto });
      }
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** O que a app mostra: só as celebrações com ficha revista, da semana que começa nesta segunda. */
export function weekCelebrations(monday: Date, cal: LiturgicalCalendar, proprioPt = true): Celebration[] {
  const sunday = new Date(monday.getTime() + 6 * 86_400_000);
  return allCelebrations(monday, sunday, cal, proprioPt).filter((c) => c.revisto && c.ficha);
}
