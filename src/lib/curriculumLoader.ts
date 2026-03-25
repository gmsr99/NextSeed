/**
 * Extrai os objectivos do currículo nacional real (DGE / Aprendizagens Essenciais)
 * a partir do ficheiro JSON oficial.
 */
import curriculo2ano from "@/data/curriculo_2ano_portugal.json";

type DisciplineObjectives = Record<string, string[]>;

function extract2ano(): DisciplineObjectives {
  const d = curriculo2ano.disciplinas;

  return {
    language: [
      ...d.portugues.dominios.oralidade.compreensao,
      ...d.portugues.dominios.oralidade.expressao,
      ...d.portugues.dominios.leitura_e_escrita.leitura,
      ...d.portugues.dominios.leitura_e_escrita.escrita,
      ...d.portugues.dominios.educacao_literaria,
      ...d.portugues.dominios.gramatica,
    ],
    math: [
      ...d.matematica.temas.numeros_e_operacoes.aprendizagens,
      ...d.matematica.temas.geometria_e_medida.aprendizagens,
      ...d.matematica.temas.algebra.aprendizagens,
      ...d.matematica.temas.dados_e_probabilidades.aprendizagens,
    ],
    world: [
      ...d.estudo_do_meio.dominios.sociedade.aprendizagens,
      ...d.estudo_do_meio.dominios.natureza.aprendizagens,
      ...d.estudo_do_meio.dominios.tecnologia.aprendizagens,
    ],
    english: [...d.ingles_aec.aprendizagens_tipicas_aec],
    expression: [
      ...d.educacao_artistica.subareas.artes_visuais.aprendizagens,
      ...d.educacao_artistica.subareas.expressao_dramatica_teatro.aprendizagens,
      ...d.educacao_artistica.subareas.musica.aprendizagens,
      ...d.educacao_artistica.subareas.danca.aprendizagens,
    ],
    project: [
      ...d.estudo_do_meio.dominios.tecnologia.aprendizagens,
      ...d.cidadania_e_desenvolvimento.competencias,
    ],
  };
}

const CURRICULUM_CACHE: Record<string, DisciplineObjectives> = {};

export function getCurriculumObjectives(schoolYear: string): DisciplineObjectives {
  if (CURRICULUM_CACHE[schoolYear]) return CURRICULUM_CACHE[schoolYear];

  let result: DisciplineObjectives = {};

  if (schoolYear === "2º ano") {
    result = extract2ano();
  }
  // Outros anos usam o fallback hardcoded no geminiPlanner

  CURRICULUM_CACHE[schoolYear] = result;
  return result;
}
