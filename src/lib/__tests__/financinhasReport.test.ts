import { describe, it, expect } from "vitest";
import { financinhasReport } from "../financinhas/report";
import type { SkillEvent } from "../financinhas/levels";

const ev = (skill_code: string, level: number, observed_on = "2026-11-10", origin: SkillEvent["origin"] = "observacao"): SkillEvent =>
  ({ skill_code, level, origin, observed_on });

describe("Financinhas no relatório (I-22)", () => {
  it("três fortes e três a trabalhar, sem repetir", () => {
    const r = financinhasReport([
      ev("DC1", 4), ev("RH1", 3), ev("GP1", 3, "2026-11-12"), ev("AD1", 2),
      ev("CS1", 1), ev("VL3", 1), ev("GP5", 2),
    ], "2026-12-31")!;
    expect(r.strong.map((s) => s.code)).toEqual(["DC1", "GP1", "RH1"]);
    expect(r.toWork.map((s) => s.code)).toEqual(["CS1", "VL3", "AD1"]);
    expect(r.strong[0].levelLabel).toBe("Autónomo");
    expect(r.strong[0].area).toBe("Decisão e pensamento crítico");
    expect(r.observed).toBe(7);
  });
  it("só conta o que foi observado até ao fim do período", () => {
    const r = financinhasReport([ev("DC1", 2), ev("RH1", 1), ev("DC1", 4, "2027-01-15")], "2026-12-31")!;
    expect(r.strong[0].level).toBe(2);
  });
  it("com menos de duas competências observadas, não há secção", () => {
    expect(financinhasReport([ev("DC1", 2)], "2026-12-31")).toBeNull();
    expect(financinhasReport([], "2026-12-31")).toBeNull();
  });
  it("nível 1 nunca aparece como forte", () => {
    const r = financinhasReport([ev("DC1", 1), ev("RH1", 1)], "2026-12-31")!;
    expect(r.strong).toEqual([]);
    expect(r.toWork).toHaveLength(2);
  });
});
