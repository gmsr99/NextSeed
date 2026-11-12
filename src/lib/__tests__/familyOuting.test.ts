import { describe, it, expect, vi } from "vitest";
vi.mock("../supabase", () => ({ supabase: {} }));
const { unifyFamilyOuting } = await import("../geminiPlanner");

const item = (child: string, day: number, friday: boolean, title: string) =>
  ({ child_id: child, day_of_week: day, is_friday_world: friday, title });

describe("unifyFamilyOuting (P-11)", () => {
  it("põe todas as crianças no mesmo destino de sexta", () => {
    const out = unifyFamilyOuting([
      item("c1", 5, true, "Visita ao Oceanário"),
      item("c2", 5, true, "Passeio no Jardim Botânico"),
      item("c2", 5, false, "Registo da visita"),
      item("c1", 1, false, "Contar pedras"),
    ]);
    expect(out[0].title).toBe("Visita ao Oceanário");
    expect(out[1].title).toBe("Visita ao Oceanário");
    expect(out[2].title).toBe("Registo da visita");
    expect(out[3].title).toBe("Contar pedras");
  });
  it("com uma só criança não muda nada", () => {
    const one = [item("c1", 5, true, "Praia")];
    expect(unifyFamilyOuting(one)).toEqual(one);
  });
});
