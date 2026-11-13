import { describe, it, expect } from "vitest";
import {
  officialCalendar, familyWeeks, weeksFor, schoolWeeks, buildAnnualPlan, isValidCalendar, isoDay,
  type AnnualContent, type FamilyCalendar,
} from "../annualPlan";

const official = officialCalendar(2026);

describe("calendário da família", () => {
  it("o calendário oficial, escrito como calendário da família, dá as mesmas semanas", () => {
    expect(official.year_start).toBe("2026-09-14");
    expect(official.year_end).toBe("2027-07-02");
    expect(official.breaks).toEqual([
      { from: "2026-12-14", to: "2027-01-03" },
      { from: "2027-03-22", to: "2027-04-04" },
    ]);
    expect(familyWeeks(official)).toEqual(schoolWeeks(2026));
  });

  it("quem não pára no verão ganha semanas no 3.º período", () => {
    const cal: FamilyCalendar = { ...official, year_end: "2027-08-27" };
    const w = familyWeeks(cal);
    expect(w.length).toBe(37 + 8);
    expect(isoDay(w.at(-1)!.monday)).toBe("2027-08-23");
    expect(w.filter((x) => x.period === "3").length).toBe(13 + 8);
    expect(w.filter((x) => x.isReview).map((x) => isoDay(x.monday))).toEqual(["2026-12-07", "2027-03-15", "2027-08-23"]);
  });

  it("sem pausas e sem balanços, todas as semanas contam", () => {
    const w = familyWeeks({ ...official, breaks: [], review_weeks: false });
    expect(w.length).toBe(42);
    expect(w.some((x) => x.isReview)).toBe(false);
    expect(w.map((x) => x.number)).toEqual(w.map((_, i) => i + 1));
  });

  it("uma pausa a meio tira essa semana; dois dias de pausa não tiram", () => {
    const base = familyWeeks(official).length;
    expect(familyWeeks({ ...official, breaks: [...official.breaks, { from: "2026-11-02", to: "2026-11-06" }] }).length).toBe(base - 1);
    expect(familyWeeks({ ...official, breaks: [...official.breaks, { from: "2027-02-08", to: "2027-02-09" }] }).length).toBe(base);
  });

  it("um ano fora do habitual (maio a julho do ano seguinte) divide-se em três partes", () => {
    const w = familyWeeks({ year_start: "2026-05-04", year_end: "2027-07-30", breaks: [], review_weeks: true });
    expect(w.length).toBe(65);
    const count = (p: string) => w.filter((x) => x.period === p).length;
    expect([count("1"), count("2"), count("3")]).toEqual([22, 22, 21]);
    expect(w.filter((x) => x.isReview).length).toBe(3);
  });

  it("recusa calendários impossíveis", () => {
    expect(isValidCalendar({ ...official, year_end: "2026-09-01" })).toBe(false);
    expect(isValidCalendar({ ...official, year_end: "2029-09-01" })).toBe(false);
    expect(isValidCalendar({ ...official, breaks: [{ from: "2027-01-10", to: "2027-01-01" }] })).toBe(false);
    expect(familyWeeks({ ...official, year_end: "2026-09-01" })).toEqual([]);
  });

  it("weeksFor usa o calendário da família só nas datas que ele cobre", () => {
    const cal: FamilyCalendar = { ...official, year_end: "2027-08-27" };
    expect(weeksFor(new Date(2027, 7, 10), cal).length).toBe(45);
    expect(weeksFor(new Date(2026, 6, 1), cal).length).toBe(45); // antes de começar: já mostra o ano que vem
    expect(weeksFor(new Date(2027, 9, 1), cal)).toEqual(schoolWeeks(2027)); // ano seguinte: volta ao escolar
    expect(weeksFor(new Date(2026, 10, 13), null)).toEqual(schoolWeeks(2026));
  });

  it("o rumo reparte currículo e manual pelas semanas da família", () => {
    const contents: AnnualContent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `c${i}`, discipline: "portugues", period: "3", domain: "Leitura", content: `c${i}`, sort_order: i,
    }));
    const manual = { discipline: "matematica", title: "M", entries: [{ title: "U1" }, { title: "U2" }] };
    const plan = buildAnnualPlan(contents, familyWeeks({ ...official, year_end: "2027-08-27" }), [manual]);
    const p3 = plan.weeks.filter((w) => w.period === "3" && !w.isReview);
    expect(p3.length).toBe(20);
    expect(p3.every((w) => w.byDiscipline.portugues?.length === 1)).toBe(true);
    expect(plan.weeks.filter((w) => w.byDiscipline.matematica).length).toBe(42);
  });
});
