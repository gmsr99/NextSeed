/**
 * Testa as funções utilitárias puras do PortfolioPDF.
 *
 * Como @react-pdf/renderer não funciona em jsdom, testamos apenas a lógica
 * pura (formatação de datas, cores por disciplina, agrupamento por mês)
 * que seria usada pelo componente.
 */
import { describe, it, expect } from "vitest";

// ─── Funções copiadas da lógica do PortfolioPDF (puras, sem JSX) ──────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}

function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

function disciplineColor(disc: string | null | undefined): string {
  const COLORS: Record<string, string> = {
    language:   "#4B9CD3",
    math:       "#E8834D",
    world:      "#6EA062",
    expression: "#C49A3C",
    english:    "#9B72CF",
    project:    "#D4648A",
    reading:    "#5B9BD5",
  };
  return COLORS[disc ?? ""] ?? "#888077";
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("formatDate (pt-PT)", () => {
  it("formata uma data ISO em formato legível com dia, mês e ano", () => {
    const result = formatDate("2025-03-15");
    // Deve conter o mês em extenso e o ano
    expect(result).toMatch(/março/i);
    expect(result).toContain("2025");
    expect(result).toContain("15");
  });

  it("formata 01 de janeiro corretamente", () => {
    const result = formatDate("2025-01-01");
    expect(result).toMatch(/janeiro/i);
    expect(result).toContain("2025");
  });

  it("formata datas de fim de mês corretamente", () => {
    const result = formatDate("2025-12-31");
    expect(result).toMatch(/dezembro/i);
    expect(result).toContain("31");
  });
});

describe("monthKey (pt-PT)", () => {
  it("devolve mês e ano sem o dia", () => {
    const key = monthKey("2025-06-15");
    expect(key).toMatch(/junho/i);
    expect(key).toContain("2025");
    // Não deve conter '15' (dia)
    expect(key).not.toContain("15");
  });

  it("duas datas do mesmo mês têm a mesma chave", () => {
    expect(monthKey("2025-06-01")).toBe(monthKey("2025-06-30"));
  });

  it("datas de meses diferentes têm chaves diferentes", () => {
    expect(monthKey("2025-06-15")).not.toBe(monthKey("2025-07-15"));
  });
});

describe("disciplineColor", () => {
  it("devolve cor hex válida para disciplinas conhecidas", () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    const disciplines = ["language", "math", "world", "expression", "english", "project", "reading"];
    disciplines.forEach((d) => {
      expect(disciplineColor(d)).toMatch(hexPattern);
    });
  });

  it("devolve cor de fallback (#888077) para disciplina desconhecida", () => {
    expect(disciplineColor("unknown")).toBe("#888077");
  });

  it("devolve cor de fallback para null", () => {
    expect(disciplineColor(null)).toBe("#888077");
  });

  it("devolve cor de fallback para undefined", () => {
    expect(disciplineColor(undefined)).toBe("#888077");
  });

  it("devolve cor de fallback para string vazia", () => {
    expect(disciplineColor("")).toBe("#888077");
  });

  it("cores de disciplinas distintas são diferentes entre si", () => {
    const colors = ["language", "math", "world", "expression", "english"].map(disciplineColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(colors.length);
  });
});

describe("agrupamento por mês", () => {
  // Simula a lógica de groupByMonth do PortfolioPDF
  function groupByMonth<T extends { date: string }>(items: T[]): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const k = monthKey(item.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(item);
    }
    return map;
  }

  it("agrupa itens do mesmo mês juntos", () => {
    const items = [
      { date: "2025-03-05", title: "A" },
      { date: "2025-03-20", title: "B" },
      { date: "2025-04-10", title: "C" },
    ];
    const grouped = groupByMonth(items);
    expect(grouped.size).toBe(2);
    const marchKey = monthKey("2025-03-01");
    expect(grouped.get(marchKey)).toHaveLength(2);
  });

  it("preserva a ordem de inserção dentro de cada mês", () => {
    const items = [
      { date: "2025-03-01", title: "Primeiro" },
      { date: "2025-03-15", title: "Segundo" },
    ];
    const grouped = groupByMonth(items);
    const marchKey = monthKey("2025-03-01");
    const entries = grouped.get(marchKey)!;
    expect(entries[0].title).toBe("Primeiro");
    expect(entries[1].title).toBe("Segundo");
  });

  it("devolve mapa vazio para lista vazia", () => {
    expect(groupByMonth([])).toEqual(new Map());
  });
});
