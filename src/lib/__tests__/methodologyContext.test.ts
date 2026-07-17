import { describe, it, expect } from "vitest";
import { buildMethodologyContext } from "../methodologyContext";
import type { FamilyMethodology, Methodology } from "../types";

function methodology(name: string, overrides: Partial<Methodology> = {}): Methodology {
  return {
    id: `id-${name}`,
    slug: name.toLowerCase(),
    name,
    category: "contemporaneo",
    short_description: "",
    philosophy_summary: null,
    intensity: "media",
    ai_generation_style: `estilo ${name}`,
    keywords: null,
    ...overrides,
  } as Methodology;
}

function fm(priority: 1 | 2 | 3, m: Methodology): FamilyMethodology {
  return {
    family_id: "fam",
    methodology_id: m.id,
    priority,
    selected_at: "2026-01-01T00:00:00Z",
    methodology: m,
  } as FamilyMethodology;
}

describe("buildMethodologyContext", () => {
  it("devolve vazio sem metodologias — o prompt não leva bloco pedagógico", () => {
    expect(buildMethodologyContext([])).toBe("");
  });

  it("ordena por prioridade e rotula cada nível, independentemente da ordem de entrada", () => {
    const out = buildMethodologyContext([
      fm(3, methodology("Reggio")),
      fm(1, methodology("Montessori")),
      fm(2, methodology("Waldorf")),
    ]);

    expect(out.indexOf("METODOLOGIA PRINCIPAL: Montessori"))
      .toBeLessThan(out.indexOf("METODOLOGIA SECUNDÁRIA: Waldorf"));
    expect(out.indexOf("METODOLOGIA SECUNDÁRIA: Waldorf"))
      .toBeLessThan(out.indexOf("METODOLOGIA COMPLEMENTAR: Reggio"));
  });

  it("cruza as três abordagens no mesmo bloco, com o estilo de geração de cada uma", () => {
    const out = buildMethodologyContext([
      fm(1, methodology("Montessori")),
      fm(2, methodology("Waldorf")),
    ]);

    expect(out).toContain("[CONTEXTO PEDAGÓGICO DA FAMÍLIA]");
    expect(out).toContain('Abordagem: "estilo Montessori"');
    expect(out).toContain('Abordagem: "estilo Waldorf"');
  });

  it("inclui palavras-chave só quando existem", () => {
    const comKeywords = buildMethodologyContext([
      fm(1, methodology("Montessori", { keywords: ["autonomia", "sensorial"] })),
    ]);
    expect(comKeywords).toContain("Palavras-chave: autonomia, sensorial");

    const semKeywords = buildMethodologyContext([fm(1, methodology("Waldorf"))]);
    expect(semKeywords).not.toContain("Palavras-chave");
  });

  it("adapta o substantivo ao gerador que o consome", () => {
    const seleção = [fm(1, methodology("Montessori"))];
    expect(buildMethodologyContext(seleção)).toContain("Os projetos gerados DEVEM refletir");
    expect(buildMethodologyContext(seleção, "atividades")).toContain("As atividades geradas DEVEM refletir");
  });

  it("não altera o array recebido — o chamador reutiliza a lista da cache", () => {
    const seleção = [fm(2, methodology("Waldorf")), fm(1, methodology("Montessori"))];
    buildMethodologyContext(seleção);
    expect(seleção.map((f) => f.priority)).toEqual([2, 1]);
  });
});
