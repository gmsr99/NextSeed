// Rumo do ano em família (P-24, fase 2): as semanas de todas as crianças lado a
// lado e, em cada semana, o que podem trabalhar juntas. O currículo de anos
// diferentes nunca é igual, por isso "em comum" quer dizer: a mesma disciplina
// partilhável na mesma semana (Estudo do Meio, Artes, Formação Pessoal e Social)
// e, quando existe, o mesmo domínio. Português, Matemática e Inglês ficam por
// criança: cada uma no seu nível.
import type { AnnualContent, AnnualPlan, Period } from "./annualPlan";

export const SHARED_YEAR_DISCIPLINES = ["estudo_do_meio", "artes_visuais", "formacao_pessoal_social"] as const;

export interface FamilyChildPlan {
  id: string;
  name: string;
  plan: AnnualPlan;
}

export interface TogetherItem {
  discipline: string;
  /** Domínios que mais do que uma criança tem nesta semana (pode ficar vazio). */
  sharedDomains: string[];
  /** Quantas crianças têm esta disciplina nesta semana. */
  children: number;
}

export interface FamilyWeekRow {
  number: number;
  monday: Date;
  period: Period;
  isReview: boolean;
  perChild: { id: string; name: string; byDiscipline: Record<string, AnnualContent[]> }[];
  together: TogetherItem[];
}

/** Cada semana do ano, com todas as crianças que têm rumo. Semanas alinhadas pela segunda-feira. */
export function familyYear(children: FamilyChildPlan[]): FamilyWeekRow[] {
  const withPlan = children.filter((c) => c.plan?.weeks?.length);
  if (withPlan.length === 0) return [];
  const byMonday = new Map<number, FamilyWeekRow>();
  for (const c of withPlan) {
    for (const w of c.plan.weeks) {
      const key = w.monday.getTime();
      let row = byMonday.get(key);
      if (!row) {
        row = { number: w.number, monday: w.monday, period: w.period, isReview: w.isReview, perChild: [], together: [] };
        byMonday.set(key, row);
      }
      row.isReview = row.isReview || w.isReview;
      row.perChild.push({ id: c.id, name: c.name, byDiscipline: w.byDiscipline });
    }
  }
  const rows = [...byMonday.values()].sort((a, b) => a.monday.getTime() - b.monday.getTime());
  for (const row of rows) row.together = togetherFor(row);
  return rows;
}

function togetherFor(row: FamilyWeekRow): TogetherItem[] {
  if (row.isReview || row.perChild.length < 2) return [];
  const out: TogetherItem[] = [];
  for (const d of SHARED_YEAR_DISCIPLINES) {
    const withD = row.perChild.filter((c) => (c.byDiscipline[d]?.length ?? 0) > 0);
    if (withD.length < 2) continue;
    const count = new Map<string, number>();
    for (const c of withD) {
      const domains = new Set(c.byDiscipline[d].map((x) => x.domain?.trim()).filter(Boolean) as string[]);
      for (const dom of domains) count.set(dom, (count.get(dom) ?? 0) + 1);
    }
    const sharedDomains = [...count.entries()].filter(([, n]) => n >= 2).map(([dom]) => dom).sort();
    out.push({ discipline: d, sharedDomains, children: withD.length });
  }
  return out;
}

/** Quantas semanas do ano têm pelo menos uma disciplina para fazer em conjunto. */
export function togetherWeeks(rows: FamilyWeekRow[]): number {
  return rows.filter((r) => r.together.length > 0).length;
}
