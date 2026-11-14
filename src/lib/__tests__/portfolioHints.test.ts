import { describe, it, expect } from "vitest";
import { applyPortfolioHints, splitPortfolio, withPortfolio, weekPortfolioList, DEFAULT_HINTS } from "../portfolioHints";
import { withMode, splitMode } from "../familyWeek";

const item = (child_id: string, day_of_week: number, discipline: string, description = "Fazer.") =>
  ({ child_id, day_of_week, discipline, description, title: `${discipline} ${day_of_week}` });

describe("sugestão escrita na descrição", () => {
  it("põe, lê e troca a sugestão", () => {
    const d = withPortfolio("Medir a mesa.", "Foto da tabela de medidas");
    expect(d).toBe("Medir a mesa. | Portefólio: Foto da tabela de medidas");
    expect(splitPortfolio(d)).toEqual({ text: "Medir a mesa.", hint: "Foto da tabela de medidas" });
    expect(withPortfolio(d, "Outra")).toBe("Medir a mesa. | Portefólio: Outra");
    expect(withPortfolio(d, "")).toBe("Medir a mesa.");
  });

  it("convive com a etiqueta da semana em família e com o texto de leitura inline", () => {
    const d = withPortfolio(withMode("Era uma vez. | Pergunta: Quem?", "sozinho"), "Guardar a resposta");
    expect(d).toBe("Sozinho(a): Era uma vez. | Pergunta: Quem? | Portefólio: Guardar a resposta");
    expect(splitMode(splitPortfolio(d).text)).toEqual({ mode: "sozinho", text: "Era uma vez. | Pergunta: Quem?" });
    expect(withMode(d, "adulto")).toBe("Com o adulto: Era uma vez. | Pergunta: Quem? | Portefólio: Guardar a resposta");
  });

  it("não mexe nos episódios de leitura", () => {
    const json = '{"episode_text":"x"}';
    expect(withPortfolio(json, "Foto")).toBe(json);
    expect(splitPortfolio(json).hint).toBe("");
  });
});

describe("applyPortfolioHints", () => {
  const week = [
    item("a", 1, "language"), item("a", 1, "math"), item("a", 1, "world"), item("a", 1, "reading", '{"episode_text":"x"}'),
    item("a", 2, "math"), item("a", 2, "language"), item("a", 2, "expression"),
    item("a", 3, "project"), item("a", 4, "english"),
    item("b", 1, "language"), item("b", 2, "math"), item("b", 3, "expression"),
  ];
  const hintsOf = (out: typeof week, child: string) => weekPortfolioList(out, child);

  it("fica com as sugestões da IA, no máximo 4 por criança, de disciplinas diferentes primeiro", () => {
    const ai = week.map((it) => (it.child_id === "a" && ["math", "language"].includes(it.discipline) ? `IA ${it.discipline}` : ""));
    ai[7] = "IA projeto";
    const a = hintsOf(applyPortfolioHints(week, ai), "a");
    expect(a.length).toBe(4);
    expect(new Set(a.map((x) => x.discipline))).toEqual(new Set(["language", "math", "project"]));
    expect(a.every((x) => x.hint.startsWith("IA "))).toBe(true);
  });

  it("sem sugestões da IA, completa até 3 com o que deixa mais para guardar", () => {
    const out = applyPortfolioHints(week, week.map(() => ""));
    const a = hintsOf(out, "a");
    expect(a.map((x) => x.discipline).sort()).toEqual(["expression", "language", "project"]);
    expect(a.find((x) => x.discipline === "project")!.hint).toBe(DEFAULT_HINTS.project);
    expect(hintsOf(out, "b").length).toBe(3);
  });

  it("nunca sugere a leitura e limpa sugestões a mais", () => {
    const withOld = week.map((it) => ({ ...it, description: withPortfolio(it.description, "antiga") }));
    const out = applyPortfolioHints(withOld, week.map((_, i) => (i === 3 ? "IA leitura" : "")));
    expect(out[3].description).toBe('{"episode_text":"x"}');
    expect(hintsOf(out, "a").length).toBe(3);
    expect(hintsOf(out, "a").some((x) => x.hint === "antiga")).toBe(false);
  });

  it("a lista da semana vem por ordem dos dias", () => {
    const out = applyPortfolioHints(week, week.map(() => ""));
    const days = hintsOf(out, "a").map((x) => x.day_of_week);
    expect(days).toEqual([...days].sort((x, y) => x - y));
  });
});
