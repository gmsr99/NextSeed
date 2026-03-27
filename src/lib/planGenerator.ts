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
  is_fixed?: boolean; // se true: só para visualização no horário, não guardado na BD
}

// ─── Disciplinas com rótulos e cores ──────────────────────────────────────────

export const SCHOOL_YEARS = [
  "Pré-escolar 3 anos",
  "Pré-escolar 4 anos",
  "Pré-escolar 5/6 anos",
  "1º ano",
  "2º ano",
  "3º ano",
  "4º ano",
  "5º ano",
  "6º ano",
];

export const DISCIPLINE_LABELS: Record<string, string> = {
  language:       "Português",
  math:           "Matemática",
  world:          "Estudo do Meio",
  expression:     "Expressão Artística",
  english:        "Inglês",
  project:        "Projeto",
  reading:        "Leitura e Portefólio",
  world_visit:    "Ver Mundo",
  // Blocos fixos (estrutura do dia)
  ritual:         "Ritual de Chegada",
  transition:     "Transição · 7 min",
  break:          "Pausa Exterior",
  practical_life: "Vida Prática",
  meditation:     "Relaxamento",
};

export const DISCIPLINE_COLORS: Record<string, string> = {
  language:       "#E9C46A",
  math:           "#90BE6D",
  world:          "#43AA8B",
  expression:     "#F4A261",
  english:        "#4CC9F0",
  project:        "#9B72CF",
  reading:        "#F77F00",
  world_visit:    "#2EC4B6",
  // Blocos fixos (tons neutros/pastel)
  ritual:         "#A7F3D0",
  transition:     "#FDE68A",
  break:          "#BFDBFE",
  practical_life: "#FBCFE8",
  meditation:     "#DDD6FE",
};

export const DAY_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// ─── Horário real (baseado no XLSX do Elton) ──────────────────────────────────
// Blocos variáveis por dia — é aqui que se injeta conteúdo curricular
// Seg e Qua: A=Português, B=Matemática | Ter e Qui: A=Matemática, B=Português

type PrimarySlot = { slot: string; discipline: string; tIdx: number; episode?: number };

const PRIMARY_DAYS: PrimarySlot[][] = [
  // Seg
  [
    { slot: "09:45-10:10", discipline: "language",    tIdx: 0 },
    { slot: "10:17-10:42", discipline: "math",        tIdx: 0 },
    { slot: "11:05-11:50", discipline: "world",       tIdx: 0 },
    { slot: "14:00-14:30", discipline: "english",     tIdx: 0 },
    { slot: "15:00-15:30", discipline: "reading",     tIdx: 0, episode: 0 },
  ],
  // Ter
  [
    { slot: "09:45-10:10", discipline: "math",        tIdx: 1 },
    { slot: "10:17-10:42", discipline: "language",    tIdx: 1 },
    { slot: "11:05-11:50", discipline: "world",       tIdx: 1 },
    { slot: "14:00-14:30", discipline: "expression",  tIdx: 0 },
    { slot: "15:00-15:30", discipline: "reading",     tIdx: 0, episode: 1 },
  ],
  // Qua
  [
    { slot: "09:45-10:10", discipline: "language",    tIdx: 2 },
    { slot: "10:17-10:42", discipline: "math",        tIdx: 2 },
    { slot: "11:05-11:50", discipline: "project",     tIdx: 0 },
    { slot: "14:00-14:30", discipline: "expression",  tIdx: 1 }, // Texto Livre
    { slot: "15:00-15:30", discipline: "reading",     tIdx: 0, episode: 2 },
  ],
  // Qui
  [
    { slot: "09:45-10:10", discipline: "math",        tIdx: 3 },
    { slot: "10:17-10:42", discipline: "language",    tIdx: 3 },
    { slot: "11:05-11:50", discipline: "world",       tIdx: 2 },
    { slot: "14:00-14:30", discipline: "project",     tIdx: 1 }, // Educação Emocional
    { slot: "15:00-15:30", discipline: "reading",     tIdx: 0, episode: 3 },
  ],
];

// Blocos variáveis da sexta-feira
const FRIDAY_VARIABLE = [
  { slot: "09:45-11:50", discipline: "world_visit",  tIdx: 0, isFridayWorld: true  },
  { slot: "14:00-14:30", discipline: "expression",   tIdx: 0, isFridayWorld: false }, // Registo da visita
  { slot: "15:00-15:30", discipline: "world_visit",  tIdx: 1, isFridayWorld: false }, // Encerramento
];

// ─── Blocos fixos (mostrados no horário PDF mas NÃO guardados na BD) ──────────

export const FIXED_BLOCKS_PRIMARY = [
  { slot: "09:30-09:45", discipline: "ritual",         label: "Ritual de Chegada"       },
  { slot: "10:10-10:17", discipline: "transition",     label: "Transição · 7 min"       },
  { slot: "10:42-11:05", discipline: "break",          label: "Pausa Exterior"          },
  { slot: "11:50-12:30", discipline: "practical_life", label: "Vida Prática"            },
  { slot: "14:30-14:45", discipline: "meditation",     label: "Relaxamento"             },
];

export const FIXED_BLOCKS_FRIDAY = [
  { slot: "09:30-09:45", discipline: "ritual",         label: "Partida · Ver Mundo"     },
  { slot: "11:50-12:30", discipline: "practical_life", label: "Vida Prática Exterior"   },
  { slot: "14:30-14:45", discipline: "meditation",     label: "Relaxamento"             },
];

export const FIXED_BLOCKS_PRESCHOOL = [
  { slot: "09:00-09:30", discipline: "ritual",         label: "Ritual de Chegada"       },
];

/**
 * Gera os blocos fixos do horário para visualização no SchedulePDF.
 * NÃO são guardados na BD.
 */
export function getFixedScheduleBlocks(children: Child[]): GeneratedPlanItem[] {
  const items: GeneratedPlanItem[] = [];
  for (const child of children) {
    const isPreSchool = child.school_year.toLowerCase().startsWith("pré");
    if (!isPreSchool) {
      // Seg a Qui — blocos fixos
      for (let dayIdx = 0; dayIdx < 4; dayIdx++) {
        FIXED_BLOCKS_PRIMARY.forEach((b, idx) => {
          items.push({
            child_id: child.id, day_of_week: dayIdx + 1,
            time_slot: b.slot, discipline: b.discipline, title: b.label,
            description: "", materials: [], is_friday_world: false,
            sort_order: 100 + idx, is_fixed: true,
          });
        });
      }
      // Sexta — blocos fixos
      FIXED_BLOCKS_FRIDAY.forEach((b, idx) => {
        items.push({
          child_id: child.id, day_of_week: 5,
          time_slot: b.slot, discipline: b.discipline, title: b.label,
          description: "", materials: [], is_friday_world: false,
          sort_order: 100 + idx, is_fixed: true,
        });
      });
    } else {
      // Pré-escolar
      for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
        FIXED_BLOCKS_PRESCHOOL.forEach((b, idx) => {
          items.push({
            child_id: child.id, day_of_week: dayIdx + 1,
            time_slot: b.slot, discipline: b.discipline, title: b.label,
            description: "", materials: [], is_friday_world: false,
            sort_order: 100 + idx, is_fixed: true,
          });
        });
      }
    }
  }
  return items;
}

// ─── Templates de atividades ──────────────────────────────────────────────────

type Tpl = { title: (i: string) => string; description: (i: string) => string; materials: string[] };

const T: Record<string, Tpl[]> = {
  language: [
    {
      title: (i) => `Leitura — A história de ${i}`,
      description: (i) =>
        `Lê um texto sobre ${i}. Sublinha as palavras difíceis. Responde: O que aconteceu? Quem são as personagens?`,
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
        `Escreve 5 frases sobre ${i}. Identifica o sujeito e o predicado. Conta as sílabas das palavras mais difíceis.`,
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
        `Inventa 5 problemas de adição e subtração com ${i}. "Havia 12 ${i}s, apareceram mais 7. Quantos ficam?"`,
      materials: ["caderno de matemática", "lápis"],
    },
    {
      title: (i) => `Geometria com ${i}`,
      description: (i) =>
        `Desenha ${i} usando formas geométricas. Conta quantas usaste de cada tipo e regista numa tabela.`,
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
        `Pesquisa 3 factos curiosos sobre ${i}. Desenha um mapa mental. Partilha com a família ao jantar.`,
      materials: ["livros ou tablet", "papel A4", "lápis de cor"],
    },
    {
      title: (i) => `Ciências — ${i} e a natureza`,
      description: (i) =>
        `Observa como ${i} aparece na natureza. Faz um desenho científico com etiquetas. Escreve 3 perguntas.`,
      materials: ["caderno de ciências", "lápis de cor", "lupa (se disponível)"],
    },
    {
      title: (i) => `Experiência com ${i}`,
      description: (i) =>
        `Faz uma experiência simples com ${i}. Regista o que pensavas que ia acontecer e o que aconteceu.`,
      materials: ["materiais da experiência", "caderno", "lápis"],
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
      title: (i) => `Texto livre — ${i} na minha imaginação`,
      description: (i) =>
        `Escreve livremente sobre ${i} sem preocupação com erros. O que sentes? O que imaginarias? Desenha se quiseres.`,
      materials: ["caderno", "lápis ou canetas coloridas"],
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
        `Ouve uma história curta sobre ${i} em inglês. Desenha 3 cenas e escreve uma frase em inglês para cada.`,
      materials: ["tablet ou computador", "caderno", "lápis de cor"],
    },
  ],
  project: [
    {
      title: (i) => `Projeto — Planear sobre ${i}`,
      description: (i) =>
        `Começa a planear um mini-projeto sobre ${i}. O que queres descobrir? Escreve um plano com 3 passos.`,
      materials: ["caderno de projetos", "lápis"],
    },
    {
      title: (i) => `Valores — ${i} no meu coração`,
      description: (i) =>
        `Conversa sobre valores ligados a ${i}: respeito, gratidão, coragem. Desenha uma situação onde aplicarias este valor.`,
      materials: ["caderno", "lápis de cor"],
    },
  ],
};

// Mini-série de Leitura e Portefólio (4 episódios semanais)
const MINI_SERIES = [
  {
    title: (i: string) => `Leitura · Ep.1 — ${i}: O Começo`,
    description: (i: string) =>
      `Descobre as personagens e o mundo de "${i}". Lê ou ouve o 1.º episódio. Desenha a cena favorita e escreve 1 frase sobre ela.`,
    materials: ["episódio impresso ou em tablet", "caderno de portefólio", "lápis de cor"],
  },
  {
    title: (i: string) => `Leitura · Ep.2 — ${i}: O Desafio`,
    description: (i: string) =>
      `As personagens encontram um grande desafio em "${i}". Lê e responde: Qual é o problema? O que farias tu? Escreve no portefólio.`,
    materials: ["episódio impresso ou em tablet", "caderno de portefólio", "lápis"],
  },
  {
    title: (i: string) => `Leitura · Ep.3 — ${i}: A Descoberta`,
    description: (i: string) =>
      `Há uma descoberta importante em "${i}"! Lê com atenção. Escreve 2 factos novos e faz um desenho da descoberta.`,
    materials: ["episódio impresso ou em tablet", "caderno de portefólio", "lápis"],
  },
  {
    title: (i: string) => `Leitura · Ep.4 — ${i}: O Final`,
    description: (i: string) =>
      `Chegou o último episódio de "${i}"! Como termina a aventura? Escreve o teu próprio final alternativo no portefólio.`,
    materials: ["episódio impresso ou em tablet", "caderno de portefólio", "lápis"],
  },
];

// Pré-escolar templates
const PRE_SCHOOL: Record<string, Tpl> = {
  language: {
    title: (i) => `Linguagem — Histórias de ${i}`,
    description: (i) =>
      `Ouve uma história sobre ${i}. Conta a história com as tuas palavras usando dedoches. Que personagem gostavas de ser?`,
    materials: ["livro de histórias", "dedoches ou bonecos"],
  },
  math: {
    title: (i) => `Números — Contar ${i}s`,
    description: (i) =>
      `Conta objetos relacionados com ${i} até 10. Agrupa por cor ou tamanho. Qual grupo tem mais?`,
    materials: ["objetos pequenos (botões, pedras)", "tabuleiro de contagem (opcional)"],
  },
  expression: {
    title: (i) => `Expressão Criativa — ${i} em Arte`,
    description: (i) =>
      `Pinta, recorta ou modela algo inspirado em ${i}. Conta o que fizeste.`,
    materials: ["tintas de dedos ou lápis de cera", "barro ou massa de modelar", "papel A3"],
  },
  world: {
    title: (i) => `Descoberta — ${i} no mundo`,
    description: (i) =>
      `Saiam à procura de coisas relacionadas com ${i}. Tira fotografias ou faz um desenho do que encontraste.`,
    materials: ["telemóvel para fotos (opcional)", "papel e lápis"],
  },
};

// ─── Gerador de horário primário ──────────────────────────────────────────────

function primarySchedule(
  child: Child,
  interests: string[],
  fridayActivity: string,
  weeklyReadingTheme: string,
): GeneratedPlanItem[] {
  const items: GeneratedPlanItem[] = [];
  const i0 = interests[0] || "natureza";
  const i1 = interests[1] || i0;
  const readingTheme = weeklyReadingTheme || i0;

  // Seg a Qui
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
          title: ep.title(readingTheme),
          description: ep.description(readingTheme),
          materials: ep.materials,
          is_friday_world: false,
          sort_order: slotIdx,
        });
      } else {
        const tpls = T[s.discipline];
        const tpl = tpls ? tpls[Math.min(s.tIdx, tpls.length - 1)] : null;
        if (!tpl) return;
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

  // Sexta — blocos variáveis
  const fridayLabel = fridayActivity || "Exploração Livre";
  FRIDAY_VARIABLE.forEach((s, slotIdx) => {
    if (s.discipline === "world_visit") {
      const isMain = s.isFridayWorld;
      items.push({
        child_id: child.id,
        day_of_week: 5,
        time_slot: s.slot,
        discipline: "world_visit",
        title: isMain
          ? `Ver Mundo — ${fridayLabel}`
          : "Ver Mundo — Encerramento Reflexivo",
        description: isMain
          ? (fridayActivity
            ? `Atividade: ${fridayActivity}. Tirem fotos, façam perguntas e registem 3 descobertas.`
            : "Dia de exploração. Visitem um local novo. Registem 3 descobertas do dia.")
          : "Partilha o momento favorito do dia. Como me senti? O que aprendi? O que levei no coração?",
        materials: isMain
          ? ["mochila", "caderno de campo", "câmara/telemóvel", "lanche"]
          : ["caderno de portefólio", "lápis de cor"],
        is_friday_world: isMain,
        sort_order: slotIdx,
      });
    } else if (s.discipline === "expression") {
      items.push({
        child_id: child.id,
        day_of_week: 5,
        time_slot: s.slot,
        discipline: "expression",
        title: `Registo da Visita — ${fridayLabel}`,
        description: "Recria o que viveste: desenha, escreve, ou cria uma colagem. Escolhe o formato livre.",
        materials: ["material de artes", "caderno", "fotos do dia (se tiradas)"],
        is_friday_world: false,
        sort_order: slotIdx,
      });
    }
  });

  return items;
}

// ─── Alinhamento multi-criança ─────────────────────────────────────────────────
// Quando existe pelo menos uma criança do ensino primário e uma do pré-escolar,
// os horários do pré-escolar são alinhados com os do primário para que o adulto
// possa lecionar em paralelo (conteúdo diferente, mesma hora e disciplina).

// Mapeamento: disciplina do primário → disciplina equivalente no pré-escolar
const PRESCHOOL_DISC_MAP: Record<string, string> = {
  language:   "language",
  math:       "math",
  world:      "world",
  english:    "expression",  // Não há inglês formal no pré-escolar
  project:    "world",       // Projeto → Descoberta no pré-escolar
  expression: "expression",
  reading:    "language",    // Leitura → actividade de linguagem oral
};

/**
 * Devolve os slots alinhados para uma criança do pré-escolar num dado dia,
 * quando existe um irmão/irmã no ensino primário.
 * Os start times coincidem com os do primário; a duração é ajustada por idade.
 */
export function getAlignedPreSchoolSlots(
  age: number,
  dayIdx: number, // 0=Seg … 3=Qui
): { slot: string; discipline: string }[] {
  const durMin = age <= 3 ? 20 : age === 4 ? 25 : 30;
  // Usa os primeiros 4 blocos do dia (ignora o 5.º = reading)
  return PRIMARY_DAYS[dayIdx].slice(0, 4).map((ps) => {
    const startStr = ps.slot.split("-")[0];
    const [hh, mm] = startStr.split(":").map(Number);
    const endMin = hh * 60 + mm + durMin;
    const endStr = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    return {
      slot: `${startStr}-${endStr}`,
      discipline: PRESCHOOL_DISC_MAP[ps.discipline] ?? "world",
    };
  });
}

// ─── Gerador pré-escolar ──────────────────────────────────────────────────────

function getPreSchoolAge(schoolYear: string): number {
  if (schoolYear.includes("3")) return 3;
  if (schoolYear.includes("4")) return 4;
  return 5; // "5/6 anos" ou genérico
}

function preSchoolSchedule(
  child: Child,
  interests: string[],
  fridayActivity: string,
  aligned = false, // true quando existe pelo menos uma criança do primário na família
): GeneratedPlanItem[] {
  const items: GeneratedPlanItem[] = [];
  const i0 = interests[0] || "natureza";
  const i1 = interests[1] || i0;
  const age = getPreSchoolAge(child.school_year);
  const subjects = ["language", "math", "expression", "world"];

  // Tempos independentes (sem alinhamento)
  const standaloneSlots =
    age <= 3
      ? ["09:30-09:55", "09:55-10:20", "10:30-10:55", "14:30-14:55"]  // 25 min
      : age === 4
      ? ["09:30-10:00", "10:00-10:30", "10:45-11:15", "14:30-15:00"]  // 30 min
      : ["09:30-10:05", "10:05-10:40", "10:55-11:30", "14:30-15:05"]; // 35 min (5/6 anos)

  for (let dayIdx = 0; dayIdx < 4; dayIdx++) {
    // Quando alinhado, os slots (hora e disciplina) espelham o horário do irmão primário
    const daySlots: { slot: string; discipline: string }[] = aligned
      ? getAlignedPreSchoolSlots(age, dayIdx)
      : subjects.map((subj, sIdx) => ({ slot: standaloneSlots[sIdx], discipline: subj }));

    daySlots.forEach(({ slot, discipline }, sIdx) => {
      const interest = sIdx % 2 === 0 ? i0 : i1;
      const tpl = PRE_SCHOOL[discipline] ?? PRE_SCHOOL["world"];
      items.push({
        child_id: child.id,
        day_of_week: dayIdx + 1,
        time_slot: slot,
        discipline: discipline,
        title: tpl.title(interest),
        description: tpl.description(interest),
        materials: tpl.materials,
        is_friday_world: false,
        sort_order: sIdx,
      });
    });
  }

  // Sexta — pré-escolar
  items.push({
    child_id: child.id,
    day_of_week: 5,
    time_slot: "09:30-12:00",
    discipline: "world_visit",
    title: fridayActivity ? `Ver Mundo — ${fridayActivity}` : "Ver Mundo — Exploração com a família",
    description: fridayActivity
      ? `Atividade: ${fridayActivity}. ${child.name.split(" ")[0]} vai explorar com os olhos bem abertos!`
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
  weeklyReadingTheme = "",
): GeneratedPlanItem[] {
  // Deteta família multi-nível: existe pelo menos um filho no primário E um no pré-escolar
  const hasPrimaryChild = children.some(
    (c) => !c.school_year.toLowerCase().startsWith("pré"),
  );

  return children.flatMap((child) => {
    const interests = childInterests[child.id] || [];
    const isPreSchool = child.school_year.toLowerCase().startsWith("pré");
    // Alinha pré-escolar com primário quando ambos existem na mesma família
    const aligned = isPreSchool && hasPrimaryChild;
    return isPreSchool
      ? preSchoolSchedule(child, interests, fridayActivity, aligned)
      : primarySchedule(child, interests, fridayActivity, weeklyReadingTheme);
  });
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

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
  let diff: number;
  if (day === 0)      diff = 1;
  else if (day === 6) diff = 2;
  else                diff = 1 - day;
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
  items
    .filter((i) => !i.is_fixed)
    .forEach((item) => item.materials.forEach((m) => set.add(m)));
  return Array.from(set).sort();
}

/**
 * Converte o schoolYear para o nível de pré-escolar (para uso no currículo)
 */
export function normalizeSchoolYear(schoolYear: string): string {
  const lower = schoolYear.toLowerCase();
  if (lower.startsWith("pré")) return "Pré-escolar";
  return schoolYear;
}

/**
 * Sugere o ano escolar de pré-escolar com base na data de nascimento
 */
export function suggestPreSchoolYear(birthDate: Date): string {
  const age = new Date().getFullYear() - birthDate.getFullYear();
  const birthMonth = birthDate.getMonth();
  const currentMonth = new Date().getMonth();
  // Ajuste se ainda não fez anos este ano
  const realAge = currentMonth < birthMonth ? age - 1 : age;

  if (realAge <= 3) return "Pré-escolar 3 anos";
  if (realAge === 4) return "Pré-escolar 4 anos";
  return "Pré-escolar 5/6 anos";
}
