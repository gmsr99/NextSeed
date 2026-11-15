// O que cada metodologia define na NexSeed (P-15, P-16; ver o documento
// claude/Metodologias_percurso_ritmo_forma.md na base de conhecimento).
//
//  percurso  tem uma sequência própria de conteúdos ou materiais
//  ritmo     organiza o ano e a semana por ritmos e estações, não por conteúdos
//  forma     decide como se trabalha; o conteúdo vem de outro lado
//
// Só a metodologia principal (prioridade 1) usa o seu papel de percurso ou
// ritmo; as secundárias entram sempre como forma de trabalhar.

export type MethodologyRole = "percurso" | "ritmo" | "forma";

const ROLE_BY_SLUG: Record<string, MethodologyRole> = {
  montessori: "percurso",
  "charlotte-mason-living-books": "percurso",
  "classical-education": "percurso",
  "waldorf-rudolf-steiner": "ritmo",
  "forest-school": "ritmo",
  pikler: "ritmo",
};

export function methodologyRole(slug: string | null | undefined): MethodologyRole {
  return (slug && ROLE_BY_SLUG[slug]) || "forma";
}

export const ROLE_LABEL: Record<MethodologyRole, string> = {
  percurso: "Tem percurso próprio",
  ritmo: "Dá o ritmo",
  forma: "Forma de trabalhar",
};

export const ROLE_EXPLAINER: Record<MethodologyRole, string> = {
  percurso: "Tem uma ordem própria de materiais ou leituras. Como principal, organiza as áreas do pré-escolar; a sequência completa ainda está a ser preparada com famílias que a praticam.",
  ritmo: "Organiza a semana e o ano por ritmos e estações. Como principal, dá o ritmo ao pré-escolar.",
  forma: "Decide como se trabalha cada conteúdo. O que se trabalha vem do currículo, dos manuais ou do tema da semana.",
};

/**
 * Instruções para o pré-escolar, conforme a metodologia principal. Ficam ao
 * nível da organização (áreas, ritmo); não inventam uma sequência de materiais.
 */
export function preschoolGuidance(principalSlug: string | null | undefined): string {
  const role = methodologyRole(principalSlug);
  if (principalSlug === "montessori") {
    return "A metodologia principal é Montessori: organiza as atividades do pré-escolar pelas cinco áreas (Vida Prática, Sensorial, Linguagem, Matemática, Cultura), com Vida Prática e Sensorial todos os dias. Uma dificuldade de cada vez, materiais reais da casa, a criança repete quanto quiser. NÃO inventes uma sequência de materiais Montessori nem digas que a criança \"deve estar\" em determinado material: segue-se a criança.";
  }
  if (role === "ritmo") {
    return "A metodologia principal dá o RITMO: no pré-escolar, cada dia da semana tem a sua atividade âncora, sempre a mesma de semana para semana (ex.: segunda pão ou culinária, terça pintura, quarta modelagem, quinta trabalhos manuais), com histórias contadas, canções, movimento e natureza, ligados à estação do ano. Sem letras, números ou fichas.";
  }
  return "";
}
