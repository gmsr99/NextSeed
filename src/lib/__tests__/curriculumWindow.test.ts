import { describe, it, expect } from "vitest";
import { currentPeriod, inPeriods, fallbackPeriods, contextPeriods } from "../curriculumWindow";

describe("currentPeriod", () => {
  it("setembro a dezembro é o 1.º período", () => {
    expect(currentPeriod(new Date(2026, 8, 15))).toBe("1");
    expect(currentPeriod(new Date(2026, 10, 12))).toBe("1");
    expect(currentPeriod(new Date(2026, 11, 31))).toBe("1");
  });
  it("janeiro a março é o 2.º período", () => {
    expect(currentPeriod(new Date(2027, 0, 5))).toBe("2");
    expect(currentPeriod(new Date(2027, 2, 31))).toBe("2");
  });
  it("abril a agosto é o 3.º período", () => {
    expect(currentPeriod(new Date(2027, 3, 1))).toBe("3");
    expect(currentPeriod(new Date(2027, 7, 20))).toBe("3");
  });
});

describe("janelas", () => {
  it("sem marcações, usa só o período atual", () => {
    expect(fallbackPeriods(new Date(2026, 10, 12))).toEqual(["1"]);
  });
  it("o contexto inclui o período seguinte, exceto no 3.º", () => {
    expect(contextPeriods(new Date(2026, 10, 12))).toEqual(["1", "2"]);
    expect(contextPeriods(new Date(2027, 4, 1))).toEqual(["3"]);
  });
  it("conteúdos do ano todo entram sempre", () => {
    expect(inPeriods("all", ["1"])).toBe(true);
    expect(inPeriods(null, ["1"])).toBe(true);
    expect(inPeriods("1", ["1"])).toBe(true);
    expect(inPeriods("3", ["1", "2"])).toBe(false);
  });
});
