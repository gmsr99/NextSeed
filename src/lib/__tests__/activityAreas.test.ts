import { describe, it, expect } from "vitest";
import { activityAreas, withObservations, planDescriptionText } from "../activityAreas";

describe("várias áreas por atividade (R-04) e registo a partir do plano (V-22)", () => {
  it("junta a principal e as outras, sem repetir", () => {
    expect(activityAreas({ discipline: "math", extra_disciplines: ["world", "math", ""] })).toEqual(["math", "world"]);
    expect(activityAreas({ discipline: null, extra_disciplines: null })).toEqual([]);
  });
  it("acrescenta as observações à descrição", () => {
    expect(withObservations("Contar feijões", "  Gostou muito ")).toBe("Contar feijões\n\nObservações: Gostou muito");
    expect(withObservations("Contar feijões", " ")).toBe("Contar feijões");
    expect(withObservations("", "Só isto")).toBe("Observações: Só isto");
  });
  it("tira o texto dos episódios de leitura", () => {
    expect(planDescriptionText('{"text":"Era uma vez","question":"?"}')).toBe("Era uma vez");
    expect(planDescriptionText("{estragado")).toBe("");
    expect(planDescriptionText(" Normal ")).toBe("Normal");
  });
});
