/**
 * Extrai objetivos do currículo nacional (DGE / Aprendizagens Essenciais)
 * a partir dos ficheiros JSON oficiais em src/data/curriculos/.
 *
 * Usado pelo Motor Criativo para gerar sugestões personalizadas.
 * Para a página Áreas de Aprendizagem, usa-se useCurriculum() que lê do Supabase.
 */

import curriculo1ano from "@/data/curriculos/curriculo_1ano.json";
import curriculo2ano from "@/data/curriculos/curriculo_2ano.json";
import curriculo3ano from "@/data/curriculos/curriculo_3ano.json";
import curriculo4ano from "@/data/curriculos/curriculo_4ano.json";
import curriculoPre  from "@/data/curriculos/curriculo_pre_escolar.json";

export type DisciplineObjectives = Record<string, string[]>;

// ─── Extratores por ano ────────────────────────────────────────────────────────

function extractPreEscolar(): DisciplineObjectives {
  const a = curriculoPre.areas_de_conteudo as Record<string, unknown>;
  const fps = a.formacao_pessoal_e_social as { aprendizagens_a_promover: string[] };
  const ec  = a.expressao_e_comunicacao  as Record<string, unknown>;
  const dominios = (ec.dominios as Record<string, unknown>);
  const loae = dominios.linguagem_oral_e_abordagem_escrita as {
    aprendizagens_a_promover: { linguagem_oral: string[]; abordagem_escrita: string[] };
  };
  const mat  = dominios.matematica as {
    aprendizagens_a_promover: {
      numeros_e_operacoes: string[];
      organizacao_e_tratamento_de_dados: string[];
      geometria_e_medida: string[];
      atitudes: string[];
    };
  };
  const ea   = dominios.educacao_artistica as Record<string, unknown>;
  const subs = (ea["subdomínios"] ?? ea["subdominios"] ?? {}) as Record<string, { aprendizagens_a_promover: string[] }>;
  const cmd  = a.conhecimento_do_mundo as {
    componentes: {
      introducao_metodologia_cientifica:  { aprendizagens_a_promover: string[] };
      abordagem_ciencias_mundo_social:    { aprendizagens_a_promover: string[] };
      mundo_tecnologico:                  { aprendizagens_a_promover: string[] };
    };
  };

  return {
    language: [
      ...(loae.aprendizagens_a_promover.linguagem_oral ?? []),
      ...(loae.aprendizagens_a_promover.abordagem_escrita ?? []),
    ],
    math: [
      ...(mat.aprendizagens_a_promover.numeros_e_operacoes ?? []),
      ...(mat.aprendizagens_a_promover.organizacao_e_tratamento_de_dados ?? []),
      ...(mat.aprendizagens_a_promover.geometria_e_medida ?? []),
      ...(mat.aprendizagens_a_promover.atitudes ?? []),
    ],
    expression: [
      ...(subs.artes_visuais?.aprendizagens_a_promover ?? []),
      ...(subs.jogo_dramatico_teatro?.aprendizagens_a_promover ?? []),
      ...(subs.musica?.aprendizagens_a_promover ?? []),
      ...(subs.danca?.aprendizagens_a_promover ?? []),
    ],
    world: [
      ...(cmd.componentes.introducao_metodologia_cientifica.aprendizagens_a_promover ?? []),
      ...(cmd.componentes.abordagem_ciencias_mundo_social.aprendizagens_a_promover ?? []),
      ...(cmd.componentes.mundo_tecnologico.aprendizagens_a_promover ?? []),
    ],
    citizenship: fps.aprendizagens_a_promover,
  };
}

function extractAno(
  data: typeof curriculo1ano | typeof curriculo2ano | typeof curriculo3ano | typeof curriculo4ano,
): DisciplineObjectives {
  const d   = data.disciplinas as Record<string, unknown>;

  // Português
  const ptDom = (d.portugues as Record<string, unknown>).dominios as Record<string, unknown>;
  const lang: string[] = [
    ...((ptDom.oralidade as Record<string, string[]>)?.compreensao ?? []),
    ...((ptDom.oralidade as Record<string, string[]>)?.expressao ?? []),
  ];
  if (ptDom.leitura_e_escrita) {
    const le = ptDom.leitura_e_escrita as Record<string, string[]>;
    lang.push(...(le.leitura ?? []), ...(le.escrita ?? []), ...(le.consciencia_fonologica ?? []));
  } else {
    lang.push(
      ...((ptDom.leitura as Record<string, string[]>)?.aprendizagens ?? []),
      ...((ptDom.escrita as Record<string, string[]>)?.aprendizagens ?? []),
    );
  }
  lang.push(
    ...(Array.isArray(ptDom.educacao_literaria) ? ptDom.educacao_literaria as string[] : []),
    ...(Array.isArray(ptDom.gramatica) ? ptDom.gramatica as string[] : []),
  );

  // Matemática
  const matTemas = ((d.matematica as Record<string, unknown>).temas as Record<string, { aprendizagens: string[] }>);
  const math = [
    ...(matTemas.numeros_e_operacoes?.aprendizagens ?? []),
    ...(matTemas.geometria_e_medida?.aprendizagens ?? []),
    ...(matTemas.algebra?.aprendizagens ?? []),
    ...(matTemas.dados_e_probabilidades?.aprendizagens ?? []),
  ];

  // Estudo do Meio
  const emDom = ((d.estudo_do_meio as Record<string, unknown>).dominios as Record<string, { aprendizagens: string[] }>);
  const world = [
    ...(emDom.sociedade?.aprendizagens ?? []),
    ...(emDom.natureza?.aprendizagens ?? []),
    ...(emDom.tecnologia?.aprendizagens ?? []),
  ];

  // Educação Artística
  const eaSubs = ((d.educacao_artistica as Record<string, unknown>).subareas as Record<string, { aprendizagens: string[] }>) ?? {};
  const expression = [
    ...(eaSubs.artes_visuais?.aprendizagens ?? []),
    ...(eaSubs.expressao_dramatica_teatro?.aprendizagens ?? []),
    ...(eaSubs.musica?.aprendizagens ?? []),
    ...(eaSubs.danca?.aprendizagens ?? []),
  ];

  // Inglês (3º/4º obrigatório; 2º AEC)
  const ingles = d.ingles as Record<string, unknown> | undefined;
  const inglesAec = d.ingles_aec as { aprendizagens_tipicas_aec?: string[] } | undefined;
  let english: string[] = [];
  if (ingles?.dominios) {
    const ing = ingles.dominios as Record<string, string[]>;
    english = [
      ...(ing.compreensao_oral ?? []),
      ...(ing.expressao_oral ?? []),
      ...(ing.leitura ?? []),
      ...(ing.escrita ?? []),
      ...(ing.vocabulario_tematico ?? ing.vocabulario_tematico_adicional_4_ano ?? []),
    ];
  } else if (inglesAec) {
    english = inglesAec.aprendizagens_tipicas_aec ?? [];
  }

  // Cidadania
  const cid = d.cidadania_e_desenvolvimento as Record<string, unknown>;
  const citizenship = (cid?.temas_principais ?? cid?.competencias ?? []) as string[];

  return { language, math, world, expression, english, citizenship };
}

// ─── Cache + ponto de entrada público ─────────────────────────────────────────

const CACHE: Record<string, DisciplineObjectives> = {};

export function getCurriculumObjectives(schoolYear: string): DisciplineObjectives {
  if (CACHE[schoolYear]) return CACHE[schoolYear];

  let result: DisciplineObjectives;
  switch (schoolYear) {
    case "pré-escolar":
    case "Pré-escolar":
    case "Pré-Escolar":
      result = extractPreEscolar(); break;
    case "1º ano":
      result = extractAno(curriculo1ano); break;
    case "2º ano":
      result = extractAno(curriculo2ano); break;
    case "3º ano":
      result = extractAno(curriculo3ano); break;
    case "4º ano":
      result = extractAno(curriculo4ano); break;
    default:
      result = {};
  }

  CACHE[schoolYear] = result;
  return result;
}
