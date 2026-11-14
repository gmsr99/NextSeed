// Sugestões para o portefólio (R-10): em cada semana, a app marca 3 ou 4
// atividades por criança que deixam uma boa evidência e diz o que guardar.
//
// A sugestão fica escrita no fim da descrição (" | Portefólio: …"), como a
// etiqueta da semana em família fica no início: aparece em todos os ecrãs e
// PDFs sem colunas novas na base de dados.

export const MAX_HINTS_PER_CHILD = 4;
export const MIN_HINTS_PER_CHILD = 3;

const SUFFIX_RE = /\s*\|\s*Portef[óo]lio:\s*(.*)$/i;

function isJson(description: string): boolean {
  return description.trim().startsWith("{");
}

/** Separa a sugestão de portefólio do resto da descrição. */
export function splitPortfolio(description: string): { text: string; hint: string } {
  if (isJson(description)) return { text: description, hint: "" };
  const m = description.match(SUFFIX_RE);
  if (!m || m.index === undefined) return { text: description, hint: "" };
  return { text: description.slice(0, m.index).trim(), hint: m[1].trim() };
}

/** Põe, troca ou tira a sugestão. Episódios de leitura (JSON) ficam como estão. */
export function withPortfolio(description: string, hint: string): string {
  if (isJson(description)) return description;
  const { text } = splitPortfolio(description);
  const clean = hint.replace(/\s*\|\s*/g, ", ").trim();
  return clean ? `${text} | Portefólio: ${clean}` : text;
}

/** O que guardar quando a IA não disse: por disciplina. */
export const DEFAULT_HINTS: Record<string, string> = {
  language: "Guardar o texto ou a folha que a criança escreveu",
  math: "Foto do trabalho ou a folha com os cálculos",
  world: "Foto ou desenho do que observaram, com uma frase da criança",
  project: "Foto do que construíram e uma frase da criança sobre o que fez",
  expression: "Guardar o trabalho ou tirar uma foto",
  english: "Guardar a folha ou gravar um áudio curto",
};

// Ordem de preferência quando é preciso completar: o que mais facilmente deixa algo para guardar
const FALLBACK_ORDER = ["project", "expression", "language", "world", "math", "english"];

interface Item {
  child_id: string;
  day_of_week: number;
  discipline: string;
  description: string;
  is_friday_world?: boolean;
}

/**
 * Fica com 3 a 4 sugestões por criança, de disciplinas diferentes sempre que
 * possível. `aiHints` vem na mesma ordem dos itens ("" = a IA não sugeriu).
 */
export function applyPortfolioHints<T extends Item>(items: T[], aiHints: (string | undefined | null)[]): T[] {
  const chosen = new Map<number, string>();
  const byChild = new Map<string, number[]>();
  items.forEach((it, i) => {
    if (it.discipline === "reading" || isJson(it.description)) return;
    if (!byChild.has(it.child_id)) byChild.set(it.child_id, []);
    byChild.get(it.child_id)!.push(i);
  });

  for (const idxs of byChild.values()) {
    const picked: number[] = [];
    const disciplines = new Set<string>();
    const take = (i: number, hint: string) => {
      picked.push(i);
      disciplines.add(items[i].discipline);
      chosen.set(i, hint);
    };
    const suggested = idxs.filter((i) => (aiHints[i] ?? "").trim());
    // 1) sugestões da IA, primeiro uma por disciplina, depois as restantes
    for (const i of suggested) {
      if (picked.length >= MAX_HINTS_PER_CHILD) break;
      if (!disciplines.has(items[i].discipline)) take(i, aiHints[i]!.trim());
    }
    for (const i of suggested) {
      if (picked.length >= MAX_HINTS_PER_CHILD) break;
      if (!picked.includes(i)) take(i, aiHints[i]!.trim());
    }
    // 2) completar até ao mínimo com disciplinas ainda não cobertas
    for (const d of FALLBACK_ORDER) {
      if (picked.length >= MIN_HINTS_PER_CHILD) break;
      if (disciplines.has(d)) continue;
      const i = idxs.find((j) => items[j].discipline === d && !items[j].is_friday_world);
      if (i !== undefined) take(i, DEFAULT_HINTS[d]);
    }
  }

  return items.map((it, i) => ({ ...it, description: withPortfolio(it.description, chosen.get(i) ?? "") }));
}

/** Lista da semana para mostrar em resumo: o que guardar, por criança e dia. */
export function weekPortfolioList<T extends Item & { title: string }>(items: T[], childId: string) {
  return items
    .filter((it) => it.child_id === childId)
    .map((it) => ({ day_of_week: it.day_of_week, discipline: it.discipline, title: it.title, hint: splitPortfolio(it.description).hint }))
    .filter((x) => x.hint)
    .sort((a, b) => a.day_of_week - b.day_of_week);
}
