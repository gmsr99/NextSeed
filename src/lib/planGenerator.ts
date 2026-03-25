import type { Child } from "./types";

export interface GeneratedPlanItem {
  child_id: string;
  day_of_week: number; // 1=Seg … 5=Sex
  time_slot: string;
  discipline: string;
  title: string;
  description: string;
  materials: string[];
  is_friday_world: boolean;
  sort_order: number;
}

export const DISCIPLINE_LABELS: Record<string, string> = {
  language: "Português",
  math: "Matemática",
  world: "Est. Meio",
  expression: "Artes",
  english: "Inglês",
  project: "Projeto",
  reading: "Leitura",
  world_visit: "Ver Mundo",
};

export const DISCIPLINE_COLORS: Record<string, string> = {
  language: "#E9C46A",
  math: "#90BE6D",
  world: "#43AA8B",
  expression: "#F4A261",
  english: "#4CC9F0",
  project: "#9B72CF",
  reading: "#F77F00",
  world_visit: "#2EC4B6",
};

export const DAY_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// ─── Templates para o ensino primário ─────────────────────────────────────────

type Tpl = { title: (i: string) => string; description: (i: string) => string; materials: string[] };

const T: Record<string, Tpl[]> = {
  language: [
    {
      title: (i) => `Leitura — A história de ${i}`,
      description: (i) =>
        `Lê um texto sobre ${i}. Sublinha as palavras difíceis. Responde: O que aconteceu? Quem são as personagens? O que aprendeste?`,
      materials: ["texto impresso ou livro", "lápis de cor", "caderno"],
    },
    {
      title: (i) => `Escrita criativa — ${i}`,
      description: (i) =>
        `Escreve uma história curta (5-8 frases) sobre ${i}. Usa pelo menos 3 adjetivos. Desenha uma cena da tua história.`,
      materials: ["caderno", "lápis", "lápis de cor"],
    },
    {
      title: (i) => `Gramática com ${i}`,
      description: (i) =>
        `Escreve 5 frases sobre ${i}. Identifica o sujeito e o predicado em cada frase. Conta as sílabas das palavras mais difíceis.`,
      materials: ["caderno", "lápis"],
    },
    {
      title: (i) => `Ditado sobre ${i}`,
      description: (i) =>
        `O adulto lê um pequeno texto sobre ${i} e a criança escreve. Corrigem juntos e ilustram a palavra favorita.`,
      materials: ["caderno", "lápis", "texto preparado pelo adulto"],
    },
  ],
  math: [
    {
      title: (i) => `Matemática — Problemas com ${i}`,
      description: (i) =>
        `Inventa 5 problemas de adição e subtração com ${i}. Exemplo: "Havia 12 ${i}s, apareceram mais 7. Quantos ficam?"`,
      materials: ["caderno de matemática", "lápis"],
    },
    {
      title: (i) => `Geometria com ${i}`,
      description: (i) =>
        `Desenha ${i} usando apenas formas geométricas. Conta quantas usaste de cada tipo e regista numa tabela.`,
      materials: ["papel quadriculado", "lápis de cor", "régua"],
    },
    {
      title: (i) => `Medidas — ${i} no mundo real`,
      description: (i) =>
        `Estima e mede objetos da casa relacionados com ${i}. Usa a régua. Faz uma tabela com os resultados.`,
      materials: ["régua", "fita métrica", "caderno", "lápis"],
    },
    {
      title: (i) => `Tabuada com ${i}`,
      description: (i) =>
        `Pratica a tabuada do 2 ao 5 usando ${i} como tema. Cria um problema de multiplicação com ${i}s.`,
      materials: ["caderno", "lápis", "fichas de tabuada"],
    },
  ],
  world: [
    {
      title: (i) => `Estudo do Meio — Descobrir ${i}`,
      description: (i) =>
        `Pesquisa 3 factos curiosos sobre ${i}. Desenha um mapa mental com o que descobriste. Partilha com a família ao jantar.`,
      materials: ["livros ou tablet para pesquisa", "papel A4", "lápis de cor"],
    },
    {
      title: (i) => `Ciências — ${i} e a natureza`,
      description: (i) =>
        `Observa como ${i} aparece na natureza. Faz um desenho científico com etiquetas. Escreve 3 perguntas que ainda tens.`,
      materials: ["caderno de ciências", "lápis de cor", "lupa (se disponível)"],
    },
    {
      title: (i) => `Experiência com ${i}`,
      description: (i) =>
        `Faz uma experiência simples relacionada com ${i}. Regista o que pensavas que ia acontecer e o que realmente aconteceu.`,
      materials: ["materiais da experiência (ver guia)", "caderno", "lápis"],
    },
  ],
  expression: [
    {
      title: (i) => `Artes — Criar ${i}`,
      description: (i) =>
        `Usa técnica livre (pintura, colagem, modelagem) para criar algo inspirado em ${i}. Explica a tua obra em 2 frases.`,
      materials: ["tintas ou lápis de cor", "folha A4", "materiais reciclados"],
    },
    {
      title: (i) => `Música com ${i}`,
      description: (i) =>
        `Cria um ritmo ou música curta sobre ${i}. Podes usar objetos da casa como instrumentos. Grava num vídeo curto.`,
      materials: ["objetos da casa", "telemóvel para gravar (opcional)"],
    },
  ],
  english: [
    {
      title: (i) => `English — ${i} words`,
      description: (i) =>
        `Aprende 5 palavras em inglês sobre ${i}. Desenha cada uma com a legenda. Pratica a pronúncia em voz alta.`,
      materials: ["caderno", "lápis de cor"],
    },
    {
      title: (i) => `English — A story about ${i}`,
      description: (i) =>
        `Ouve uma história curta sobre ${i} em inglês. Desenha 3 cenas e escreve uma frase em inglês para cada uma.`,
      materials: ["tablet ou computador", "caderno", "lápis de cor"],
    },
  ],
  project: [
    {
      title: (i) => `Projeto — Planear sobre ${i}`,
      description: (i) =>
        `Começa a planear um mini-projeto sobre ${i}. O que queres descobrir? O que vais fazer? Escreve um plano com 3 passos.`,
      materials: ["caderno de projetos", "lápis"],
    },
    {
      title: (i) => `Projeto — Construir com ${i}`,
      description: (i) =>
        `Avança no projeto sobre ${i}. Hoje constróis, experimentas ou pesquisas. Regista com fotos ou desenhos.`,
      materials: ["materiais do projeto", "câmara/telemóvel"],
    },
  ],
};

const MINI_SERIES: { title: (i: string) => string; description: (i: string) => string; materials: string[] }[] = [
  {
    title: (i) => `Mini-série "${i}" — Ep.1: O Começo`,
    description: (i) =>
      `Lê o 1.º episódio da história sobre ${i}. Descobre as personagens e onde começa a aventura. Desenha a cena favorita.`,
    materials: ["episódio impresso ou em tablet", "caderno", "lápis de cor"],
  },
  {
    title: (i) => `Mini-série "${i}" — Ep.2: O Desafio`,
    description: (i) =>
      `No 2.º episódio as personagens encontram um grande desafio sobre ${i}. Lê e responde: Qual é o problema? O que farias tu?`,
    materials: ["episódio impresso ou em tablet", "caderno", "lápis"],
  },
  {
    title: (i) => `Mini-série "${i}" — Ep.3: A Descoberta`,
    description: (i) =>
      `No 3.º episódio há uma grande descoberta sobre ${i}! Lê com atenção. Escreve 2 factos novos que aprendeste.`,
    materials: ["episódio impresso ou em tablet", "caderno", "lápis"],
  },
  {
    title: (i) => `Mini-série "${i}" — Ep.4: O Final`,
    description: (i) =>
      `Chegou o último episódio! Como termina a aventura com ${i}? Depois de ler, escreve o teu próprio final alternativo.`,
    materials: ["episódio impresso ou em tablet", "caderno", "lápis"],
  },
];

const PRE_SCHOOL: Record<string, Tpl> = {
  language: {
    title: (i) => `Linguagem — Histórias de ${i}`,
    description: (i) =>
      `Ouve uma história sobre ${i}. Conta a história com as tuas palavras usando dedoches ou bonecos. Que personagem gostavas de ser?`,
    materials: ["livro de histórias", "dedoches ou bonecos"],
  },
  math: {
    title: (i) => `Números — Contar ${i}s`,
    description: (i) =>
      `Conta objetos relacionados com ${i} até 10. Agrupa por cor ou tamanho. Qual grupo tem mais? Qual tem menos?`,
    materials: ["objetos pequenos (botões, pedras)", "tabuleiro de contagem (opcional)"],
  },
  expression: {
    title: (i) => `Expressão Criativa — ${i} em Arte`,
    description: (i) =>
      `Pinta, recorta ou modela algo inspirado em ${i}. Não há regras — a criatividade é tua! Conta o que fizeste.`,
    materials: ["tintas de dedos ou lápis de cera", "barro ou massa de modelar", "papel A3"],
  },
  world: {
    title: (i) => `Descoberta — ${i} no mundo`,
    description: (i) =>
      `Saiam à procura de coisas relacionadas com ${i}. Tira fotografias ou faz um desenho do que encontraste.`,
    materials: ["telemóvel para fotos (opcional)", "papel e lápis"],
  },
};

// ─── Gerador primário ──────────────────────────────────────────────────────────

const PRIMARY_DAYS: { slot: string; discipline: string; tIdx: number; episode?: number }[][] = [
  // Seg
  [
    { slot: "09:00-10:00", discipline: "language", tIdx: 0 },
    { slot: "10:15-11:15", discipline: "math", tIdx: 0 },
    { slot: "11:30-12:00", discipline: "english", tIdx: 0 },
    { slot: "14:00-15:00", discipline: "world", tIdx: 0 },
    { slot: "15:00-15:30", discipline: "reading", tIdx: 0, episode: 0 },
  ],
  // Ter
  [
    { slot: "09:00-10:00", discipline: "math", tIdx: 1 },
    { slot: "10:15-11:15", discipline: "language", tIdx: 1 },
    { slot: "11:30-12:00", discipline: "expression", tIdx: 0 },
    { slot: "14:00-15:00", discipline: "world", tIdx: 1 },
    { slot: "15:00-15:30", discipline: "reading", tIdx: 0, episode: 1 },
  ],
  // Qua
  [
    { slot: "09:00-10:00", discipline: "language", tIdx: 2 },
    { slot: "10:15-11:15", discipline: "math", tIdx: 2 },
    { slot: "11:30-12:00", discipline: "english", tIdx: 1 },
    { slot: "14:00-15:00", discipline: "project", tIdx: 0 },
    { slot: "15:00-15:30", discipline: "reading", tIdx: 0, episode: 2 },
  ],
  // Qui
  [
    { slot: "09:00-10:00", discipline: "math", tIdx: 3 },
    { slot: "10:15-11:15", discipline: "language", tIdx: 3 },
    { slot: "11:30-12:00", discipline: "expression", tIdx: 1 },
    { slot: "14:00-15:00", discipline: "project", tIdx: 1 },
    { slot: "15:00-15:30", discipline: "reading", tIdx: 0, episode: 3 },
  ],
];

function primarySchedule(child: Child, interests: string[], fridayActivity: string): GeneratedPlanItem[] {
  const items: GeneratedPlanItem[] = [];
  const i0 = interests[0] || "natureza";
  const i1 = interests[1] || i0;

  PRIMARY_DAYS.forEach((day, dayIdx) => {
    day.forEach((s, slotIdx) => {
      const interest = slotIdx % 2 === 0 ? i0 : i1;
      if (s.discipline === "reading") {
        const ep = MINI_SERIES[s.episode!];
        items.push({
          child_id: child.id,
          day_of_week: dayIdx + 1,
          time_slot: s.slot,
          discipline: "reading",
          title: ep.title(i0),
          description: ep.description(i0),
          materials: ep.materials,
          is_friday_world: false,
          sort_order: slotIdx,
        });
      } else {
        const tpls = T[s.discipline];
        const tpl = tpls[Math.min(s.tIdx, tpls.length - 1)];
        items.push({
          child_id: child.id,
          day_of_week: dayIdx + 1,
          time_slot: s.slot,
          discipline: s.discipline,
          title: tpl.title(interest),
          description: tpl.description(interest),
          materials: tpl.materials,
          is_friday_world: false,
          sort_order: slotIdx,
        });
      }
    });
  });

  // Sexta
  items.push({
    child_id: child.id,
    day_of_week: 5,
    time_slot: "09:00-12:00",
    discipline: "world_visit",
    title: fridayActivity ? `Ver Mundo — ${fridayActivity}` : "Ver Mundo — Exploração Livre",
    description: fridayActivity
      ? `Atividade planeada: ${fridayActivity}. Tirem fotos, façam perguntas e registem o que descobriram.`
      : "Saída de exploração livre. Visitem um local novo ou favorito. Registem 3 descobertas do dia.",
    materials: ["mochila", "caderno de campo", "câmara/telemóvel", "lanche"],
    is_friday_world: true,
    sort_order: 0,
  });
  items.push({
    child_id: child.id,
    day_of_week: 5,
    time_slot: "14:00-15:30",
    discipline: "expression",
    title: "Expressão Livre — Recriação do Ver Mundo",
    description: "Com base no que viveram esta manhã, cria algo: um desenho, uma história, uma maqueta. Conta o momento favorito.",
    materials: ["material de artes", "caderno", "lápis de cor"],
    is_friday_world: false,
    sort_order: 1,
  });

  return items;
}

function preSchoolSchedule(child: Child, interests: string[], fridayActivity: string): GeneratedPlanItem[] {
  const items: GeneratedPlanItem[] = [];
  const i0 = interests[0] || "natureza";
  const i1 = interests[1] || i0;
  const subjects = ["language", "math", "expression", "world"];
  const slots = ["09:30-10:00", "10:00-10:30", "10:30-11:00", "14:30-15:00"];

  for (let dayIdx = 0; dayIdx < 4; dayIdx++) {
    subjects.forEach((subj, sIdx) => {
      const interest = sIdx % 2 === 0 ? i0 : i1;
      const tpl = PRE_SCHOOL[subj];
      items.push({
        child_id: child.id,
        day_of_week: dayIdx + 1,
        time_slot: slots[sIdx],
        discipline: subj,
        title: tpl.title(interest),
        description: tpl.description(interest),
        materials: tpl.materials,
        is_friday_world: false,
        sort_order: sIdx,
      });
    });
  }

  items.push({
    child_id: child.id,
    day_of_week: 5,
    time_slot: "09:00-12:00",
    discipline: "world_visit",
    title: fridayActivity ? `Ver Mundo — ${fridayActivity}` : "Ver Mundo — Exploração com a família",
    description: fridayActivity
      ? `Atividade planeada: ${fridayActivity}. A Noa vai explorar com os olhos bem abertos!`
      : "Dia de exploração livre com a família. Observa, toca e sente o mundo à tua volta.",
    materials: ["mochila", "lanche", "brinquedo favorito"],
    is_friday_world: true,
    sort_order: 0,
  });

  return items;
}

// ─── Exportação principal ──────────────────────────────────────────────────────

export function generateWeeklyPlan(
  children: Child[],
  childInterests: Record<string, string[]>,
  fridayActivity: string,
): GeneratedPlanItem[] {
  return children.flatMap((child) => {
    const interests = childInterests[child.id] || [];
    const isPreSchool = child.school_year.toLowerCase().startsWith("pré");
    return isPreSchool
      ? preSchoolSchedule(child, interests, fridayActivity)
      : primarySchedule(child, interests, fridayActivity);
  });
}

export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getNextMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const locale = "pt-PT";
  return `${weekStart.toLocaleDateString(locale, opts)} a ${end.toLocaleDateString(locale, { ...opts, year: "numeric" })}`;
}

export function collectMaterials(items: GeneratedPlanItem[]): string[] {
  const set = new Set<string>();
  items.forEach((item) => item.materials.forEach((m) => set.add(m)));
  return Array.from(set).sort();
}
