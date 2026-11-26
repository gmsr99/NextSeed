import { describe, it, expect } from "vitest";
import municipalitiesJson from "../../data/municipalities.pt.json";
import {
  km, ring, buildList, occurrences, nextOccurrence, prefsFromInterests, cleanPrefs, isHidden,
  ageOn, ageFit, nearestMunicipality, type Municipality, type CommunityEventLike,
} from "../agenda";

const municipalities = municipalitiesJson as Municipality[];
const byName = (n: string) => municipalities.find((m) => m.name === n)!;
const map = new Map(municipalities.map((m) => [m.code, m]));
const caldas = byName("Caldas da Rainha");
const obidos = byName("Óbidos");
const lisboa = byName("Lisboa");

function ev(over: Partial<CommunityEventLike> & { id: string }): CommunityEventLike {
  return {
    kind: "evento",
    municipality_code: caldas.code,
    starts_at: "2026-12-05T10:00:00Z",
    ends_at: "2026-12-05T12:00:00Z",
    recurrence: "none",
    recurrence_until: null,
    age_min: null,
    age_max: null,
    categories: ["arte_manuais"],
    is_free: true,
    status: "publicado",
    ...over,
  };
}

const from = new Date("2026-12-01T00:00:00Z");
const to = new Date("2027-02-28T00:00:00Z");
const base = { from, to, home: caldas, municipalities: map, prefs: {}, childAges: [], showHidden: false };

describe("concelhos (CAOP 2020)", () => {
  it("tem os 308 concelhos, com códigos únicos", () => {
    expect(municipalities).toHaveLength(308);
    expect(new Set(municipalities.map((m) => m.code)).size).toBe(308);
  });

  it("as distâncias de verificação batem certo", () => {
    const co = km(caldas, obidos);
    expect(co).toBeGreaterThan(5);
    expect(co).toBeLessThan(12);
    const cl = km(caldas, lisboa);
    expect(cl).toBeGreaterThan(70);
    expect(cl).toBeLessThan(95);
  });

  it("encontra o concelho mais próximo de um ponto", () => {
    expect(nearestMunicipality({ lat: 39.403, lng: -9.135 }, municipalities)?.name).toBe("Caldas da Rainha");
  });
});

describe("blocos de distância", () => {
  it("≤15, ≤40, ≤80 e mais longe; sem território fica tudo no primeiro", () => {
    expect(ring(null)).toBe(0);
    expect(ring(10)).toBe(0);
    expect(ring(15)).toBe(0);
    expect(ring(30)).toBe(1);
    expect(ring(80)).toBe(2);
    expect(ring(81)).toBe(3);
  });

  it("com o território em Caldas, Óbidos aparece antes de Lisboa", () => {
    const list = buildList(
      [ev({ id: "lx", municipality_code: lisboa.code }), ev({ id: "ob", municipality_code: obidos.code })],
      base,
    );
    expect(list.map((x) => x.event.id)).toEqual(["ob", "lx"]);
  });
});

describe("sem hierarquia entre tipos", () => {
  const oficina = ev({ id: "oficina", categories: ["arte_manuais"], starts_at: "2026-12-10T10:00:00Z", ends_at: "2026-12-10T12:00:00Z" });
  const encontro = ev({ id: "encontro", kind: "encontro", categories: ["movimento"], starts_at: "2026-12-03T10:00:00Z", ends_at: "2026-12-03T12:00:00Z" });

  it("sem preferências, ordena por data", () => {
    expect(buildList([oficina, encontro], base).map((x) => x.event.id)).toEqual(["encontro", "oficina"]);
  });

  it("com trabalhos manuais em primeiro, a oficina passa à frente do encontro", () => {
    const list = buildList([oficina, encontro], { ...base, prefs: { arte_manuais: "primeiro" } });
    expect(list.map((x) => x.event.id)).toEqual(["oficina", "encontro"]);
  });

  it("com encontros em primeiro, o encontro passa à frente", () => {
    const list = buildList([encontro, oficina], { ...base, prefs: { encontros: "primeiro", arte_manuais: "normal" } });
    expect(list.map((x) => x.event.id)).toEqual(["encontro", "oficina"]);
  });

  it("a preferência não salta blocos de distância", () => {
    const longe = ev({ id: "longe", municipality_code: lisboa.code });
    const perto = ev({ id: "perto", categories: ["ciencia"] });
    const list = buildList([longe, perto], { ...base, prefs: { arte_manuais: "primeiro" } });
    expect(list.map((x) => x.event.id)).toEqual(["perto", "longe"]);
  });
});

describe("Não mostrar", () => {
  it("esconde, e 'Mostrar tudo' volta a mostrar", () => {
    const e = ev({ id: "musical", categories: ["teatro_espetaculos"] });
    const prefs = { teatro_espetaculos: "esconder" as const };
    expect(isHidden(e, prefs)).toBe(true);
    expect(buildList([e], { ...base, prefs })).toHaveLength(0);
    expect(buildList([e], { ...base, prefs, showHidden: true })).toHaveLength(1);
  });

  it("esconder encontros esconde só os encontros", () => {
    const e1 = ev({ id: "e", kind: "encontro" });
    const e2 = ev({ id: "v" });
    expect(buildList([e1, e2], { ...base, prefs: { encontros: "esconder" } }).map((x) => x.event.id)).toEqual(["v"]);
  });
});

describe("idades", () => {
  it("calcula a idade em anos completos", () => {
    expect(ageOn("2019-12-10", new Date("2026-12-09T12:00:00"))).toBe(6);
    expect(ageOn("2019-12-10", new Date("2026-12-10T12:00:00"))).toBe(7);
  });

  it("um evento para a idade das crianças vem antes, dentro do mesmo bloco", () => {
    expect(ageFit({ age_min: 6, age_max: 12 }, [3])).toBe(0);
    expect(ageFit({ age_min: 6, age_max: 12 }, [3, 8])).toBe(1);
    const bebes = ev({ id: "bebes", age_min: 0, age_max: 2, starts_at: "2026-12-02T10:00:00Z", ends_at: "2026-12-02T11:00:00Z" });
    const seis = ev({ id: "seis", age_min: 6, age_max: 12, starts_at: "2026-12-09T10:00:00Z", ends_at: "2026-12-09T11:00:00Z" });
    expect(buildList([bebes, seis], { ...base, childAges: [8] }).map((x) => x.event.id)).toEqual(["seis", "bebes"]);
  });
});

describe("repetição semanal", () => {
  const semanal = ev({
    id: "parque", kind: "encontro",
    starts_at: "2026-12-02T10:00:00Z", ends_at: "2026-12-02T12:00:00Z",
    recurrence: "weekly", recurrence_until: "2026-12-30",
  });

  it("dá uma ocorrência por semana até à data de fim", () => {
    const occ = occurrences(semanal, from, to);
    expect(occ).toHaveLength(5); // 2, 9, 16, 23 e 30 de dezembro
    expect(occ[4].start.toISOString().slice(0, 10)).toBe("2026-12-30");
  });

  it("aparece uma só vez na lista, pela próxima ocorrência", () => {
    const list = buildList([semanal], { ...base, from: new Date("2026-12-10T00:00:00Z") });
    expect(list).toHaveLength(1);
    expect(list[0].occurrence.start.toISOString().slice(0, 10)).toBe("2026-12-16");
  });

  it("um evento de vários dias a decorrer conta como hoje", () => {
    const vila = ev({ id: "vila", starts_at: "2026-11-27T10:00:00Z", ends_at: "2027-01-03T20:00:00Z" });
    const now = new Date("2026-12-15T09:00:00Z");
    expect(nextOccurrence(vila, now)?.start.toISOString().slice(0, 10)).toBe("2026-11-27");
    expect(buildList([vila], { ...base, from: now })).toHaveLength(1);
  });

  it("os eventos passados saem da lista", () => {
    const passado = ev({ id: "p", starts_at: "2026-11-01T10:00:00Z", ends_at: "2026-11-01T12:00:00Z" });
    expect(buildList([passado], base)).toHaveLength(0);
  });

  it("os cancelados e pendentes não aparecem", () => {
    expect(buildList([ev({ id: "c", status: "cancelado" }), ev({ id: "p", status: "pendente" })], base)).toHaveLength(0);
  });
});

describe("filtros", () => {
  it("grátis, tipo e categoria", () => {
    const pago = ev({ id: "pago", is_free: false });
    const enc = ev({ id: "enc", kind: "encontro", categories: ["natureza"] });
    expect(buildList([pago, enc], { ...base, onlyFree: true }).map((x) => x.event.id)).toEqual(["enc"]);
    expect(buildList([pago, enc], { ...base, kind: "encontro" }).map((x) => x.event.id)).toEqual(["enc"]);
    expect(buildList([pago, enc], { ...base, category: "arte_manuais" }).map((x) => x.event.id)).toEqual(["pago"]);
  });
});

describe("O que preferimos", () => {
  it("pré-preenche a partir dos interesses, só com 'primeiro'", () => {
    const p = prefsFromInterests(["Artesanato", "Animais", "Robótica"]);
    expect(p).toEqual({ arte_manuais: "primeiro", natureza: "primeiro", ciencia: "primeiro" });
    expect(Object.values(prefsFromInterests(["Futebol", "Teatro", "Leitura"]))).not.toContain("esconder");
  });

  it("limpa valores desconhecidos vindos da base de dados", () => {
    expect(cleanPrefs({ encontros: "primeiro", magia: "esconder", natureza: "normal", ciencia: 3 })).toEqual({ encontros: "primeiro" });
    expect(cleanPrefs(null)).toEqual({});
  });
});
