// Rascunho do Plano Semanal, guardado só neste dispositivo, para não se perder
// o formulário nem um plano gerado e ainda não guardado quando se sai da página.
// Apaga-se ao guardar o plano e ao terminar a sessão.

import type { GeneratedPlanItem } from "./planGenerator";
import type { OutingPart } from "./familyRoutine";

const PREFIX = "nexseed:plano-rascunho:";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export interface PlanDraft {
  childInterests: Record<string, string[]>;
  weeklyContent: Record<string, Record<string, string>>;
  fridayActivity: string;
  /** P-31: a Ver Mundo escolhida só para esta semana (null = a de "A vossa semana") */
  weekOutings?: OutingPart[] | null;
  notes: string;
  weeklyReadingTheme: string;
  weekTheme: string;
  step: "form" | "preview";
  planItems: GeneratedPlanItem[];
  planId: string | null;
  isNewGeneration: boolean;
}

const key = (familyId: string, weekKey: string) => `${PREFIX}${familyId}:${weekKey}`;

export function saveDraft(familyId: string, weekKey: string, draft: PlanDraft): void {
  try {
    localStorage.setItem(key(familyId, weekKey), JSON.stringify({ savedAt: Date.now(), draft }));
  } catch { /* sem espaço ou sem acesso: fica sem rascunho */ }
}

export function loadDraft(familyId: string, weekKey: string): PlanDraft | null {
  try {
    const raw = localStorage.getItem(key(familyId, weekKey));
    if (!raw) return null;
    const { savedAt, draft } = JSON.parse(raw) as { savedAt: number; draft: PlanDraft };
    if (!draft || typeof savedAt !== "number" || Date.now() - savedAt > MAX_AGE_MS || !Array.isArray(draft.planItems)) {
      localStorage.removeItem(key(familyId, weekKey));
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function removeDraft(familyId: string, weekKey: string): void {
  try { localStorage.removeItem(key(familyId, weekKey)); } catch { /* ignora */ }
}

export function clearPlanDrafts(): void {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) localStorage.removeItem(k);
    }
  } catch { /* ignora */ }
}
