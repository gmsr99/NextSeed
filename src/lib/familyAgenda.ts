// Agenda da família ("Minha família"): o que se repete todas as semanas.
// Lógica pura, com testes em __tests__/familyAgenda.test.ts.
import { routineOutings, type WeekRoutine } from "./familyRoutine";

export interface WeeklyFixed {
  /** 1 = segunda … 7 = domingo */
  dow: number;
  title: string;
  /** "Ver Mundo" (sexta, o dia todo) ou outra saída marcada em "A vossa semana" */
  kind: "ver_mundo" | "saida";
}

/**
 * As saídas da semana a partir de "A vossa semana", uma por família (não uma por criança).
 * Sem rotina guardada vale a semana de sempre: "Ver Mundo" à sexta.
 * Os dias sem estudo não têm saída (routineOutings já o trata).
 */
export function routineFixedEntries(r: WeekRoutine | null | undefined): WeeklyFixed[] {
  return routineOutings(r).flatMap((part, i): WeeklyFixed[] => {
    if (part === "none") return [];
    if (i === 4 && part === "day") return [{ dow: 5, title: "Ver Mundo", kind: "ver_mundo" }];
    const label = part === "morning" ? "Saída (manhã)" : part === "afternoon" ? "Saída (tarde)" : "Saída (dia todo)";
    return [{ dow: i + 1, title: label, kind: "saida" }];
  });
}

/** Só a versão mais recente do plano de cada semana (desde a 003 pode haver várias). */
export function latestPlans<P extends { id: string; week_start: string; version?: number | null }>(plans: P[]): P[] {
  const best = new Map<string, P>();
  for (const p of plans) {
    const cur = best.get(p.week_start);
    if (!cur || (p.version ?? 1) > (cur.version ?? 1)) best.set(p.week_start, p);
  }
  return [...best.values()];
}

/** As saídas vêm da rotina; os mesmos blocos do plano (um por criança) não se repetem no calendário. */
export function isOutingPlanItem(item: { discipline?: string | null; is_friday_world?: boolean | null }): boolean {
  return item.discipline === "outing" || item.is_friday_world === true;
}

/** Atividades extracurriculares: 1 = segunda … 7 = domingo (os fins de semana também contam). */
export function isValidDow(dow: number | null | undefined): dow is number {
  return typeof dow === "number" && dow >= 1 && dow <= 7;
}
