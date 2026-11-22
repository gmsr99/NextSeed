import { describe, it, expect } from "vitest";
import {
  weekSummary, disciplinePaces, sumSteps, paceState, paceSentence, yearClock,
  closeStatus, closeSummary, shouldOfferClose, type Steps, type YearClock,
} from "../dashboard";
import { buildAnnualPlan, type AnnualContent } from "../annualPlan";

describe("weekSummary (DASH §3)", () => {
  const items = [
    { day_of_week: 1, completed_at: "x" },
    { day_of_week: 1, completed_at: null },
    { day_of_week: 3, completed_at: null },
  ];
  it("em dia à segunda: nada estava previsto até ontem", () => {
    expect(weekSummary(items, 1, true).state).toBe("em_dia");
  });
  it("quase lá quando ficou alguma coisa para trás", () => {
    const s = weekSummary(items, 2, true);
    expect(s.state).toBe("quase");
    expect(s.done).toBe(1);
    expect(s.total).toBe(3);
    expect(s.days[0]).toEqual({ day: 1, done: 1, total: 2 });
  });
  it("sem plano numa semana de aulas: por preparar", () => {
    expect(weekSummary(null, 2, false).state).toBe("por_preparar");
  });
  it("ao fim de semana olha para a semana seguinte", () => {
    expect(weekSummary(items, 7, false).state).toBe("por_preparar");
    expect(weekSummary(items, 6, true).state).toBe("preparada");
  });
});

const contents: AnnualContent[] = Array.from({ length: 24 }, (_, i) => ({
  id: `c${i}`, discipline: "matematica", period: "1", domain: "N", content: `c${i}`, sort_order: i,
}));

describe("disciplinePaces (DASH §7)", () => {
  const plan = buildAnnualPlan(contents, 2026);
  const today = new Date(2026, 8, 30); // 3.ª semana

  it("conta dados (incluindo a consolidar) e previstos até à semana anterior", () => {
    const [m] = disciplinePaces(plan, { c0: "dominado", c1: "em_progresso", c5: "a_aprender" }, {}, [], today);
    expect(m.discipline).toBe("matematica");
    expect(m.total).toBe(24);
    expect(m.given).toBe(2);
    expect(m.consolidating).toBe(1);
    expect(m.plannedByNow).toBe(4);
  });

  it("os dados das últimas 4 semanas contam como ritmo recente", () => {
    const [m] = disciplinePaces(plan, { c0: "dominado", c1: "dominado" }, { c0: "2026-09-25T10:00:00Z", c1: "2026-01-01T10:00:00Z" }, [], today);
    expect(m.recent).toBe(1);
  });

  it("manual: unidades feitas e previstas pelo índice; lição seguinte fica de fora", () => {
    const manuals = [
      { discipline: "portugues", title: "Livro", entries: [{ title: "U1", done: true }, { title: "U2" }, { title: "U3" }] },
      { discipline: "ingles", title: "Book", entries: [{ title: "Lição seguinte", next: true }] },
    ];
    const p = buildAnnualPlan(contents, 2026, manuals);
    const list = disciplinePaces(p, {}, {}, manuals, today);
    const pt = list.find((x) => x.discipline === "portugues")!;
    expect(pt.total).toBe(3);
    expect(pt.given).toBe(1);
    expect(pt.manual).toBe("Livro");
    expect(pt.recent).toBeNull();
    expect(list.find((x) => x.discipline === "ingles")).toBeUndefined();
  });
});

describe("paceState e paceSentence (DASH §7)", () => {
  const clock: YearClock = { elapsed: 10, left: 26, current: 11, totalWeeks: 36 };
  const s = (o: Partial<Steps>): Steps => ({ total: 100, given: 30, consolidating: 0, plannedByNow: 28, recent: null, ...o });

  it("em linha com o rumo: bom ritmo", () => {
    expect(paceState(s({}), clock)).toBe("bom");
  });
  it("atrás do rumo mas acaba até 30 de junho: bom ritmo", () => {
    expect(paceState(s({ plannedByNow: 40, recent: 12 }), clock)).toBe("bom"); // 3/semana, 70/3 ≈ 23 semanas
  });
  it("acaba em julho: a usar a folga", () => {
    expect(paceState(s({ plannedByNow: 40, given: 30, recent: 10 }), clock)).toBe("folga"); // 2,5/semana → 28 semanas
  });
  it("depois de julho: pede um ajuste", () => {
    expect(paceState(s({ plannedByNow: 40, given: 20 }), clock)).toBe("ajuste"); // 2/semana → 40 semanas
  });
  it("sem cor no arranque e sem marcações", () => {
    expect(paceState(s({ plannedByNow: 40 }), { ...clock, elapsed: 3 })).toBe("a_ganhar");
    expect(paceState(s({ given: 0 }), clock)).toBe("sem_marcas");
  });
  it("a consolidar não muda a cor", () => {
    expect(paceState(s({ consolidating: 30 }), clock)).toBe(paceState(s({}), clock));
  });
  it("frase para os pais", () => {
    expect(paceSentence(s({ total: 88 }), { ...clock, left: 29 })).toBe("Faltam 58 temas em 29 semanas: cerca de 2 por semana. Têm feito 3.");
    expect(paceSentence(s({ given: 100 }), clock)).toBe("Os temas do ano estão todos dados.");
  });
  it("soma de disciplinas: sem data num manual, o recente fica desconhecido", () => {
    const t = sumSteps([s({ recent: 4 }), s({ recent: null })]);
    expect(t.total).toBe(200);
    expect(t.recent).toBeNull();
  });
});

describe("yearClock", () => {
  it("conta semanas passadas e as que faltam até 30 de junho", () => {
    const plan = buildAnnualPlan(contents, 2026);
    const c = yearClock(plan, new Date(2026, 8, 30));
    expect(c.elapsed).toBe(2);
    expect(c.current).toBe(3);
    expect(c.left).toBeGreaterThan(25);
  });
});

describe("fecho da semana (DASH §4)", () => {
  it("dado = ok; dado + precisa de mais = a consolidar; não dado não mexe", () => {
    expect(closeStatus(true, false, undefined)).toBe("dominado");
    expect(closeStatus(true, true, undefined)).toBe("em_progresso");
    expect(closeStatus(true, false, "em_progresso")).toBe("dominado"); // revisão que ficou consolidada
    expect(closeStatus(false, false, "em_progresso")).toBeNull();
    expect(closeStatus(true, false, "dominado")).toBeNull();
  });
  it("resumo", () => {
    expect(closeSummary(12, 10, 1)).toBe("10 de 12 dados · 1 volta mais tarde para consolidar · 2 passam para a semana que vem");
    expect(closeSummary(3, 3, 0)).toBe("3 de 3 dados");
  });
  it("popup só à sexta a partir das 12h, uma vez", () => {
    expect(shouldOfferClose(new Date(2026, 10, 27, 12, 5), false)).toBe(true);
    expect(shouldOfferClose(new Date(2026, 10, 27, 11, 0), false)).toBe(false);
    expect(shouldOfferClose(new Date(2026, 10, 27, 15, 0), true)).toBe(false);
    expect(shouldOfferClose(new Date(2026, 10, 26, 15, 0), false)).toBe(false);
  });
});

describe("ritmo com lição seguinte e índice", () => {
  it("conta as unidades do índice e ignora a linha marcadora", () => {
    const manuals = [{ discipline: "portugues", title: "Livro", entries: [{ title: "U1", done: true }, { title: "U2" }, { title: "Lição seguinte", next: true, lessonDays: 1 }] }];
    const p = buildAnnualPlan(contents, 2026, manuals);
    const pt = disciplinePaces(p, {}, {}, manuals, new Date(2026, 8, 30)).find((x) => x.discipline === "portugues")!;
    expect(pt.total).toBe(2);
    expect(pt.given).toBe(1);
  });
});
