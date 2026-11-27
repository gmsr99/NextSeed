// Plano essencial (P-27, aprovado pelo Elton a 26 nov).
//
// O plano tinha 5 atividades por criança por dia, cerca de 2 horas e meia
// guiadas pelo adulto, e "ainda não houve um único dia em que tenha
// conseguido fazer tudo". Passa a ter:
//   - um núcleo de 3 atividades por dia (Português, Matemática e a da manhã
//     que roda: Estudo do Meio, Projeto…);
//   - a leitura em família em 3 dias (sai a de terça);
//   - o bloco da tarde marcado "Se houver tempo";
//   - a duração de cada atividade pela idade (regra prática de 2 a 3 minutos
//     por ano de idade nas tarefas guiadas pelo adulto);
//   - o horário sem horas por omissão: a família segue a ordem dos blocos e
//     põe as horas se quiser (opção em "A vossa semana").
import { routineOutings, type WeekRoutine } from "./familyRoutine";

/** Prefixo do título das atividades opcionais (vai para a base de dados com o título). */
export const OPTIONAL_PREFIX = "Se houver tempo · ";
/**
 * P-28: semana difícil (regra do plano da F-01: "se a semana correr mal, só as
 * orações e a leitura; não é uma semana falhada"). O resto da semana fica com
 * este prefixo: não conta para "Em dia" e desfaz-se sem mexer no que já era
 * "se houver tempo".
 */
export const LIGHT_WEEK_PREFIX = "Semana leve · ";

/** Começam a esta hora (ou depois) os blocos da tarde, que passam a opcionais. */
const AFTERNOON = "14:00";

/** Dia da leitura que sai (terça): ficam três histórias por semana. */
const READING_DAY_OFF = 2;

/** Minutos de uma atividade guiada pelo adulto, pela idade. */
export function targetMinutes(schoolYear: string): number {
  const y = schoolYear.toLowerCase();
  if (y.startsWith("pré")) {
    if (y.includes("3 anos")) return 8;
    if (y.includes("4 anos")) return 10;
    return 12;
  }
  const n = parseInt(y, 10);
  if (n <= 1) return 15;
  if (n === 2) return 18;
  if (n === 3) return 20;
  if (n === 4) return 25;
  return 30;
}

export const durationLabel = (schoolYear: string) => `cerca de ${targetMinutes(schoolYear)} min`;

interface SlotItem {
  day_of_week: number;
  time_slot: string;
  discipline: string;
  is_friday_world?: boolean;
  is_fixed?: boolean;
}

/** É um bloco opcional? A tarde dos dias de estudo, menos a leitura e os dias de Ver Mundo o dia todo. */
export function isOptionalSlot(item: SlotItem, routine: WeekRoutine | null): boolean {
  if (item.is_fixed || item.is_friday_world || item.discipline === "reading") return false;
  if (routineOutings(routine)[item.day_of_week - 1] === "day") return false;
  return item.time_slot.slice(0, 5) >= AFTERNOON;
}

export const isOptional = (item: { title: string }) =>
  item.title.startsWith(OPTIONAL_PREFIX) || item.title.startsWith(LIGHT_WEEK_PREFIX);
export const stripOptional = (title: string) =>
  title.startsWith(LIGHT_WEEK_PREFIX) ? stripOptional(title.slice(LIGHT_WEEK_PREFIX.length))
  : title.startsWith(OPTIONAL_PREFIX) ? title.slice(OPTIONAL_PREFIX.length) : title;

/** P-28: o que muda (id e título novo) para pôr a semana leve a partir de um dia, ou para a desfazer. */
export function lightWeekChanges<T extends { id: string; title: string; discipline: string | null; day_of_week: number; is_friday_world?: boolean | null }>(
  items: T[], fromDay: number, on: boolean,
): { id: string; title: string }[] {
  if (!on) {
    return items.filter((i) => i.title.startsWith(LIGHT_WEEK_PREFIX)).map((i) => ({ id: i.id, title: i.title.slice(LIGHT_WEEK_PREFIX.length) }));
  }
  return items
    .filter((i) => i.day_of_week >= fromDay && i.discipline !== "reading" && !i.is_friday_world && !isOptional(i))
    .map((i) => ({ id: i.id, title: LIGHT_WEEK_PREFIX + i.title }));
}

/** P-28: a semana está leve? (algum item com o prefixo) */
export const isLightWeek = (items: { title: string }[]) => items.some((i) => i.title.startsWith(LIGHT_WEEK_PREFIX));

/** Marca no título as atividades opcionais (idempotente). */
export function markOptional<T extends SlotItem & { title: string }>(items: T[], routine: WeekRoutine | null): T[] {
  return items.map((i) =>
    isOptionalSlot(i, routine) && !isOptional(i) ? { ...i, title: OPTIONAL_PREFIX + i.title } : i,
  );
}

/** Tira a leitura de terça (fica em família, três vezes por semana). */
export function dropReadingDay<T extends SlotItem>(items: T[], routine?: WeekRoutine | null): T[] {
  // P-29: num dia livre a leitura fica (é o que o dia tem)
  if (routine && routine.days[READING_DAY_OFF - 1] === "free") return items;
  return items.filter((i) => !(i.discipline === "reading" && i.day_of_week === READING_DAY_OFF));
}

/** O que aparece onde estava a hora: a hora (se a família as quer) ou a duração. */
export function slotText(item: SlotItem & { title: string }, schoolYear: string | undefined, hours: boolean): string {
  if (hours) return item.time_slot;
  if (isOptional(item)) return "se houver tempo";
  if (item.is_fixed || item.is_friday_world || !schoolYear) return "";
  return durationLabel(schoolYear);
}
