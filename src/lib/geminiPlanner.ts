import type { Child } from "./types";
import type { GeneratedPlanItem } from "./planGenerator";
import { DISCIPLINE_LABELS, DAY_LABELS } from "./planGenerator";

const GEMINI_MODEL = "gemini-2.5-flash";

// ─── Currículo Nacional Português (DGE / Aprendizagens Essenciais) ─────────────

const CURRICULUM: Record<string, Record<string, string[]>> = {
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
    // Fonte: DGE — Aprendizagens Essenciais 2.º ano (Decreto-Lei n.º 55/2018)
    language: [
      "Falar com clareza, articular palavras e usar formas de tratamento adequadas",
      "Formular perguntas, pedidos e respostas considerando o interlocutor",
      "Ler com fluência crescente textos de diferentes géneros e suportes",
      "Identificar o tema e assunto principal; inferir o sentido de palavras pelo contexto",
      "Mobilizar o conhecimento da pontuação para interpretar e organizar o discurso",
      "Escrever textos narrativos, descritivos e instrucionais com planificação (início, meio, fim)",
      "Usar corretamente sinais de pontuação: ponto final, interrogação, exclamação, vírgula",
      "Escrever com correção ortográfica palavras de uso frequente",
      "Ouvir e ler textos literários: contos, fábulas, poemas, lengalengas, adivinhas",
      "Recontar e recriar textos lidos oralmente e por escrito com expressividade",
      "Exprimir sentimentos, emoções e opiniões sobre textos lidos ou ouvidos",
      "Identificar nomes, verbos e adjetivos; distinguir singular/plural e masculino/feminino",
      "Reconhecer sílabas, sílaba tónica e fazer divisão silábica correta",
      "Aplicar regras ortográficas: maiúsculas, dígrafos (lh, nh, ch, rr, ss), ditongos",
    ],
    math: [
      "Ler, escrever, representar e comparar números naturais até 1000",
      "Efetuar contagens de 2 em 2, 5 em 5, 10 em 10, 100 em 100",
      "Compor e decompor números até 1000 em centenas, dezenas e unidades",
      "Adicionar e subtrair usando estratégias diversas e o algoritmo com e sem transporte",
      "Construir e memorizar as tabuadas do 2, 3, 4, 5 e 10",
      "Interpretar a multiplicação como adição repetida; resolver problemas do quotidiano",
      "Fazer estimativas e verificar a razoabilidade dos resultados com reta numérica",
      "Identificar e classificar figuras geométricas: triângulo, quadrado, retângulo, círculo",
      "Reconhecer sólidos: cubo, paralelepípedo, cilindro, cone, esfera, pirâmide",
      "Identificar figuras com eixo de simetria",
      "Medir comprimentos em cm e m; massas em g e kg; capacidades em L",
      "Usar unidades de tempo: horas, meias-horas, quarto de hora; ler calendários",
      "Identificar e continuar sequências e padrões; descrever a regra",
      "Compreender igualdade e desigualdade (=, ≠, <, >)",
      "Recolher dados e organizar em tabelas de frequência e gráficos de barras",
    ],
    world: [
      "Distinguir órgãos internos: coração, pulmões, estômago, rins e funções vitais",
      "Associar ossos e músculos ao movimento e postura; cuidados específicos",
      "Refletir sobre bem-estar físico e psicológico; importância da vacinação",
      "Identificar riscos para a saúde e propor medidas de prevenção",
      "Categorizar animais por revestimento, alimentação, locomoção e reprodução",
      "Identificar partes das plantas: raiz, caule, folha, flor, fruto, semente",
      "Relacionar características dos seres vivos com o seu habitat",
      "Estabelecer correspondência entre estados físicos da água e o ciclo da água",
      "Relacionar ameaças à biodiversidade com atitudes responsáveis face à Natureza",
      "Localizar Portugal na Europa e no Mundo em representações cartográficas",
      "Caracterizar os estados de tempo típicos das quatro estações em Portugal",
      "Reconhecer instituições e serviços que contribuem para o bem-estar das populações",
      "Reconhecer influências de outros países no quotidiano português",
      "Valorizar os direitos da Convenção sobre os Direitos da Criança",
    ],
    english: [
      "Vocabulário: cores, números 1-20, animais, família, partes do corpo, comida",
      "Cantar músicas e rimas em inglês com boa pronúncia",
      "Responder a instruções e perguntas simples em inglês",
      "Produzir frases: My name is..., I like..., I have..., I can..., I am...",
      "Compreender vocabulário em histórias e contextos simples",
    ],
    expression: [
      "Criar composições com ponto, linha, forma, cor (primárias/secundárias/quentes/frias), textura",
      "Explorar aguarela, guache, colagem, recorte, modelagem com barro ou massa",
      "Desenvolver representação do espaço e figuras; apreciar obras de arte",
      "Explorar corpo, voz e movimento em jogos dramáticos e improvisação",
      "Recriar situações do quotidiano e narrativas pela dramatização e mímica",
      "Cantar canções temáticas; explorar instrumentos de percussão simples",
    ],
    project: [
      "Pesquisa simples sobre um tema (livros, internet, observação direta)",
      "Registo de observações com texto, desenho e/ou fotografia",
      "Construção de maquetas, objetos simples ou apresentações visuais",
      "Apresentação oral das descobertas à família com apoio visual",
    ],
  },
  "3º ano": {
    language: [
      "Leitura expressiva de textos narrativos e informativos com interpretação",
      "Escrita de textos com estrutura clara: parágrafos e pontuação correta",
      "Conjugação verbal no presente, passado e futuro; grau dos adjetivos",
      "Ortografia de palavras com dificuldade (ã, lh, nh, ss, ç, etc.)",
    ],
    math: [
      "Números até 1000 e frações simples (metade, terça, quarta parte)",
      "Multiplicação e divisão: tabuadas completas até ao 9",
      "Calcular o perímetro de figuras geométricas",
      "Organizar e interpretar dados em tabelas e gráficos de barras",
    ],
    world: [
      "Portugal: regiões, relevo, rios e clima",
      "Descobrimentos portugueses: introdução histórica",
      "Ecossistemas: floresta, campo e mar em Portugal",
      "Alimentação saudável e primeiros socorros básicos",
    ],
    english: [
      "Descrever rotinas diárias e atividades preferidas em inglês",
      "Descrever pessoas e lugares com adjetivos simples",
      "Compreender textos curtos e diálogos simples",
    ],
    expression: [
      "Análise de obras de arte portuguesas; criação de histórias ilustradas",
      "Música: notação musical simples, canções em cânone",
    ],
    project: [
      "Projeto de investigação sobre tema escolhido",
      "Trabalho de campo: observação e registo no exterior",
    ],
  },
};

// ─── Estrutura do horário (espelho do planGenerator.ts) ───────────────────────

const PRIMARY_DAYS = [
  [
    { slot: "09:00-10:00", discipline: "language", sort: 0 },
    { slot: "10:15-11:15", discipline: "math", sort: 1 },
    { slot: "11:30-12:00", discipline: "english", sort: 2 },
    { slot: "14:00-15:00", discipline: "world", sort: 3 },
    { slot: "15:00-15:30", discipline: "reading", sort: 4, episode: 1 },
  ],
  [
    { slot: "09:00-10:00", discipline: "math", sort: 0 },
    { slot: "10:15-11:15", discipline: "language", sort: 1 },
    { slot: "11:30-12:00", discipline: "expression", sort: 2 },
    { slot: "14:00-15:00", discipline: "world", sort: 3 },
    { slot: "15:00-15:30", discipline: "reading", sort: 4, episode: 2 },
  ],
  [
    { slot: "09:00-10:00", discipline: "language", sort: 0 },
    { slot: "10:15-11:15", discipline: "math", sort: 1 },
    { slot: "11:30-12:00", discipline: "english", sort: 2 },
    { slot: "14:00-15:00", discipline: "project", sort: 3 },
    { slot: "15:00-15:30", discipline: "reading", sort: 4, episode: 3 },
  ],
  [
    { slot: "09:00-10:00", discipline: "math", sort: 0 },
    { slot: "10:15-11:15", discipline: "language", sort: 1 },
    { slot: "11:30-12:00", discipline: "expression", sort: 2 },
    { slot: "14:00-15:00", discipline: "project", sort: 3 },
    { slot: "15:00-15:30", discipline: "reading", sort: 4, episode: 4 },
  ],
];

const PRE_SCHOOL_SLOTS = [
  { slot: "09:30-10:00", discipline: "language", sort: 0 },
  { slot: "10:00-10:30", discipline: "math", sort: 1 },
  { slot: "10:30-11:00", discipline: "expression", sort: 2 },
  { slot: "14:30-15:00", discipline: "world", sort: 3 },
];

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
  for (const child of children) {
    const isPreSchool = child.school_year.toLowerCase().startsWith("pré");
    if (!isPreSchool) {
      PRIMARY_DAYS.forEach((day, dayIdx) => {
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
    } else {
      for (let d = 0; d < 4; d++) {
        PRE_SCHOOL_SLOTS.forEach((s) => {
          skeleton.push({
            child_id: child.id,
            child_name: child.name,
            school_year: child.school_year,
            day_of_week: d + 1,
            time_slot: s.slot,
            discipline: s.discipline,
            discipline_label: DISCIPLINE_LABELS[s.discipline] ?? s.discipline,
            is_friday_world: false,
            sort_order: s.sort,
          });
        });
      }
    }
    skeleton.push({
      child_id: child.id, child_name: child.name, school_year: child.school_year,
      day_of_week: 5, time_slot: "09:00-12:00", discipline: "world_visit",
      discipline_label: "Ver Mundo", is_friday_world: true, sort_order: 0,
    });
    if (!isPreSchool) {
      skeleton.push({
        child_id: child.id, child_name: child.name, school_year: child.school_year,
        day_of_week: 5, time_slot: "14:00-15:30", discipline: "expression",
        discipline_label: "Expressão Livre", is_friday_world: false, sort_order: 1,
      });
    }
  }
  return skeleton;
}

function buildPrompt(
  children: Child[],
  skeleton: SkeletonItem[],
  childInterests: Record<string, string[]>,
  fridayActivity: string,
): string {
  const childrenSection = children.map((c) => {
    const interests = (childInterests[c.id] || []).join(", ") || "livre";
    return `- **${c.name}** (${c.school_year}) | Interesses: ${interests} | Estilo: ${c.learning_preferences ?? "misto"} | Ritmo: ${c.learning_pace ?? "moderado"}`;
  }).join("\n");

  const curriculumSection = children.map((c) => {
    const isPreSchool = c.school_year.toLowerCase().startsWith("pré");
    const key = isPreSchool ? "Pré-escolar" : c.school_year;
    const curr = CURRICULUM[key];
    if (!curr) return `### ${c.name} — sem currículo definido`;
    return `### ${c.name} (${c.school_year})\n${Object.entries(curr).map(([disc, objs]) =>
      `  **${DISCIPLINE_LABELS[disc] ?? disc}:**\n${objs.map((o) => `    - ${o}`).join("\n")}`
    ).join("\n")}`;
  }).join("\n\n");

  const skeletonSection = skeleton.map((item, idx) => {
    const day = DAY_LABELS[item.day_of_week - 1];
    const interests = (childInterests[item.child_id] || []).join(", ") || "livre";
    const ep = item.episode ? ` [Episódio ${item.episode}/4 — história contínua]` : "";
    return `${idx + 1}. ${item.child_name} | ${day} | ${item.time_slot} | ${item.discipline_label}${ep} | interesses: ${interests}`;
  }).join("\n");

  const fridayNote = fridayActivity
    ? `Atividade de sexta-feira planeada: "${fridayActivity}"`
    : "Sexta-feira: exploração livre — sugere algo concreto e local";

  return `És um especialista em educação e homeschooling português. Gera ${skeleton.length} atividades para um plano semanal.

## CRIANÇAS
${childrenSection}

## CURRÍCULO NACIONAL (DGE — Aprendizagens Essenciais)
${curriculumSection}

## SEXTA-FEIRA
${fridayNote}

## ATIVIDADES A PREENCHER
${skeletonSection}

## REGRAS
1. Usa os **interesses** para tematizar o conteúdo curricular. Ex: interesse "vulcões" + Matemática → problemas de adição/subtração sobre vulcões.
2. **Leitura Episódio X/4**: cria 4 episódios de uma história CONTÍNUA. Descrição = resumo (3 frases) + 2 perguntas de compreensão.
3. **Ver Mundo**: usa a atividade planeada ou sugere algo concreto.
4. **Pré-escolar**: atividades lúdicas, sensoriais, máx. 30 min, sem escrita.
5. Títulos específicos e criativos — nunca genéricos.
6. Descrições CURTAS: máximo 2 frases diretas com passos concretos para a mãe implementar.
7. Materiais: máximo 4 itens simples disponíveis em casa ou papelaria.
8. Títulos com máximo 8 palavras.

## RESPOSTA
Devolve APENAS um JSON array com exatamente ${skeleton.length} objetos, na mesma ordem:
[{"title":"...","description":"...","materials":["...","..."]}]`;
}

// ─── Chamada ao Gemini ─────────────────────────────────────────────────────────

export async function generateWithGemini(
  children: Child[],
  childInterests: Record<string, string[]>,
  fridayActivity: string,
): Promise<GeneratedPlanItem[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY não definida");

  const skeleton = buildSkeleton(children);
  const prompt = buildPrompt(children, skeleton, childInterests, fridayActivity);

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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const data = await res.json();

  // gemini-2.5-flash é um modelo de raciocínio: devolve múltiplas parts,
  // sendo a primeira o "pensamento" (thought: true) e a última a resposta real.
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
