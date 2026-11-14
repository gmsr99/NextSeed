import { describe, it, expect } from "vitest";
import { reviewLines, DAY_QUESTIONS, SHORT_DAY } from "../weekGuide";

describe("guia da semana (P-22)", () => {
  it("o balanço lista os conteúdos da semana para assinalar", () => {
    const lines = reviewLines(
      {
        estudo_do_meio: [{ content: "Os órgãos do corpo humano." }],
        matematica: [{ content: "Unidade 3 (pp. 38–41) · parte 1 de 2" }],
      },
      { estudo_do_meio: "Estudo do Meio", matematica: "Matemática" },
    );
    expect(lines).toEqual([
      "Estudo do Meio: Os órgãos do corpo humano",
      "Matemática: Unidade 3 (pp. 38–41) · parte 1 de 2",
    ]);
  });

  it("tem perguntas para os cinco dias e uma versão curta de 45 minutos", () => {
    expect(DAY_QUESTIONS.map((d) => d.day)).toEqual(["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]);
    expect(SHORT_DAY.steps.length).toBe(3);
  });
});
