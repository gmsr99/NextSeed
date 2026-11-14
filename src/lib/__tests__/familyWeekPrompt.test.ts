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
            }))),
          },
          error: null,
        };
      },
    },
  },
}));
const { generateWithGemini } = await import("../geminiPlanner");
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
