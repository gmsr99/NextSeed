import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiLabel, firstName, restoreNames, withAiLabels, SEND_CHILD_NAMES_TO_AI } from "../aiPrivacy";
import type { Child } from "../types";

const invoke = vi.fn();
vi.mock("../supabase", () => ({ supabase: { functions: { invoke: (...a: unknown[]) => invoke(...a) } } }));

// Import depois do mock
const { generateWithGemini, regenerateActivity } = await import("../geminiPlanner");

function child(id: string, name: string, school_year: string): Child {
  return {
    id, name, school_year, family_id: "fam", interests: ["vulcões"],
    learning_preferences: null, learning_pace: null, birth_date: null,
  } as unknown as Child;
}

describe("aiPrivacy (nomes desligados por defeito)", () => {
  it("está configurado para NÃO enviar nomes", () => {
    expect(SEND_CHILD_NAMES_TO_AI).toBe(false);
  });

  it("dá pseudónimos por posição", () => {
    expect(aiLabel("Ana Sousa", 0)).toBe("Criança A");
    expect(aiLabel("Rui", 1)).toBe("Criança B");
    expect(withAiLabels([{ name: "Ana" }, { name: "Rui" }]).map((c) => c.name)).toEqual(["Criança A", "Criança B"]);
  });

  it("repõe só o primeiro nome quando o modelo escreve o pseudónimo", () => {
    expect(restoreNames("A Criança B conta vulcões com a criança A.", ["Ana Sousa", "Rui Costa"]))
      .toBe("A Rui conta vulcões com a Ana.");
    expect(restoreNames("Sem pseudónimos aqui.", ["Ana"])).toBe("Sem pseudónimos aqui.");
    expect(firstName("  Ana   Sousa ")).toBe("Ana");
  });
});

describe("pedido ao Gemini sem nomes", () => {
  beforeEach(() => invoke.mockReset());

  it("o plano semanal não envia nome nem apelido e repõe o nome no resultado", async () => {
    const kids = [child("c1", "Ana Sousa", "2º ano"), child("c2", "Rui Sousa", "Pré-escolar")];
    invoke.mockImplementation(async (...args: unknown[]) => {
      const opts = args[1] as { body: { prompt: string } } | undefined;
      if (!opts) return { data: null, error: { message: "sem pedido" } };
      const n = (opts.body.prompt.match(/^\d+\. /gm) ?? []).length;
      const items = Array.from({ length: n }, () => ({
        title: "Vulcões com a Criança A", description: "A criança mede lava.", materials: ["papel"],
      }));
      return { data: { text: JSON.stringify(items) }, error: null };
    });

    const plan = await generateWithGemini(kids, { c1: ["vulcões"], c2: ["dinossauros"] }, "");
    const prompt: string = invoke.mock.calls[0][1].body.prompt;

    expect(prompt).not.toMatch(/Ana|Rui|Sousa/);
    expect(prompt).toContain("Criança A");
    expect(prompt).toContain("Criança B");
    expect(plan.length).toBeGreaterThan(0);
    expect(plan[0].title).toBe("Vulcões com a Ana");
    expect(plan.every((p) => p.child_id === "c1" || p.child_id === "c2")).toBe(true);
  });

  it("a regeneração de uma atividade não envia o nome", async () => {
    invoke.mockResolvedValue({
      data: { text: JSON.stringify({ title: "Novo", description: "A Criança A desenha.", materials: [] }) },
      error: null,
    });
    const out = await regenerateActivity(
      child("c1", "Ana Sousa", "2º ano"),
      { child_id: "c1", day_of_week: 1, time_slot: "09:45-10:10", discipline: "math",
        title: "Contar", description: "Contar pedras", materials: [], is_friday_world: false, sort_order: 0 },
      ["vulcões"],
    );
    const prompt: string = invoke.mock.calls[0][1].body.prompt;
    expect(prompt).not.toMatch(/Ana|Sousa/);
    expect(out.description).toBe("A Ana desenha.");
  });
});
