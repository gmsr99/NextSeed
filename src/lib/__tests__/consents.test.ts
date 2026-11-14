import { describe, it, expect, vi } from "vitest";
vi.mock("../supabase", () => ({ supabase: {} }));
vi.mock("@/lib/supabase", () => ({ supabase: {} }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({}) }));
const { currentConsents } = await import("../../hooks/useConsents");

const row = (purpose: "termos" | "melhoria_produto", granted: boolean, terms_version: string, created_at: string) =>
  ({ purpose, granted, terms_version, created_at });

describe("currentConsents (B-09)", () => {
  it("sem registos: termos por aceitar e melhoria do produto ligada", () => {
    expect(currentConsents([])).toEqual({ termsVersion: null, productImprovement: true });
  });

  it("conta a linha mais recente de cada finalidade", () => {
    expect(currentConsents([
      row("termos", true, "1.0", "2026-05-01T10:00:00Z"),
      row("termos", true, "2.0", "2026-11-14T10:00:00Z"),
      row("melhoria_produto", false, "2.0", "2026-11-14T10:00:00Z"),
      row("melhoria_produto", true, "1.0", "2026-06-01T10:00:00Z"),
    ])).toEqual({ termsVersion: "2.0", productImprovement: false });
  });
});
