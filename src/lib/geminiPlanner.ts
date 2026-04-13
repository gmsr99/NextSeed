import type { Child } from "./types";
import type { GeneratedPlanItem } from "./planGenerator";
import { DISCIPLINE_LABELS, DAY_LABELS, getAlignedPreSchoolSlots } from "./planGenerator";
import { GC_DISCIPLINE_LABELS } from "./gcConstants";

const GEMINI_MODEL = "gemini-2.5-flash";

// ─── [removido] Currículo Nacional hardcoded — vem da BD (curriculum_contents) ──
// Este bloco já não é usado; mantido temporariamente para não quebrar o git diff

const _UNUSED = {
  "Pré-escolar": {
    language: [
      "Escuta ativa de histórias e recontar com as suas palavras",
      "Reconhecimento de letras e sons iniciais de palavras",
      "Desenvolvimento do vocabulário e expressão oral",
      "Rimas, lengalengas e jogos com sons e fonemas",
    ],
    math: [
      "Contagem até 10 com objetos concretos",
      "Conceitos de mais/menos, grande/pequeno, dentro/fora",
      "Reconhecimento de formas geométricas simples",
      "Classificação por cor, forma ou tamanho",
    ],
    expression: [
      "Pintura com dedos, esponjas e pincéis; exploração de cores",
      "Modelagem com barro ou massa de sal",
      "Música, dança e movimento rítmico expressivo",
      "Dramatização com bonecos, dedoches e jogos de faz de conta",
    ],
    world: [
      "Observação da natureza: plantas, insetos, animais",
      "Partes do corpo humano e rotinas de higiene",
      "Noção de tempo: manhã, tarde, noite, dias da semana",
      "Rotinas e hábitos saudáveis",
    ],
  },
  "1º ano": {
    language: [
      "Reconhecimento de todas as letras e seus sons (consciência fonológica)",
      "Leitura de palavras e frases simples com fluência crescente",
      "Cópia e escrita de palavras com ortografia correta",
      "Divisão de palavras em sílabas",
    ],
    math: [
      "Números até 20: leitura, escrita e ordenação",
      "Adição e subtração até 20",
      "Figuras geométricas: quadrado, retângulo, triângulo, círculo",
      "Medida informal de comprimento e capacidade",
    ],
    world: [
      "A família e a casa; papéis e relações familiares",
      "O corpo humano: partes externas e cinco sentidos",
      "Animais e plantas do ambiente próximo",
      "Estações do ano e fenómenos atmosféricos simples",
    ],
    english: [
      "Saudações e despedidas em inglês",
      "Cores e números até 10",
      "Vocabulário: animais, família, objetos da sala de aula",
      "Canções e rimas simples em inglês",
    ],
    expression: [
      "Técnicas básicas de desenho e pintura",
      "Colagem com materiais naturais e reciclados",
      "Música: ritmo, canções e instrumentos de percussão simples",
    ],
  },
  "2º ano": {
    language: [
      "Falar com clareza e usar formas de tratamento adequadas",
      "Ler com fluência textos de diferentes géneros",
      "Escrever textos narrativos e descritivos com planificação",
      "Usar corretamente sinais de pontuação",
      "Identificar nomes, verbos e adjetivos; singular/plural e masculino/feminino",
    ],
    math: [
      "Ler, escrever e comparar números naturais até 1000",
      "Adicionar e subtrair usando o algoritmo com e sem transporte",
      "Construir e memorizar as tabuadas do 2, 3, 4, 5 e 10",
      "Medir comprimentos em cm e m; massas em g e kg",
      "Recolher dados e organizar em tabelas e gráficos de barras",
    ],
    world: [
      "Distinguir órgãos internos e funções vitais",
      "Categorizar animais por revestimento, alimentação e locomoção",
      "Identificar partes das plantas: raiz, caule, folha, flor, fruto, semente",
      "Localizar Portugal na Europa e no Mundo",
      "Valorizar os direitos da Convenção sobre os Direitos da Criança",
    ],
    english: [
      "Vocabulário: cores, números 1-20, animais, família, partes do corpo",
      "Cantar músicas e rimas em inglês",
      "Produzir frases: My name is..., I like..., I have...",
    ],
    expression: [
      "Criar composições com cor, forma, textura",
      "Explorar aguarela, guache, colagem, modelagem",
      "Explorar corpo e movimento em jogos dramáticos",
    ],
    project: [
      "Pesquisa simples sobre um tema",
      "Construção de maquetas ou apresentações visuais",
      "Apresentação oral das descobertas à família",
    ],
  },
  "3º ano": {
    language: [
      "Leitura expressiva com interpretação",
      "Escrita com parágrafos e pontuação correta",
      "Conjugação verbal no presente, passado e futuro",
    ],
    math: [
      "Números até 1000 e frações simples",
      "Tabuadas completas até ao 9",
      "Calcular o perímetro de figuras geométricas",
    ],
    world: [
      "Portugal: regiões, relevo, rios e clima",
      "Descobrimentos portugueses: introdução histórica",
      "Alimentação saudável e primeiros socorros básicos",
    ],
    english: [
      "Descrever rotinas diárias em inglês",
      "Descrever pessoas e lugares com adjetivos simples",
    ],
    project: [
      "Projeto de investigação sobre tema escolhido",
      "Trabalho de campo: observação e registo no exterior",
    ],
  },
  "4º ano": {
    language: [
      "Análise de textos literários e informativos",
      "Discurso direto e indireto; expansão de frase",
      "Produção de textos com recursos expressivos",
    ],
    math: [
      "Números até 1 000 000",
      "Divisão: algoritmo e resolução de problemas",
      "Ângulos, retas e propriedades de figuras",
    ],
    world: [
      "Expansão marítima portuguesa e encontro de culturas",
      "Portugal no passado: civilizações e monumentos",
      "Educação para a cidadania e democracia",
    ],
    english: [
      "Compreender e produzir textos simples",
      "Usar o passado simples em inglês",
    ],
    project: [
      "Projeto interdisciplinar com produto final",
      "Apresentação à comunidade",
    ],
  },
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
): string {
  const hasPrimary = children.some((c) => !c.school_year.toLowerCase().startsWith("pré"));
  const hasPreSchool = children.some((c) => c.school_year.toLowerCase().startsWith("pré"));
  const multiLevel = hasPrimary && hasPreSchool;

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
${multiLevelNote}${nexseedSection}${gcSection}${gcAllSection}
## SEXTA-FEIRA
${fridayNote}

## LEITURA E PORTEFÓLIO
${readingNote}

## ATIVIDADES A PREENCHER
${skeletonSection}

## REGRAS DE TRIANGULAÇÃO
1. **Prioridade**: NexSeed (se existir) → Conteúdos GC em foco → Conteúdos GC por dominar → interesses.
2. Usa os **interesses** para tematizar — nunca como objetivo. Ex: objetivo GC "contagem até 10" + interesse "dinossauros" → contar dinossauros por tipo.
3. **Conteúdos dominados** NÃO devem voltar a aparecer nas atividades.
4. **Leitura Ep.X/4**: cria 4 episódios de uma história CONTÍNUA sobre o tema indicado. Descrição = resumo (2 frases) + 1 pergunta de compreensão.
5. **Ver Mundo** (09:45-11:50): usa a atividade planeada ou sugere algo concreto ao ar livre.
6. **Registo da Visita** (14:00-14:30): atividade criativa de recriação/registo do que foi vivido na manhã.
7. **Encerramento Reflexivo** (15:00-15:30): partilha emocional e síntese do dia.
8. **Pré-escolar**: atividades lúdicas, sensoriais, máx. 30 min, sem escrita formal.
9. Títulos específicos e criativos — NUNCA genéricos. Máx. 8 palavras.
10. Descrições CURTAS: máx. 2 frases diretas com passos concretos.
11. Materiais: máx. 4 itens simples disponíveis em casa ou papelaria.

## RESPOSTA
Devolve APENAS um JSON array com exatamente ${skeleton.length} objetos, na mesma ordem:
[{"title":"...","description":"...","materials":["...","..."]}]`;
}

// ─── Chamada ao Gemini ─────────────────────────────────────────────────────────

async function callGemini(apiKey: string, prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.85,
          maxOutputTokens: 65536,
        },
      }),
    },
  );
  return res;
}

export async function generateWithGemini(
  children: Child[],
  childInterests: Record<string, string[]>,
  fridayActivity: string,
  weeklyReadingTheme = "",
  nexseedByYear: Record<string, Record<string, string[]>> = {},
  gcProgressByChild: Record<string, Record<string, string[]>> = {},
  gcAllByChild: Record<string, Record<string, string[]>> = {},
): Promise<GeneratedPlanItem[]> {
  const apiKey1 = import.meta.env.VITE_GEMINI_API_KEY as string;
  const apiKey2 = import.meta.env.VITE_GEMINI_API_KEY_2 as string;
  if (!apiKey1) throw new Error("VITE_GEMINI_API_KEY não definida");

  const skeleton = buildSkeleton(children);
  const prompt = buildPrompt(children, skeleton, childInterests, fridayActivity, weeklyReadingTheme, nexseedByYear, gcProgressByChild, gcAllByChild);

  let res = await callGemini(apiKey1, prompt);

  if (res.status === 429 && apiKey2) {
    console.warn("Gemini: quota da chave 1 atingida, a usar chave 2...");
    res = await callGemini(apiKey2, prompt);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const data = await res.json();

  const parts: { text: string; thought?: boolean }[] =
    data.candidates?.[0]?.content?.parts ?? [];
  const responsePart = parts.filter((p) => !p.thought).pop();
  const raw = responsePart?.text ?? "[]";

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
