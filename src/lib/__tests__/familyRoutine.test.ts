import { describe, it, expect } from "vitest";
import { applyWeekRoutine, DEFAULT_ROUTINE, hasOuting, isDefaultRoutine, normalizeRoutine, renumberEpisodes, routineSummary, studyDays, type WeekRoutine } from "../familyRoutine";

type Item = { child_id: string; day_of_week: number; discipline: string; is_friday_world: boolean; time_slot: string; episode?: number };
const week = (): Item[] => {
  const items: Item[] = [];
  for (let d = 1; d <= 4; d++) {
    items.push({ child_id: "a", day_of_week: d, discipline: "language", is_friday_world: false, time_slot: "09:45-10:10" });
    items.push({ child_id: "a", day_of_week: d, discipline: "math", is_friday_world: false, time_slot: "10:17-10:42" });
    items.push({ child_id: "a", day_of_week: d, discipline: "world", is_friday_world: false, time_slot: "11:05-11:50" });
    items.push({ child_id: "a", day_of_week: d, discipline: "reading", is_friday_world: false, time_slot: "14:45-15:15", episode: d });
  }
  items.push({ child_id: "a", day_of_week: 5, discipline: "world_visit", is_friday_world: true, time_slot: "09:45-11:50" });
  items.push({ child_id: "a", day_of_week: 5, discipline: "expression", is_friday_world: false, time_slot: "14:00-14:30" });
  return items;
};

describe("a nossa semana", () => {
  it("a semana de sempre não muda nada", () => {
    const items = week();
    expect(applyWeekRoutine(items, DEFAULT_ROUTINE)).toBe(items);
    expect(applyWeekRoutine(items, null)).toBe(items);
    expect(isDefaultRoutine(null)).toBe(true);
  });

  it("segunda a quinta, sexta com 1 hora e sem saída (caso das notas de 22 nov)", () => {
    const r: WeekRoutine = { days: ["full", "full", "full", "full", "short"], outing: false };
    const out = applyWeekRoutine(week(), r);
    const friday = out.filter((i) => i.day_of_week === 5);
    expect(friday.map((i) => i.discipline)).toEqual(["language", "math"]);
    expect(friday.some((i) => i.is_friday_world)).toBe(false);
    expect(friday.some((i) => i.episode)).toBe(false);
    expect(out.filter((i) => i.day_of_week === 1)).toHaveLength(4);
    expect(hasOuting(r)).toBe(false);
    expect(routineSummary(r)).toBe("Segunda a quinta, sexta curta, sem saída");
  });

  it("dias sem estudo saem e os episódios de leitura renumeram-se", () => {
    const r: WeekRoutine = { days: ["full", "off", "full", "full", "off"], outing: true };
    const out = applyWeekRoutine(week(), r);
    expect(out.some((i) => i.day_of_week === 2 || i.day_of_week === 5)).toBe(false);
    expect(renumberEpisodes(out)).toBe(3);
    expect(out.filter((i) => i.episode).map((i) => i.episode)).toEqual([1, 2, 3]);
    expect(studyDays(r)).toEqual([1, 3, 4]);
    expect(hasOuting(r)).toBe(false);
  });

  it("sexta curta com saída fica só com a saída da manhã", () => {
    const out = applyWeekRoutine(week(), { days: ["full", "full", "full", "full", "short"], outing: true });
    expect(out.filter((i) => i.day_of_week === 5).map((i) => i.discipline)).toEqual(["world_visit"]);
  });

  it("valores estranhos na base de dados voltam à semana de sempre", () => {
    expect(normalizeRoutine(["full", "nada"], "x")).toEqual({ ...DEFAULT_ROUTINE, hours: false });
    expect(normalizeRoutine(["off", "short", "full", "full", "full"], false)).toEqual({ days: ["off", "short", "full", "full", "full"], outing: false, outings: ["none", "none", "none", "none", "none"], hours: false });
    expect(normalizeRoutine(["full", "full", "full", "full", "full"], true, "horas").hours).toBe(true);
  });
});

describe("dia livre (P-29)", () => {
  it("fica só a manhã em família, o almoço e a leitura", async () => {
    const { applyWeekRoutine, normalizeRoutine, routineSummary, hasOuting } = await import("../familyRoutine");
    const r = normalizeRoutine(["full", "full", "free", "full", "full"], true);
    expect(r.days[2]).toBe("free");
    const items = [
      { day_of_week: 3, discipline: "ritual", is_friday_world: false, time_slot: "09:30-09:45" },
      { day_of_week: 3, discipline: "language", is_friday_world: false, time_slot: "09:45-10:10" },
      { day_of_week: 3, discipline: "reading", is_friday_world: false, time_slot: "14:45-15:15", episode: 2 },
      { day_of_week: 3, discipline: "lunch", is_friday_world: false, time_slot: "12:30-14:00" },
      { day_of_week: 2, discipline: "language", is_friday_world: false, time_slot: "09:45-10:10" },
    ];
    expect(applyWeekRoutine(items, r).map((i) => `${i.day_of_week}:${i.discipline}`)).toEqual(["3:ritual", "3:reading", "3:lunch", "2:language"]);
    expect(routineSummary(r)).toContain("quarta livre");
    // P-30: uma sexta livre pode ter a saída "Ver Mundo"
    expect(hasOuting(normalizeRoutine(["full", "full", "full", "full", "free"], true))).toBe(true);
  });
});

describe("saídas em qualquer dia (P-30)", () => {
  it("guarda-se dentro de days, sem migração, e lê-se de volta", async () => {
    const { normalizeRoutine, serializeRoutine, routineOutings } = await import("../familyRoutine");
    const r = { days: ["full", "full", "full", "free", "full"] as const, outing: false, outings: ["none", "afternoon", "none", "day", "morning"] as const };
    const saved = serializeRoutine({ ...r, days: [...r.days], outings: [...r.outings] });
    expect(saved).toEqual({ days: ["full", { m: "full", o: "afternoon" }, "full", { m: "free", o: "day" }, { m: "full", o: "morning" }], outing: false });
    const back = normalizeRoutine(saved.days, saved.outing);
    expect(routineOutings(back)).toEqual(["none", "afternoon", "none", "day", "morning"]);
    expect(back.days).toEqual(["full", "full", "full", "free", "full"]);
    // rotina antiga (só texto): a saída é a de sexta, se outing
    expect(routineOutings(normalizeRoutine(["full", "full", "full", "full", "full"], true))).toEqual(["none", "none", "none", "none", "day"]);
  });

  it("a parte do dia da saída fica sem currículo e aparece o bloco Saída", async () => {
    const { applyWeekRoutine, normalizeRoutine, outingBlocks, routineSummary, hasOuting } = await import("../familyRoutine");
    const r = normalizeRoutine(["full", { m: "full", o: "afternoon" }, { m: "full", o: "morning" }, "full", { m: "full", o: "day" }], true);
    const items = [
      { day_of_week: 2, discipline: "language", is_friday_world: false, time_slot: "09:45-10:10" },
      { day_of_week: 2, discipline: "english", is_friday_world: false, time_slot: "14:00-14:30" },
      { day_of_week: 3, discipline: "language", is_friday_world: false, time_slot: "09:45-10:10" },
      { day_of_week: 3, discipline: "lunch", is_friday_world: false, time_slot: "12:30-14:00" },
      { day_of_week: 3, discipline: "reading", is_friday_world: false, time_slot: "14:45-15:15" },
      { day_of_week: 5, discipline: "world", is_friday_world: true, time_slot: "09:30-12:00" },
    ];
    expect(applyWeekRoutine(items, r).map((i) => `${i.day_of_week}:${i.discipline}`)).toEqual(["2:language", "3:lunch", "3:reading", "5:world"]);
    expect(hasOuting(r)).toBe(true);
    expect(outingBlocks(r, (d, slot, title) => `${d} ${slot} ${title}`)).toEqual(["2 14:00-16:30 Saída (tarde)", "3 09:30-12:30 Saída (manhã)"]);
    expect(routineSummary(r)).toContain("saídas à terça à tarde, à quarta de manhã, à sexta");
  });
});
