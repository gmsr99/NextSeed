import { describe, it, expect } from "vitest";
import { outingEntriesFromPlan, latestPlans, isOutingPlanItem, isValidDow } from "../familyAgenda";

describe("agenda da família: saídas que vêm do plano", () => {
  it("sem plano, não há saídas no calendário", () => {
    expect(outingEntriesFromPlan([])).toEqual([]);
  });

  it("a Ver Mundo aparece uma vez por dia, mesmo com duas crianças, e leva o título da saída", () => {
    const items = [
      { date: "2026-12-04", title: "Visita ao mercado", discipline: "mundo", is_friday_world: true },
      { date: "2026-12-04", title: "Visita ao mercado", discipline: "mundo", is_friday_world: true },
      { date: "2026-12-04", title: "Português", discipline: "portugues", is_friday_world: false },
    ];
    expect(outingEntriesFromPlan(items)).toEqual([{ date: "2026-12-04", title: "Ver Mundo · Visita ao mercado" }]);
  });

  it("as outras saídas aparecem no dia em que o plano as pôs", () => {
    const items = [
      { date: "2026-12-01", title: "Saída (tarde)", discipline: "outing" },
      { date: "2026-12-01", title: "Saída (tarde)", discipline: "outing" },
      { date: "2026-12-02", title: "Saída (manhã)", discipline: "outing" },
    ];
    expect(outingEntriesFromPlan(items)).toEqual([
      { date: "2026-12-01", title: "Saída (tarde)" },
      { date: "2026-12-02", title: "Saída (manhã)" },
    ]);
  });

  it("uma semana com os cinco dias de estudo não tem saídas", () => {
    const items = [1, 2, 3, 4, 5].map((d) => ({ date: `2026-12-0${d}`, title: "Matemática", discipline: "matematica", is_friday_world: false }));
    expect(outingEntriesFromPlan(items)).toEqual([]);
  });

  it("fica só a versão mais recente do plano de cada semana", () => {
    const plans = [
      { id: "a", week_start: "2026-11-23", version: 1 },
      { id: "b", week_start: "2026-11-23", version: 3 },
      { id: "c", week_start: "2026-11-30", version: null },
    ];
    expect(latestPlans(plans).map((p) => p.id).sort()).toEqual(["b", "c"]);
  });

  it("reconhece os blocos de saída do plano", () => {
    expect(isOutingPlanItem({ discipline: "outing" })).toBe(true);
    expect(isOutingPlanItem({ discipline: "portugues", is_friday_world: true })).toBe(true);
    expect(isOutingPlanItem({ discipline: "portugues", is_friday_world: false })).toBe(false);
  });

  it("os fins de semana contam para as atividades fixas", () => {
    expect([0, 1, 5, 6, 7, 8, null].map((d) => isValidDow(d as number))).toEqual([false, true, true, true, true, false, false]);
  });
});
