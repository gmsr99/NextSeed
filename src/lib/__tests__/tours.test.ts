import { describe, it, expect, beforeEach } from "vitest";
import { TOURS, getTour, getToursForRoute, getSeenTours, markTourSeen } from "@/lib/tours";

describe("definições dos tours", () => {
  it("todos os tours têm id, nome, rota e pelo menos 2 passos", () => {
    for (const tour of TOURS) {
      expect(tour.id).toBeTruthy();
      expect(tour.name).toBeTruthy();
      expect(tour.route.startsWith("/")).toBe(true);
      expect(tour.steps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("cada passo tem título e corpo", () => {
    for (const tour of TOURS) {
      for (const step of tour.steps) {
        expect(step.title).toBeTruthy();
        expect(step.body).toBeTruthy();
      }
    }
  });

  it("os targets são únicos dentro de cada tour", () => {
    for (const tour of TOURS) {
      const targets = tour.steps.map((s) => s.target).filter(Boolean);
      expect(new Set(targets).size).toBe(targets.length);
    }
  });

  it("tours com autoStart não partilham rota entre si", () => {
    const autoRoutes = TOURS.filter((t) => t.autoStart).map((t) => t.route);
    expect(new Set(autoRoutes).size).toBe(autoRoutes.length);
  });

  it("getTour devolve o tour pelo id", () => {
    expect(getTour("boas-vindas")?.route).toBe("/");
    expect(getTour("planeador")?.route).toBe("/weekly-planner");
  });

  it("getToursForRoute devolve os dois tours do planeador", () => {
    const tours = getToursForRoute("/weekly-planner");
    expect(tours.map((t) => t.id).sort()).toEqual(["planeador", "plano-gerado"]);
    expect(getToursForRoute("/rota-inexistente")).toEqual([]);
  });
});

describe("persistência de tours vistos", () => {
  const USER = "user-teste-123";

  beforeEach(() => {
    localStorage.clear();
  });

  it("começa vazio e regista tours vistos por utilizador", () => {
    expect(getSeenTours(USER)).toEqual({});
    markTourSeen(USER, "boas-vindas");
    expect(Object.keys(getSeenTours(USER))).toEqual(["boas-vindas"]);
    // Outro utilizador não é afetado
    expect(getSeenTours("outro-user")).toEqual({});
  });

  it("acumula vários tours e guarda timestamps ISO", () => {
    markTourSeen(USER, "boas-vindas");
    markTourSeen(USER, "planeador");
    const seen = getSeenTours(USER);
    expect(Object.keys(seen).sort()).toEqual(["boas-vindas", "planeador"]);
    expect(new Date(seen["planeador"]).getTime()).not.toBeNaN();
  });

  it("sobrevive a localStorage corrompido", () => {
    localStorage.setItem(`nexseed_tours_seen:${USER}`, "{{{não é json");
    expect(getSeenTours(USER)).toEqual({});
    markTourSeen(USER, "diario");
    expect(Object.keys(getSeenTours(USER))).toEqual(["diario"]);
  });
});
