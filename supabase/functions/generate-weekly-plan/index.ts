import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL = "gemini-2.5-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Currículo Nacional Português ─────────────────────────────────────────────

const CURRICULUM: Record<string, Record<string, string[]>> = {
  "Pré-escolar": {
    language: [
      "Escuta ativa de histórias e recontar com as suas palavras",
      "Reconhecimento de letras e sons iniciais de palavras",
      "Desenvolvimento do vocabulário e expressão oral",
      "Rimas, lengalengas e jogos com sons",
    ],
    math: [
      "Contagem até 10 com objetos concretos",
      "Conceitos de mais/menos, grande/pequeno, dentro/fora",
      "Reconhecimento de formas geométricas simples",
      "Classificação por cor, forma ou tamanho",
    ],
    expression: [
      "Pintura com dedos, esponjas e pincéis",
      "Modelagem com barro ou massa de sal",
      "Música, dança e movimento rítmico",
      "Dramatização com bonecos e dedoches",
    ],
    world: [
      "Observação da natureza: plantas, insetos, animais",
      "Partes do corpo humano",
      "Noção de tempo: manhã, tarde, noite, dias da semana",
      "Rotinas e hábitos saudáveis",
    ],
  },
  "1º ano": {
    language: [
      "Reconhecimento de todas as letras e seus sons",
      "Leitura de palavras e frases simples",
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
      "A família e a casa",
      "O corpo humano: partes externas e sentidos",
      "Animais e plantas do ambiente próximo",
      "Estações do ano e fenómenos atmosféricos simples",
    ],
    english: [
      "Saudações e despedidas",
      "Cores e números até 10",
      "Vocabulário: animais, família, objetos da sala",
      "Canções e rimas simples em inglês",
    ],
    expression: [
      "Técnicas básicas de pintura e desenho",
      "Colagem com materiais naturais e reciclados",
      "Música: ritmo, canções e instrumentos simples",
    ],
  },
  "2º ano": {
    // Fonte: DGE — Aprendizagens Essenciais 2.º ano (Decreto-Lei n.º 55/2018)
    language: [
      // Oralidade
      "Falar com clareza, articular palavras e usar formas de tratamento adequadas à situação",
      "Formular perguntas, pedidos e respostas considerando o interlocutor",
      // Leitura
      "Ler com fluência crescente textos de diferentes géneros e suportes",
      "Identificar o tema e assunto principal; inferir o sentido de palavras desconhecidas pelo contexto",
      "Mobilizar o conhecimento da pontuação para interpretar e organizar o discurso",
      // Escrita
      "Escrever textos narrativos, descritivos e instrucionais com planificação (início, meio, fim)",
      "Usar corretamente sinais de pontuação: ponto final, interrogação, exclamação, vírgula",
      "Escrever com correção ortográfica palavras de uso frequente",
      // Educação Literária
      "Ouvir e ler textos literários: contos, fábulas, poemas, lengalengas, adivinhas",
      "Recontar e recriar textos lidos oralmente e por escrito com expressividade",
      "Exprimir sentimentos, emoções e opiniões sobre textos lidos ou ouvidos",
      // Gramática
      "Identificar nomes, verbos e adjetivos; distinguir singular/plural e masculino/feminino",
      "Reconhecer sílabas, sílaba tónica e fazer divisão silábica correta",
      "Aplicar regras ortográficas: uso de maiúsculas, dígrafos (lh, nh, ch, rr, ss), ditongos",
    ],
    math: [
      // Números e Operações
      "Ler, escrever, representar e comparar números naturais até 1000",
      "Efetuar contagens progressivas e regressivas de 2 em 2, 5 em 5, 10 em 10, 100 em 100",
      "Compor e decompor números até 1000 em centenas, dezenas e unidades",
      "Adicionar e subtrair usando estratégias diversas e o algoritmo da adição com e sem transporte",
      "Construir e memorizar as tabuadas do 2, 3, 4, 5 e 10",
      "Interpretar a multiplicação como adição repetida e resolver problemas do quotidiano",
      "Fazer estimativas e verificar a razoabilidade dos resultados com reta numérica",
      // Geometria e Medida
      "Identificar e classificar figuras geométricas: triângulo, quadrado, retângulo, círculo",
      "Reconhecer sólidos geométricos: cubo, paralelepípedo, cilindro, cone, esfera, pirâmide",
      "Identificar figuras com eixo de simetria",
      "Medir comprimentos com régua em cm e m; massas em g e kg; capacidades em L e meio L",
      "Usar unidades de tempo: horas, meias-horas, quarto de hora, dias, semanas, meses, ano; ler calendários",
      // Álgebra
      "Identificar e continuar sequências e padrões numéricos e não numéricos; descrever a regra",
      "Compreender igualdade e desigualdade (=, ≠, <, >)",
      // Dados
      "Recolher dados e organizar em tabelas de frequência",
      "Representar dados em pictogramas e gráficos de barras; interpretar e responder a questões",
    ],
    world: [
      // Corpo Humano
      "Distinguir órgãos internos principais: coração, pulmões, estômago, rins e as suas funções vitais",
      "Associar ossos e músculos ao movimento, postura e equilíbrio; cuidados específicos",
      "Refletir sobre comportamentos de bem-estar físico e psicológico; importância da vacinação",
      "Identificar situações e comportamentos de risco para a saúde, propondo medidas de prevenção",
      // Seres Vivos e Natureza
      "Categorizar animais por revestimento (pele/penas/escamas/carapaça), alimentação, locomoção e reprodução",
      "Identificar as partes das plantas: raiz, caule, folha, flor, fruto e semente; funções de cada parte",
      "Relacionar as características dos seres vivos com o seu habitat",
      "Estabelecer correspondência entre estados físicos da água (evaporação, condensação, solidificação, fusão) e o ciclo da água",
      "Relacionar ameaças à biodiversidade com a necessidade de atitudes responsáveis face à Natureza",
      // Geografia e Sociedade
      "Localizar Portugal na Europa e no Mundo em diferentes representações cartográficas",
      "Caracterizar os estados de tempo típicos das quatro estações do ano em Portugal",
      "Reconhecer instituições e serviços que contribuem para o bem-estar das populações e as suas funções",
      "Reconhecer influências de outros países e culturas no quotidiano (alimentação, vestuário, música)",
      "Valorizar os direitos consagrados na Convenção sobre os Direitos da Criança",
    ],
    english: [
      "Vocabulário temático: cores, números 1-20, animais, família, partes do corpo, objetos, comida",
      "Cantar músicas e rimas simples em inglês com boa pronúncia e expressividade",
      "Responder a instruções e perguntas simples em inglês",
      "Produzir frases simples: My name is..., I like..., I have..., I can..., I am...",
      "Compreender vocabulário e expressões em contextos familiares; identificar palavras em histórias simples",
    ],
    expression: [
      // Artes Visuais
      "Criar composições visuais explorando: ponto, linha, forma, cor (primárias, secundárias, quentes/frias), textura",
      "Explorar técnicas: aguarela, guache, colagem, recorte, modelagem com barro ou massa de sal",
      "Desenvolver representação do espaço e das figuras; apreciar obras de arte do patrimônio",
      // Expressão Dramática
      "Explorar expressão do corpo, voz e movimento em jogos dramáticos e improvisação",
      "Recriar situações do quotidiano e narrativas pela dramatização e mímica",
      // Música
      "Cantar canções temáticas com expressividade e dicção correta",
      "Explorar instrumentos de percussão simples; reproduzir padrões rítmicos com corpo e instrumentos",
    ],
    project: [
      "Pesquisa simples sobre um tema com apoio do adulto (livros, internet, observação direta)",
      "Registo de observações com texto, desenho e/ou fotografia; organização dos dados recolhidos",
      "Construção de maquetas, objetos técnicos simples ou apresentações visuais",
      "Apresentação oral das descobertas à família com apoio de materiais visuais",
    ],
  },
  "3º ano": {
    language: [
      "Leitura expressiva de textos narrativos e informativos",
      "Escrita de textos com estrutura clara (parágrafo, pontuação)",
      "Análise morfológica: grau dos adjetivos, conjugação verbal (presente, passado, futuro)",
      "Ortografia de palavras com dificuldade (ã, lh, nh, etc.)",
    ],
    math: [
      "Números até 1000 e números racionais simples (meios, quartos)",
      "Multiplicação e divisão: tabuadas até ao 9",
      "Perímetro de figuras geométricas",
      "Frações: metade, terça parte, quarta parte",
      "Organização e interpretação de dados em tabelas e gráficos",
    ],
    world: [
      "Portugal: regiões, relevo, rios e clima",
      "Os portugueses no mundo: Descobrimentos (introdução)",
      "Ecossistemas: floresta, campo, mar",
      "Saúde e segurança: alimentação saudável, primeiros socorros",
    ],
    english: [
      "Rotinas diárias e atividades preferidas",
      "Descrição de pessoas e lugares",
      "Compreensão de textos curtos e diálogos simples",
    ],
    expression: [
      "Arte: análise de obras de arte portuguesas",
      "Criação de histórias ilustradas",
      "Música: notação musical simples, canções em cânone",
    ],
    project: [
      "Projeto de investigação sobre tema escolhido",
      "Produção de um livro, jornal ou exposição",
      "Trabalho de campo: observação e registo no exterior",
    ],
  },
};

// ─── Estrutura do horário ──────────────────────────────────────────────────────

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

const DISCIPLINE_LABELS: Record<string, string> = {
  language: "Português",
  math: "Matemática",
  world: "Estudo do Meio",
  expression: "Artes e Expressão",
  english: "Inglês",
  project: "Projeto",
  reading: "Leitura",
  world_visit: "Ver Mundo",
};

const DAY_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

interface ChildInput {
  id: string;
  name: string;
  school_year: string;
  learning_preferences?: string | null;
  learning_pace?: string | null;
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { children, childInterests, fridayActivity } = await req.json() as {
      children: ChildInput[];
      childInterests: Record<string, string[]>;
      fridayActivity: string;
    };

    // ── 1. Construir esqueleto do horário ──────────────────────────────────────
    const skeleton: SkeletonItem[] = [];

    for (const child of children) {
      const isPreSchool = child.school_year.toLowerCase().startsWith("pré");

      if (!isPreSchool) {
        PRIMARY_DAYS.forEach((day, dayIdx) => {
          day.forEach((slot) => {
            skeleton.push({
              child_id: child.id,
              child_name: child.name,
              school_year: child.school_year,
              day_of_week: dayIdx + 1,
              time_slot: slot.slot,
              discipline: slot.discipline,
              discipline_label: DISCIPLINE_LABELS[slot.discipline] ?? slot.discipline,
              is_friday_world: false,
              sort_order: slot.sort,
              episode: (slot as { episode?: number }).episode,
            });
          });
        });
      } else {
        for (let dayIdx = 0; dayIdx < 4; dayIdx++) {
          PRE_SCHOOL_SLOTS.forEach((slot) => {
            skeleton.push({
              child_id: child.id,
              child_name: child.name,
              school_year: child.school_year,
              day_of_week: dayIdx + 1,
              time_slot: slot.slot,
              discipline: slot.discipline,
              discipline_label: DISCIPLINE_LABELS[slot.discipline] ?? slot.discipline,
              is_friday_world: false,
              sort_order: slot.sort,
            });
          });
        }
      }

      // Sexta-feira — Ver Mundo
      skeleton.push({
        child_id: child.id,
        child_name: child.name,
        school_year: child.school_year,
        day_of_week: 5,
        time_slot: "09:00-12:00",
        discipline: "world_visit",
        discipline_label: "Ver Mundo",
        is_friday_world: true,
        sort_order: 0,
      });

      // Sexta tarde — só ensino primário
      if (!isPreSchool) {
        skeleton.push({
          child_id: child.id,
          child_name: child.name,
          school_year: child.school_year,
          day_of_week: 5,
          time_slot: "14:00-15:30",
          discipline: "expression",
          discipline_label: "Expressão Livre",
          is_friday_world: false,
          sort_order: 1,
        });
      }
    }

    // ── 2. Construir prompt ────────────────────────────────────────────────────

    const childrenSection = children.map((c) => {
      const interests = (childInterests[c.id] || []).join(", ") || "livre";
      return `- **${c.name}** (${c.school_year}) | Interesses desta semana: ${interests} | Estilo: ${c.learning_preferences ?? "misto"} | Ritmo: ${c.learning_pace ?? "moderado"}`;
    }).join("\n");

    const curriculumSection = children.map((c) => {
      const key = c.school_year.toLowerCase().startsWith("pré") ? "Pré-escolar" : c.school_year;
      const curr = CURRICULUM[key];
      if (!curr) return `### ${c.name} — currículo não definido`;
      const lines = Object.entries(curr).map(([disc, objs]) =>
        `  - **${DISCIPLINE_LABELS[disc] ?? disc}:** ${objs.join("; ")}`
      ).join("\n");
      return `### ${c.name} (${c.school_year})\n${lines}`;
    }).join("\n\n");

    const skeletonSection = skeleton.map((item, idx) => {
      const day = DAY_LABELS[item.day_of_week - 1];
      const interests = (childInterests[item.child_id] || []).join(", ") || "livre";
      const episodeNote = item.episode ? ` — Episódio ${item.episode}/4 da mini-série` : "";
      return `${idx + 1}. [${item.child_name} | ${day} | ${item.time_slot} | ${item.discipline_label}${episodeNote}] interesses: ${interests}`;
    }).join("\n");

    const fridayNote = fridayActivity
      ? `Atividade de sexta-feira planeada pela mãe: "${fridayActivity}"`
      : "Sexta-feira: exploração livre — sugere algo criativo";

    const prompt = `És um especialista em educação e homeschooling português. Vais gerar ${skeleton.length} atividades para um plano semanal de ensino doméstico.

## CRIANÇAS E INTERESSES DA SEMANA
${childrenSection}

## CURRÍCULO NACIONAL PORTUGUÊS (objetivos a cobrir)
${curriculumSection}

## NOTA SEXTA-FEIRA
${fridayNote}

## LISTA DE ATIVIDADES A PREENCHER
Para cada entrada abaixo, gera: título criativo, descrição com passos concretos, lista de materiais.

${skeletonSection}

## REGRAS OBRIGATÓRIAS
1. Usa os **interesses da criança** para TEMATIZAR o conteúdo curricular. Exemplo: se o interesse é "vulcões" e a disciplina é Matemática, cria problemas de adição/subtração sobre vulcões.
2. Para entradas de **Leitura (Episódio X/4)**: cria 4 episódios de uma história CONTÍNUA sobre os interesses. A descrição deve ter: resumo do episódio (3 frases) + 2 perguntas de compreensão oral.
3. Para **Ver Mundo**: usa a atividade planeada se indicada, senão sugere algo concreto e local.
4. Para **Pré-escolar**: atividades lúdicas, sensoriais, muito curtas (máx. 30 min), sem escrita.
5. Títulos específicos e criativos (nunca genéricos como "Atividade de Matemática").
6. Materiais simples disponíveis em casa ou numa papelaria.
7. Descrições em 2-3 frases diretas, do ponto de vista de quem vai fazer a atividade com a criança.

## FORMATO DE RESPOSTA
Devolve APENAS um array JSON com exatamente ${skeleton.length} objetos, na mesma ordem da lista acima:
[{"title":"...","description":"...","materials":["...","..."]}]`;

    // ── 3. Chamar Gemini ───────────────────────────────────────────────────────

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.85,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error (${geminiRes.status}): ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

    let aiContent: { title: string; description: string; materials: string[] }[] = [];
    try {
      aiContent = JSON.parse(rawText);
    } catch {
      throw new Error(`Gemini devolveu JSON inválido: ${rawText.slice(0, 200)}`);
    }

    // ── 4. Combinar esqueleto com conteúdo AI ──────────────────────────────────

    const items = skeleton.map((s, idx) => ({
      child_id: s.child_id,
      day_of_week: s.day_of_week,
      time_slot: s.time_slot,
      discipline: s.discipline,
      title: aiContent[idx]?.title ?? `${s.discipline_label}`,
      description: aiContent[idx]?.description ?? "",
      materials: aiContent[idx]?.materials ?? [],
      is_friday_world: s.is_friday_world,
      sort_order: s.sort_order,
    }));

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
