import { describe, it, expect } from "vitest";
import { blockModes, applyFamilyWeek, splitMode, withMode } from "../familyWeek";

const slot = (child_id: string, day_of_week: number, time_slot: string, discipline: string) =>
  ({ child_id, day_of_week, time_slot, discipline });
const item = (child: string, day: number, time: string, disc: string, title: string, description = "Fazer.") =>
  ({ ...slot(child, day, time, disc), title, description });

// Dois dias de duas crianças do 1.º ciclo, como no esqueleto do plano
const week = ["a", "b"].flatMap((c) => [
  slot(c, 1, "09:45-10:10", "language"), slot(c, 1, "10:17-10:42", "math"),
  slot(c, 1, "11:05-11:50", "world"), slot(c, 1, "14:00-14:30", "english"), slot(c, 1, "14:45-15:15", "reading"),
  slot(c, 2, "09:45-10:10", "math"), slot(c, 2, "10:17-10:42", "language"),
  slot(c, 5, "09:45-11:50", "world"), slot(c, 5, "14:00-14:30", "expression"),
]);

describe("blockModes", () => {
  const modes = blockModes(week);
  const of = (child: string, day: number, start: string) =>
    modes[week.findIndex((s) => s.child_id === child && s.day_of_week === day && s.time_slot.startsWith(start))];

  it("nunca põe duas crianças com o adulto à mesma hora", () => {
    const byBlock = new Map<string, number>();
    week.forEach((s, i) => {
      if (modes[i] === "adulto") byBlock.set(`${s.day_of_week}|${s.time_slot}`, (byBlock.get(`${s.day_of_week}|${s.time_slot}`) ?? 0) + 1);
    });
    expect([...byBlock.values()].every((n) => n === 1)).toBe(true);
    expect(byBlock.size).toBe(5); // 3 blocos académicos na segunda + 2 na terça
  });

  it("o adulto alterna entre as crianças de bloco para bloco", () => {
    expect(of("a", 1, "09:45")).not.toBe(of("b", 1, "09:45"));
    expect(of("a", 1, "09:45")).toBe(of("b", 1, "10:17"));
    for (const c of ["a", "b"]) {
      const mine = week.map((s, i) => (s.child_id === c ? modes[i] : null));
      expect(mine.filter((m) => m === "adulto").length).toBeGreaterThanOrEqual(2);
      expect(mine.filter((m) => m === "sozinho").length).toBeGreaterThanOrEqual(2);
    }
  });

  it("Estudo do Meio, leitura e sexta-feira são em conjunto", () => {
    for (const c of ["a", "b"]) {
      expect(of(c, 1, "11:05")).toBe("juntos");
      expect(of(c, 1, "14:45")).toBe("juntos");
      expect(of(c, 5, "09:45")).toBe("juntos");
      expect(of(c, 5, "14:00")).toBe("juntos");
    }
  });

  it("com uma só criança não há etiquetas", () => {
    expect(blockModes(week.filter((s) => s.child_id === "a")).every((m) => m === null)).toBe(true);
  });

  it("pré-escolar alinhado: mesma hora de início, duração diferente", () => {
    const m = blockModes([
      slot("a", 1, "09:45-10:10", "language"), slot("p", 1, "09:45-10:15", "language"),
      slot("a", 1, "11:05-11:50", "world"), slot("p", 1, "11:05-11:35", "world"),
    ]);
    expect(new Set(m.slice(0, 2))).toEqual(new Set(["adulto", "sozinho"]));
    expect(m.slice(2)).toEqual(["juntos", "juntos"]);
  });

  it("três crianças: uma com o adulto, duas sozinhas", () => {
    const m = blockModes(["a", "b", "c"].map((c) => slot(c, 3, "09:45-10:10", "math")));
    expect(m.filter((x) => x === "adulto").length).toBe(1);
    expect(m.filter((x) => x === "sozinho").length).toBe(2);
  });
});

describe("etiquetas na descrição", () => {
  it("withMode põe a etiqueta e substitui a que a IA tenha escrito", () => {
    expect(withMode("Contar feijões.", "sozinho")).toBe("Sozinho(a): Contar feijões.");
    expect(withMode("Sozinha: Contar feijões.", "sozinho")).toBe("Sozinho(a): Contar feijões.");
    expect(withMode("Em conjunto: Contar feijões.", "adulto")).toBe("Com o adulto: Contar feijões.");
    expect(withMode("Com o adulto: Contar.", null)).toBe("Contar.");
  });

  it("não mexe nos episódios de leitura (JSON)", () => {
    const json = '{"episode_text":"Era uma vez.","comprehension_question":"Quem?"}';
    expect(withMode(json, "juntos")).toBe(json);
  });

  it("splitMode devolve a etiqueta e o texto", () => {
    expect(splitMode("Sozinho(a): Contar.")).toEqual({ mode: "sozinho", text: "Contar." });
    expect(splitMode("Contar sozinho: não é etiqueta.")).toEqual({ mode: null, text: "Contar sozinho: não é etiqueta." });
  });
});

describe("applyFamilyWeek", () => {
  const ep = (text: string, q: string) => JSON.stringify({ episode_text: text, comprehension_question: q, discussion_prompt: "E tu?" });
  const out = applyFamilyWeek([
    item("a", 1, "09:45-10:10", "language", "Ditado do outono"),
    item("b", 1, "09:45-10:10", "language", "Sílabas com folhas", "Sozinho: Separar sílabas."),
    item("a", 1, "11:05-11:50", "world", "As estações do ano", "Observar a rua."),
    item("b", 1, "11:05-11:50", "world", "O outono na rua", "Desenhar o que vê."),
    item("a", 1, "14:45-15:15", "reading", "A folha viajante", ep("História A.", "Pergunta A?")),
    item("b", 1, "14:45-15:15", "reading", "O vento do norte", ep("História B.", "Pergunta B?")),
  ]);

  it("etiqueta os blocos académicos sem trocar os títulos", () => {
    expect(out[0].title).toBe("Ditado do outono");
    expect(out[1].title).toBe("Sílabas com folhas");
    const prefixes = [splitMode(out[0].description).mode, splitMode(out[1].description).mode];
    expect(new Set(prefixes)).toEqual(new Set(["adulto", "sozinho"]));
    expect(out[1].description).not.toMatch(/Sozinho: /);
  });

  it("nos blocos em conjunto, o título é o mesmo e cada criança mantém a sua parte", () => {
    expect(out[3].title).toBe("As estações do ano");
    expect(out[2].description).toBe("Em conjunto: Observar a rua.");
    expect(out[3].description).toBe("Em conjunto: Desenhar o que vê.");
  });

  it("na leitura, a história é uma só e a pergunta é de cada criança", () => {
    const b = JSON.parse(out[5].description);
    expect(out[5].title).toBe("A folha viajante");
    expect(b.episode_text).toBe("História A.");
    expect(b.comprehension_question).toBe("Pergunta B?");
  });

  it("com uma criança, o plano fica igual", () => {
    const solo = [item("a", 1, "09:45-10:10", "language", "Ditado", "Escrever.")];
    expect(applyFamilyWeek(solo)).toEqual(solo);
  });
});
