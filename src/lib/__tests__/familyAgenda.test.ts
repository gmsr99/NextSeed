import { describe, it, expect } from "vitest";
import { routineFixedEntries, latestPlans, isOutingPlanItem, isValidDow } from "../familyAgenda";
import { normalizeRoutine } from "../familyRoutine";

describe("agenda da família: o que se repete", () => {
  it("sem rotina guardada, há Ver Mundo à sexta", () => {
    expect(routineFixedEntries(null)).toEqual([{ dow: 5, title: "Ver Mundo", kind: "ver_mundo" }]);
  });

  it("saídas de outros dias aparecem uma vez, com a parte do dia", () => {
    const r = normalizeRoutine(
      [{ m: "full", o: "none" }, { m: "full", o: "afternoon" }, { m: "full", o: "morning" }, { m: "full", o: "none" }, { m: "full", o: "none" }],
      false,
    );
    expect(routineFixedEntries(r)).toEqual([
      { dow: 2, title: "Saída (tarde)", kind: "saida" },
      { dow: 3, title: "Saída (manhã)", kind: "saida" },
    ]);
  });

  it("sexta sem estudo não tem Ver Mundo", () => {
    const r = normalizeRoutine(["full", "full", "full", "full", "off"], true);
    expect(routineFixedEntries(r)).toEqual([]);
  });

  it("fica só a versão mais recente do plano de cada semana", () => {
    const plans = [
      { id: "a", week_start: "2026-11-23", version: 1 },
      { id: "b", week_start: "2026-11-23", version: 3 },
      { id: "c", week_start: "2026-11-30", version: null },
    ];
    expect(latestPlans(plans).map((p) => p.id).sort()).toEqual(["b", "c"]);
  });

  it("os blocos de saída do plano não se repetem", () => {
    expect(isOutingPlanItem({ discipline: "outing" })).toBe(true);
    expect(isOutingPlanItem({ discipline: "portugues", is_friday_world: true })).toBe(true);
    expect(isOutingPlanItem({ discipline: "portugues", is_friday_world: false })).toBe(false);
  });

  it("os fins de semana contam para as atividades fixas", () => {
    expect([0, 1, 5, 6, 7, 8, null].map((d) => isValidDow(d as number))).toEqual([false, true, true, true, true, false, false]);
  });
});
