import { describe, it, expect } from "vitest";
import { parseIndex, formatIndex, distributeManual, sliceLabel, hasUsablePages, countGroups, applyCurrentPage, currentPageOf, remainingEntries } from "../manualIndex";
import { buildAnnualPlan, weekFocus, type AnnualContent } from "../annualPlan";

describe("parseIndex", () => {
  it("lê uma unidade por linha, com ou sem página", () => {
    expect(parseIndex(`
      Unidade 1 — Números até 100 ..... 6
      - Unidade 2: Adição e subtração, p. 24
      Unidade 3 – Figuras geométricas (pág. 40)
      Frações    58
      Revisões
    `)).toEqual([
      { title: "Unidade 1 — Números até 100", page: 6 },
      { title: "Unidade 2: Adição e subtração", page: 24 },
      { title: "Unidade 3 – Figuras geométricas", page: 40 },
      { title: "Frações", page: 58 },
      { title: "Revisões" },
    ]);
  });

  it("não confunde o número da unidade com a página", () => {
    expect(parseIndex("Unidade 3\nCapítulo 12\nNúmeros até 100")).toEqual([
      { title: "Unidade 3" }, { title: "Capítulo 12" }, { title: "Números até 100" },
    ]);
  });

  it("ignora linhas vazias e linhas só com números", () => {
    expect(parseIndex("\n  \n12\n...\nLeitura . 8")).toEqual([{ title: "Leitura", page: 8 }]);
  });

  it("formatIndex e parseIndex são inversos", () => {
    const e = [{ title: "Unidade 1 — Números", page: 6 }, { title: "Revisões" }];
    expect(parseIndex(formatIndex(e))).toEqual(e);
  });
});

describe("distributeManual", () => {
  const paged = [
    { title: "A", page: 10 }, // 10 páginas
    { title: "B", page: 20 }, // 40 páginas
    { title: "C", page: 60 }, // 10 páginas
    { title: "D", page: 70 }, // última: média (20)
  ];

  it("cobre o manual todo, por ordem, sem semanas vazias", () => {
    const weeks = distributeManual(paged, 8);
    expect(weeks.every((w) => w.length > 0)).toBe(true);
    const order = weeks.flat().map((s) => s.entryIndex);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(new Set(order)).toEqual(new Set([0, 1, 2, 3]));
  });

  it("dá mais semanas às unidades com mais páginas e reparte as páginas", () => {
    const weeks = distributeManual(paged, 8);
    const count = (i: number) => weeks.filter((w) => w.some((s) => s.entryIndex === i)).length;
    expect(count(1)).toBeGreaterThan(count(0));
    const b = weeks.flat().filter((s) => s.entryIndex === 1);
    expect(b[0].pageFrom).toBe(20);
    expect(b.at(-1)!.pageTo).toBe(59);
    expect(b.every((s, i) => i === 0 || s.pageFrom === b[i - 1].pageTo! + 1)).toBe(true);
    expect(b[0].parts).toBe(b.length);
  });

  it("sem páginas, reparte por igual", () => {
    const weeks = distributeManual([{ title: "A" }, { title: "B" }, { title: "C" }], 6);
    expect(weeks.map((w) => w.map((s) => s.title).join())).toEqual(["A", "A", "B", "B", "C", "C"]);
    expect(weeks[0][0].pageFrom).toBeUndefined();
  });

  it("com mais unidades do que semanas, junta várias por semana", () => {
    const entries = Array.from({ length: 10 }, (_, i) => ({ title: `U${i}` }));
    const weeks = distributeManual(entries, 4);
    expect(weeks.flat().length).toBe(10);
    expect(weeks.every((w) => w.length >= 2)).toBe(true);
  });

  it("páginas fora de ordem não contam como páginas", () => {
    expect(hasUsablePages([{ title: "A", page: 30 }, { title: "B", page: 10 }])).toBe(false);
  });

  it("sliceLabel mostra páginas e partes", () => {
    expect(sliceLabel({ entryIndex: 0, title: "Frações", pageFrom: 24, pageTo: 27, part: 1, parts: 2 }))
      .toBe("Frações (pp. 24–27) · parte 1 de 2");
    expect(sliceLabel({ entryIndex: 0, title: "Frações" })).toBe("Frações");
  });
});

describe("rumo do ano com manual", () => {
  const contents: AnnualContent[] = [
    { id: "m1", discipline: "matematica", period: "1", domain: "Números", content: "x", sort_order: 0 },
    { id: "p1", discipline: "portugues", period: "1", domain: "Leitura", content: "y", sort_order: 0 },
  ];
  const manual = { discipline: "matematica", title: "Manual de Matemática", entries: [{ title: "U1", page: 6 }, { title: "U2", page: 40 }, { title: "U3", page: 80 }] };
  const plan = buildAnnualPlan(contents, 2026, [manual]);

  it("a disciplina com manual segue o manual o ano inteiro; as outras seguem o currículo", () => {
    const math = plan.weeks.flatMap((w) => w.byDiscipline.matematica ?? []);
    expect(math.every((c) => c.fromManual)).toBe(true);
    expect(math.some((c) => c.id === "m1")).toBe(false);
    const teaching = plan.weeks.filter((w) => !w.isReview);
    expect(teaching.every((w) => (w.byDiscipline.matematica ?? []).length > 0)).toBe(true);
    expect(plan.weeks.filter((w) => w.isReview).every((w) => !w.byDiscipline.matematica)).toBe(true);
    expect(plan.weeks.flatMap((w) => w.byDiscipline.portugues ?? []).map((c) => c.id)).toEqual(["p1"]);
  });

  it("o foco da semana traz a unidade e as páginas", () => {
    const f = weekFocus(plan, new Date(2026, 8, 14))!;
    expect(f.matematica[0].content).toMatch(/^U1 \(pp\. 6–\d+\) · parte 1 de \d+$/);
  });

  it("funciona sem currículo carregado (5.º ano, pré-escolar)", () => {
    const only = buildAnnualPlan([], 2026, [manual]);
    expect(weekFocus(only, new Date(2026, 10, 9))!.matematica.length).toBe(1);
  });

  it("começado a meio do ano, reparte-se só pelas semanas que faltam", () => {
    const late = buildAnnualPlan(contents, 2026, [{ ...manual, start_date: "2026-11-11" }]);
    const weeks = late.weeks.filter((w) => w.byDiscipline.matematica);
    expect(weeks[0].number).toBe(9); // semana de 9 a 13 de novembro
    expect(weeks[0].byDiscipline.matematica[0].content).toMatch(/^U1 \(pp\. 6–/);
    // antes disso, a disciplina não tem nada marcado (o currículo já não se aplica)
    expect(late.weeks.slice(0, 8).every((w) => !w.byDiscipline.matematica)).toBe(true);
    expect(late.weeks.at(-2)!.byDiscipline.matematica.at(-1)!.content).toMatch(/^U3/);
  });
});

describe("countGroups (V-05)", () => {
  it("conta as unidades quando as linhas são temas dentro de unidades", () => {
    const e = parseIndex("Unidade 1 — Números até 100 ... 6\nUnidade 1 — Contar de 2 em 2 ... 10\nunidade  2 — Adição ... 24\nCapítulo 3: Medir ... 40");
    expect(e).toHaveLength(4);
    expect(countGroups(e)).toBe(3);
  });
  it("0 quando as linhas não indicam a unidade", () => {
    expect(countGroups(parseIndex("Frações ... 4\nMedidas ... 9"))).toBe(0);
  });
});

describe("página onde vão", () => {
  const idx = parseIndex("Números ... 6\nContar ... 12\nAdição ... 24\nSubtração ... 40\nFiguras ... 52");
  it("marca feitos os temas antes e retoma o tema começado", () => {
    const e = applyCurrentPage(idx, 30);
    expect(e.map((x) => !!x.done)).toEqual([true, true, false, false, false]);
    expect(e[2].from).toBe(31);
    expect(currentPageOf(e)).toBe(30);
    const left = remainingEntries(e);
    expect(left.map((x) => x.index)).toEqual([2, 3, 4]);
    expect(left[0].entry.page).toBe(31);
  });
  it("página no fim de um tema: o seguinte começa inteiro", () => {
    const e = applyCurrentPage(idx, 23);
    expect(e.filter((x) => x.done)).toHaveLength(2);
    expect(e[2].from).toBeUndefined();
    expect(currentPageOf(e)).toBe(23);
    expect(currentPageOf(applyCurrentPage(idx, 39))).toBe(39);
  });
  it("sem página limpa as marcas", () => {
    expect(applyCurrentPage(applyCurrentPage(idx, 30), null)).toEqual(idx);
    expect(currentPageOf(idx)).toBeNull();
  });
});
