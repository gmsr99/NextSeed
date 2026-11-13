// Índices de manuais (I-01): a família escreve o índice do manual que usa e a
// app reparte as unidades pelas semanas do ano letivo.
//
// Fronteira (doc 10, INS-05): só orientação e calendarização — títulos das
// unidades e páginas. Nunca o conteúdo do manual, nem reescrito nem resumido.

export interface ManualEntry {
  title: string;
  /** Página onde a unidade começa (opcional) */
  page?: number;
}

export interface Manual {
  discipline: string;
  title: string;
  entries: ManualEntry[];
  /** Data (aaaa-mm-dd) a partir da qual o manual se reparte; sem data, desde o início do ano */
  start_date?: string | null;
}

/** Disciplinas a que se pode associar um manual (chaves do currículo). */
export const MANUAL_DISCIPLINES = ["portugues", "matematica", "estudo_do_meio", "ingles", "artes_visuais"] as const;

export const MAX_MANUAL_ENTRIES = 200;

/**
 * Lê um índice colado ou escrito à mão: uma unidade por linha, com a página no
 * fim se a família a quiser pôr ("Unidade 2 — Frações ..... 24", "Frações, p. 24").
 */
export function parseIndex(text: string): ManualEntry[] {
  const entries: ManualEntry[] = [];
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.replace(/\t/g, " ").trim().replace(/^[-•*·–—]+\s*/, "");
    if (!line) continue;
    let page: number | undefined;
    const m = line.match(/^(.*?)[\s.…·_,;:–—-]*(?:\(?\s*p(?:ágs?|ags?|p)?\.?\s*)?(\d{1,4})\s*\)?$/i);
    if (m && m[1].trim() && /\D/.test(m[1])) {
      // "Unidade 3" sozinha é um título, não "Unidade" na página 3
      const title = m[1].trim();
      const sep = line.slice(title.length, line.length - m[2].length);
      const looksLikePage = /[.…·_,;:–—-]|\bp/i.test(sep) || /\s{2,}/.test(sep);
      if (looksLikePage) {
        line = title;
        page = Number(m[2]);
      }
    }
    line = line.replace(/[\s.…·_]+$/, "").trim();
    if (!line || !/\p{L}/u.test(line)) continue;
    entries.push(page ? { title: line, page } : { title: line });
    if (entries.length >= MAX_MANUAL_ENTRIES) break;
  }
  return entries;
}

/** Volta a escrever o índice em texto, para o editar. */
export function formatIndex(entries: ManualEntry[]): string {
  return entries.map((e) => (e.page ? `${e.title} ... ${e.page}` : e.title)).join("\n");
}

/** As páginas servem para repartir? Todas presentes e sempre a crescer. */
export function hasUsablePages(entries: ManualEntry[]): boolean {
  return entries.length > 1 && entries.every((e, i) => !!e.page && (i === 0 || e.page! > entries[i - 1].page!));
}

export interface ManualSlice {
  entryIndex: number;
  title: string;
  /** Páginas a trabalhar nesta semana, quando o índice as tem */
  pageFrom?: number;
  pageTo?: number;
  /** Unidade repartida por várias semanas: parte N de M */
  part?: number;
  parts?: number;
}

/**
 * Reparte as unidades por `slots` semanas. Com páginas, cada unidade ocupa
 * semanas na proporção do seu tamanho; sem páginas, todas pesam o mesmo.
 * Cobre o manual todo: nenhuma unidade fica de fora e nenhuma semana vazia
 * quando há mais semanas do que unidades.
 */
export function distributeManual(entries: ManualEntry[], slots: number): ManualSlice[][] {
  const weeks: ManualSlice[][] = Array.from({ length: Math.max(slots, 0) }, () => []);
  if (entries.length === 0 || slots <= 0) return weeks;

  const paged = hasUsablePages(entries);
  // Tamanho de cada unidade; a última não tem "página seguinte": usa a média
  const sizes = entries.map((e, i) => (paged && i < entries.length - 1 ? entries[i + 1].page! - e.page! : 0));
  const avg = paged ? Math.max(1, Math.round(sizes.slice(0, -1).reduce((a, b) => a + b, 0) / (entries.length - 1))) : 1;
  const weights = paged ? sizes.map((s, i) => (i === entries.length - 1 ? avg : s)) : entries.map(() => 1);
  const total = weights.reduce((a, b) => a + b, 0);

  let acc = 0;
  entries.forEach((e, i) => {
    const start = (acc * slots) / total;
    acc += weights[i];
    const end = (acc * slots) / total;
    const clamp = (n: number) => Math.max(0, Math.min(slots - 1, n));
    // Uma unidade que cabe numa semana não se parte em duas
    const short = end - start <= 1;
    const first = clamp(short ? Math.floor((start + end) / 2) : Math.round(start));
    const last = short ? first : Math.max(first, clamp(Math.round(end) - 1));
    const parts = last - first + 1;
    for (let w = first; w <= last; w++) {
      const slice: ManualSlice = { entryIndex: i, title: e.title };
      if (parts > 1) {
        slice.part = w - first + 1;
        slice.parts = parts;
      }
      if (paged) {
        const from = e.page!;
        const size = weights[i];
        slice.pageFrom = from + Math.floor(((w - first) * size) / parts);
        slice.pageTo = Math.max(slice.pageFrom, from + Math.floor(((w - first + 1) * size) / parts) - 1);
      }
      weeks[w].push(slice);
    }
  });
  return weeks;
}

/** Texto de uma fatia: "Frações (pp. 24–27) · parte 1 de 2". */
export function sliceLabel(s: ManualSlice): string {
  const pages = s.pageFrom
    ? s.pageTo && s.pageTo > s.pageFrom ? ` (pp. ${s.pageFrom}–${s.pageTo})` : ` (p. ${s.pageFrom})`
    : "";
  const part = s.parts ? ` · parte ${s.part} de ${s.parts}` : "";
  return `${s.title}${pages}${part}`;
}
