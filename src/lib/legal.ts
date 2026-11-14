// Dados dos textos legais (B-07, B-08). Os campos a null ainda não foram
// decididos: enquanto houver algum, as páginas mostram um aviso de rascunho e
// os textos não devem ser publicados (ver o documento de revisão jurídica na
// base de conhecimento do projeto).

/** Versão dos Termos e da Política. Fica registada no consentimento de cada conta. */
export const LEGAL_VERSION = "2.0-rascunho";
export const LEGAL_UPDATED = "14 de novembro de 2026";

export const LEGAL = {
  /** Nome do responsável pelo tratamento (pessoa singular durante o piloto, doc 05 §4) */
  controllerName: null as string | null,
  /** NIF do responsável */
  controllerNif: null as string | null,
  contactEmail: "geral@nexseed.pt",
  /** O Gemini já está em faturação paga? (B-01). Muda o que a política diz sobre a Google */
  geminiPaid: false,
  /** Entidade de resolução alternativa de litígios de consumo indicada nos Termos */
  adrEntity: null as string | null,
  adrWebsite: null as string | null,
};

export function legalPending(): string[] {
  const missing: string[] = [];
  if (!LEGAL.controllerName) missing.push("nome do responsável pelo tratamento");
  if (!LEGAL.controllerNif) missing.push("NIF do responsável");
  if (!LEGAL.adrEntity) missing.push("entidade de resolução alternativa de litígios");
  return missing;
}
