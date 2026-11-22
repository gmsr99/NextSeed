import type { Child, FamilyMethodology } from "./types";
import type { GeneratedPlanItem } from "./planGenerator";
import { DISCIPLINE_LABELS, DAY_LABELS, getAlignedPreSchoolSlots } from "./planGenerator";
import { GC_DISCIPLINE_LABELS } from "./gcConstants";
import { buildMethodologyContext } from "./methodologyContext";
import { supabase } from "./supabase";
import { withAiLabels, aiLabel, restoreNames, AI_NAME_RULE } from "./aiPrivacy";
import { applyFamilyWeek, blockModes, splitMode, withMode, type BlockMode } from "./familyWeek";
import { assignFormats } from "./activityFormats";
import { preschoolGuidance } from "./methodologyRoles";
import { applyPortfolioHints, splitPortfolio, withPortfolio, DEFAULT_HINTS } from "./portfolioHints";
import { applyWeekRoutine, renumberEpisodes, type WeekRoutine } from "./familyRoutine";

const MODE_LABEL: Record<BlockMode, string> = {
  juntos: "EM CONJUNTO",
  adulto: "COM O ADULTO",
  sozinho: "SOZINHO",
};

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

function buildSkeleton(children: Child[], routine: WeekRoutine | null = null): SkeletonItem[] {
  // P-18: a semana da família (dias sem estudo, dias curtos, sexta sem saída)
  const skeleton = applyWeekRoutine(buildFullSkeleton(children), routine);
  renumberEpisodes(skeleton);
  return skeleton;
}

function buildFullSkeleton(children: Child[]): SkeletonItem[] {
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
  familyMethodologies: FamilyMethodology[] = [],
): string {
  const hasPrimary = children.some((c) => !c.school_year.toLowerCase().startsWith("pré"));
  const hasPreSchool = children.some((c) => c.school_year.toLowerCase().startsWith("pré"));
  const multiLevel = hasPrimary && hasPreSchool;

  const methodologySection = buildMethodologyContext(familyMethodologies, "atividades");
  // P-18: quantos episódios de leitura há nesta semana (depende dos dias de estudo)
  const episodes = skeleton.reduce((m, s) => Math.max(m, s.episode ?? 0), 0);
  const hasOutingThisWeek = skeleton.some((s) => s.is_friday_world);

  const childrenSection = children.map((c) => {
    const interests = (childInterests[c.id] || []).join(", ") || "livre";
    return `- **${c.name}** (${c.school_year}) | Interesses: ${interests} | Estilo: ${c.learning_preferences ?? "misto"} | Ritmo: ${c.learning_pace ?? "moderado"}`;
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
    ? `\n## CONTEÚDOS GC EM FOCO (a aprender / em progresso — NÃO incluir já dominados)\nSão os conteúdos desta semana (do plano anual ou marcados pelo educador). As atividades devem trabalhar estes conteúdos de forma criativa, ligando-os aos interesses da criança.\nLinhas com [já domina]: servem só para saberes o nível da criança nessa disciplina. NÃO as voltes a ensinar; parte delas para ir um degrau acima.\nLinhas com [retomar]: ficaram por consolidar em semanas anteriores; dedica-lhes uma atividade curta de revisão com um formato diferente, sem os tratar como atraso.\nLinhas com [manual «…»]: a família segue esse manual. As atividades dessa disciplina acompanham a unidade e as páginas indicadas (refere-as na descrição, ex.: "Manual, pp. 24–27") com uma forma prática de as introduzir ou consolidar. NUNCA inventes nem reproduzas o texto ou os exercícios do manual. Se a linha disser «Lição seguinte», a família segue o livro pela ordem e tu não sabes qual é a lição: a atividade dessa disciplina chama-se "Lição seguinte do manual" e a descrição diz só como acompanhar (ler o enunciado em conjunto, fazer a lição, mostrar ao adulto), sem inventar o conteúdo:\n${gcLines.join("\n\n")}\n`
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

  // P-10: com várias crianças, cada bloco leva o modo (calculado por nós, não pela IA)
  const modes = blockModes(skeleton);
  const hasModes = modes.some(Boolean);
  // P-06: formato de cada bloco atribuído pela app, a rodar ao longo da semana
  const formats = assignFormats(skeleton, modes.map((m) => m === "juntos"));
  const skeletonSection = skeleton.map((item, idx) => {
    const day = DAY_LABELS[item.day_of_week - 1];
    const ep = item.episode ? ` [Ep.${item.episode}/${episodes} — história contínua sobre o tema de leitura]` : "";
    const mode = modes[idx] ? ` | MODO: ${MODE_LABEL[modes[idx]!]}` : "";
    const format = formats[idx] ? ` | FORMATO: ${formats[idx]}` : "";
    return `${idx + 1}. ${item.child_name} | ${day} | ${item.time_slot} | ${item.discipline_label}${ep}${mode}${format}`;
  }).join("\n");

  const familyWeekSection = hasModes
    ? `\n## SEMANA EM FAMÍLIA ⚡ (um adulto, várias crianças)
Há um só adulto para todas as crianças. Cada atividade tem um MODO e tens de o respeitar:
- **EM CONJUNTO**: as crianças fazem a MESMA atividade, à mesma hora. Usa exatamente o MESMO título para todas. Na descrição de cada criança, diz o que ELA faz nessa atividade, ao nível da sua idade e dos seus conteúdos (a mais velha pode ler, registar ou explicar; a mais nova observa, conta, desenha ou ajuda).
- **COM O ADULTO**: é aqui que o adulto ensina. Usa este bloco para introduzir o conteúdo novo ou o passo mais difícil.
- **SOZINHO**: a criança tem de conseguir fazer a atividade do princípio ao fim SEM ajuda, enquanto o adulto está com outra criança. Só prática de algo já introduzido, instruções que ela percebe sozinha, nada de conteúdo novo, nada que precise de supervisão (sem cozinha, tesouras afiadas, saídas). Para o pré-escolar: exploração livre e segura, ao lado do adulto.
Não escrevas o modo no título nem na descrição: a app acrescenta-o.\n`
    : "";

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

  const fridayBase = fridayActivity
    ? `Atividade de sexta-feira planeada: "${fridayActivity}"`
    : "Sexta-feira: exploração livre — sugere algo concreto e local";
  // P-11: com várias crianças, o "Ver Mundo" é uma saída da família, não uma por criança
  const fridayNote = !hasOutingThisWeek
    ? "Esta família não inclui a saída \"Ver Mundo\" nesta semana. Não proponhas saídas nem visitas: se a sexta tem atividades, são de estudo em casa, como nos outros dias."
    : children.length > 1
    ? `${fridayBase}\n**"Ver Mundo" é UMA só saída para a família toda:** todas as crianças vão ao MESMO sítio, à mesma hora, com o MESMO título. Na descrição de cada criança, adapta o que ela faz lá à sua idade.`
    : fridayBase;

  const readingBase = episodes === 0
    ? "Nesta semana não há blocos de leitura: não escrevas episódios."
    : weeklyReadingTheme
    ? `Tema semanal para Leitura e Portefólio: **"${weeklyReadingTheme}"** — os ${episodes} episódios (Ep.1 a Ep.${episodes}) devem ser capítulos sequenciais sobre este tema.`
    : `Leitura: usa o fio condutor da semana como tema da mini-série de ${episodes} episódios.`;
  const readingNote = hasModes
    ? `${readingBase}\n**UMA só história para a família:** no mesmo episódio, todas as crianças têm o MESMO título e o MESMO "episode_text", escrito para a mais nova conseguir acompanhar quando lido em voz alta. A "comprehension_question" é diferente para cada criança, adequada à sua idade.`
    : readingBase;

  const multiLevelNote = multiLevel
    ? `\n## FAMÍLIA MULTI-NÍVEL ⚡
Os horários do pré-escolar estão alinhados com o ensino primário: à mesma hora, os irmãos trabalham a mesma disciplina com conteúdos diferentes.
Na **descrição** das atividades do pré-escolar menciona (1 frase) como o adulto pode aproveitar a atividade do irmão mais velho como ponto de partida.`
    : "";

  // P-16: pré-escolar com linha condutora. As OCEPE não são um programa: dão
  // três áreas, e o tema da semana atravessa-as.
  const principal = [...familyMethodologies].sort((a, b) => a.priority - b.priority)[0]?.methodology?.slug;
  const preschoolSection = hasPreSchool
    ? `\n## PRÉ-ESCOLAR: UMA LINHA CONDUTORA
No pré-escolar não há programa a cumprir. O fio condutor da semana${hasPrimary ? " (o mesmo dos irmãos)" : ""} atravessa as três áreas das Orientações Curriculares:
- **Formação Pessoal e Social** (autonomia, cuidar de si e dos outros, regras do dia a dia);
- **Expressão e Comunicação** (linguagem oral e primeiras descobertas da escrita, matemática com objetos, artes, música, movimento);
- **Conhecimento do Mundo** (observar, perguntar, experimentar).
Ao longo da semana, cada área aparece pelo menos duas vezes, sempre a brincar e a mexer.
${preschoolGuidance(principal)}\n`
    : "";

  return `${methodologySection}És um especialista em educação e homeschooling português. Gera ${skeleton.length} atividades para um plano semanal NexSeed.

## CRIANÇAS
${childrenSection}
${AI_NAME_RULE}${multiLevelNote}${preschoolSection}${familyWeekSection}${weeklyContentSection}${nexseedSection}${gcSection}${gcAllSection}
## FIO CONDUTOR DA SEMANA
Antes de escreveres as atividades, escolhe UM tema ou pergunta para a semana, tirado dos conteúdos desta semana (de preferência de Estudo do Meio; ex.: "Como é que as plantas bebem?"). Esse fio condutor liga as disciplinas${children.length > 1 ? " e é o mesmo para todas as crianças" : ""}: a matemática conta, mede ou compara coisas do tema; o português lê e escreve sobre ele; a expressão representa-o. Não o forces onde não cabe (ex.: uma unidade de manual segue o manual).

## SEXTA-FEIRA
${fridayNote}

## LEITURA E PORTEFÓLIO
${readingNote}

## ATIVIDADES A PREENCHER
${skeletonSection}

## REGRAS DE TRIANGULAÇÃO
1. **Prioridade**: Conteúdos desta semana (se existirem) → NexSeed → Conteúdos GC em foco → Conteúdos GC por dominar → interesses.
2. Os **interesses** são tempero, nunca o objetivo: usa-os em NO MÁXIMO uma em cada três atividades de cada criança (ex.: objetivo "contagem até 10" + interesse "dinossauros" → contar dinossauros por tipo). As restantes seguem o fio condutor da semana ou o dia a dia da casa.
3. **Conteúdos dominados** NÃO devem voltar a aparecer nas atividades.
4. **Leitura Ep.X/${episodes}**: cria ${episodes} episódios de uma história CONTÍNUA sobre o tema indicado. Cada episódio é CURTO e CONCRETO: 1 ou 2 parágrafos, no máximo 120 palavras no total, com personagens com nome, um lugar concreto e uma coisa que acontece (nada de resumos ou títulos soltos). Devolve a "description" como JSON string com este formato exacto (sem quebras de linha): {"episode_text":"[1-2 parágrafos curtos em português de Portugal, adequados à idade, continuação do episódio anterior]","comprehension_question":"[1 pergunta sobre o que aconteceu neste episódio]","discussion_prompt":"[1 pergunta aberta para pais e criança explorarem juntos]"}.
5. **Ver Mundo** (09:45-11:50): usa a atividade planeada ou sugere algo concreto ao ar livre.
6. **Registo da Visita** (14:00-14:30): atividade criativa de recriação/registo do que foi vivido na manhã.
7. **Encerramento Reflexivo** (14:45-15:15): partilha emocional e síntese do dia.
8. **Pré-escolar**: atividades lúdicas, sensoriais, máx. 30 min, sem escrita formal.
9. Títulos específicos e criativos — NUNCA genéricos. Máx. 8 palavras.
10. Descrições CURTAS: máx. 2 frases diretas com passos concretos.
11. **Materiais sem preparação**: máx. 4 itens que já existem em qualquer casa (papel, lápis, tesoura, cola, objetos da cozinha, coisas apanhadas na rua, os livros e manuais da criança). NUNCA peças fichas, cartões, tabuleiros, jogos ou imagens para imprimir, recortar ou fabricar antes da atividade. Se a atividade precisa de cartões ou de um registo, é a criança que os faz, como parte da atividade.
12. **FORMATO**: quando a atividade tem FORMATO indicado, usa esse formato (ex.: "manipulação de objetos" → a criança mexe em objetos; "conversa e narração oral" → não há escrita). Nunca transformes todas as atividades de uma disciplina no mesmo tipo de tarefa (ex.: "encontra as personagens principais" todos os dias).
13. **TEXTO INLINE — leitura+compreensão** (Português e Estudo do Meio): quando o formato é "leitura e compreensão", NUNCA escrevas "Lê um texto sobre X" nem deixes o educador à procura de um livro. Em vez disso:
    - No \`title\`: "Leitura: [tema em 4 palavras max]"
    - Na \`description\`: escreve um texto narrativo ou informativo curto (1 parágrafo, 4-6 frases simples, vocabulário adequado à idade da criança, em português de Portugal), seguido do separador " | " e de "Pergunta: [1 pergunta de compreensão concreta]".
    - Exemplo para 1º ano: "A Marta foi à quinta com o avô e viu muitos animais. O cavalo comia feno e a cabra saltava nas pedras. No fim, o avô ordenhou a vaca e Marta provou leite fresquinho. | Pergunta: Que animal comia feno?"
    - Exemplo para 3º ano: "Os polvos são animais marinhos com oito tentáculos e um cérebro surpreendente. Conseguem mudar de cor em menos de um segundo para se camuflar dos predadores. Alguns polvos usam conchas como casas portáteis. | Pergunta: Para que serve a mudança de cor no polvo?"
    - Neste caso a \`description\` pode ter mais de 2 frases — ignora a regra 10 apenas para este formato.
14. **COMO EXPLICAR**: ${hasModes ? "nas atividades COM O ADULTO" : "na primeira atividade de cada disciplina na semana"}, acaba a descrição com uma frase que comece por "Para explicar:" e dê ao adulto uma forma simples de explicar o conteúdo, diferente da do manual (uma comparação com o dia a dia ou um objeto de casa). Ex.: "Para explicar: a dezena é como uma caixa de ovos cheia, dez de uma vez."
15. **DIFICULDADE AO NÍVEL DA CRIANÇA**: parte sempre do passo mais simples do conteúdo e sobe um degrau de cada vez ao longo da semana. Com ritmo "Calmo" ou no 1.º ano, no máximo um passo novo por atividade e instruções de uma frase. Pré-escolar: sem leitura nem escrita formal.
16. **PORTEFÓLIO** (campo \`portfolio\`): para cada criança, escolhe 3 a 4 atividades da semana que deixam uma boa evidência para o portefólio (um texto, um desenho, uma construção, o registo de uma experiência ou de uma saída), de disciplinas DIFERENTES. Nessas, escreve em \`portfolio\` o que guardar, em 12 palavras no máximo (ex.: "Foto da maquete e a legenda escrita pela criança"). Em todas as outras atividades e nos episódios de leitura, \`portfolio\` fica "".

17. **TEMA DA SEMANA** (campo \`theme\`): no PRIMEIRO objeto, escreve o fio condutor que escolheste, em 8 palavras no máximo (ex.: "Como é que as plantas bebem?"). Nos restantes, \`theme\` fica "".

## RESPOSTA
Devolve APENAS um JSON array com exatamente ${skeleton.length} objetos, na mesma ordem:
[{"title":"...","description":"...","materials":["...","..."],"portfolio":"","theme":""}]`;
}

// ─── Chamada ao Gemini (via edge function autenticada) ──────────────────────────
// A chave Gemini vive apenas como secret do servidor. O prompt é construído aqui
// e enviado à edge function `generate-weekly-plan`, que faz o relay para o Gemini.

// Structured output: garante que a resposta é um array de atividades bem formado.
const PLAN_RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      description: { type: "STRING" },
      materials: { type: "ARRAY", items: { type: "STRING" } },
      portfolio: { type: "STRING" },
      theme: { type: "STRING" },
    },
    required: ["title", "description", "materials"],
  },
};

// ─── Regeneração de UMA atividade do plano (FASE 3.2.1) ────────────────────────

const SINGLE_ACTIVITY_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    description: { type: "STRING" },
    materials: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["title", "description", "materials"],
};

export async function regenerateActivity(
  child: Child,
  item: GeneratedPlanItem,
  interests: string[],
  familyMethodologies: FamilyMethodology[] = [],
): Promise<Pick<GeneratedPlanItem, "title" | "description" | "materials">> {
  const disciplineLabel = DISCIPLINE_LABELS[item.discipline] ?? item.discipline;
  const interestsStr = interests.join(", ") || "livre";
  const methodologySection = buildMethodologyContext(familyMethodologies, "atividades");
  // P-10: a atividade nova mantém o modo do bloco (em conjunto / com o adulto / sozinho)
  const { text: withoutHint, hint: oldHint } = splitPortfolio(item.description);
  const { mode, text: currentText } = splitMode(withoutHint);
  const modeRule =
    mode === "sozinho" ? "\n5. A criança faz esta atividade SOZINHA enquanto o adulto está com outra criança: só prática de algo já introduzido, instruções que ela percebe sem ajuda, nada que precise de supervisão."
    : mode === "adulto" ? "\n5. Esta atividade é feita COM O ADULTO: pode introduzir conteúdo novo."
    : mode === "juntos" ? "\n5. Esta atividade é feita EM CONJUNTO com os irmãos, de idades diferentes: tem de funcionar para várias idades ao mesmo tempo. Descreve o que esta criança faz."
    : "";

  const prompt = `${methodologySection}És um especialista em educação e homeschooling português. Substitui UMA atividade de um plano semanal NexSeed por uma alternativa DIFERENTE.

## CRIANÇA
- ${aiLabel(child.name, 0)} (${child.school_year}) | Interesses: ${interestsStr} | Estilo: ${child.learning_preferences ?? "misto"} | Ritmo: ${child.learning_pace ?? "moderado"}

## ATIVIDADE A SUBSTITUIR
- ${DAY_LABELS[item.day_of_week - 1]} | ${item.time_slot} | ${disciplineLabel}
- Título atual: "${item.title}"
- Descrição atual: "${currentText}"

## REGRAS
1. Mantém a disciplina (${disciplineLabel}) e a duração do bloco; muda o FORMATO da atividade — se era jogo propõe escrita, observação, experiência, construção… nunca uma variação da mesma.
2. Usa os interesses apenas para tematizar, nunca como objetivo.
3. Título específico e criativo, máx. 8 palavras. Descrição CURTA: máx. 2 frases diretas com passos concretos. Materiais: máx. 4 itens que já existem em casa; nada para imprimir, recortar ou fabricar antes.
4. Se optares por leitura+compreensão (Português/Estudo do Meio): escreve o próprio texto na descrição (1 parágrafo, 4-6 frases adequadas à idade, português de Portugal), seguido de " | Pergunta: [1 pergunta de compreensão concreta]" — só neste formato podes ignorar o limite de 2 frases.${modeRule}

${AI_NAME_RULE}
## RESPOSTA
Devolve APENAS um objeto JSON: {"title":"...","description":"...","materials":["...","..."]}`;

  let lastError = "erro desconhecido";
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await supabase.functions.invoke("generate-weekly-plan", {
      body: { prompt, responseSchema: SINGLE_ACTIVITY_SCHEMA, temperature: 1.0 },
    });

    if (error) { lastError = error.message; continue; }
    if (data?.error) { lastError = `${data.error}${data.detail ? ` — ${data.detail}` : ""}`; continue; }

    try {
      const parsed = JSON.parse(data?.text ?? "");
      if (parsed && typeof parsed.title === "string" && typeof parsed.description === "string") {
        const names = [child.name];
        return {
          title: restoreNames(parsed.title, names),
          // Se era uma sugestão de portefólio, a atividade nova também é (com a dica genérica da disciplina)
          description: withPortfolio(
            withMode(restoreNames(parsed.description, names), mode),
            oldHint ? DEFAULT_HINTS[item.discipline] ?? "Guardar o trabalho ou tirar uma foto" : "",
          ),
          materials: Array.isArray(parsed.materials)
            ? parsed.materials.map((m: string) => restoreNames(String(m), names))
            : [],
        };
      }
      lastError = "resposta sem os campos esperados";
    } catch {
      lastError = "JSON inválido";
    }
  }
  throw new Error(`Falha ao regenerar a atividade: ${lastError}`);
}

let lastWeekTheme = "";
/** Fio condutor da última geração (vazio se a IA não o devolveu). */
export function getLastWeekTheme(): string {
  return lastWeekTheme;
}

export async function generateWithGemini(
  children: Child[],
  childInterests: Record<string, string[]>,
  fridayActivity: string,
  weeklyReadingTheme = "",
  nexseedByYear: Record<string, Record<string, string[]>> = {},
  gcProgressByChild: Record<string, Record<string, string[]>> = {},
  gcAllByChild: Record<string, Record<string, string[]>> = {},
  weeklyContent: Record<string, Record<string, string>> = {},
  familyMethodologies: FamilyMethodology[] = [],
  /** P-18: a semana da família; null = semana de sempre */
  routine: WeekRoutine | null = null,
): Promise<GeneratedPlanItem[]> {
  // O modelo recebe pseudónimos em vez de nomes (P-03). Os ids mantêm-se,
  // por isso o encaixe das respostas (por posição) não muda.
  const aiChildren = withAiLabels(children);
  const realNames = children.map((c) => c.name);
  const skeleton = buildSkeleton(aiChildren, routine);
  if (skeleton.length === 0) throw new Error("A vossa semana não tem dias de estudo. Ajustem em \"A nossa semana\".");
  const prompt = buildPrompt(aiChildren, skeleton, childInterests, fridayActivity, weeklyReadingTheme, nexseedByYear, gcProgressByChild, gcAllByChild, weeklyContent, familyMethodologies);

  // Até 2 tentativas: cobre falhas transitórias (429/502) e parsing.
  let aiContent: { title: string; description: string; materials: string[]; portfolio?: string; theme?: string }[] | null = null;
  let lastError = "erro desconhecido";

  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await supabase.functions.invoke("generate-weekly-plan", {
      body: { prompt, responseSchema: PLAN_RESPONSE_SCHEMA },
    });

    if (error) { lastError = error.message; continue; }
    if (data?.error) { lastError = `${data.error}${data.detail ? ` — ${data.detail}` : ""}`; continue; }

    const raw: string = data?.text ?? "[]";
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) { aiContent = parsed; break; }
      lastError = "a resposta não é um array";
    } catch {
      lastError = `JSON inválido: ${raw.slice(0, 120)}`;
    }
  }

  if (!aiContent) {
    throw new Error(`Falha ao gerar o plano: ${lastError}`);
  }

  // R-10: 3 a 4 sugestões de portefólio por criança (as da IA, completadas pela app)
  // Tema da semana escolhido pela IA (fica acessível a quem chamou, sem mudar o tipo devolvido)
  lastWeekTheme = restoreNames(String(aiContent.find((c) => c?.theme?.trim())?.theme ?? ""), realNames).trim().slice(0, 90);
  const hints = skeleton.map((_, idx) => restoreNames(String(aiContent![idx]?.portfolio ?? ""), realNames));
  return applyPortfolioHints(applyFamilyWeek(unifyFamilyOuting(skeleton.map((s, idx) => ({
    child_id: s.child_id,
    day_of_week: s.day_of_week,
    time_slot: s.time_slot,
    discipline: s.discipline,
    title: restoreNames(aiContent[idx]?.title ?? s.discipline_label, realNames),
    description: restoreNames(aiContent[idx]?.description ?? "", realNames),
    materials: (aiContent[idx]?.materials ?? []).map((m) => restoreNames(String(m), realNames)),
    is_friday_world: s.is_friday_world,
    sort_order: s.sort_order,
  })))), hints);
}

/**
 * Garante que a saída "Ver Mundo" de sexta é a mesma para todas as crianças
 * (backlog P-11): o título (o destino) passa a ser o da primeira criança; a
 * descrição de cada uma, adaptada à idade, mantém-se.
 */
export function unifyFamilyOuting<T extends { day_of_week: number; is_friday_world: boolean; title: string }>(
  items: T[],
): T[] {
  const outings = items.filter((i) => i.day_of_week === 5 && i.is_friday_world);
  if (outings.length < 2) return items;
  const sharedTitle = outings[0].title;
  return items.map((i) =>
    i.day_of_week === 5 && i.is_friday_world ? { ...i, title: sharedTitle } : i,
  );
}
