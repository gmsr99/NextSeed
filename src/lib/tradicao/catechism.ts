// Tradição da família, fase 2 (I-08): catecismo em família, sem IA.
// Uma pergunta por semana, para todos juntos, aprendida de cor por etapas
// (como no plano da F-01): ler → repetir com ajuda → sem ajuda → sozinho →
// em família. A família cola os números e os títulos das perguntas; as
// respostas ficam no livro dela e a app nunca as escreve.

export interface CatechismQuestion { n: number | null; t: string }

export interface FamilyCatechism {
  name: string | null;
  questions: CatechismQuestion[];
  pos: number;
}

export const MAX_CATECHISM_QUESTIONS = 600;
const MAX_TITLE = 200;

/** As cinco etapas da semana, de segunda a sexta. */
export const CATECHISM_STAGES = [
  { day: "Segunda", stage: "Ler a pergunta e a resposta no livro, em conjunto" },
  { day: "Terça", stage: "Repetir com ajuda" },
  { day: "Quarta", stage: "Repetir sem ajuda" },
  { day: "Quinta", stage: "Recitar sozinho(a)" },
  { day: "Sexta", stage: "Recitar em família" },
] as const;

/**
 * Lê a lista colada: uma pergunta por linha, com ou sem número no início
 * ("12. Quem é Deus?", "12 - Quem é Deus?", "P. 12 Quem é Deus?" ou só o título).
 * Ignora linhas vazias e corta títulos muito longos (não queremos as respostas).
 */
export function parseCatechism(text: string): CatechismQuestion[] {
  const out: CatechismQuestion[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(?:p(?:ergunta)?\.?\s*)?(\d{1,4})\s*[.)\-:–—º°]*\s*(.*)$/i);
    const n = m && m[2] ? Number(m[1]) : null;
    const t = (m && m[2] ? m[2] : line).trim().slice(0, MAX_TITLE);
    if (!t) continue;
    out.push({ n, t });
    if (out.length >= MAX_CATECHISM_QUESTIONS) break;
  }
  return out;
}

/** Volta a texto, para editar a lista. */
export function catechismToText(qs: CatechismQuestion[]): string {
  return qs.map((q) => (q.n != null ? `${q.n}. ${q.t}` : q.t)).join("\n");
}

/** Normaliza o que vem da base de dados (jsonb). */
export function normalizeCatechism(name: unknown, questions: unknown, pos: unknown): FamilyCatechism {
  const qs = Array.isArray(questions)
    ? questions
        .filter((q): q is { n?: unknown; t?: unknown } => !!q && typeof q === "object")
        .map((q) => ({ n: typeof q.n === "number" ? q.n : null, t: typeof q.t === "string" ? q.t.slice(0, MAX_TITLE) : "" }))
        .filter((q) => q.t)
    : [];
  const p = typeof pos === "number" && pos >= 0 ? Math.floor(pos) : 0;
  return { name: typeof name === "string" && name.trim() ? name.trim() : null, questions: qs, pos: p };
}

export interface WeekCatechism {
  /** "Pergunta n.º 12: Quem é Deus?" */
  label: string;
  number: number | null;
  title: string;
  /** 1-based, sobre o total */
  index: number;
  total: number;
  book: string | null;
  stages: typeof CATECHISM_STAGES;
  last: boolean;
}

/** A pergunta desta semana, ou null se a lista estiver vazia ou já tiverem chegado ao fim. */
export function weekCatechism(c: FamilyCatechism | null): WeekCatechism | null {
  if (!c || c.questions.length === 0 || c.pos >= c.questions.length) return null;
  const q = c.questions[c.pos];
  return {
    label: q.n != null ? `Pergunta n.º ${q.n}: ${q.t}` : q.t,
    number: q.n,
    title: q.t,
    index: c.pos + 1,
    total: c.questions.length,
    book: c.name,
    stages: CATECHISM_STAGES,
    last: c.pos === c.questions.length - 1,
  };
}
