// Agenda da família ("Minha família"): o que vem do plano e o que se repete todas as semanas.
// Lógica pura, com testes em __tests__/familyAgenda.test.ts.

export interface PlanOutingEntry {
  date: string;
  title: string;
}

/**
 * As saídas da semana (Ver Mundo e outras) vêm só do plano guardado dessa semana:
 * cada família e cada semana decidem se saem, quando e quantas vezes.
 * No plano há um bloco por criança; no calendário fica um por dia e por título.
 */
export function outingEntriesFromPlan(
  items: { date: string; title: string | null; discipline?: string | null; is_friday_world?: boolean | null }[],
): PlanOutingEntry[] {
  const seen = new Set<string>();
  const out: PlanOutingEntry[] = [];
  for (const it of items) {
    if (!isOutingPlanItem(it)) continue;
    const raw = (it.title ?? "").trim();
    const title = it.is_friday_world
      ? (raw && !/^ver mundo$/i.test(raw) ? `Ver Mundo · ${raw}` : "Ver Mundo")
      : raw || "Saída";
    const key = `${it.date}|${it.is_friday_world ? "vm" : title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ date: it.date, title });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
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

/** Blocos de saída do plano: a Ver Mundo (preparada pela IA) e as saídas de "A vossa semana". */
export function isOutingPlanItem(item: { discipline?: string | null; is_friday_world?: boolean | null }): boolean {
  return item.discipline === "outing" || item.is_friday_world === true;
}

/** Atividades extracurriculares: 1 = segunda … 7 = domingo (os fins de semana também contam). */
export function isValidDow(dow: number | null | undefined): dow is number {
  return typeof dow === "number" && dow >= 1 && dow <= 7;
}
