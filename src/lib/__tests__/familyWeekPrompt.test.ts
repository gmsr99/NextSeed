import { describe, it, expect, vi } from "vitest";

let lastPrompt = "";
vi.mock("../supabase", () => ({
  supabase: {
    functions: {
      invoke: async (_name: string, { body }: { body: { prompt: string } }) => {
        lastPrompt = body.prompt;
        const n = Number(body.prompt.match(/Gera (\d+) atividades/)![1]);
        const lines = body.prompt.split("\n").filter((l) => /^\d+\. /.test(l)).slice(0, n);
        return {
          data: {
            text: JSON.stringify(lines.map((l, i) => ({
              title: `Atividade ${i}`,
              description: l.includes("Ep.")
                ? JSON.stringify({ episode_text: `História ${i}.`, comprehension_question: `Pergunta ${i}?`, discussion_prompt: "E tu?" })
                : "Sozinho: fazer isto.",
              materials: ["papel"],
              portfolio: /Projeto/.test(l) ? "Foto da construção" : "",
              theme: i === 0 ? "Como bebem as plantas?" : "",
            }))),
          },
          error: null,
        };
      },
    },
  },
}));
const { generateWithGemini, getLastWeekTheme } = await import("../geminiPlanner");
const { splitMode } = await import("../familyWeek");
const { weekPortfolioList } = await import("../portfolioHints");

const child = (id: string, name: string, school_year: string) =>
  ({ id, name, school_year, learning_preferences: null, learning_pace: null }) as never;

describe("plano semanal em família (P-10, P-23)", () => {
  it("com duas crianças: modos no pedido, etiquetas e títulos comuns no resultado", async () => {
    const items = await generateWithGemini([child("a", "Ana", "2º ano"), child("b", "Rui", "4º ano")], { a: ["vulcões"] }, "");
    expect(lastPrompt).toContain("## SEMANA EM FAMÍLIA");
    expect(lastPrompt).toMatch(/Português \| MODO: (COM O ADULTO|SOZINHO)/);
    expect(lastPrompt).toMatch(/Estudo do Meio \| MODO: EM CONJUNTO/);
    expect(lastPrompt).toContain("UMA só história para a família");
    expect(lastPrompt).not.toContain("Ana");

    const monday = items.filter((i) => i.day_of_week === 1);
    const at = (c: string, start: string) => monday.find((i) => i.child_id === c && i.time_slot.startsWith(start))!;
    expect(new Set([splitMode(at("a", "09:45").description).mode, splitMode(at("b", "09:45").description).mode]))
      .toEqual(new Set(["adulto", "sozinho"]));
    expect(at("a", "09:45").description).not.toContain("Sozinho: ");
    expect(at("b", "11:05").title).toBe(at("a", "11:05").title);
    expect(at("b", "11:05").description.startsWith("Em conjunto: ")).toBe(true);
    const ra = JSON.parse(at("a", "14:45").description), rb = JSON.parse(at("b", "14:45").description);
    expect(rb.episode_text).toBe(ra.episode_text);
    expect(rb.comprehension_question).not.toBe(ra.comprehension_question);
    // nunca duas crianças com o adulto no mesmo bloco, em toda a semana
    const adult = items.filter((i) => splitMode(i.description).mode === "adulto").map((i) => `${i.day_of_week}|${i.time_slot}`);
    expect(new Set(adult).size).toBe(adult.length);
  });

  it("sugere 3 a 4 atividades por criança para o portefólio (R-10)", async () => {
    const items = await generateWithGemini([child("a", "Ana", "2º ano"), child("b", "Rui", "4º ano")], {}, "");
    expect(lastPrompt).toContain("**PORTEFÓLIO**");
    // P-06, P-07, P-08: formatos atribuídos, como explicar, episódios curtos
    expect(lastPrompt).toMatch(/Português \| MODO: (COM O ADULTO|SOZINHO) \| FORMATO: /);
    expect(lastPrompt).toContain("nas atividades COM O ADULTO");
    expect(lastPrompt).toContain("no máximo 120 palavras");
    for (const c of ["a", "b"]) {
      const list = weekPortfolioList(items, c);
      expect(list.length).toBeGreaterThanOrEqual(3);
      expect(list.length).toBeLessThanOrEqual(4);
      expect(list.some((x) => x.hint === "Foto da construção")).toBe(true);
      expect(list.every((x) => x.discipline !== "reading")).toBe(true);
    }
    // a etiqueta da semana em família mantém-se no início
    const withHint = items.find((i) => i.description.includes(" | Portefólio: ") && i.day_of_week === 3)!;
    expect(splitMode(withHint.description).mode).not.toBeNull();
  });

  it("pré-escolar: linha condutora pelas três áreas e tema da semana devolvido (P-16)", async () => {
    await generateWithGemini([child("a", "Ana", "2º ano"), child("p", "Bia", "Pré-escolar 4 anos")], {}, "", "", {}, {}, {}, {},
      [{ priority: 1, methodology: { slug: "waldorf-rudolf-steiner", name: "Waldorf", ai_generation_style: "x", keywords: [] } } as never]);
    expect(lastPrompt).toContain("## PRÉ-ESCOLAR: UMA LINHA CONDUTORA");
    expect(lastPrompt).toContain("Conhecimento do Mundo");
    expect(lastPrompt).toContain("dá o RITMO");
    expect(lastPrompt).toContain("**TEMA DA SEMANA**");
    expect(getLastWeekTheme()).toBe("Como bebem as plantas?");
  });

  it("com uma criança: sem modos, mas com fio condutor e materiais sem preparação", async () => {
    const items = await generateWithGemini([child("a", "Ana", "2º ano")], {}, "");
    expect(lastPrompt).not.toContain("SEMANA EM FAMÍLIA");
    expect(lastPrompt).not.toContain("MODO:");
    expect(lastPrompt).toContain("## FIO CONDUTOR DA SEMANA");
    expect(lastPrompt).toContain("Materiais sem preparação");
    expect(lastPrompt).toContain("NO MÁXIMO uma em cada três");
    expect(items.every((i) => splitMode(i.description).mode === null)).toBe(true);
    expect(weekPortfolioList(items, "a").length).toBeGreaterThanOrEqual(3);
  });
});

describe("a nossa semana no pedido (P-18)", () => {
  it("segunda a quinta, sexta curta e sem saída: sem Ver Mundo e sexta só com a manhã", async () => {
    const items = await generateWithGemini(
      [child("a", "Ana", "2º ano"), child("b", "Rui", "Pré-escolar (4 anos)")], {}, "", "", {}, {}, {}, {}, [],
      { days: ["full", "full", "full", "full", "short"], outing: false },
    );
    expect(lastPrompt).not.toContain("| Ver Mundo");
    expect(lastPrompt).toContain("não inclui a saída");
    expect(items.some((i) => i.is_friday_world)).toBe(false);
    const friday = items.filter((i) => i.day_of_week === 5);
    expect(friday.length).toBeGreaterThan(0);
    expect(friday.every((i) => i.time_slot < "10:42")).toBe(true);
    expect(lastPrompt).toContain("Ep.3/3"); // P-27: a leitura de terça sai
  });

  it("dias sem estudo não entram e a história tem só os episódios desses dias", async () => {
    const items = await generateWithGemini(
      [child("a", "Ana", "2º ano")], {}, "", "", {}, {}, {}, {}, [],
      { days: ["full", "off", "full", "off", "full"], outing: true },
    );
    expect(items.some((i) => i.day_of_week === 2 || i.day_of_week === 4)).toBe(false);
    expect(lastPrompt).toContain("Ep.2/2");
    expect(lastPrompt).not.toContain("Ep.3");
    expect(items.some((i) => i.is_friday_world)).toBe(true);
  });
});

describe("plano essencial no pedido (P-27)", () => {
  it("cada bloco leva a duração da idade e a tarde vai como SE HOUVER TEMPO", async () => {
    const items = await generateWithGemini([child("a", "Ana", "2º ano")], {}, "", "", {}, {}, {}, {}, [], null);
    expect(lastPrompt).toContain("~18 min");
    expect(lastPrompt).toContain("SE HOUVER TEMPO");
    expect(lastPrompt).toContain("DURAÇÃO (plano essencial)");
    expect(lastPrompt).toContain("Ep.3/3");
    expect(items.filter((i) => i.title.startsWith("Se houver tempo · ")).length).toBe(4);
  });
});

describe("revisões curtas no pedido (DASH fase 3)", () => {
  it("as linhas [rever] chegam ao pedido com a regra da revisão curta", async () => {
    await generateWithGemini([child("a", "Ana", "2º ano")], {}, "", "", {}, {
      a: { matematica: ["[a aprender] Dezenas", "[rever] Unidades"] },
    });
    expect(lastPrompt).toContain("[rever] Unidades");
    expect(lastPrompt).toContain("Linhas com [rever]");
    expect(lastPrompt).toContain("Rever · ");
  });
});
