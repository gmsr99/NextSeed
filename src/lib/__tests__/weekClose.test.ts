import { describe, it, expect } from "vitest";
import { mergeWeekContents, paceUntil, weekCloseNote } from "../weekClose";
import { buildAnnualPlan, type AnnualContent } from "../annualPlan";

describe("mergeWeekContents (P-14)", () => {
  it("junta a semana com até dois por retomar, sem repetir", () => {
    expect(mergeWeekContents(
      { matematica: ["A", "B"] },
      { matematica: ["B", "X", "Y", "Z"], portugues: ["P"] },
    )).toEqual({
      matematica: ["[a aprender] A", "[a aprender] B", "[retomar] X", "[retomar] Y"],
      portugues: ["[retomar] P"],
    });
  });

  it("sem foco (pausa ou balanço), só o que ficou por consolidar", () => {
    expect(mergeWeekContents(null, { matematica: ["X"] })).toEqual({ matematica: ["[retomar] X"] });
  });
});

describe("paceUntil (P-14)", () => {
  const contents: AnnualContent[] = Array.from({ length: 24 }, (_, i) => ({
    id: `c${i}`, discipline: "matematica", period: "1", domain: "N", content: `c${i}`, sort_order: i,
  }));
  const plan = buildAnnualPlan(contents, 2026, [{ discipline: "portugues", title: "M", entries: [{ title: "U1" }] }]);

  it("conta só as semanas anteriores e ignora os manuais", () => {
    const p = paceUntil(plan, new Date(2026, 8, 28), { c0: "dominado", c1: "em_progresso", c5: "dominado" });
    expect(p.planned).toBe(4); // semanas de 14 e 21 de setembro, 2 conteúdos cada
    expect(p.mastered).toBe(1);
    expect(p.inProgress).toBe(1);
  });

  it("na primeira semana não há nada para trás", () => {
    expect(paceUntil(plan, new Date(2026, 8, 14), {}).planned).toBe(0);
  });
});

describe("weekCloseNote", () => {
  it("junta só o que foi escrito", () => {
    expect(weekCloseNote(" lê sílabas ", "")).toBe("O que ganhou: lê sílabas");
    expect(weekCloseNote("a", "b")).toBe("O que ganhou: a\nOnde teve dificuldade: b");
    expect(weekCloseNote(" ", "")).toBeNull();
  });
});
