// Financinhas · níveis das competências (regra de ouro do tracking)
//
// "Só se sobe depois de observar, nunca depois de dar a aula."
// O nível de cada skill não se guarda: deriva-se do histórico de eventos.
//   · observacao  → o nível só pode subir (fica o maior dos dois); nunca desce
//   · ajuste      → o adulto corrige à mão, com nota (pode subir ou descer)
//   · fotografia  → ponto de partida (fotografia inicial ou histórico importado)
// Dar uma aula nunca gera eventos.

export type LevelOrigin = "observacao" | "ajuste" | "fotografia";

export interface SkillEvent {
  skill_code: string;
  level: number;
  origin: LevelOrigin;
  observed_on: string; // AAAA-MM-DD
  created_at?: string | null;
  note?: string | null;
}

export type Levels = Record<string, number>;

const clamp = (n: number) => Math.max(1, Math.min(4, Math.round(n)));

function sortEvents<T extends SkillEvent>(events: T[]): T[] {
  return [...events].sort((a, b) =>
    a.observed_on === b.observed_on
      ? String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""))
      : a.observed_on.localeCompare(b.observed_on),
  );
}

/** Nível atual de cada skill (as que nunca foram avaliadas ficam de fora). */
export function currentLevels(events: SkillEvent[]): Levels {
  const levels: Levels = {};
  for (const ev of sortEvents(events)) {
    const lvl = clamp(ev.level);
    const prev = levels[ev.skill_code];
    if (ev.origin === "observacao") {
      levels[ev.skill_code] = prev === undefined ? lvl : Math.max(prev, lvl);
    } else {
      levels[ev.skill_code] = lvl;
    }
  }
  return levels;
}

/** Último evento de cada skill (para mostrar a data e a nota). */
export function lastEventBySkill<T extends SkillEvent>(events: T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const ev of sortEvents(events)) out[ev.skill_code] = ev;
  return out;
}

/**
 * Nível-alvo de um sinal novo: um acima do atual (máximo 4). Sem avaliação,
 * a primeira observação conta como "em desenvolvimento" (2).
 */
export function nextTarget(current: number | undefined): number {
  if (current === undefined) return 2;
  return Math.min(4, current + 1);
}

/** Confirmar um sinal: o nível que fica (nunca abaixo do atual). */
export function levelAfterConfirm(current: number | undefined, target: number): number {
  const t = clamp(target);
  return current === undefined ? t : Math.max(current, t);
}
