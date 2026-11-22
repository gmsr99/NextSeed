// Variedade de formatos no plano (P-06). Em vez de pedir à IA que não repita
// (não cumpria: "encontra as personagens principais" todos os dias), a app
// atribui um formato a cada bloco, a rodar ao longo da semana. Nos blocos em
// conjunto, todas as crianças ficam com o mesmo formato.

import { fridayIsStudyDay } from "./familyWeek";

export const FORMATS: Record<string, string[]> = {
  language: ["jogo de sons e sílabas", "leitura e compreensão", "escrita curta", "conversa e narração oral", "jogo de palavras com movimento", "gramática com objetos da casa"],
  math: ["manipulação de objetos", "problema do dia a dia", "jogo com dados ou cartas", "medir e comparar", "padrões e sequências", "cálculo mental em movimento"],
  world: ["observação direta", "experiência simples", "registo desenhado", "conversa e entrevista", "saída curta à rua ou ao quintal", "construção de um modelo"],
  english: ["canção com gestos", "jogo de mímica", "mini-diálogo", "jogo de memória com palavras"],
  expression: ["desenho", "modelagem", "colagem", "música e movimento", "teatro e fantoches", "pintura"],
  project: ["planear e começar", "construir", "investigar", "apresentar"],
};

interface Slot {
  child_id: string;
  day_of_week: number;
  time_slot: string;
  discipline: string;
  is_friday_world?: boolean;
}

/**
 * Formato de cada bloco (null onde não se aplica: leitura, sexta, pré-escolar
 * sem lista). Cada criança roda os formatos de cada disciplina pela ordem dos
 * dias, começando num ponto diferente da dos irmãos; `together` indica os blocos
 * em conjunto, que herdam o formato do primeiro irmão.
 */
export function assignFormats(slots: Slot[], together: boolean[] = []): (string | null)[] {
  const childOrder = [...new Set(slots.map((s) => s.child_id))];
  const order = slots
    .map((_, i) => i)
    .sort((a, b) => slots[a].day_of_week - slots[b].day_of_week || slots[a].time_slot.localeCompare(slots[b].time_slot));
  const counters = new Map<string, number>();
  const shared = new Map<string, string>();
  const out: (string | null)[] = slots.map(() => null);
  // Sexta de saída não leva formato; sexta de estudo (sem saída, P-18) leva
  const fridayStudy = fridayIsStudyDay(slots);

  for (const i of order) {
    const s = slots[i];
    const list = FORMATS[s.discipline];
    if (!list || (s.day_of_week === 5 && !fridayStudy)) continue;
    const blockKey = `${s.day_of_week}|${s.time_slot.split("-")[0]}|${s.discipline}`;
    if (together[i] && shared.has(blockKey)) {
      out[i] = shared.get(blockKey)!;
      continue;
    }
    const key = `${s.child_id}|${s.discipline}`;
    const n = counters.get(key) ?? 0;
    counters.set(key, n + 1);
    const offset = childOrder.indexOf(s.child_id);
    out[i] = list[(n + offset) % list.length];
    if (together[i]) shared.set(blockKey, out[i]!);
  }
  return out;
}
