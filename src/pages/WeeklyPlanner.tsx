import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { format, addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import PostWeekProgressDialog from "@/components/PostWeekProgressDialog";
import {
  VersionBadge,
  PlannerForm,
  PlanActions,
  ExtracurricularsCard,
  PlanPreview,
} from "@/components/planner";
import { useChildren } from "@/hooks/useChildren";
import { useExtracurricular } from "@/hooks/useExtracurricular";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  generateWeeklyPlan,
  getNextMonday,
  formatWeekRange,
  type GeneratedPlanItem,
} from "@/lib/planGenerator";
import { generateWithGemini } from "@/lib/geminiPlanner";
import { YEAR_MAP } from "@/lib/gcConstants";

type Step = "form" | "preview";

// ─── Persistência do campo "notes" (backward compat) ─────────────────────────
function parseNotesField(raw: string | null): { notes: string; readingTheme: string } {
  if (!raw) return { notes: "", readingTheme: "" };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "notes" in parsed) {
      return { notes: parsed.notes ?? "", readingTheme: parsed.readingTheme ?? "" };
    }
  } catch { /* string simples */ }
  return { notes: raw, readingTheme: "" };
}

function serializeNotesField(notes: string, readingTheme: string): string | null {
  if (!notes && !readingTheme) return null;
  if (!readingTheme) return notes;
  return JSON.stringify({ notes, readingTheme });
}

// Keep serializeNotesField in scope — used indirectly for backward compat
void serializeNotesField;

export default function WeeklyPlanner() {
  const { children, isLoading: childrenLoading } = useChildren();
  const { family } = useAuth();
  const { activities: extracurriculars } = useExtracurricular();

  const [weekStart, setWeekStart] = useState<Date>(getNextMonday());
  const [weekStartReady, setWeekStartReady] = useState(false);
  const [childInterests, setChildInterests] = useState<Record<string, string[]>>({});
  const [fridayActivity, setFridayActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [weeklyReadingTheme, setWeeklyReadingTheme] = useState("");

  const [step, setStep] = useState<Step>("form");
  const [planItems, setPlanItems] = useState<GeneratedPlanItem[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planVersion, setPlanVersion] = useState<number>(1);
  const [isNewGeneration, setIsNewGeneration] = useState(false);
  const [planHistory, setPlanHistory] = useState<Array<{ id: string; version: number; generated_at: string | null }>>([]);

  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Seleciona automaticamente a semana mais próxima sem plano
  useEffect(() => {
    if (!family || childrenLoading) return;

    const pickInitialWeek = async () => {
      const thisMonday = getNextMonday();
      const nextMonday = addDays(thisMonday, 7);

      const { data: plans } = await supabase
        .from("weekly_plans")
        .select("week_start")
        .eq("family_id", family.id)
        .in("week_start", [format(thisMonday, "yyyy-MM-dd"), format(nextMonday, "yyyy-MM-dd")]);

      const planned = new Set(plans?.map((p) => p.week_start) ?? []);

      if (!planned.has(format(thisMonday, "yyyy-MM-dd"))) {
        setWeekStart(thisMonday);
      } else if (!planned.has(format(nextMonday, "yyyy-MM-dd"))) {
        setWeekStart(nextMonday);
      } else {
        setWeekStart(thisMonday);
      }

      setWeekStartReady(true);
    };

    pickInitialWeek();
  }, [family, childrenLoading]);

  // Carrega (ou limpa) o plano sempre que a semana selecionada muda
  useEffect(() => {
    if (!family || !weekStartReady) return;

    setPlanId(null);
    setPlanItems([]);
    setPlanVersion(1);
    setIsNewGeneration(false);
    setPlanHistory([]);
    setSent(false);
    setError(null);
    setStep("form");
    setWeeklyReadingTheme("");
    setLoadingExisting(true);

    const loadExisting = async () => {
      try {
        const { data: plans } = await supabase
          .from("weekly_plans")
          .select("id, version, generated_at, child_interests, friday_activity, notes, reading_theme, status")
          .eq("family_id", family.id)
          .eq("week_start", format(weekStart, "yyyy-MM-dd"))
          .order("version", { ascending: false });

        if (!plans?.length) {
          const defaultInterests: Record<string, string[]> = {};
          children.forEach((c) => {
            if (c.interests?.length) defaultInterests[c.id] = c.interests;
          });
          setChildInterests(defaultInterests);
          setFridayActivity("");
          setNotes("");
          setWeeklyReadingTheme("");
          return;
        }

        setPlanHistory(plans.map((p) => ({
          id: p.id,
          version: p.version ?? 1,
          generated_at: p.generated_at ?? null,
        })));

        const plan = plans[0];

        const { data: items } = await supabase
          .from("weekly_plan_items")
          .select("child_id, day_of_week, time_slot, discipline, title, description, materials, is_friday_world, sort_order")
          .eq("plan_id", plan.id)
          .order("day_of_week")
          .order("sort_order");

        if (!items?.length) return;

        setPlanId(plan.id);
        setPlanVersion(plan.version ?? 1);
        setIsNewGeneration(false);
        setPlanItems(items as GeneratedPlanItem[]);
        setFridayActivity(plan.friday_activity ?? "");

        if (plan.reading_theme != null) {
          setWeeklyReadingTheme(plan.reading_theme);
          setNotes(plan.notes ?? "");
        } else {
          const parsedNotes = parseNotesField(plan.notes);
          setNotes(parsedNotes.notes);
          setWeeklyReadingTheme(parsedNotes.readingTheme);
        }

        const interests = plan.child_interests as Record<string, string[]> | null;
        if (interests) setChildInterests(interests);
        if (plan.status === "sent") setSent(true);
        setStep("preview");
      } finally {
        setLoadingExisting(false);
      }
    };

    loadExisting();
  }, [family, weekStart, weekStartReady]);

  const goToPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goToNextWeek = () => setWeekStart((d) => addDays(d, 7));

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);
    setPlanId(null);
    setIsNewGeneration(true);
    try {
      setGeneratingStep("A consultar o currículo NexSeed...");
      const schoolYears = [...new Set(children.map((c) => c.school_year))];
      const { data: nexseedRows } = await supabase
        .from("nexseed_curriculum")
        .select("school_year, discipline_key, objective")
        .in("school_year", schoolYears);

      const nexseedByYear: Record<string, Record<string, string[]>> = {};
      for (const row of nexseedRows ?? []) {
        if (!nexseedByYear[row.school_year]) nexseedByYear[row.school_year] = {};
        if (!nexseedByYear[row.school_year][row.discipline_key]) nexseedByYear[row.school_year][row.discipline_key] = [];
        nexseedByYear[row.school_year][row.discipline_key].push(row.objective);
      }

      setGeneratingStep("A consultar o progresso curricular...");
      const gcProgressByChild: Record<string, Record<string, string[]>> = {};
      const gcAllByChild: Record<string, Record<string, string[]>> = {};
      const gcChildren = children.filter((c) => YEAR_MAP[c.school_year]);
      await Promise.all(
        gcChildren.map(async (child) => {
          const dbYear = YEAR_MAP[child.school_year];

          const { data: allContents } = await supabase
            .from("curriculum_contents")
            .select("id, discipline, content")
            .eq("school_year", dbYear);

          const { data: progressRows } = await supabase
            .from("child_content_progress")
            .select("content_id, status")
            .eq("child_id", child.id);

          if (!allContents?.length) return;

          const progressMap = new Map((progressRows ?? []).map((p) => [p.content_id, p.status]));

          for (const c of allContents) {
            const status = progressMap.get(c.id) ?? "a_aprender";
            if (status === "dominado") continue;

            if (!gcAllByChild[child.id]) gcAllByChild[child.id] = {};
            if (!gcAllByChild[child.id][c.discipline]) gcAllByChild[child.id][c.discipline] = [];
            gcAllByChild[child.id][c.discipline].push(c.content);

            if (status === "em_progresso") {
              if (!gcProgressByChild[child.id]) gcProgressByChild[child.id] = {};
              if (!gcProgressByChild[child.id][c.discipline]) gcProgressByChild[child.id][c.discipline] = [];
              gcProgressByChild[child.id][c.discipline].push(`[em progresso] ${c.content}`);
            }
          }
        })
      );

      for (const child of gcChildren) {
        if (!gcProgressByChild[child.id] && gcAllByChild[child.id]) {
          gcProgressByChild[child.id] = {};
          for (const [discipline, contents] of Object.entries(gcAllByChild[child.id])) {
            gcProgressByChild[child.id][discipline] = contents.map((c) => `[a aprender] ${c}`);
          }
        }
      }

      setGeneratingStep("A gerar atividades com IA...");
      const items = await generateWithGemini(children, childInterests, fridayActivity, weeklyReadingTheme, nexseedByYear, gcProgressByChild, gcAllByChild);

      setGeneratingStep("A montar o horário...");
      setPlanItems(items);
      setStep("preview");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("AI falhou:", msg);
      setGeneratingStep("A usar templates locais...");
      const items = generateWeeklyPlan(children, childInterests, fridayActivity, weeklyReadingTheme);
      setPlanItems(items);
      setStep("preview");
      setError(`IA indisponível (${msg}) — plano gerado com templates.`);
    } finally {
      setGenerating(false);
      setGeneratingStep("");
    }
  };

  const persistPlan = async (): Promise<string> => {
    if (!family) throw new Error("Família não encontrada");

    const weekKey = format(weekStart, "yyyy-MM-dd");
    const planPayload = {
      family_id: family.id,
      week_start: weekKey,
      child_interests: childInterests,
      friday_activity: fridayActivity || null,
      notes: notes || null,
      reading_theme: weeklyReadingTheme || null,
      status: "generated",
      generated_at: new Date().toISOString(),
    };

    let savedPlanId: string;
    let savedVersion: number;

    if (!isNewGeneration && planId) {
      const { data: plan, error: planErr } = await supabase
        .from("weekly_plans")
        .update(planPayload)
        .eq("id", planId)
        .select("id, version")
        .single();
      if (planErr) throw planErr;
      savedPlanId = plan.id;
      savedVersion = plan.version ?? planVersion;
    } else {
      const { data: versionRows } = await supabase
        .from("weekly_plans")
        .select("version")
        .eq("family_id", family.id)
        .eq("week_start", weekKey)
        .order("version", { ascending: false })
        .limit(1);

      const nextVersion = (versionRows?.[0]?.version ?? 0) + 1;

      const { data: plan, error: planErr } = await supabase
        .from("weekly_plans")
        .insert({ ...planPayload, version: nextVersion })
        .select("id, version")
        .single();
      if (planErr) throw planErr;
      savedPlanId = plan.id;
      savedVersion = plan.version ?? nextVersion;

      const newEntry = { id: savedPlanId, version: savedVersion, generated_at: planPayload.generated_at };
      setPlanHistory((prev) => [newEntry, ...prev]);
    }

    setPlanId(savedPlanId);
    setPlanVersion(savedVersion);
    setIsNewGeneration(false);

    await supabase.from("weekly_plan_items").delete().eq("plan_id", savedPlanId);
    const itemsToInsert = planItems.map((item) => ({ ...item, plan_id: savedPlanId }));
    const { error: itemsErr } = await supabase.from("weekly_plan_items").insert(itemsToInsert);
    if (itemsErr) throw itemsErr;

    await Promise.all(
      Object.entries(childInterests).map(([childId, interests]) =>
        interests.length > 0
          ? supabase.from("children").update({ interests, updated_at: new Date().toISOString() }).eq("id", childId)
          : Promise.resolve()
      )
    );

    return savedPlanId;
  };

  const handleRestoreVersion = async (targetId: string) => {
    const { data: items } = await supabase
      .from("weekly_plan_items")
      .select("child_id, day_of_week, time_slot, discipline, title, description, materials, is_friday_world, sort_order")
      .eq("plan_id", targetId)
      .order("day_of_week")
      .order("sort_order");

    if (!items?.length) return;

    const targetEntry = planHistory.find((h) => h.id === targetId);
    setPlanId(targetId);
    setPlanVersion(targetEntry?.version ?? 1);
    setIsNewGeneration(false);
    setPlanItems(items as GeneratedPlanItem[]);
  };

  const handleSavePlan = async () => {
    const wasNewGeneration = isNewGeneration;
    setSaving(true);
    setError(null);
    try {
      await persistPlan();
      if (wasNewGeneration) setShowProgressDialog(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDFs = async () => {
    const familyName = family?.name ?? "Família";

    const { default: SchedulePDFComp } = await import("@/components/pdf/SchedulePDF");
    const scheduleBlob = await pdf(
      <SchedulePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} extracurriculars={extracurriculars} />
    ).toBlob();
    const a1 = document.createElement("a");
    a1.href = URL.createObjectURL(scheduleBlob);
    a1.download = `nexseed-horario-${format(weekStart, "yyyy-MM-dd")}.pdf`;
    a1.click();

    const { default: ActivityGuidePDFComp } = await import("@/components/pdf/ActivityGuidePDF");
    const guideBlob = await pdf(
      <ActivityGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
    ).toBlob();
    const a2 = document.createElement("a");
    a2.href = URL.createObjectURL(guideBlob);
    a2.download = `nexseed-guia-${format(weekStart, "yyyy-MM-dd")}.pdf`;
    a2.click();
  };

  const handleSendEmail = async () => {
    if (!family) return;
    setSending(true);
    setError(null);
    try {
      const { error: sessionErr } = await supabase.auth.refreshSession();
      if (sessionErr) throw new Error("Sessão expirada. Por favor recarrega a página.");

      const savedPlanId = planId ?? await persistPlan();
      const familyName = family.name;

      const { default: SchedulePDFComp } = await import("@/components/pdf/SchedulePDF");
      const scheduleBlob = await pdf(
        <SchedulePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} extracurriculars={extracurriculars} />
      ).toBlob();

      const { default: ActivityGuidePDFComp } = await import("@/components/pdf/ActivityGuidePDF");
      const guideBlob = await pdf(
        <ActivityGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
      ).toBlob();

      const toBase64 = (blob: Blob): Promise<string> =>
        new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res((reader.result as string).split(",")[1]);
          reader.readAsDataURL(blob);
        });

      const scheduleB64 = await toBase64(scheduleBlob);
      const guideB64 = await toBase64(guideBlob);

      const { error: fnErr } = await supabase.functions.invoke("send-weekly-plan", {
        body: {
          to: family.email,
          familyId: family.id,
          familyName,
          weekLabel: formatWeekRange(weekStart),
          scheduleB64,
          guideB64,
          scheduleName: `nexseed-horario-${format(weekStart, "yyyy-MM-dd")}.pdf`,
          guideName: `nexseed-guia-${format(weekStart, "yyyy-MM-dd")}.pdf`,
        },
      });

      if (fnErr) {
        let detail = fnErr.message;
        try {
          const body = await (fnErr as unknown as { context: Response }).context.json();
          detail = body?.error ?? JSON.stringify(body);
        } catch {
          try {
            detail = await (fnErr as unknown as { context: Response }).context.text();
          } catch { /* usa mensagem original */ }
        }
        throw new Error(detail);
      }

      await supabase
        .from("weekly_plans")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", savedPlanId);

      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao enviar email");
    } finally {
      setSending(false);
    }
  };

  if (childrenLoading || loadingExisting) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Planeador Semanal</h1>
          <p className="text-muted-foreground mt-1">
            {step === "form"
              ? (planId ? "Ajusta os interesses e regenera o plano." : "Preenche os interesses e recebe o plano completo por email.")
              : `${planId ? "Plano guardado" : "Plano gerado"} · ${formatWeekRange(weekStart)}`}
          </p>
        </div>

        {step === "form" ? (
          <PlannerForm
            children={children}
            childInterests={childInterests}
            onChildInterestsChange={(childId, tags) =>
              setChildInterests((prev) => ({ ...prev, [childId]: tags }))
            }
            fridayActivity={fridayActivity}
            onFridayActivityChange={setFridayActivity}
            weeklyReadingTheme={weeklyReadingTheme}
            onWeeklyReadingThemeChange={setWeeklyReadingTheme}
            notes={notes}
            onNotesChange={setNotes}
            weekStart={weekStart}
            onPrevWeek={goToPrevWeek}
            onNextWeek={goToNextWeek}
            generating={generating}
            generatingStep={generatingStep}
            onGenerate={handleGeneratePlan}
          />
        ) : (
          <div className="space-y-6">
            <PlanActions
              planId={planId}
              saving={saving}
              sending={sending}
              sent={sent}
              onBack={() => setStep("form")}
              onSave={handleSavePlan}
              onDownload={handleDownloadPDFs}
              onSendEmail={handleSendEmail}
            />

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <VersionBadge
              version={planVersion}
              history={planHistory}
              isUnsaved={isNewGeneration && !planId}
              onRestore={handleRestoreVersion}
            />

            <ExtracurricularsCard
              extracurriculars={extracurriculars}
              children={children}
            />

            <PlanPreview
              children={children}
              planItems={planItems}
            />
          </div>
        )}
      </div>

      <PostWeekProgressDialog
        open={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        familyChildren={children}
        planItems={planItems}
      />
    </AppLayout>
  );
}
