import { describe, it, expect } from "vitest";
import { parseCatechism, catechismToText, normalizeCatechism, weekCatechism, CATECHISM_STAGES } from "../tradicao/catechism";

describe("catecismo em família (I-08, fase 2)", () => {
  it("lê números e títulos em vários formatos, sem linhas vazias", () => {
    expect(parseCatechism("1. Quem nos criou?\n\n2 - Quem é Deus?\nP. 3 Onde está Deus?\nPergunta 4: Deus vê tudo?\nSem número")).toEqual([
      { n: 1, t: "Quem nos criou?" },
      { n: 2, t: "Quem é Deus?" },
      { n: 3, t: "Onde está Deus?" },
      { n: 4, t: "Deus vê tudo?" },
      { n: null, t: "Sem número" },
    ]);
  });

  it("um número sozinho fica como título; títulos longos são cortados", () => {
    expect(parseCatechism("2026")).toEqual([{ n: null, t: "2026" }]);
    expect(parseCatechism("5. " + "a".repeat(400))[0].t).toHaveLength(200);
  });

  it("volta a texto para editar", () => {
    expect(catechismToText([{ n: 1, t: "A" }, { n: null, t: "B" }])).toBe("1. A\nB");
  });

  it("a pergunta da semana segue a posição e acaba no fim da lista", () => {
    const c = normalizeCatechism("Catecismo", [{ n: 1, t: "A" }, { n: 2, t: "B" }], 1);
    const w = weekCatechism(c)!;
    expect(w.label).toBe("Pergunta n.º 2: B");
    expect([w.index, w.total, w.last]).toEqual([2, 2, true]);
    expect(w.stages).toBe(CATECHISM_STAGES);
    expect(weekCatechism({ ...c, pos: 2 })).toBeNull();
    expect(weekCatechism(normalizeCatechism(null, [], 0))).toBeNull();
    expect(weekCatechism(null)).toBeNull();
  });

  it("ignora o que vier estragado da base de dados", () => {
    expect(normalizeCatechism("  ", [{ n: "x", t: "A" }, null, { t: 3 }], -1)).toEqual({ name: null, questions: [{ n: null, t: "A" }], pos: 0 });
  });

  it("cinco etapas, de segunda a sexta", () => {
    expect(CATECHISM_STAGES.map((s) => s.day)).toEqual(["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]);
  });
});
