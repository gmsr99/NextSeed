import { describe, it, expect } from "vitest";
import { weekSessions, mdLines } from "../financinhas/weekSession";

const lesson = (id: string, child_id: string, status: string, created_at: string) =>
  ({ id, child_id, status, title: `Aula ${id}`, notebook_prompt: "prompt", created_at });

describe("Financinhas no plano semanal (I-21)", () => {
  const profiles = [{ child_id: "a", ritual_weekday: 6 }, { child_id: "b", ritual_weekday: 3 }];
  const lessons = [
    lesson("1", "a", "dada", "2026-11-01"),
    lesson("2", "a", "por_dar", "2026-11-20"),
    lesson("3", "a", "por_dar", "2026-11-10"),
    lesson("4", "b", "dada", "2026-11-05"),
  ];

  it("só as crianças com perfil, pela ordem das crianças", () => {
    const s = weekSessions(["c", "b", "a"], profiles, lessons);
    expect(s.map((x) => x.childId)).toEqual(["b", "a"]);
  });

  it("a próxima aula é a por dar mais antiga", () => {
    const [a] = weekSessions(["a"], profiles, lessons);
    expect(a.lesson?.id).toBe("3");
    expect(a.weekdayLabel).toBe("sábado");
    expect(a.inPlanDays).toBe(false);
  });

  it("sem aula por dar, convida a preparar; dia de semana conta como dia do plano", () => {
    const [b] = weekSessions(["b"], profiles, lessons);
    expect(b.lesson).toBeNull();
    expect(b.weekdayLabel).toBe("quarta");
    expect(b.inPlanDays).toBe(true);
  });

  it("markdown simples para o PDF", () => {
    expect(mdLines("## Quiz\n- **Uma** pergunta\n1. Outra\n\nTexto `x`")).toEqual([
      { kind: "h", text: "Quiz" },
      { kind: "li", text: "Uma pergunta" },
      { kind: "li", text: "Outra" },
      { kind: "p", text: "Texto x" },
    ]);
    expect(mdLines(null)).toEqual([]);
  });
});
