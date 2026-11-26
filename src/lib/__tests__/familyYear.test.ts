import { describe, it, expect } from "vitest";
import { familyYear, togetherWeeks } from "../familyYear";
import type { AnnualContent, AnnualPlan, PlanWeek } from "../annualPlan";

const c = (id: string, discipline: string, domain: string | null): AnnualContent =>
  ({ id, discipline, period: "1", domain, content: `conteúdo ${id}`, sort_order: 1 });

const week = (n: number, byDiscipline: PlanWeek["byDiscipline"], isReview = false): PlanWeek =>
  ({ number: n, monday: new Date(2026, 8, 14 + 7 * (n - 1)), period: "1", isReview, byDiscipline });

const plan = (weeks: PlanWeek[]): AnnualPlan => ({ weeks, yearRound: {} });

describe("rumo do ano em família (P-24)", () => {
  const c1 = plan([
    week(1, { portugues: [c("a", "portugues", "Leitura")], estudo_do_meio: [c("b", "estudo_do_meio", "Natureza")] }),
    week(2, { estudo_do_meio: [c("c", "estudo_do_meio", "Sociedade")], artes_visuais: [c("d", "artes_visuais", null)] }),
    week(3, { estudo_do_meio: [c("e", "estudo_do_meio", "Natureza")] }, true),
  ]);
  const c2 = plan([
    week(1, { portugues: [c("f", "portugues", "Leitura")], estudo_do_meio: [c("g", "estudo_do_meio", "Natureza")] }),
    week(2, { estudo_do_meio: [c("h", "estudo_do_meio", "Tecnologia")] }),
    week(3, { estudo_do_meio: [c("i", "estudo_do_meio", "Natureza")] }, true),
  ]);
  const rows = familyYear([{ id: "1", name: "C1", plan: c1 }, { id: "2", name: "C2", plan: c2 }]);

  it("alinha as semanas e mostra as duas crianças", () => {
    expect(rows).toHaveLength(3);
    expect(rows[0].perChild.map((p) => p.name)).toEqual(["C1", "C2"]);
  });

  it("Português nunca é em comum; Estudo do Meio com o mesmo domínio é", () => {
    expect(rows[0].together).toEqual([{ discipline: "estudo_do_meio", sharedDomains: ["Natureza"], children: 2 }]);
  });

  it("mesma disciplina com domínios diferentes ainda se pode fazer em conjunto, sem domínio comum", () => {
    expect(rows[1].together).toEqual([{ discipline: "estudo_do_meio", sharedDomains: [], children: 2 }]);
  });

  it("semana de balanço e uma só criança não propõem nada em conjunto", () => {
    expect(rows[2].together).toEqual([]);
    const solo = familyYear([{ id: "1", name: "C1", plan: c1 }]);
    expect(solo.every((r) => r.together.length === 0)).toBe(true);
    expect(togetherWeeks(rows)).toBe(2);
  });

  it("sem rumo, sem semanas", () => {
    expect(familyYear([])).toEqual([]);
  });
});
