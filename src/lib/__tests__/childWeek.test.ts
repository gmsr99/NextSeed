import { describe, it, expect } from "vitest";
import {
  childStage, weekHeadline, themeLine, openingPrompt, closingPrompts, childItemText,
  guidingQuestions, GUIDING_QUESTIONS,
} from "@/lib/childWeek";

describe("childStage", () => {
  it("separa pré-escolar, 1.º–2.º e 3.º ano em diante", () => {
    expect(childStage("Pré-escolar 4 anos")).toBe("pre");
    expect(childStage("1º ano")).toBe("early");
    expect(childStage("2º ano")).toBe("early");
    expect(childStage("3º ano")).toBe("older");
    expect(childStage("4º ano")).toBe("older");
    expect(childStage("6º ano")).toBe("older");
  });
});

describe("weekHeadline", () => {
  it("usa até dois interesses da criança", () => {
    expect(weekHeadline(["futebol"])).toBe("Semana de futebol");
    expect(weekHeadline(["futebol", "dinossauros", "vulcões"])).toBe("Semana de futebol e dinossauros");
  });
  it("sem interesses, não há título novo", () => {
    expect(weekHeadline([])).toBeNull();
    expect(weekHeadline(null)).toBeNull();
    expect(weekHeadline(["  "])).toBeNull();
  });
  it("ignora interesses compridos de mais para um título", () => {
    expect(weekHeadline(["x".repeat(31), "lua"])).toBe("Semana de lua");
  });
});

describe("themeLine", () => {
  it("pergunta ou tema", () => {
    expect(themeLine("Como é que as plantas bebem?")).toBe("A grande pergunta: Como é que as plantas bebem?");
    expect(themeLine("piratas")).toBe("O tema da semana: piratas");
    expect(themeLine("")).toBeNull();
  });
});

describe("prompts por fase", () => {
  it("o pré-escolar não tem linha para escrever no topo e desenha no fim", () => {
    expect(openingPrompt("pre")).toBeNull();
    expect(closingPrompts("pre")[0]).toMatch(/^Desenha/);
  });
  it("1.º–2.º descobre; os mais velhos têm objetivo e o que levam", () => {
    expect(openingPrompt("early")).toMatch(/descobrir/);
    expect(openingPrompt("older")).toMatch(/objetivo/);
    expect(closingPrompts("early")).toHaveLength(2);
    expect(closingPrompts("older")).toHaveLength(3);
  });
  it("fala sempre do que aprendeu e do que construiu", () => {
    for (const s of ["pre", "early", "older"] as const) {
      const all = closingPrompts(s).join(" ").toLowerCase();
      expect(all).toMatch(/aprend/);
      expect(all).toMatch(/constru/);
    }
  });
});

describe("childItemText", () => {
  it("encurta e tira prefixos do adulto", () => {
    expect(childItemText("Leitura: O dragão da serra", "early")).toBe("O dragão da serra");
    expect(childItemText("Rever · Contar com dezenas", "early")).toBe("Contar com dezenas");
    expect(childItemText("Contar golos com dezenas no jardim de casa", "pre")).toBe("Contar golos com…");
  });
});

describe("guidingQuestions (P-31)", () => {
  it("dá 3 perguntas diferentes e muda de semana para semana", () => {
    const a = guidingQuestions(new Date(2026, 10, 30));
    const b = guidingQuestions(new Date(2026, 11, 7));
    expect(a).toHaveLength(3);
    expect(new Set(a).size).toBe(3);
    expect(a).not.toEqual(b);
    for (const q of [...a, ...b]) expect(GUIDING_QUESTIONS).toContain(q);
  });
  it("é estável para a mesma semana", () => {
    expect(guidingQuestions(new Date(2026, 10, 30))).toEqual(guidingQuestions(new Date(2026, 10, 30)));
  });
});
