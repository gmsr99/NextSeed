import { describe, it, expect } from "vitest";
import { targetMinutes, isOptionalSlot, markOptional, dropReadingDay, slotText, isOptional, OPTIONAL_PREFIX, stripOptional } from "../essentialPlan";
import { generateWeeklyPlan } from "../planGenerator";
import type { Child } from "../types";

const child = (id: string, school_year: string) => ({ id, name: id, school_year, created_at: "2026-01-01" } as unknown as Child);

describe("plano essencial (P-27)", () => {
  it("duração pela idade (2 a 3 minutos por ano nas tarefas guiadas)", () => {
    expect(targetMinutes("Pré-escolar 3 anos")).toBe(8);
    expect(targetMinutes("Pré-escolar 4 anos")).toBe(10);
    expect(targetMinutes("Pré-escolar 5/6 anos")).toBe(12);
    expect(targetMinutes("1.º ano")).toBe(15);
    expect(targetMinutes("2.º ano")).toBe(18);
    expect(targetMinutes("4.º ano")).toBe(25);
  });
  it("a tarde fica opcional, menos a leitura, a saída e a sexta com saída", () => {
    expect(isOptionalSlot({ day_of_week: 1, time_slot: "14:00-14:30", discipline: "english" }, null)).toBe(true);
    expect(isOptionalSlot({ day_of_week: 1, time_slot: "14:45-15:15", discipline: "reading" }, null)).toBe(false);
    expect(isOptionalSlot({ day_of_week: 1, time_slot: "10:17-10:42", discipline: "math" }, null)).toBe(false);
    expect(isOptionalSlot({ day_of_week: 5, time_slot: "14:00-14:30", discipline: "expression" }, null)).toBe(false);
    const noOuting = { days: ["full", "full", "full", "full", "full"] as const, outing: false };
    expect(isOptionalSlot({ day_of_week: 5, time_slot: "14:00-14:30", discipline: "expression" }, { ...noOuting, days: [...noOuting.days] })).toBe(true);
  });
  it("marcar é idempotente e o título fica legível", () => {
    const items = [{ day_of_week: 2, time_slot: "14:00-14:30", discipline: "expression", title: "Pintar folhas" }];
    const once = markOptional(items, null);
    expect(once[0].title).toBe(OPTIONAL_PREFIX + "Pintar folhas");
    expect(markOptional(once, null)[0].title).toBe(once[0].title);
    expect(isOptional(once[0])).toBe(true);
    expect(stripOptional(once[0].title)).toBe("Pintar folhas");
  });
  it("a leitura de terça sai: ficam três histórias", () => {
    const r = dropReadingDay([1, 2, 3, 4].map((d) => ({ day_of_week: d, time_slot: "14:45-15:15", discipline: "reading" })));
    expect(r.map((i) => i.day_of_week)).toEqual([1, 3, 4]);
  });
  it("sem horas mostra a duração; com horas, a hora", () => {
    const item = { day_of_week: 1, time_slot: "09:45-10:10", discipline: "language", title: "Rimas" };
    expect(slotText(item, "2.º ano", false)).toBe("cerca de 18 min");
    expect(slotText(item, "2.º ano", true)).toBe("09:45-10:10");
    expect(slotText({ ...item, title: OPTIONAL_PREFIX + "x" }, "2.º ano", false)).toBe("se houver tempo");
  });
  it("plano sem IA: núcleo de 3 por dia, leitura em 3 dias, tarde opcional", () => {
    const items = generateWeeklyPlan([child("c1", "2.º ano")], { c1: [] }, "Parque", "");
    const mon = items.filter((i) => i.day_of_week === 1 && !i.is_fixed);
    const core = mon.filter((i) => !isOptional(i) && i.discipline !== "reading");
    expect(core).toHaveLength(3);
    expect(items.filter((i) => i.discipline === "reading").map((i) => i.day_of_week)).toEqual([1, 3, 4]);
    expect(mon.filter((i) => isOptional(i))).toHaveLength(1);
  });
});
