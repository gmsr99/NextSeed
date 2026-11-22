// Semana em família (P-10): com várias crianças, o plano diz em cada bloco se
// a atividade é para fazerem juntas, com o adulto ou sozinhas, para o adulto
// nunca ter de estar em dois sítios ao mesmo tempo.
//
// O modo de cada bloco é calculado aqui (não pela IA) e fica escrito no início
// da descrição ("Em conjunto: …"), por isso aparece em todos os ecrãs e PDFs
// sem precisar de colunas novas na base de dados.

export type BlockMode = "juntos" | "adulto" | "sozinho";

export const MODE_PREFIX: Record<BlockMode, string> = {
  juntos: "Em conjunto: ",
  adulto: "Com o adulto: ",
  sozinho: "Sozinho(a): ",
};

/** Disciplinas que se fazem em família quando calham à mesma hora. */
const SHARED_DISCIPLINES = new Set(["world", "expression", "project", "reading"]);

export interface BlockSlot {
  child_id: string;
  day_of_week: number;
  time_slot: string;
  discipline: string;
  is_friday_world?: boolean;
}

/** Sexta como dia de estudo (a família não inclui a saída, P-18): sem nenhum bloco de saída. */
export function fridayIsStudyDay(items: { day_of_week: number; is_friday_world?: boolean }[]): boolean {
  const fri = items.filter((i) => i.day_of_week === 5);
  return fri.length > 0 && fri.every((i) => i.is_friday_world === false);
}

const startOf = (slot: string) => slot.split("-")[0].trim();

/**
 * Modo de cada bloco, na mesma ordem dos itens (null = sem etiqueta).
 *  - sexta-feira e disciplinas partilhadas à mesma hora: "juntos";
 *  - nos outros blocos em que várias crianças trabalham à mesma hora, uma fica
 *    "com o adulto" e as restantes "sozinhas", a rodar de bloco para bloco.
 */
export function blockModes(items: BlockSlot[]): (BlockMode | null)[] {
  const modes: (BlockMode | null)[] = items.map(() => null);
  const fridayStudy = fridayIsStudyDay(items);
  const groups = new Map<string, number[]>();
  items.forEach((it, i) => {
    const key = `${it.day_of_week}|${startOf(it.time_slot)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(i);
  });

  const startsByDay = new Map<number, string[]>();
  for (const it of items) {
    const list = startsByDay.get(it.day_of_week) ?? [];
    if (!list.includes(startOf(it.time_slot))) list.push(startOf(it.time_slot));
    startsByDay.set(it.day_of_week, list.sort());
  }

  for (const [key, idxs] of groups) {
    if (new Set(idxs.map((i) => items[i].child_id)).size < 2) continue;
    const day = Number(key.split("|")[0]);
    const rest: number[] = [];
    for (const i of idxs) {
      const d = items[i].discipline;
      const together =
        (day === 5 && !fridayStudy) ||
        (SHARED_DISCIPLINES.has(d) && idxs.some((j) => j !== i && items[j].discipline === d));
      if (together) modes[i] = "juntos";
      else rest.push(i);
    }
    const kids = [...new Set(rest.map((i) => items[i].child_id))].sort();
    if (kids.length < 2) continue;
    const rank = startsByDay.get(day)!.indexOf(key.split("|")[1]);
    const withAdult = kids[(day + rank) % kids.length];
    for (const i of rest) modes[i] = items[i].child_id === withAdult ? "adulto" : "sozinho";
  }
  return modes;
}

const PREFIX_RE = /^\s*(em conjunto|juntos|com o adulto|sozinh[oa](?:\(a\))?)\s*:\s*/i;

/** Separa a etiqueta do resto da descrição. */
export function splitMode(description: string): { mode: BlockMode | null; text: string } {
  const m = description.match(PREFIX_RE);
  if (!m) return { mode: null, text: description };
  const word = m[1].toLowerCase();
  const mode: BlockMode = word.startsWith("sozinh") ? "sozinho" : word.startsWith("com") ? "adulto" : "juntos";
  return { mode, text: description.slice(m[0].length) };
}

function isJson(description: string): boolean {
  return description.trim().startsWith("{");
}

/** Põe (ou corrige) a etiqueta no início da descrição. Episódios de leitura (JSON) ficam como estão. */
export function withMode(description: string, mode: BlockMode | null): string {
  if (isJson(description)) return description;
  const { text } = splitMode(description);
  return mode ? `${MODE_PREFIX[mode]}${text}` : text;
}

type PlanItem = BlockSlot & { title: string; description: string };

/**
 * Aplica a semana em família a um plano gerado:
 *  - etiqueta cada bloco;
 *  - nos blocos em conjunto, todas as crianças ficam com o mesmo título;
 *  - na leitura em conjunto, todas ficam com o mesmo texto do episódio (a
 *    pergunta de cada uma mantém-se).
 */
export function applyFamilyWeek<T extends PlanItem>(items: T[]): T[] {
  const modes = blockModes(items);
  const first = new Map<string, T>();
  return items.map((it, i) => {
    const mode = modes[i];
    if (mode !== "juntos") return { ...it, description: withMode(it.description, mode) };
    const key = `${it.day_of_week}|${startOf(it.time_slot)}|${it.discipline}`;
    const lead = first.get(key);
    if (!lead) {
      first.set(key, it);
      return { ...it, description: withMode(it.description, mode) };
    }
    let description = withMode(it.description, mode);
    if (isJson(it.description) && isJson(lead.description)) {
      try {
        const mine = JSON.parse(it.description);
        const theirs = JSON.parse(lead.description);
        if (typeof theirs.episode_text === "string") {
          description = JSON.stringify({ ...mine, episode_text: theirs.episode_text });
        }
      } catch { /* descrição mal formada: fica como veio */ }
    }
    return { ...it, title: lead.title, description };
  });
}
