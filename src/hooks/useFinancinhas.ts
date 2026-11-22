// Financinhas · dados da família (migração 031) e ações.
// Enquanto a migração não estiver aplicada, `available` fica a false e a
// página mostra um aviso em vez de partir.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import type { FinLesson, FinProfile, FinRitual, FinSignal, FinSkillEvent, FinSnapshot, Json } from "@/lib/types";
import { generateLesson, type GenerationContext, type InvokeModel } from "@/lib/financinhas/generator";
import { currentLevels, levelAfterConfirm, nextTarget } from "@/lib/financinhas/levels";
import { ritualSignals, type RitualEntry } from "@/lib/financinhas/ritual";
import type { ImportedLesson, ImportedLevel } from "@/lib/financinhas/importer";

export interface FinData {
  available: boolean;
  profiles: FinProfile[];
  lessons: FinLesson[];
  signals: FinSignal[];
  events: FinSkillEvent[];
  rituals: FinRitual[];
  snapshots: FinSnapshot[];
}

const EMPTY: FinData = { available: false, profiles: [], lessons: [], signals: [], events: [], rituals: [], snapshots: [] };

async function fetchAll(familyId: string): Promise<FinData> {
  const [p, l, s, e, r, n] = await Promise.all([
    supabase.from("fin_profiles").select("*").eq("family_id", familyId),
    supabase.from("fin_lessons").select("*").eq("family_id", familyId).order("created_at"),
    supabase.from("fin_signals").select("*").eq("family_id", familyId).order("created_at"),
    supabase.from("fin_skill_events").select("*").eq("family_id", familyId).order("observed_on"),
    supabase.from("fin_rituals").select("*").eq("family_id", familyId).order("week_start"),
    supabase.from("fin_snapshots").select("*").eq("family_id", familyId),
  ]);
  // Tabela inexistente (migração por aplicar) → módulo indisponível
  if (p.error) return EMPTY;
  return {
    available: true,
    profiles: (p.data ?? []) as FinProfile[],
    lessons: (l.data ?? []) as FinLesson[],
    signals: (s.data ?? []) as FinSignal[],
    events: (e.data ?? []) as FinSkillEvent[],
    rituals: (r.data ?? []) as FinRitual[],
    snapshots: (n.data ?? []) as FinSnapshot[],
  };
}

/** Pedido ao Gemini através do proxy autenticado (nunca a partir do cliente diretamente). */
export const invokeGemini: InvokeModel = async (prompt, schema) => {
  const { data, error } = await supabase.functions.invoke("generate-weekly-plan", {
    body: { prompt, responseSchema: schema, temperature: 0.9 },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(`${data.error}${data.detail ? ` — ${data.detail}` : ""}`);
  return String(data?.text ?? "");
};

const today = () => new Date().toISOString().slice(0, 10);

export function useFinancinhas() {
  const { family } = useAuth();
  const qc = useQueryClient();
  const key = ["financinhas", family?.id];

  const { data = EMPTY, isLoading } = useQuery({
    queryKey: key,
    enabled: !!family,
    queryFn: () => fetchAll(family!.id),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });
  const fid = () => family!.id;

  const saveProfile = useMutation({
    mutationFn: async (p: { child_id: string; stage: "trilho" | "ciclo"; allowance_cents: number | null; ritual_weekday: number; character_mode?: "generico" | "original"; isNew?: boolean }) => {
      const { isNew, ...row } = p;
      const { error } = await supabase.from("fin_profiles").upsert({ ...row, family_id: fid(), updated_at: new Date().toISOString() });
      if (error) throw error;
      if (isNew) track("financinhas_started", { stage: p.stage });
    },
    onSuccess: invalidate,
  });

  const saveSnapshot = useMutation({
    mutationFn: async (s: { child_id: string; kind: "entrada" | "saida"; answers: Record<string, string> }) => {
      const { error } = await supabase.from("fin_snapshots").upsert(
        { child_id: s.child_id, kind: s.kind, answers: s.answers as unknown as Json, family_id: fid(), taken_on: today() },
        { onConflict: "child_id,kind" },
      );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Gera a aula com IA e guarda-a "por dar", com os sinais "o que observar". */
  const createLesson = useMutation({
    mutationFn: async ({ childId, ctx }: { childId: string; ctx: GenerationContext }) => {
      const date = today();
      const a = await generateLesson(ctx, invokeGemini, date);
      const plan = ctx.plan;
      const { data: row, error } = await supabase.from("fin_lessons").insert({
        family_id: fid(), child_id: childId, status: "por_dar", tier: plan.tier,
        track_session: plan.trackSession, theme_numbers: plan.themeNumbers,
        skill_codes: [...plan.skills, ...plan.reinforce], discovery_mode: plan.mode,
        protagonist: plan.protagonist, module_week: plan.moduleWeek,
        universe: ctx.interest || a.universe || null, real_situation: ctx.situation?.trim() || null,
        title: a.title, notebook_prompt: a.notebook_prompt, quiz_md: a.quiz_md, activities_md: a.activities_md,
        challenge_md: a.challenge_md || null, adult_guide_md: a.adult_guide_md, tracking_md: a.tracking_md,
        content_md: a.content_md, notes: ctx.extra?.trim() || null, source: "app",
      }).select().single();
      if (error) throw error;
      if (a.signals.length) {
        const levels = currentLevels(data.events.filter((e) => e.child_id === childId));
        const { error: sErr } = await supabase.from("fin_signals").insert(a.signals.map((s) => ({
          family_id: fid(), child_id: childId, lesson_id: row.id, origin: "aula" as const, skill_code: s.skill_code,
          target_level: nextTarget(levels[s.skill_code]), description: s.description,
        })));
        if (sErr) throw sErr;
      }
      track("financinhas_lesson_generated", { tier: plan.tier, kind: plan.kind, trimmed: a.trimmed });
      return row as FinLesson;
    },
    onSuccess: invalidate,
  });

  const markGiven = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase.from("fin_lessons").update({ status: "dada", given_on: date, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      track("financinhas_lesson_given", {});
    },
    onSuccess: invalidate,
  });

  const updateLessonNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase.from("fin_lessons").update({ notes, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fin_lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Confirmar sobe o nível (nunca o faz descer); descartar só fecha o sinal. */
  const resolveSignal = useMutation({
    mutationFn: async ({ signal, confirm, date, note }: { signal: FinSignal; confirm: boolean; date: string; note?: string }) => {
      const { error } = await supabase.from("fin_signals")
        .update({ status: confirm ? "confirmado" : "descartado", resolved_on: date })
        .eq("id", signal.id);
      if (error) throw error;
      if (confirm) {
        const levels = currentLevels(data.events.filter((e) => e.child_id === signal.child_id));
        const { error: eErr } = await supabase.from("fin_skill_events").insert({
          family_id: fid(), child_id: signal.child_id, skill_code: signal.skill_code,
          level: levelAfterConfirm(levels[signal.skill_code], signal.target_level),
          origin: "observacao", note: note?.trim() || signal.description, observed_on: date, signal_id: signal.id,
        });
        if (eErr) throw eErr;
      }
      track("financinhas_signal_resolved", { confirmed: confirm, origin: signal.origin });
    },
    onSuccess: invalidate,
  });

  /** Observação livre (sem sinal) ou ajuste manual do adulto. */
  const addEvent = useMutation({
    mutationFn: async (e: { child_id: string; skill_code: string; level: number; origin: "observacao" | "ajuste" | "fotografia"; note: string; observed_on: string }) => {
      const { error } = await supabase.from("fin_skill_events").insert({ ...e, family_id: fid(), note: e.note.trim() || null });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Regista o ritual da semana e propõe os sinais que ele dá (DC1, GP3). */
  const saveRitual = useMutation({
    mutationFn: async ({ childId, weekStart, entry }: { childId: string; weekStart: string; entry: RitualEntry }) => {
      const { error } = await supabase.from("fin_rituals").upsert({
        ...entry, choice_text: entry.choice_text?.trim() || null, question: entry.question?.trim() || null,
        child_id: childId, week_start: weekStart, family_id: fid(), updated_at: new Date().toISOString(),
      }, { onConflict: "child_id,week_start" });
      if (error) throw error;
      const levels = currentLevels(data.events.filter((e) => e.child_id === childId));
      const pendingRitual = new Set(
        data.signals.filter((s) => s.child_id === childId && s.origin === "ritual" && s.status === "pendente").map((s) => s.skill_code),
      );
      const proposed = ritualSignals(entry, levels).filter((s) => !pendingRitual.has(s.skill_code));
      if (proposed.length) {
        const { error: sErr } = await supabase.from("fin_signals").insert(proposed.map((s) => ({
          ...s, family_id: fid(), child_id: childId, origin: "ritual" as const,
        })));
        if (sErr) throw sErr;
      }
      track("financinhas_ritual_logged", { done: entry.done });
    },
    onSuccess: invalidate,
  });

  /** Importa o histórico já filtrado (sem duplicados) por planImport. */
  const importHistory = useMutation({
    mutationFn: async ({ lessons, levels }: { lessons: (ImportedLesson & { child_id: string })[]; levels: (ImportedLevel & { child_id: string })[] }) => {
      if (lessons.length) {
        const rows = lessons.map((l) => ({
          family_id: fid(), child_id: l.child_id, status: (l.given_on ? "dada" : "por_dar") as "dada" | "por_dar",
          given_on: l.given_on, track_session: l.track_session, theme_numbers: l.theme_numbers, skill_codes: l.skill_codes,
          discovery_mode: l.discovery_mode, protagonist: l.protagonist, universe: l.universe, title: l.title,
          notebook_prompt: l.notebook_prompt && l.notebook_prompt.length <= 5000 ? l.notebook_prompt : null,
          quiz_md: l.quiz_md, activities_md: l.activities_md, challenge_md: l.challenge_md,
          adult_guide_md: l.adult_guide_md, tracking_md: l.tracking_md,
          content_md: l.content_md ?? (l.notebook_prompt && l.notebook_prompt.length > 5000 ? l.notebook_prompt : null),
          notes: l.notes, source: "importada" as const,
        }));
        const { error } = await supabase.from("fin_lessons").insert(rows);
        if (error) throw error;
      }
      // Níveis só entram para crianças que ainda não têm fotografia (não duplica)
      const withPhoto = new Set(data.events.filter((e) => e.origin === "fotografia").map((e) => e.child_id));
      const lv = levels.filter((l) => !withPhoto.has(l.child_id));
      if (lv.length) {
        const { error } = await supabase.from("fin_skill_events").insert(lv.map((l) => ({
          family_id: fid(), child_id: l.child_id, skill_code: l.skill_code, level: l.level, origin: "fotografia" as const,
          note: l.note ?? "Importado do histórico", observed_on: l.observed_on ?? today(),
        })));
        if (error) throw error;
      }
      return { lessons: lessons.length, levels: lv.length };
    },
    onSuccess: invalidate,
  });

  return {
    data, isLoading,
    saveProfile, saveSnapshot, createLesson, markGiven, updateLessonNotes, deleteLesson,
    resolveSignal, addEvent, saveRitual, importHistory,
  };
}
