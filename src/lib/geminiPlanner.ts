import type { Child } from "./types";
import type { GeneratedPlanItem } from "./planGenerator";
import { DISCIPLINE_LABELS, DAY_LABELS, getAlignedPreSchoolSlots } from "./planGenerator";
import { GC_DISCIPLINE_LABELS } from "./gcConstants";
import { supabase } from "./supabase";

// ─── Estrutura do horário (espelho do planGenerator.ts — só slots variáveis) ──

const PRIMARY_DAYS_SKELETON = [
  // Seg
  [
    { slot: "09:45-10:10", discipline: "language",   sort: 0 },
    { slot: "10:17-10:42", discipline: "math",       sort: 1 },
    { slot: "11:05-11:50", discipline: "world",      sort: 2 },
    { slot: "14:00-14:30", discipline: "english",    sort: 3 },
    { slot: "14:45-15:15", discipline: "reading",    sort: 4, episode: 1 },
  ],
  // Ter
  [
    { slot: "09:45-10:10", discipline: "math",       sort: 0 },
    { slot: "10:17-10:42", discipline: "language",   sort: 1 },
    { slot: "11:05-11:50", discipline: "world",      sort: 2 },
    { slot: "14:00-14:30", discipline: "expression", sort: 3 },
    { slot: "14:45-15:15", discipline: "reading",    sort: 4, episode: 2 },
  ],
  // Qua
  [
    { slot: "09:45-10:10", discipline: "language",   sort: 0 },
    { slot: "10:17-10:42", discipline: "math",       sort: 1 },
    { slot: "11:05-11:50", discipline: "project",    sort: 2 },
    { slot: "14:00-14:30", discipline: "expression", sort: 3 },
    { slot: "14:45-15:15", discipline: "reading",    sort: 4, episode: 3 },
  ],
  // Qui
  [
    { slot: "09:45-10:10", discipline: "math",       sort: 0 },
    { slot: "10:17-10:42", discipline: "language",   sort: 1 },
    { slot: "11:05-11:50", discipline: "world",      sort: 2 },
    { slot: "14:00-14:30", discipline: "project",    sort: 3 },
    { slot: "14:45-15:15", discipline: "reading",    sort: 4, episode: 4 },
  ],
];

const PRE_SCHOOL_SLOTS_4Y = [
  { slot: "09:30-10:00", discipline: "language",   sort: 0 },
  { slot: "10:00-10:30", discipline: "math",       sort: 1 },
  { slot: "10:45-11:15", discipline: "expression", sort: 2 },
  { slot: "14:30-15:00", discipline: "world",      sort: 3 },
];

// ─── Esqueleto para geração de IA ──────────────────────────────────────────────

interface SkeletonItem {
  child_id: string;
  child_name: string;
  school_year: string;
  day_of_week: number;
  time_slot: string;
  discipline: string;
  discipline_label: string;
  is_friday_world: boolean;
  sort_order: number;
  episode?: number;
}

function buildSkeleton(children: Child[]): SkeletonItem[] {
  const skeleton: SkeletonItem[] = [];
  // Deteta família multi-nível
  const hasPrimaryChild = children.some(
    (c) => !c.school_year.toLowerCase().startsWith("pré"),
  );

  for (const child of children) {
    const isPreSchool = child.school_year.toLowerCase().startsWith("pré");
    const aligned = isPreSchool && hasPrimaryChild;

    if (!isPreSchool) {
      PRIMARY_DAYS_SKELETON.forEach((day, dayIdx) => {
        day.forEach((s) => {
          skeleton.push({
            child_id: child.id,
            child_name: child.name,
            school_year: child.school_year,
            day_of_week: dayIdx + 1,
            time_slot: s.slot,
            discipline: s.discipline,
            discipline_label: DISCIPLINE_LABELS[s.discipline] ?? s.discipline,
            is_friday_world: false,
            sort_order: s.sort,
            episode: (s as { episode?: number }).episode,
          });
        });
      });
      // Sexta-feira — 3 blocos variáveis
      skeleton.push({
        child_id: child.id, child_name: child.name, school_year: child.school_year,
        day_of_week: 5, time_slot: "09:45-11:50", discipline: "world_visit",
        discipline_label: "Ver Mundo", is_friday_world: true, sort_order: 0,
      });
      skeleton.push({
        child_id: child.id, child_name: child.name, school_year: child.school_year,
        day_of_week: 5, time_slot: "14:00-14:30", discipline: "expression",
        discipline_label: "Registo da Visita", is_friday_world: false, sort_order: 1,
      });
      skeleton.push({
        child_id: child.id, child_name: child.name, school_year: child.school_year,
        day_of_week: 5, time_slot: "14:45-15:15", discipline: "world_visit",
        discipline_label: "Encerramento Reflexivo", is_friday_world: false, sort_order: 2,
      });
    } else {
      // Pré-escolar: alinhado com irmão do primário, ou horário independente
      const age = child.school_year.includes("3 anos") ? 3
                : child.school_year.includes("4 anos") ? 4
                : 5;

      for (let d = 0; d < 4; d++) {
        if (aligned) {
          // Slots alinhados: mesma hora do irmão primário, duração ajustada por idade
          getAlignedPreSchoolSlots(age, d).forEach((s, idx) => {
            skeleton.push({
              child_id: child.id, child_name: child.name, school_year: child.school_year,
              day_of_week: d + 1, time_slot: s.slot, discipline: s.discipline,
              discipline_label: DISCIPLINE_LABELS[s.discipline] ?? s.discipline,
              is_friday_world: false, sort_order: idx,
            });
          });
        } else {
          // Horário independente do pré-escolar (sem irmãos no primário)
          PRE_SCHOOL_SLOTS_4Y.forEach((s) => {
            skeleton.push({
              child_id: child.id, child_name: child.name, school_year: child.school_year,
              day_of_week: d + 1, time_slot: s.slot, discipline: s.discipline,
              discipline_label: DISCIPLINE_LABELS[s.discipline] ?? s.discipline,
              is_friday_world: false, sort_order: s.sort,
            });
          });
        }
      }
      skeleton.push({
        child_id: child.id, child_name: child.name, school_year: child.school_year,
        day_of_week: 5, time_slot: "09:30-12:00", discipline: "world_visit",
        discipline_label: "Ver Mundo", is_friday_world: true, sort_order: 0,
      });
    }
  }
  return skeleton;
}

// ─── Construção do prompt ──────────────────────────────────────────────────────

function buildPrompt(
  children: Child[],
  skeleton: SkeletonItem[],
  childInterests: Record<string, string[]>,
  fridayActivity: string,
  weeklyReadingTheme: string,
  nexseedByYear: Record<string, Record<string, string[]>>,
  gcProgressByChild: Record<string, Record<string, string[]>>,
  gcAllByChild: Record<string, Record<string, string[]>>,
  weeklyContent: Record<string, Record<string, string>> = {},
  childMethodologyStyle: Record<string, string> = {},
): string {
  const hasPrimary = children.some((c) => !c.school_year.toLowerCase().startsWith("pré"));
  const hasPreSchool = children.some((c) => c.school_year.toLowerCase().startsWith("pré"));
  const multiLevel = hasPrimary && hasPreSchool;

  const childrenSection = children.map((c) => {
    const interests = (childInterests[c.id] || []).join(", ") || "livre";
    const methodStyle = childMethodologyStyle[c.id] ? ` | Metodologia: ${childMethodologyStyle[c.id]}` : "";
    return `- **${c.name}** (${c.school_year}) | Interesses: ${interests} | Estilo: ${c.learning_preferences ?? "misto"} | Ritmo: ${c.learning_pace ?? "moderado"}${methodStyle}`;
  }).join("\n");

  // Conteúdos GC activos (a aprender / em progresso) por criança — TRIANGULAÇÃO PRINCIPAL
  const gcLines = children.map((c) => {
    const disc = gcProgressByChild[c.id];
    if (!disc || Object.keys(disc).length === 0) return null;
    return `### ${c.name} (${c.school_year})\n${Object.entries(disc).map(([d, contents]) =>
      `  **${GC_DISCIPLINE_LABELS[d] ?? d}:**\n${contents.map((ct) => `    - ${ct}`).join("\n")}`
    ).join("\n")}`;
  }).filter(Boolean);
  const gcSection = gcLines.length > 0
    ? `\n## CONTEÚDOS GC EM FOCO (a aprender / em progresso — NÃO incluir já dominados)\nO educador marcou estes conteúdos. As atividades devem trabalhar estes conteúdos de forma criativa, ligando-os aos interesses da criança:\n${gcLines.join("\n\n")}\n`
    : "";

  // Contexto GC completo por criança (todos os não dominados) — para orientação geral
  const gcAllLines = children.map((c) => {
    const disc = gcAllByChild[c.id];
    if (!disc || Object.keys(disc).length === 0) return null;
    return `### ${c.name} (${c.school_year})\n${Object.entries(disc).map(([d, contents]) =>
      `  **${GC_DISCIPLINE_LABELS[d] ?? d}:** ${contents.length} conteúdos por explorar`
    ).join("\n")}`;
  }).filter(Boolean);
  const gcAllSection = gcAllLines.length > 0
    ? `\n## CURRÍCULO NACIONAL GC — CONTEÚDOS AINDA POR DOMINAR\n${gcAllLines.join("\n\n")}\n`
    : "";

  // Currículo NexSeed (objetivos próprios da família)
  const nexseedLines = children.map((c) => {
    const yr = nexseedByYear[c.school_year];
    if (!yr || Object.keys(yr).length === 0) return null;
    return `### ${c.name} (${c.school_year})\n${Object.entries(yr).map(([disc, objs]) =>
      `  **${DISCIPLINE_LABELS[disc] ?? disc}:**\n${objs.map((o) => `    - ${o}`).join("\n")}`
    ).join("\n")}`;
  }).filter(Boolean);
  const nexseedSection = nexseedLines.length > 0
    ? `\n## CURRÍCULO NEXSEED (metodologia própria da família — prioridade máxima)\n${nexseedLines.join("\n\n")}\n`
    : "";

  const skeletonSection = skeleton.map((item, idx) => {
    const day = DAY_LABELS[item.day_of_week - 1];
    const interests = (childInterests[item.child_id] || []).join(", ") || "livre";
    const ep = item.episode ? ` [Ep.${item.episode}/4 — história contínua sobre o tema de leitura]` : "";
    return `${idx + 1}. ${item.child_name} | ${day} | ${item.time_slot} | ${item.discipline_label}${ep} | interesses: ${interests}`;
  }).join("\n");

  // Conteúdos específicos que o educador quer trabalhar esta semana por disciplina
  const WEEKLY_CONTENT_DISC_LABELS: Record<string, string> = {
    language: "Português", math: "Matemática", world: "Estudo do Meio",
    english: "Inglês", expression: "Expressão Artística", project: "Projeto",
  };
  const weeklyContentLines = children.map((c) => {
    const content = weeklyContent[c.id];
    if (!content || Object.keys(content).length === 0) return null;
    const lines = Object.entries(content)
      .filter(([, v]) => v.trim())
      .map(([disc, v]) => `  - ${WEEKLY_CONTENT_DISC_LABELS[disc] ?? disc}: "${v.trim()}"`)
      .join("\n");
    if (!lines) return null;
    return `### ${c.name} (${c.school_year})\n${lines}`;
  }).filter(Boolean);
  const weeklyContentSection = weeklyContentLines.length > 0
    ? `\n## CONTEÚDOS A ENSINAR ESTA SEMANA ⚠️ PRIORIDADE MÁXIMA\nO educador especificou o que quer trabalhar. TODAS as atividades das disciplinas listadas DEVEM ensinar diretamente estes conteúdos. Os interesses apenas tematizam (ex: se conteúdo é "adição até 20" e interesse é "dinossauros" → conta dinossauros em somas).\n${weeklyContentLines.join("\n\n")}\n`
    : "";

  const fridayNote = fridayActivity
    ? `Atividade de sexta-feira planeada: "${fridayActivity}"`
    : "Sexta-feira: exploração livre — sugere algo concreto e local";

  const readingNote = weeklyReadingTheme
    ? `Tema semanal para Leitura e Portefólio: **"${weeklyReadingTheme}"** — os 4 episódios (Ep.1 a Ep.4) devem ser capítulos sequenciais sobre este tema.`
    : "Leitura: usa o interesse principal da criança como tema da mini-série de 4 episódios.";

  const multiLevelNote = multiLevel
    ? `\n## FAMÍLIA MULTI-NÍVEL ⚡
Os horários do pré-escolar estão alinhados com o ensino primário: à mesma hora, os irmãos trabalham a mesma disciplina com conteúdos diferentes.
Na **descrição** das atividades do pré-escolar menciona (1 frase) como o adulto pode aproveitar a atividade do irmão mais velho como ponto de partida.`
    : "";

  return `És um especialista em educação e homeschooling português. Gera ${skeleton.length} atividades para um plano semanal NexSeed.

## CRIANÇAS
${childrenSection}
${multiLevelNote}${weeklyContentSection}${nexseedSection}${gcSection}${gcAllSection}
## SEXTA-FEIRA
${fridayNote}

## LEITURA E PORTEFÓLIO
${readingNote}

## ATIVIDADES A PREENCHER
${skeletonSection}

## REGRAS DE TRIANGULAÇÃO
1. **Prioridade**: Conteúdos desta semana (se existirem) → NexSeed → Conteúdos GC em foco → Conteúdos GC por dominar → interesses.
2. Usa os **interesses** para tematizar — nunca como objetivo. Ex: objetivo GC "contagem até 10" + interesse "dinossauros" → contar dinossauros por tipo.
3. **Conteúdos dominados** NÃO devem voltar a aparecer nas atividades.
4. **Leitura Ep.X/4**: cria 4 episódios de uma história CONTÍNUA sobre o tema indicado. Devolve a "description" como JSON string com este formato exacto (sem quebras de linha): {"episode_text":"[2-3 parágrafos em português, adequados à idade, continuação da narrativa do episódio anterior]","comprehension_question":"[1 pergunta sobre o que aconteceu neste episódio]","discussion_prompt":"[1 pergunta aberta para pais e criança explorarem juntos]"}.
5. **Ver Mundo** (09:45-11:50): usa a atividade planeada ou sugere algo concreto ao ar livre.
6. **Registo da Visita** (14:00-14:30): atividade criativa de recriação/registo do que foi vivido na manhã.
7. **Encerramento Reflexivo** (14:45-15:15): partilha emocional e síntese do dia.
8. **Pré-escolar**: atividades lúdicas, sensoriais, máx. 30 min, sem escrita formal.
9. Títulos específicos e criativos — NUNCA genéricos. Máx. 8 palavras.
10. Descrições CURTAS: máx. 2 frases diretas com passos concretos.
11. Materiais: máx. 4 itens simples disponíveis em casa ou papelaria.
12. **DIVERSIDADE OBRIGATÓRIA**: Para cada criança e cada disciplina, NUNCA repitas o mesmo formato de atividade em dias diferentes da mesma semana. Usa formatos distintos de entre:
    - Português: leitura+compreensão, escrita/ditado, jogo de fonética/sílabas, exercício de gramática, produção oral/narração, caligrafia, caça-palavras, jogo de palavras
    - Matemática: contagem/operações escritas, jogo com objetos físicos, resolução de problema contextualizado, medição no mundo real, padrões/sequências, estimativa, jogo de cartas/dados
    - Estudo do Meio: observação direta, experiência simples, registo desenhado/mapa, entrevista, pesquisa guiada, saída de campo, construção de modelo
    - Inglês: canção/rima, flashcards, jogo de mímica/charadas, produção oral curta, mini-diálogo, colorir com vocabulário
    - Expressão: desenho, pintura, colagem, escultura/modelagem, dança/teatro, fotografia, construção 3D
    Verifica a tua lista antes de devolver o JSON — se repetiste formato numa disciplina, substitui.
13. **TEXTO INLINE — leitura+compreensão** (Português e Estudo do Meio): quando este é o formato escolhido, NUNCA escrevas "Lê um texto sobre X" nem deixes o educador à procura de um livro. Em vez disso:
    - No \`title\`: "Leitura: [tema em 4 palavras max]"
    - Na \`description\`: escreve um texto narrativo ou informativo curto (1 parágrafo, 4-6 frases simples, vocabulário adequado à idade da criança, em português de Portugal), seguido do separador " | " e de "Pergunta: [1 pergunta de compreensão concreta]".
    - Exemplo para 1º ano: "A Marta foi à quinta com o avô e viu muitos animais. O cavalo comia feno e a cabra saltava nas pedras. No fim, o avô ordenhou a vaca e Marta provou leite fresquinho. | Pergunta: Que animal comia feno?"
    - Exemplo para 3º ano: "Os polvos são animais marinhos com oito tentáculos e um cérebro surpreendente. Conseguem mudar de cor em menos de um segundo para se camuflar dos predadores. Alguns polvos usam conchas como casas portáteis. | Pergunta: Para que serve a mudança de cor no polvo?"
    - Neste caso a \`description\` pode ter mais de 2 frases — ignora a regra 10 apenas para este formato.

## RESPOSTA
Devolve APENAS um JSON array com exatamente ${skeleton.length} objetos, na mesma ordem:
[{"title":"...","description":"...","materials":["...","..."]}]`;
}

// ─── Chamada ao Gemini (via edge function autenticada) ──────────────────────────
// A chave Gemini vive apenas como secret do servidor. O prompt é construído aqui
// e enviado à edge function `generate-weekly-plan`, que faz o relay para o Gemini.

export async function generateWithGemini(
  children: Child[],
  childInterests: Record<string, string[]>,
  fridayActivity: string,
  weeklyReadingTheme = "",
  nexseedByYear: Record<string, Record<string, string[]>> = {},
  gcProgressByChild: Record<string, Record<string, string[]>> = {},
  gcAllByChild: Record<string, Record<string, string[]>> = {},
  weeklyContent: Record<string, Record<string, string>> = {},
  childMethodologyStyle: Record<string, string> = {},
): Promise<GeneratedPlanItem[]> {
  const skeleton = buildSkeleton(children);
  const prompt = buildPrompt(children, skeleton, childInterests, fridayActivity, weeklyReadingTheme, nexseedByYear, gcProgressByChild, gcAllByChild, weeklyContent, childMethodologyStyle);

  const { data, error } = await supabase.functions.invoke("generate-weekly-plan", {
    body: { prompt },
  });

  if (error) {
    throw new Error(`Falha ao gerar o plano: ${error.message}`);
  }
  if (data?.error) {
    throw new Error(`Gemini: ${data.error}${data.detail ? ` — ${data.detail}` : ""}`);
  }

  const raw: string = data?.text ?? "[]";

  let aiContent: { title: string; description: string; materials: string[] }[];
  try {
    aiContent = JSON.parse(raw);
  } catch {
    throw new Error(`JSON inválido do Gemini: ${raw.slice(0, 200)}`);
  }

  return skeleton.map((s, idx) => ({
    child_id: s.child_id,
    day_of_week: s.day_of_week,
    time_slot: s.time_slot,
    discipline: s.discipline,
    title: aiContent[idx]?.title ?? s.discipline_label,
    description: aiContent[idx]?.description ?? "",
    materials: aiContent[idx]?.materials ?? [],
    is_friday_world: s.is_friday_world,
    sort_order: s.sort_order,
  }));
}
