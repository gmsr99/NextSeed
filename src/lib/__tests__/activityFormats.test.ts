import { describe, it, expect } from "vitest";
import { assignFormats, FORMATS } from "../activityFormats";

const slot = (child_id: string, day_of_week: number, time_slot: string, discipline: string) =>
  ({ child_id, day_of_week, time_slot, discipline });

describe("assignFormats (P-06)", () => {
  const week = [1, 2, 3, 4].flatMap((d) => [
    slot("a", d, "09:45-10:10", "language"), slot("a", d, "10:17-10:42", "math"),
    slot("b", d, "09:45-10:10", "language"), slot("b", d, "11:05-11:50", "world"),
    slot("a", d, "11:05-11:50", "world"), slot("a", d, "14:45-15:15", "reading"),
  ]).concat([
    // P-31: um dia de Ver Mundo o dia todo (aqui à sexta, como os planos antigos)
    { ...slot("a", 5, "09:45-11:50", "world_visit"), is_friday_world: true },
    slot("a", 5, "14:45-15:15", "world_visit"),
    slot("a", 5, "14:00-14:30", "expression"),
  ]);
  const together = week.map((s) => s.discipline === "world");
  const f = assignFormats(week, together);
  const of = (c: string, disc: string) => week.map((s, i) => (s.child_id === c && s.discipline === disc ? f[i] : undefined)).filter((x) => x !== undefined);

  it("nunca repete o formato da mesma disciplina na semana (até esgotar a lista)", () => {
    for (const c of ["a", "b"]) {
      const lang = of(c, "language");
      expect(new Set(lang).size).toBe(lang.length);
    }
    expect(new Set(of("a", "math")).size).toBe(4);
  });

  it("irmãos à mesma hora têm formatos diferentes nos blocos separados", () => {
    expect(of("a", "language")[0]).not.toBe(of("b", "language")[0]);
  });

  it("nos blocos em conjunto o formato é o mesmo", () => {
    expect(of("a", "world")).toEqual(of("b", "world"));
  });

  it("leitura e sexta-feira ficam sem formato imposto", () => {
    expect(of("a", "reading").every((x) => x === null)).toBe(true);
    expect(f.at(-1)).toBeNull();
  });

  it("num dia de Ver Mundo de meio dia, o estudo que fica leva formato", () => {
    const half = [
      { ...slot("a", 3, "14:00-16:30", "world_visit"), is_friday_world: true },
      slot("a", 3, "09:45-10:10", "language"),
    ];
    const out = assignFormats(half);
    expect(out[0]).toBeNull();
    expect(out[1]).not.toBeNull();
  });

  it("os formatos vêm da lista da disciplina", () => {
    expect(of("a", "math").every((x) => FORMATS.math.includes(x!))).toBe(true);
  });
});
