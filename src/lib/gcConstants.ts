import type { ContentProgressStatus } from "./types";

// ── Mapeamento: ano escolar → código BD ──────────────────────────────────────
export const YEAR_MAP: Record<string, string> = {
  "Pré-escolar":         "pre",
  "Pré-escolar 3 anos":  "pre",
  "Pré-escolar 4 anos":  "pre",
  "Pré-escolar 5/6 anos":"pre",
  "1º ano": "1",
  "2º ano": "2",
  "3º ano": "3",
  "4º ano": "4",
};

// ── Mapeamento: disciplina do plano → chave(s) GC ────────────────────────────
// Retorna array porque uma disciplina de plano pode cobrir várias GC
export const PLAN_TO_GC: Record<string, string[]> = {
  language:    ["portugues"],
  math:        ["matematica"],
  world:       ["estudo_do_meio"],
  world_visit: ["estudo_do_meio"],
  expression:  ["artes_visuais"],
  // pré-escolar: expression também cobre formacao_pessoal_social implicitamente
  // mas não criamos mapping duplo — fica separado para não sobrecarregar o dialog
};

// ── Labels das disciplinas GC ────────────────────────────────────────────────
export const GC_DISCIPLINE_LABELS: Record<string, string> = {
  portugues:               "Português",
  matematica:              "Matemática",
  estudo_do_meio:          "Estudo do Meio",
  artes_visuais:           "Artes e Expressão",
  formacao_pessoal_social: "Formação Pessoal e Social",
};

// ── Labels dos períodos ──────────────────────────────────────────────────────
export const PERIOD_LABELS: Record<string, string> = {
  "1": "1º Período",
  "2": "2º Período",
  "3": "3º Período",
  all: "Ano todo",
};

// ── Configuração de status — sistema 1-2-3 ───────────────────────────────────
// 1 = A aprender  |  2 = Em progresso  |  3 = Dominado
export const STATUS_CONFIG: Record<
  ContentProgressStatus,
  { label: string; rating: number; classes: string; bar: string; text: string; bg: string }
> = {
  a_aprender:   {
    rating:  1,
    label:   "A aprender",
    classes: "bg-gray-100 text-gray-500 border-gray-200",
    bar:     "bg-gray-300",
    text:    "text-gray-500",
    bg:      "bg-gray-100",
  },
  em_progresso: {
    rating:  2,
    label:   "Em progresso",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    bar:     "bg-amber-400",
    text:    "text-amber-700",
    bg:      "bg-amber-50",
  },
  dominado:     {
    rating:  3,
    label:   "Dominado",
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
    bar:     "bg-emerald-500",
    text:    "text-emerald-800",
    bg:      "bg-emerald-50",
  },
};

export const STATUS_ORDER: ContentProgressStatus[] = [
  "a_aprender",
  "em_progresso",
  "dominado",
];

// Conteúdos com este status não voltam a entrar no Gemini nem no dialog pós-semana
export const MASTERED_STATUS: ContentProgressStatus = "dominado";
export const ACTIVE_STATUSES: ContentProgressStatus[] = ["a_aprender", "em_progresso"];
