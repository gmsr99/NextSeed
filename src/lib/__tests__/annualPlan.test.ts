import { applyCurrentPage } from "../manualIndex";
import { describe, it, expect } from "vitest";
import {
  schoolWeeks, buildAnnualPlan, planWeekFor, weekFocus, easterSunday, schoolYearStartFor, mondayOf,
  type AnnualContent, manualLabel } from "../annualPlan";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function c(id: string, discipline: string, period: string, domain: string, sort_order: number): AnnualContent {
  return { id, discipline, period, domain, content: `conteúdo ${id}`, sort_order };
}

describe("calendário escolar", () => {
  it("calcula a Páscoa", () => {
    expect(iso(easterSunday(2026))).toBe("2026-04-05");
    expect(iso(easterSunday(2027))).toBe("2027-03-28");
  });

  it("2026/27 segue o calendário oficial do 1.º ciclo", () => {
    const w = schoolWeeks(2026);
    const of = (p: string) => w.filter((x) => x.period === p);
    expect(iso(of("1")[0].monday)).toBe("2026-09-14");
    expect(iso(of("1").at(-1)!.monday)).toBe("2026-12-07");
    expect(iso(of("2")[0].monday)).toBe("2027-01-04");
    expect(iso(of("2").at(-1)!.monday)).toBe("2027-03-15");
    expect(iso(of("3")[0].monday)).toBe("2027-04-05");
    expect(iso(of("3").at(-1)!.monday)).toBe("2027-06-28");
    expect(w.map((x) => x.number)).toEqual(w.map((_, i) => i + 1));
    expect(w.every((x) => x.monday.getDay() === 1)).toBe(true);
  });

  it("a última semana de cada período é de balanço", () => {
    const w = schoolWeeks(2026);
    expect(w.filter((x) => x.isReview).map((x) => iso(x.monday))).toEqual(["2026-12-07", "2027-03-15", "2027-06-28"]);
  });

  it("o ano letivo vai de agosto a julho", () => {
    expect(schoolYearStartFor(new Date(2026, 10, 13))).toBe(2026);
    expect(schoolYearStartFor(new Date(2027, 2, 1))).toBe(2026);
    expect(schoolYearStartFor(new Date(2027, 7, 30))).toBe(2027);
  });

  it("mondayOf trata o domingo como fim da semana", () => {
    expect(iso(mondayOf(new Date(2026, 10, 15)))).toBe("2026-11-09");
    expect(iso(mondayOf(new Date(2026, 10, 13)))).toBe("2026-11-09");
  });
});

describe("buildAnnualPlan", () => {
  const contents: AnnualContent[] = [
    ...Array.from({ length: 6 }, (_, i) => c(`l${i}`, "portugues", "1", "Leitura", i)),
    ...Array.from({ length: 3 }, (_, i) => c(`g${i}`, "portugues", "1", "Gramática", i)),
    ...Array.from({ length: 30 }, (_, i) => c(`m${i}`, "matematica", "1", "Números", i)),
    c("p2", "portugues", "2", "Leitura", 0),
    c("a0", "artes_visuais", "all", "Experimentação", 0),
    c("a1", "artes_visuais", "all", "Experimentação", 1),
    c("a2", "artes_visuais", "all", "Experimentação", 2),
  ];
  const plan = buildAnnualPlan(contents, 2026);
  const p1 = plan.weeks.filter((w) => w.period === "1");

  it("coloca cada conteúdo exatamente uma vez, no seu período", () => {
    const placed = plan.weeks.flatMap((w) => Object.values(w.byDiscipline).flat().map((x) => [x.id, w.period]));
    expect(placed.length).toBe(40);
    expect(new Set(placed.map((x) => x[0])).size).toBe(40);
    expect(placed.find((x) => x[0] === "p2")![1]).toBe("2");
    expect(placed.filter((x) => x[0].startsWith("m")).every((x) => x[1] === "1")).toBe(true);
  });

  it("mantém a ordem dentro de cada domínio e começa na primeira semana", () => {
    const leitura = p1.flatMap((w) => (w.byDiscipline.portugues ?? []).filter((x) => x.domain === "Leitura").map((x) => x.id));
    expect(leitura).toEqual(["l0", "l1", "l2", "l3", "l4", "l5"]);
    expect(p1[0].byDiscipline.portugues.map((x) => x.id).sort()).toEqual(["g0", "l0"]);
  });

  it("espalha os conteúdos e deixa a semana de balanço livre", () => {
    const review = p1.at(-1)!;
    expect(review.isReview).toBe(true);
    expect(Object.keys(review.byDiscipline)).toEqual([]);
    const perWeek = p1.slice(0, -1).map((w) => (w.byDiscipline.matematica ?? []).length);
    expect(Math.max(...perWeek) - Math.min(...perWeek)).toBeLessThanOrEqual(1);
    expect(Math.min(...perWeek)).toBeGreaterThanOrEqual(2);
  });

  it("os conteúdos do ano todo ficam à parte", () => {
    expect(plan.yearRound.artes_visuais.map((x) => x.id)).toEqual(["a0", "a1", "a2"]);
  });

  describe("weekFocus", () => {
    const nov9 = new Date(2026, 10, 9);

    it("devolve os conteúdos da semana e dois do ano todo", () => {
      const f = weekFocus(plan, nov9)!;
      expect(f.matematica.length).toBeGreaterThanOrEqual(2);
      expect(f.artes_visuais.length).toBe(2);
      expect(f.portugues.length).toBeGreaterThanOrEqual(1);
    });

    it("aceita qualquer dia da semana", () => {
      expect(weekFocus(plan, new Date(2026, 10, 13))).toEqual(weekFocus(plan, nov9));
      expect(planWeekFor(plan, new Date(2026, 10, 13))!.number).toBe(9);
    });

    it("salta o que já está dominado e nunca deixa uma disciplina vazia", () => {
      const thisWeek = new Set(weekFocus(plan, nov9)!.matematica.map((x) => x.id));
      const f = weekFocus(plan, nov9, (id) => thisWeek.has(id))!;
      expect(f.matematica.length).toBe(1);
      expect(thisWeek.has(f.matematica[0].id)).toBe(false);
    });

    it("não inventa foco em pausas, balanços ou férias", () => {
      expect(weekFocus(plan, new Date(2026, 11, 7))).toBeNull(); // balanço
      expect(weekFocus(plan, new Date(2026, 11, 28))).toBeNull(); // Natal
      expect(weekFocus(plan, new Date(2027, 7, 2))).toBeNull(); // agosto
    });
  });
});

describe("vários manuais e página onde vão", () => {
  it("dois manuais na mesma disciplina seguem lado a lado, cada um com o seu nome", () => {
    const plan = buildAnnualPlan([], 2026, [
      { discipline: "matematica", title: "Manual", entries: [{ title: "A", page: 1 }, { title: "B", page: 20 }], start_date: "2026-09-01" },
      { discipline: "matematica", title: "Fichas", entries: [{ title: "F1" }, { title: "F2" }], start_date: "2026-09-01" },
    ]);
    const all = plan.weeks.flatMap((w) => w.byDiscipline.matematica ?? []);
    expect(all.some((c) => c.content.startsWith("Manual: "))).toBe(true);
    expect(all.some((c) => c.content.startsWith("Fichas: "))).toBe(true);
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
    expect(manualLabel(all)).toBe("Manual + Fichas");
  });
  it("com a página marcada, só o que falta entra no rumo", () => {
    const entries = applyCurrentPage([{ title: "A", page: 1 }, { title: "B", page: 20 }, { title: "C", page: 40 }], 25);
    const plan = buildAnnualPlan([], 2026, [{ discipline: "matematica", title: "M", entries, start_date: "2026-11-16" }]);
    const all = plan.weeks.flatMap((w) => w.byDiscipline.matematica ?? []);
    expect(all.some((c) => c.content.startsWith("A"))).toBe(false);
    expect(all[0].content).toMatch(/^B \(pp?\. 26/);
  });
});
