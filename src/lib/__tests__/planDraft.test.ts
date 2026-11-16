import { describe, it, expect, beforeEach } from "vitest";
import { clearPlanDrafts, loadDraft, removeDraft, saveDraft, type PlanDraft } from "../planDraft";

const draft: PlanDraft = {
  childInterests: { c1: ["dinossauros"] }, weeklyContent: {}, fridayActivity: "", notes: "n", weeklyReadingTheme: "", weekTheme: "",
  step: "preview", planItems: [{ child_id: "c1", day_of_week: 1, time_slot: "09:00", discipline: "portugues", title: "t", description: "d", materials: [], is_friday_world: false, sort_order: 1 }],
  planId: null, isNewGeneration: true,
};

describe("planDraft", () => {
  beforeEach(() => localStorage.clear());
  it("guarda e repõe por família e semana", () => {
    saveDraft("f1", "2026-11-16", draft);
    expect(loadDraft("f1", "2026-11-16")).toEqual(draft);
    expect(loadDraft("f1", "2026-11-23")).toBeNull();
    expect(loadDraft("f2", "2026-11-16")).toBeNull();
  });
  it("apaga ao guardar o plano e ao terminar a sessão", () => {
    saveDraft("f1", "2026-11-16", draft);
    saveDraft("f1", "2026-11-23", draft);
    localStorage.setItem("outra-coisa", "1");
    removeDraft("f1", "2026-11-16");
    expect(loadDraft("f1", "2026-11-16")).toBeNull();
    clearPlanDrafts();
    expect(loadDraft("f1", "2026-11-23")).toBeNull();
    expect(localStorage.getItem("outra-coisa")).toBe("1");
  });
  it("ignora rascunhos antigos ou estragados", () => {
    localStorage.setItem("nexseed:plano-rascunho:f1:2026-11-16", JSON.stringify({ savedAt: Date.now() - 20 * 86400000, draft }));
    expect(loadDraft("f1", "2026-11-16")).toBeNull();
    localStorage.setItem("nexseed:plano-rascunho:f1:2026-11-16", "{");
    expect(loadDraft("f1", "2026-11-16")).toBeNull();
  });
});
