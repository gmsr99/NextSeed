import { describe, it, expect } from "vitest";
import { applyWeekRoutine, DEFAULT_ROUTINE, hasOuting, isDefaultRoutine, normalizeRoutine, outingsFromPlan, renumberEpisodes, routineForPlan, routineSummary, studyDays, verMundoDays, withWeekOutings, type WeekRoutine } from "../familyRoutine";

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
  items.push({ child_id: "a", day_of_week: 5, discipline: "world_visit", is_friday_world: false, time_slot: "14:45-15:15" });
  return items;
};

describe("a nossa semana", () => {
  it("sem configuração (P-31): segunda a sexta, sem Ver Mundo; a sexta é como a segunda, sem leitura", () => {
    for (const r of [null, DEFAULT_ROUTINE]) {
      const out = applyWeekRoutine(week(), r);
      expect(out.some((i) => i.is_friday_world)).toBe(false);
      expect(out.filter((i) => i.day_of_week === 5).map((i) => i.discipline)).toEqual(["language", "math", "world"]);
      expect(out.filter((i) => i.day_of_week === 1)).toHaveLength(4);
    }
    expect(isDefaultRoutine(null)).toBe(true);
    expect(routineSummary(null)).toBe("Segunda a sexta, sem Ver Mundo");
    expect(verMundoDays(null)).toEqual([]);
  });

  it("Ver Mundo à quarta, o dia todo: a quarta fica com a visita e a sexta é de estudo", () => {
    const r = normalizeRoutine(["full", "full", { m: "full", o: "day" }, "full", "full"], false);
    const out = applyWeekRoutine(week(), r);
    expect(out.filter((i) => i.day_of_week === 3).map((i) => `${i.discipline}${i.is_friday_world ? "*" : ""}`)).toEqual(["world_visit*", "expression", "world_visit"]);
    expect(out.filter((i) => i.day_of_week === 5).some((i) => i.is_friday_world)).toBe(false);
    expect(renumberEpisodes(out)).toBe(3);
    expect(routineSummary(r)).toContain("Ver Mundo à quarta");
  });

  it("duas Ver Mundo na semana, uma de manhã e outra o dia todo", () => {
    const r = normalizeRoutine([{ m: "full", o: "morning" }, "full", "full", "full", { m: "full", o: "day" }], false);
    const out = applyWeekRoutine(week(), r);
    const mon = out.filter((i) => i.day_of_week === 1);
    expect(mon.map((i) => `${i.time_slot} ${i.discipline}`)).toEqual(["09:30-12:30 world_visit", "14:45-15:15 reading"]);
    expect(out.filter((i) => i.day_of_week === 5 && i.is_friday_world)).toHaveLength(1);
    expect(verMundoDays(r)).toEqual([{ day: 1, part: "morning" }, { day: 5, part: "day" }]);
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
    expect(routineSummary(r)).toBe("Segunda a quinta, sexta curta, sem Ver Mundo");
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

  it("rotina antiga com saída à sexta (outing): o histórico mantém-se, Ver Mundo à sexta o dia todo", () => {
    const r = normalizeRoutine(["full", "full", "full", "full", "full"], true);
    const out = applyWeekRoutine(week(), r);
    expect(out.filter((i) => i.day_of_week === 5).map((i) => `${i.discipline}${i.is_friday_world ? "*" : ""}`)).toEqual(["world_visit*", "expression", "world_visit"]);
    expect(hasOuting(r)).toBe(true);
  });

  it("no Planeador escolhe-se a semana: só esta semana, sem mexer em A vossa semana", () => {
    const base = normalizeRoutine(["full", "full", "full", "full", "off"], true);
    const wk = withWeekOutings(base, ["none", "afternoon", "none", "none", "day"])!;
    expect(wk.outings).toEqual(["none", "afternoon", "none", "none", "none"]); // sexta sem estudo: sem Ver Mundo
    expect(base.outings).toEqual(["none", "none", "none", "none", "day"]); // "A vossa semana" não muda
    expect(withWeekOutings(base, null)).toBe(base);
    expect(withWeekOutings(null, ["none", "none", "day", "none", "none"])!.outings).toEqual(["none", "none", "day", "none", "none"]);
  });

  it("o horário segue o plano guardado: lê as Ver Mundo de cada dia", () => {
    const legacy = [
      { day_of_week: 5, time_slot: "09:45-11:50", is_friday_world: true },
      { day_of_week: 5, time_slot: "14:00-14:30", is_friday_world: false },
    ];
    expect(outingsFromPlan(legacy)).toEqual(["none", "none", "none", "none", "day"]);
    expect(outingsFromPlan([{ day_of_week: 5, time_slot: "09:30-12:00", is_friday_world: true }])).toEqual(["none", "none", "none", "none", "day"]);
    expect(outingsFromPlan([
      { day_of_week: 2, time_slot: "14:00-16:30", is_friday_world: true },
      { day_of_week: 3, time_slot: "09:30-12:30", is_friday_world: true },
    ])).toEqual(["none", "afternoon", "morning", "none", "none"]);
    const r = routineForPlan(null, [{ day_of_week: 3, time_slot: "09:45-11:50", is_friday_world: true }])!;
    expect(r.outings).toEqual(["none", "none", "day", "none", "none"]);
    expect(routineForPlan(null, [])).toBeNull();
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
    expect(applyWeekRoutine(items, r).map((i) => `${i.day_of_week}:${i.discipline}`)).toEqual(["2:language", "3:ritual", "3:lunch", "3:reading"]);
    expect(routineSummary(r)).toContain("quarta livre");
    // P-30: uma sexta livre pode ter a saída "Ver Mundo"
    expect(hasOuting(normalizeRoutine(["full", "full", "full", "full", "free"], true))).toBe(true);
  });
});

describe("Ver Mundo em qualquer dia (P-30, P-31)", () => {
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

  it("a parte do dia da Ver Mundo fica sem currículo e entra o bloco da saída", async () => {
    const { applyWeekRoutine, normalizeRoutine, routineSummary, hasOuting } = await import("../familyRoutine");
    const r = normalizeRoutine(["full", { m: "full", o: "afternoon" }, { m: "full", o: "morning" }, "full", { m: "full", o: "day" }], true);
    const items = [
      { day_of_week: 2, discipline: "language", is_friday_world: false, time_slot: "09:45-10:10" },
      { day_of_week: 2, discipline: "english", is_friday_world: false, time_slot: "14:00-14:30" },
      { day_of_week: 3, discipline: "language", is_friday_world: false, time_slot: "09:45-10:10" },
      { day_of_week: 3, discipline: "lunch", is_friday_world: false, time_slot: "12:30-14:00" },
      { day_of_week: 3, discipline: "reading", is_friday_world: false, time_slot: "14:45-15:15" },
      { day_of_week: 5, discipline: "world", is_friday_world: true, time_slot: "09:30-12:00" },
    ];
    const out = applyWeekRoutine(items, r);
    expect(out.map((i) => `${i.day_of_week}:${i.discipline}`)).toEqual(["2:language", "2:world", "3:world", "3:lunch", "3:reading", "5:world"]);
    expect(out.filter((i) => i.is_friday_world).map((i) => `${i.day_of_week} ${i.time_slot}`)).toEqual(["2 14:00-16:30", "3 09:30-12:30", "5 09:30-12:00"]);
    expect(hasOuting(r)).toBe(true);
    expect(routineSummary(r)).toContain("Ver Mundo à terça à tarde, à quarta de manhã, à sexta");
  });
});
