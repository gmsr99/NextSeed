import { describe, it, expect } from "vitest";
import { dayLogDescription } from "../dayLog";

describe("registo do dia (R-10)", () => {
  it("junta só as linhas preenchidas", () => {
    expect(dayLogDescription({ done: " Herbário ", pending: "", note: "Gostou de medir" }))
      .toBe("O que fizemos: Herbário\nCorreu bem / mudaria: Gostou de medir");
  });
  it("vazio não cria entrada", () => {
    expect(dayLogDescription({ done: " ", pending: "", note: "" })).toBeNull();
  });
});
