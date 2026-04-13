import type { Child } from "./types";
import RAW_TEMPLATES from "./planTemplates.json";

// ─── Template helpers ─────────────────────────────────────────────────────────

type TplJSON = { title: string; description: string; materials: string[] };

/** Substitui {interest} pelo valor real em title e description */
function applyTpl(tpl: TplJSON, interest: string): { title: string; description: string; materials: string[] } {
  const r = (s: string) => s.replace(/\{interest\}/g, interest);
  return { title: r(tpl.title), description: r(tpl.description), materials: tpl.materials };
}

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
  lunch:          "Almoço + Tempo Livre",
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
  lunch:          "#FEF9C3",
  meditation:     "#DDD6FE",
};

export const DAY_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// ─── Horário real (baseado no XLSX do Elton) ──────────────────────────────────
// Blocos variáveis por dia — é aqui que se injeta conteúdo curricular
// Seg e Qua: A=Português, B=Matemática | Ter e Qui: A=Matemática, B=Português

type PrimarySlot = { slot: string; discipline: string; tIdx: number; episode?: number };

export const PRIMARY_DAYS: PrimarySlot[][] = [
  // Seg
  [
    { slot: "09:45-10:10", discipline: "language",    tIdx: 0 },
    { slot: "10:17-10:42", discipline: "math",        tIdx: 0 },
    { slot: "11:05-11:50", discipline: "world",       tIdx: 0 },
    { slot: "14:00-14:30", discipline: "english",     tIdx: 0 },
    { slot: "14:45-15:15", discipline: "reading",     tIdx: 0, episode: 0 },
  ],
  // Ter
  [
    { slot: "09:45-10:10", discipline: "math",        tIdx: 1 },
    { slot: "10:17-10:42", discipline: "language",    tIdx: 1 },
    { slot: "11:05-11:50", discipline: "world",       tIdx: 1 },
    { slot: "14:00-14:30", discipline: "expression",  tIdx: 0 },
    { slot: "14:45-15:15", discipline: "reading",     tIdx: 0, episode: 1 },
  ],
  // Qua
  [
    { slot: "09:45-10:10", discipline: "language",    tIdx: 2 },
    { slot: "10:17-10:42", discipline: "math",        tIdx: 2 },
    { slot: "11:05-11:50", discipline: "project",     tIdx: 0 },
    { slot: "14:00-14:30", discipline: "expression",  tIdx: 1 }, // Texto Livre
    { slot: "14:45-15:15", discipline: "reading",     tIdx: 0, episode: 2 },
  ],
  // Qui
  [
    { slot: "09:45-10:10", discipline: "math",        tIdx: 3 },
    { slot: "10:17-10:42", discipline: "language",    tIdx: 3 },
    { slot: "11:05-11:50", discipline: "world",       tIdx: 2 },
    { slot: "14:00-14:30", discipline: "project",     tIdx: 1 }, // Educação Emocional
    { slot: "14:45-15:15", discipline: "reading",     tIdx: 0, episode: 3 },
  ],
];

// Blocos variáveis da sexta-feira
export const FRIDAY_VARIABLE = [
  { slot: "09:45-11:50", discipline: "world_visit",  tIdx: 0, isFridayWorld: true  },
  { slot: "14:00-14:30", discipline: "expression",   tIdx: 0, isFridayWorld: false }, // Registo da visita
  { slot: "14:45-15:15", discipline: "world_visit",  tIdx: 1, isFridayWorld: false }, // Encerramento
];

// ─── Blocos fixos (mostrados no horário PDF mas NÃO guardados na BD) ──────────

export const FIXED_BLOCKS_PRIMARY = [
  { slot: "09:30-09:45", discipline: "ritual",         label: "Ritual de Chegada"              },
  { slot: "10:10-10:17", discipline: "transition",     label: "Transição · 7 min"              },
  { slot: "10:42-11:05", discipline: "break",          label: "Pausa Exterior"                 },
  { slot: "11:50-12:30", discipline: "practical_life", label: "Vida Prática / Preparação Almoço"},
  { slot: "12:30-14:00", discipline: "lunch",          label: "Almoço + Tempo Livre"           },
  { slot: "14:30-14:45", discipline: "meditation",     label: "Relaxamento / Meditação"        },
];

export const FIXED_BLOCKS_FRIDAY = [
  { slot: "09:30-09:45", discipline: "ritual",         label: "Saída / Visita de Estudo"   },
  { slot: "11:50-12:30", discipline: "practical_life", label: "Vida Prática no Exterior"   },
  { slot: "12:30-14:00", discipline: "lunch",          label: "Almoço fora / Piquenique"   },
  { slot: "14:30-14:45", discipline: "meditation",     label: "Relaxamento / Meditação"    },
];

export const FIXED_BLOCKS_PRESCHOOL = [
  { slot: "09:00-09:30", discipline: "ritual",         label: "Ritual de Chegada"         },
  { slot: "10:30-10:45", discipline: "break",          label: "Pausa Lúdica"              },
  { slot: "11:15-12:00", discipline: "practical_life", label: "Vida Prática / Jogo Livre"  },
  { slot: "12:00-14:00", discipline: "lunch",          label: "Almoço + Tempo Livre"      },
  { slot: "14:30-14:45", discipline: "meditation",     label: "Relaxamento / Meditação"   },
];

// Pré-escolar autónomo — sexta: world_visit na BD tem slot "09:30-12:00"
// Os blocos fixos preenchem os espaços antes e depois dessa janela.
export const FIXED_BLOCKS_PRESCHOOL_FRIDAY = [
  { slot: "09:00-09:30", discipline: "ritual",    label: "Saída / Visita de Estudo" },
  { slot: "12:00-14:00", discipline: "lunch",     label: "Almoço fora / Piquenique" },
  { slot: "14:30-14:45", discipline: "meditation", label: "Relaxamento / Meditação"  },
];

/**
 * Gera os blocos fixos do horário para visualização no SchedulePDF.
 * NÃO são guardados na BD.
 *
 * Lógica:
 * - Ensino primário → FIXED_BLOCKS_PRIMARY (Seg-Qui) + FIXED_BLOCKS_FRIDAY (Sex)
 * - Pré-escolar alinhado (tem irmão/irmã no primário) → mesma estrutura do primário
 *   para que o adulto possa gerir ambos em paralelo
 * - Pré-escolar autónomo → FIXED_BLOCKS_PRESCHOOL (Seg-Qui) + FIXED_BLOCKS_PRESCHOOL_FRIDAY
 */
export function getFixedScheduleBlocks(children: Child[]): GeneratedPlanItem[] {
  const hasPrimaryChild = children.some(
    (c) => !c.school_year.toLowerCase().startsWith("pré"),
  );
  const items: GeneratedPlanItem[] = [];

  for (const child of children) {
    const isPreSchool = child.school_year.toLowerCase().startsWith("pré");
    // Pré-escolar alinhado partilha a estrutura de blocos fixos do primário
    const isAligned = isPreSchool && hasPrimaryChild;

    if (!isPreSchool || isAligned) {
      // Primário (ou pré-escolar alinhado): Seg a Qui
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
      // Sexta
      FIXED_BLOCKS_FRIDAY.forEach((b, idx) => {
        items.push({
          child_id: child.id, day_of_week: 5,
          time_slot: b.slot, discipline: b.discipline, title: b.label,
          description: "", materials: [], is_friday_world: false,
          sort_order: 100 + idx, is_fixed: true,
        });
      });
    } else {
      // Pré-escolar autónomo: Seg a Qui
      for (let dayIdx = 0; dayIdx < 4; dayIdx++) {
        FIXED_BLOCKS_PRESCHOOL.forEach((b, idx) => {
          items.push({
            child_id: child.id, day_of_week: dayIdx + 1,
            time_slot: b.slot, discipline: b.discipline, title: b.label,
            description: "", materials: [], is_friday_world: false,
            sort_order: 100 + idx, is_fixed: true,
          });
        });
      }
      // Sexta pré-escolar
      FIXED_BLOCKS_PRESCHOOL_FRIDAY.forEach((b, idx) => {
        items.push({
          child_id: child.id, day_of_week: 5,
          time_slot: b.slot, discipline: b.discipline, title: b.label,
          description: "", materials: [], is_friday_world: false,
          sort_order: 100 + idx, is_fixed: true,
        });
      });
    }
  }
  return items;
}

// ─── Templates de atividades — carregados de planTemplates.json ──────────────

// T: activities indexed by discipline, array of templates
const T: Record<string, TplJSON[]> = RAW_TEMPLATES.activities as Record<string, TplJSON[]>;

// Mini-série de Leitura e Portefólio (4 episódios semanais)
const MINI_SERIES: TplJSON[] = RAW_TEMPLATES.miniSeries as TplJSON[];

// Pré-escolar templates (1 template per discipline)
const PRE_SCHOOL: Record<string, TplJSON> = RAW_TEMPLATES.preSchool as Record<string, TplJSON>;

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
          ...applyTpl(ep, readingTheme),
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
          ...applyTpl(tpl, interest),
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
        ...applyTpl(tpl, interest),
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
