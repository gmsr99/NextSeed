import type { FamilyMethodology } from "@/lib/types";

export const PRIORITY_PROMPT_LABELS: Record<1 | 2 | 3, string> = {
  1: "METODOLOGIA PRINCIPAL",
  2: "METODOLOGIA SECUNDÁRIA",
  3: "METODOLOGIA COMPLEMENTAR",
};

/**
 * Bloco de contexto pedagógico da família, por ordem de prioridade, para injetar
 * no prompt da IA. Partilhado pelo motor criativo e pelo planeador semanal — a
 * metodologia é da família, por isso ambos cruzam as mesmas 1-3 abordagens.
 */
const GENERATED_SUBJECT = {
  projetos: "Os projetos gerados",
  atividades: "As atividades geradas",
} as const;

export function buildMethodologyContext(
  methodologies: FamilyMethodology[],
  generatedNoun: keyof typeof GENERATED_SUBJECT = "projetos",
): string {
  if (methodologies.length === 0) return "";

  const blocks = [...methodologies]
    .sort((a, b) => a.priority - b.priority)
    .map((fm) => {
      const m = fm.methodology;
      if (!m) return null;
      const keywordsStr = m.keywords?.length ? `\nPalavras-chave: ${m.keywords.join(", ")}` : "";
      return `${PRIORITY_PROMPT_LABELS[fm.priority]}: ${m.name}\nAbordagem: "${m.ai_generation_style}"${keywordsStr}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return blocks
    ? `[CONTEXTO PEDAGÓGICO DA FAMÍLIA]\n${blocks}\n\n${GENERATED_SUBJECT[generatedNoun]} DEVEM refletir esta(s) abordagem(ns) pedagógica(s), especialmente a principal.\n`
    : "";
}
