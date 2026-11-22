import { describe, it, expect } from "vitest";
import { adventStart, baptism, easter, epiphany, liturgicalDay, marianAntiphon, traditionBreaks } from "../tradicao/liturgical";

const d = (s: string) => new Date(`${s}T12:00:00`);
const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;

describe("ano litúrgico (I-08)", () => {
  it("Páscoa e 1.º domingo do Advento", () => {
    expect(iso(easter(2026))).toBe("2026-04-05");
    expect(iso(easter(2027))).toBe("2027-03-28"); // como no plano da F-01
    expect(iso(easter(2025))).toBe("2025-04-20");
    expect(iso(adventStart(2026))).toBe("2026-11-29");
    expect(iso(adventStart(2027))).toBe("2027-11-28");
  });

  it("Epifania e Batismo em Portugal (atual) e no calendário de 1962", () => {
    expect(iso(epiphany(2027, "atual"))).toBe("2027-01-03");
    expect(iso(baptism(2027, "atual"))).toBe("2027-01-10");
    expect(iso(epiphany(2027, "tradicional"))).toBe("2027-01-06");
    expect(iso(baptism(2027, "tradicional"))).toBe("2027-01-13");
  });

  it("rótulo da semana e antífona", () => {
    expect(liturgicalDay(d("2026-12-07")).label).toBe("2.ª semana do Advento");
    expect(liturgicalDay(d("2026-11-30")).antiphon).toBe("Alma Redemptoris Mater");
    expect(liturgicalDay(d("2026-12-28")).label).toBe("Tempo do Natal");
    expect(liturgicalDay(d("2027-01-11")).label).toBe("Tempo Comum");
    expect(liturgicalDay(d("2027-02-15")).label).toBe("1.ª semana da Quaresma");
    expect(marianAntiphon(d("2027-02-15"))).toBe("Ave Regina Caelorum");
    expect(marianAntiphon(d("2026-09-07"))).toBe("Salve Rainha");
    expect(marianAntiphon(d("2027-03-26"))).toBeNull(); // Sexta-feira Santa
    expect(marianAntiphon(d("2027-04-05"))).toBe("Regina Caeli");
    expect(liturgicalDay(d("2027-03-29")).label).toBe("1.ª semana da Páscoa");
    expect(liturgicalDay(d("2027-02-01"), "tradicional").label).toBe("Tempo da Septuagésima");
  });

  it("pausas da tradição: Natal e Semana Santa (como no plano da F-01)", () => {
    expect(traditionBreaks(2026)).toEqual([
      { label: "Natal", from: "2026-12-21", to: "2027-01-03" },
      { label: "Semana Santa e Oitava da Páscoa", from: "2027-03-22", to: "2027-04-04" },
    ]);
  });
});

import { allCelebrations, weekCelebrations } from "../tradicao/celebrations";

describe("celebrações do Advento e do Natal (I-08)", () => {
  it("datas no calendário atual (2026-27)", () => {
    const list = allCelebrations(d("2026-11-29"), d("2027-01-11"), "atual");
    const on = (id: string) => list.filter((c) => c.id === id).map((c) => iso(c.date));
    expect(on("imaculada-conceicao")).toEqual(["2026-12-08"]);
    expect(on("sagrada-familia")).toEqual(["2026-12-27"]);
    expect(on("epifania")).toEqual(["2027-01-03"]);
    expect(on("batismo")).toEqual(["2027-01-10"]);
    expect(on("antifonas-o")).toHaveLength(7);
    expect(on("s-joao-da-cruz")).toEqual(["2026-12-14"]);
  });

  it("diferenças no calendário de 1962", () => {
    const list = allCelebrations(d("2026-11-20"), d("2027-01-14"), "tradicional");
    const on = (id: string) => list.filter((c) => c.id === id).map((c) => iso(c.date));
    expect(on("s-joao-da-cruz")).toEqual(["2026-11-24"]);
    expect(on("sagrada-familia")).toEqual(["2027-01-10"]);
    expect(on("epifania")).toEqual(["2027-01-06"]);
    expect(list.find((c) => c.id === "1-janeiro")?.name).toBe("Oitava do Natal");
  });

  it("sem ficha revista, a app não mostra nenhuma celebração", () => {
    expect(weekCelebrations(d("2026-12-07"), "atual")).toEqual([]);
  });

  it("sem o próprio de Portugal, a Imaculada Conceição perde o título de padroeira", () => {
    const c = allCelebrations(d("2026-12-08"), d("2026-12-08"), "atual", false)[0];
    expect(c.name).toBe("Imaculada Conceição da Virgem Santa Maria");
  });
});
