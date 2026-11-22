// Financinhas · ritual da semanada (registo de 30 segundos)
//
// O ritual é a fonte fixa de observação (FIN_CUR_04): a linha
// "escolhi ___ em vez de ___" dá sinal de DC1, e usar o chão num imprevisto e
// repô-lo sozinha dá sinal de GP3. O registo não sobe níveis: propõe sinais
// que o adulto confirma ou descarta.

import { nextTarget, type Levels } from "./levels.ts";

export interface RitualEntry {
  done: boolean;
  amount_cents: number | null;
  choice_text: string | null;
  floor_used: boolean;
  floor_restored: boolean;
  question: string | null;
}

export interface ProposedSignal {
  skill_code: string;
  target_level: number;
  description: string;
}

/** Segunda-feira da semana de `iso` (AAAA-MM-DD). */
export function weekStart(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  const dow = d.getUTCDay(); // 0 = domingo
  d.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1));
  return d.toISOString().slice(0, 10);
}

export function ritualSignals(r: RitualEntry, levels: Levels): ProposedSignal[] {
  if (!r.done) return [];
  const out: ProposedSignal[] = [];
  const choice = (r.choice_text ?? "").trim();
  if (choice) {
    out.push({
      skill_code: "DC1",
      target_level: nextTarget(levels.DC1),
      description: `No ritual escreveu: "${choice.slice(0, 140)}". Explicou sozinha porque escolheu isso?`,
    });
  }
  if (r.floor_used && r.floor_restored) {
    out.push({
      skill_code: "GP3",
      target_level: nextTarget(levels.GP3),
      description: "Usou o chão do 🐷 e repô-lo. Foi ela que se lembrou de repor, sem lembrete?",
    });
  }
  return out;
}

/** O chão foi usado e ainda não foi reposto: lembrete para o ritual seguinte. */
export function floorPending(r: RitualEntry | null | undefined): boolean {
  return !!r && r.floor_used && !r.floor_restored;
}
