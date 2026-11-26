import { useState, useEffect, useMemo, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import { format, addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import WeekCloseDialog from "@/components/WeekCloseDialog";
import {
  VersionBadge,
  PlannerForm,
  PlanActions,
  ExtracurricularsCard,
  PlanPreview,
  planItemKey,
} from "@/components/planner";
import { useChildren } from "@/hooks/useChildren";
import { useChildrenWithoutFocus } from "@/hooks/useChildrenFocus";
import { useFamilyMethodologies } from "@/hooks/useMethodologies";
import { useExtracurricular } from "@/hooks/useExtracurricular";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useTour } from "@/contexts/TourContext";
import { track } from "@/lib/analytics";
import { daysSince, isoDayOfWeek } from "@/lib/feedback/time";
import { supabase } from "@/lib/supabase";
import {
  generateWeeklyPlan,
  getNextMonday,
  formatWeekRange,
  type GeneratedPlanItem,
} from "@/lib/planGenerator";
import { Button } from "@/components/ui/button";
import { loadDraft, removeDraft, saveDraft, type PlanDraft } from "@/lib/planDraft";
import { isOptional, OPTIONAL_PREFIX } from "@/lib/essentialPlan";
import { showsHours } from "@/lib/familyRoutine";
import { getLastWeekTheme, generateWithGemini, regenerateActivity } from "@/lib/geminiPlanner";
import { YEAR_MAP } from "@/lib/gcConstants";
import { fallbackPeriods, contextPeriods, inPeriods } from "@/lib/curriculumWindow";
import { buildAnnualPlan, planWeekFor, weekFocus, weeksFor, type AnnualContent } from "@/lib/annualPlan";
import { fetchFamilyCalendar } from "@/hooks/useFamilyCalendar";
import { fetchFamilyRoutine, useFamilyRoutine } from "@/hooks/useFamilyRoutine";
import type { WeekRoutine } from "@/lib/familyRoutine";
import { useFamilyTradition } from "@/hooks/useFamilyTradition";
import { weekLiturgy } from "@/lib/tradicao/week";
import { mergeWeekContents } from "@/lib/weekClose";
import { useWeekFocus } from "@/hooks/useAnnualPlan";
import { fetchChildManuals } from "@/hooks/useChildManuals";
import { useFinancinhas } from "@/hooks/useFinancinhas";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";
import { usePilotFeature } from "@/hooks/usePilotFeature";
import { canSeeFinancinhas } from "@/lib/financinhas/access";
import { weekSessions } from "@/lib/financinhas/weekSession";
import FinancinhasWeekCard from "@/components/financinhas/FinancinhasWeekCard";

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

/** Os erros do Supabase são objetos simples, não Error: mostra a mensagem na mesma. */
function errorText(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  const m = (e as { message?: unknown } | null)?.message;
  return typeof m === "string" && m ? `${fallback}: ${m}` : fallback;
}

// Keep serializeNotesField in scope — used indirectly for backward compat
void serializeNotesField;

export default function WeeklyPlanner() {
  const { children, isLoading: childrenLoading } = useChildren();
  const childrenWithoutFocus = useChildrenWithoutFocus(children);
  const { data: familyMethodologies = [] } = useFamilyMethodologies();
  const { family, registeredAt } = useAuth();
  // P-18: a semana da família (dias de estudo, dias curtos, saída à sexta)
  const { routine } = useFamilyRoutine();
  // I-08: tempo litúrgico da semana (só com a Tradição da família ligada; não vai para a IA)
  const { tradition } = useFamilyTradition();
  // I-21: a sessão Financinhas da semana, para quem tem o módulo e perfis criados
  const { isAdmin: finAdmin } = useIsTeamAdmin();
  const { invited: finInvited } = usePilotFeature("financinhas");
  const { data: finData } = useFinancinhas();
  const finSessions = canSeeFinancinhas(finAdmin, finInvited) && finData.available
    ? weekSessions(children.map((c) => c.id), finData.profiles, finData.lessons)
    : [];
  const { notifyEvent } = useFeedback();
  const { startTourIfUnseen } = useTour();
  const { activities: extracurriculars } = useExtracurricular();

  // ?semana=proxima (vem do fecho da semana no Início): abre a semana seguinte
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const m = getNextMonday();
    const next = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("semana") === "proxima";
    return next && new Date().getDay() >= 1 && new Date().getDay() <= 5 ? addDays(m, 7) : m;
  });
  const [weekStartReady, setWeekStartReady] = useState(false);
  const weekFocusByChild = useWeekFocus(children, weekStart);
  const [childInterests, setChildInterests] = useState<Record<string, string[]>>({});
  const [weeklyContent, setWeeklyContent] = useState<Record<string, Record<string, string>>>({});
  const [fridayActivity, setFridayActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [weeklyReadingTheme, setWeeklyReadingTheme] = useState("");
  // P-16: fio condutor escolhido pela IA. Guarda-se em reading_theme quando a
  // família não escreveu um tema de leitura (sem coluna nova na BD).
  const [weekTheme, setWeekTheme] = useState("");

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
  const loadedWeekRef = useRef<string | null>(null);
  const baselineRef = useRef<string | null>(null);
  const [restoredDraft, setRestoredDraft] = useState(false);

  // Semana inicial é sempre a semana atual/próxima — o plano existente (se houver)
  // é carregado no efeito seguinte. Navegar para outra semana é feito manualmente
  // com as setas (goToPrevWeek/goToNextWeek).
  useEffect(() => {
    if (!family || childrenLoading) return;
    setWeekStartReady(true);
  }, [family, childrenLoading]);

  // Visitas guiadas do planeador — dependem do estado do ecrã (form vs preview),
  // por isso arrancam aqui e não no auto-start por rota do TourProvider.
  useEffect(() => {
    if (loadingExisting || childrenLoading || generating) return;
    if (step === "form" && children.length === 0) return;
    const timer = setTimeout(
      () => startTourIfUnseen(step === "form" ? "planeador" : "plano-gerado"),
      600,
    );
    return () => clearTimeout(timer);
  }, [step, loadingExisting, childrenLoading, generating, children.length, startTourIfUnseen]);

  // Carrega (ou limpa) o plano sempre que a semana selecionada muda
  useEffect(() => {
    if (!family || !weekStartReady) return;

    loadedWeekRef.current = null;
    baselineRef.current = null;
    setRestoredDraft(false);
    setPlanId(null);
    setPlanItems([]);
    setPlanVersion(1);
    setIsNewGeneration(false);
    setPlanHistory([]);
    setSent(false);
    setError(null);
    setStep("form");
    setWeeklyReadingTheme("");
    setWeeklyContent({});
    setLoadingExisting(true);

    const loadExisting = async () => {
      try {
        const { data: plans } = await supabase
          .from("weekly_plans")
          .select("id, version, generated_at, child_interests, friday_activity, notes, reading_theme, status, weekly_content")
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
          setWeeklyContent({});
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
          setWeekTheme(plan.reading_theme);
          setNotes(plan.notes ?? "");
        } else {
          const parsedNotes = parseNotesField(plan.notes);
          setNotes(parsedNotes.notes);
          setWeeklyReadingTheme(parsedNotes.readingTheme);
        }

        const interests = plan.child_interests as Record<string, string[]> | null;
        if (interests) setChildInterests(interests);
        const wc = plan.weekly_content as Record<string, Record<string, string>> | null;
        if (wc) setWeeklyContent(wc);
        if (plan.status === "sent") setSent(true);
        setStep("preview");

        // plan_viewed — 1× por plano e por sessão (guard contra StrictMode / re-mount).
        try {
          const viewKey = `plan_viewed_${plan.id}`;
          if (!sessionStorage.getItem(viewKey)) {
            sessionStorage.setItem(viewKey, "1");
            track("plan_viewed", { plan_id: plan.id, day_of_week: isoDayOfWeek() });
          }
        } catch { /* sessionStorage indisponível — ignora */ }
      } finally {
        loadedWeekRef.current = format(weekStart, "yyyy-MM-dd");
        setLoadingExisting(false);
      }
    };

    loadExisting();
    // family?.id e não family: o objeto pode ser recriado sem a família mudar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family?.id, weekStart, weekStartReady]);

  // ─── Rascunho neste dispositivo: nada se perde ao sair da página ────────────
  const weekKeyNow = format(weekStart, "yyyy-MM-dd");
  const draftState: PlanDraft = useMemo(
    () => ({ childInterests, weeklyContent, fridayActivity, notes, weeklyReadingTheme, weekTheme, step, planItems, planId, isNewGeneration }),
    [childInterests, weeklyContent, fridayActivity, notes, weeklyReadingTheme, weekTheme, step, planItems, planId, isNewGeneration],
  );
  useEffect(() => {
    if (!family || loadingExisting || generating || loadedWeekRef.current !== weekKeyNow) return;
    const snapshot = JSON.stringify(draftState);
    if (baselineRef.current === null) {
      // Acabou de carregar: o que veio da base de dados é a referência
      baselineRef.current = snapshot;
      const draft = loadDraft(family.id, weekKeyNow);
      if (draft && JSON.stringify(draft) !== snapshot) {
        setChildInterests(draft.childInterests ?? {});
        setWeeklyContent(draft.weeklyContent ?? {});
        setFridayActivity(draft.fridayActivity ?? "");
        setNotes(draft.notes ?? "");
        setWeeklyReadingTheme(draft.weeklyReadingTheme ?? "");
        setWeekTheme(draft.weekTheme ?? "");
        if (draft.planItems.length > 0) {
          setPlanItems(draft.planItems);
          setIsNewGeneration(draft.isNewGeneration);
          // Edições a um plano guardado só se repõem sobre esse mesmo plano
          setPlanId(draft.isNewGeneration ? null : draft.planId);
          setStep(draft.step);
        } else {
          setStep("form");
        }
        setRestoredDraft(true);
      }
      return;
    }
    if (snapshot === baselineRef.current) removeDraft(family.id, weekKeyNow);
    else saveDraft(family.id, weekKeyNow, draftState);
  }, [family, loadingExisting, generating, weekKeyNow, draftState]);

  const discardDraft = () => {
    if (family) removeDraft(family.id, weekKeyNow);
    setRestoredDraft(false);
    // volta a carregar a semana a partir da base de dados
    setWeekStart((d) => new Date(d));
  };

  const goToPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goToNextWeek = () => setWeekStart((d) => addDays(d, 7));

  const handleGeneratePlan = async () => {
    let weekRoutine: WeekRoutine | null = routine;
    setGenerating(true);
    setError(null);
    setPlanId(null);
    setIsNewGeneration(true);
    setRestoredDraft(false);
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
      const manuals = (family ? await fetchChildManuals(family.id) : null) ?? [];
      const manualFocusByChild: Record<string, Record<string, string[]>> = {};
      // P-24: semanas do calendário da família, ou do escolar se não houver
      const planWeeks = weeksFor(weekStart, family ? await fetchFamilyCalendar(family.id) : null);
      // P-18: lida na hora, para o plano seguir a semana acabada de guardar
      weekRoutine = family ? await fetchFamilyRoutine(family.id) : null;
      // Crianças com currículo carregado ou com um manual (ex.: 5.º ano só com manuais)
      const gcChildren = children.filter(
        (c) => YEAR_MAP[c.school_year] || manuals.some((m) => m.child_id === c.id),
      );
      const ctxPeriods = contextPeriods(weekStart);
      const fbPeriods = fallbackPeriods(weekStart);
      // Conteúdos por dominar do período atual, por criança (para o caso sem marcações)
      const gcCurrentByChild: Record<string, Record<string, string[]>> = {};
      // P-14: conteúdos "em progresso" (por consolidar) e se a semana tem foco no rumo
      const inProgressByChild: Record<string, Record<string, string[]>> = {};
      const hasFocus = new Set<string>();
      // P-09: o que a criança já domina, para a IA ajustar o nível (vem do Fechar a semana)
      const masteredByChild: Record<string, Record<string, string[]>> = {};
      // DASH: temas da semana anterior que não foram dados
      const leftoverByChild: Record<string, Record<string, string[]>> = {};
      await Promise.all(
        gcChildren.map(async (child) => {
          const dbYear = YEAR_MAP[child.school_year];

          const { data: allContents } = dbYear
            ? await supabase
                .from("curriculum_contents")
                .select("id, discipline, content, period, domain, sort_order")
                .eq("school_year", dbYear)
            : { data: [] };

          const { data: progressRows } = await supabase
            .from("child_content_progress")
            .select("content_id, status, updated_at")
            .eq("child_id", child.id);

          const childManuals = manuals.filter((m) => m.child_id === child.id && m.entries.length > 0);
          if (!allContents?.length && childManuals.length === 0) return;

          const progressMap = new Map((progressRows ?? []).map((p) => [p.content_id, p.status]));

          // P-12: sem marcações, o plano parte dos conteúdos desta semana no rumo
          // do ano. Em pausas e semanas de balanço não há foco: usa o período.
          // A "lição seguinte" reparte-se a partir da semana que se está a planear
          const childPlan = buildAnnualPlan((allContents ?? []) as AnnualContent[], planWeeks, childManuals, weekStart);
          const focus = weekFocus(childPlan, weekStart, (id) => progressMap.get(id) === "dominado");

          // DASH §4: o que não foi dado na semana anterior passa para esta, ao
          // lado do que está a consolidar (mesmo limite de dois por disciplina).
          // Só para quem fecha as semanas (marcou algum tema nos últimos 14 dias).
          const closesWeeks = (progressRows ?? []).some(
            (p) => p.updated_at && Date.now() - new Date(p.updated_at).getTime() < 14 * 24 * 3600 * 1000,
          );
          if (closesWeeks) {
            const prevWeek = planWeekFor(childPlan, new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7));
            for (const c of Object.values(prevWeek?.byDiscipline ?? {}).flat()) {
              if (c.fromManual || progressMap.get(c.id) === "dominado" || progressMap.get(c.id) === "em_progresso") continue;
              const list = ((leftoverByChild[child.id] ??= {})[c.discipline] ??= []);
              if (!list.includes(c.content)) list.push(c.content);
            }
          }
          if (focus) {
            hasFocus.add(child.id);
            gcCurrentByChild[child.id] = Object.fromEntries(
              Object.entries(focus).map(([d, list]) => [d, list.map((c) => c.content)]),
            );
          }

          // I-01: nas disciplinas com manual, a semana segue sempre o manual,
          // mesmo que haja conteúdos do currículo marcados como "em progresso"
          for (const d of new Set(childManuals.map((m) => m.discipline))) {
            const list = focus?.[d]?.filter((c) => c.fromManual);
            if (!list?.length) continue;
            (manualFocusByChild[child.id] ??= {})[d] = list.map((c) => `[manual «${c.domain}»] ${c.content}`);
          }
          const manualDisciplines = new Set(childManuals.map((m) => m.discipline));

          for (const c of allContents ?? []) {
            if (manualDisciplines.has(c.discipline)) continue;
            const status = progressMap.get(c.id) ?? "a_aprender";
            if (status === "dominado") {
              ((masteredByChild[child.id] ??= {})[c.discipline] ??= []).push(c.content);
              continue;
            }
            // P-01: o contexto "por dominar" leva só o período atual e o seguinte
            if (status !== "em_progresso" && !inPeriods(c.period, ctxPeriods)) continue;

            if (!gcAllByChild[child.id]) gcAllByChild[child.id] = {};
            if (!gcAllByChild[child.id][c.discipline]) gcAllByChild[child.id][c.discipline] = [];
            gcAllByChild[child.id][c.discipline].push(c.content);

            if (!focus && inPeriods(c.period, fbPeriods)) {
              if (!gcCurrentByChild[child.id]) gcCurrentByChild[child.id] = {};
              if (!gcCurrentByChild[child.id][c.discipline]) gcCurrentByChild[child.id][c.discipline] = [];
              gcCurrentByChild[child.id][c.discipline].push(c.content);
            }

            if (status === "em_progresso") {
              ((inProgressByChild[child.id] ??= {})[c.discipline] ??= []).push(c.content);
              if (!gcProgressByChild[child.id]) gcProgressByChild[child.id] = {};
              if (!gcProgressByChild[child.id][c.discipline]) gcProgressByChild[child.id][c.discipline] = [];
              gcProgressByChild[child.id][c.discipline].push(`[em progresso] ${c.content}`);
            }
          }
        })
      );

      // Sem nada marcado como "em progresso": conteúdos desta semana no rumo do
      // ano (P-12) ou, fora das semanas com aulas, o período atual (P-01)
      for (const child of gcChildren) {
        // P-14: semana com foco no rumo → os conteúdos da semana e, por cima, até
        // dois por disciplina que ficaram por consolidar (atraso sem culpa)
        if (hasFocus.has(child.id)) {
          const manualDisciplines = new Set(Object.keys(manualFocusByChild[child.id] ?? {}));
          const focusNoManual = Object.fromEntries(
            Object.entries(gcCurrentByChild[child.id] ?? {}).filter(([d]) => !manualDisciplines.has(d)),
          );
          // DASH fase 3: o que não foi dado volta como [retomar]; o que ficou
          // "precisa de mais" volta como revisão curta [rever] (até 2 por criança)
          const noManual = (src: Record<string, string[]>) =>
            Object.fromEntries(Object.entries(src).filter(([d]) => !manualDisciplines.has(d)));
          gcProgressByChild[child.id] = mergeWeekContents(
            focusNoManual,
            noManual(leftoverByChild[child.id] ?? {}),
            undefined,
            noManual(inProgressByChild[child.id] ?? {}),
          );
          continue;
        }
        if (!gcProgressByChild[child.id] && gcCurrentByChild[child.id]) {
          gcProgressByChild[child.id] = {};
          for (const [discipline, contents] of Object.entries(gcCurrentByChild[child.id])) {
            gcProgressByChild[child.id][discipline] = contents.map((c) => `[a aprender] ${c}`);
          }
        }
      }

      for (const [childId, byDiscipline] of Object.entries(manualFocusByChild)) {
        gcProgressByChild[childId] = { ...(gcProgressByChild[childId] ?? {}), ...byDiscipline };
      }

      for (const [childId, byDiscipline] of Object.entries(masteredByChild)) {
        for (const [d, list] of Object.entries(byDiscipline)) {
          // só onde há conteúdos em foco: o nível serve para calibrar, não para abrir disciplinas
          const target = gcProgressByChild[childId]?.[d];
          if (target?.length) target.push(...list.slice(-3).map((c) => `[já domina] ${c}`));
        }
      }

      setGeneratingStep("A gerar atividades com IA... (pode demorar até um minuto)");
      const items = await generateWithGemini(children, childInterests, fridayActivity, weeklyReadingTheme, nexseedByYear, gcProgressByChild, gcAllByChild, weeklyContent, familyMethodologies, weekRoutine);

      setGeneratingStep("A montar o horário...");
      setWeekTheme(getLastWeekTheme());
      setPlanItems(items);
      setStep("preview");
      track("plan_generated", {
        source: "ai",
        days_since_registration: registeredAt ? daysSince(registeredAt) : null,
        children_count: children.length,
      });
      notifyEvent("plan_generated");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("AI falhou:", msg);
      setGeneratingStep("A usar templates locais...");
      const items = generateWeeklyPlan(children, childInterests, fridayActivity, weeklyReadingTheme, weekRoutine);
      setPlanItems(items);
      setStep("preview");
      setError(`IA indisponível (${msg}) — plano gerado com templates.`);
      track("plan_generated", {
        source: "fallback",
        days_since_registration: registeredAt ? daysSince(registeredAt) : null,
        children_count: children.length,
      });
      notifyEvent("plan_generated");
    } finally {
      setGenerating(false);
      setGeneratingStep("");
    }
  };

  // ─── Regeneração inline de UMA atividade (FASE 3.2.1) ───────────────────────
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);

  const handleRegenerateItem = async (item: GeneratedPlanItem) => {
    const child = children.find((c) => c.id === item.child_id);
    if (!child) return;
    const key = planItemKey(item);
    setRegeneratingKey(key);
    setError(null);
    try {
      const patch = await regenerateActivity(child, item, childInterests[item.child_id] ?? [], familyMethodologies);
      // P-27: uma atividade "se houver tempo" continua opcional depois de regenerada
      const keepOptional = isOptional(item) && patch.title && !isOptional({ title: patch.title });
      setPlanItems((prev) =>
        prev.map((i) => (planItemKey(i) === key ? { ...i, ...patch, ...(keepOptional ? { title: OPTIONAL_PREFIX + patch.title } : {}) } : i))
      );
    } catch (e: unknown) {
      setError(errorText(e, "Erro ao regenerar a atividade"));
    } finally {
      setRegeneratingKey(null);
    }
  };

  const persistPlan = async (): Promise<string> => {
    if (!family) throw new Error("Família não encontrada");

    const weekKey = format(weekStart, "yyyy-MM-dd");
    const hasWeeklyContent = Object.values(weeklyContent).some(
      (disc) => Object.values(disc).some((v) => v.trim())
    );
    const planPayload = {
      family_id: family.id,
      week_start: weekKey,
      child_interests: childInterests,
      weekly_content: hasWeeklyContent ? weeklyContent : null,
      friday_activity: fridayActivity || null,
      notes: notes || null,
      reading_theme: weeklyReadingTheme || weekTheme || null,
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
      track("plan_edited", { items_count: planItems.length });
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
    // Guardado: deixa de haver rascunho e o estado atual passa a ser a referência
    removeDraft(family.id, weekKey);
    baselineRef.current = JSON.stringify({ ...draftState, planId: savedPlanId, isNewGeneration: false });
    setRestoredDraft(false);

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
      setError(errorText(e, "Erro ao guardar"));
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDFs = async () => {
    const familyName = family?.name ?? "Família";

    const { default: SchedulePDFComp } = await import("@/components/pdf/SchedulePDF");
    const scheduleBlob = await pdf(
      <SchedulePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} extracurriculars={extracurriculars} routine={routine} liturgyOn={!!tradition} />
    ).toBlob();
    const a1 = document.createElement("a");
    a1.href = URL.createObjectURL(scheduleBlob);
    a1.download = `nexseed-horario-${format(weekStart, "yyyy-MM-dd")}.pdf`;
    a1.click();

    const { default: ActivityGuidePDFComp } = await import("@/components/pdf/ActivityGuidePDF");
    const guideBlob = await pdf(
      <ActivityGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} weekFocus={weekFocusByChild} weekTheme={weeklyReadingTheme || weekTheme} routine={routine} liturgy={weekLiturgy(weekStart, tradition)} />
    ).toBlob();
    const a2 = document.createElement("a");
    a2.href = URL.createObjectURL(guideBlob);
    a2.download = `nexseed-guia-${format(weekStart, "yyyy-MM-dd")}.pdf`;
    a2.click();

    // R-11: o mapa da semana de cada criança
    const { default: ChildWeekMapPDFComp } = await import("@/components/pdf/ChildWeekMapPDF");
    const mapBlob = await pdf(<ChildWeekMapPDFComp children={children} planItems={planItems} weekStart={weekStart} />).toBlob();
    const a4 = document.createElement("a");
    a4.href = URL.createObjectURL(mapBlob);
    a4.download = `nexseed-mapa-criancas-${format(weekStart, "yyyy-MM-dd")}.pdf`;
    a4.click();

    // I-21: Financinhas da semana, só com aulas preparadas
    const finEntries = finSessions.filter((s) => s.lesson).map((s) => {
      const l = finData.lessons.find((x) => x.id === s.lesson!.id)!;
      return {
        childName: children.find((c) => c.id === s.childId)?.name ?? "",
        weekdayLabel: s.weekdayLabel,
        title: l.title ?? "Sessão da semana",
        adultGuide: l.adult_guide_md, quiz: l.quiz_md, activities: l.activities_md, challenge: l.challenge_md,
      };
    });
    if (finEntries.length > 0) {
      const { default: FinPDF } = await import("@/components/pdf/FinancinhasWeekPDF");
      const finBlob = await pdf(<FinPDF entries={finEntries} weekStart={weekStart} />).toBlob();
      const a5 = document.createElement("a");
      a5.href = URL.createObjectURL(finBlob);
      a5.download = `nexseed-financinhas-${format(weekStart, "yyyy-MM-dd")}.pdf`;
      a5.click();
    }

    // Guia de Leitura — só gera se existirem episódios
    const readingItems = planItems.filter((i) => i.discipline === "reading");
    if (readingItems.length > 0) {
      const { default: ReadingGuidePDFComp } = await import("@/components/pdf/ReadingGuidePDF");
      const readingGuideBlob = await pdf(
        <ReadingGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
      ).toBlob();
      const a3 = document.createElement("a");
      a3.href = URL.createObjectURL(readingGuideBlob);
      a3.download = `nexseed-leitura-${format(weekStart, "yyyy-MM-dd")}.pdf`;
      a3.click();
    }
  };

  // R-07: uma folha compacta para imprimir; o detalhe fica no Guia, em digital
  const handleDownloadCompact = async () => {
    const { default: WeekSheetPDFComp } = await import("@/components/pdf/WeekSheetPDF");
    const blob = await pdf(
      <WeekSheetPDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={family?.name ?? ""} hours={showsHours(routine)} />
    ).toBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nexseed-folha-${format(weekStart, "yyyy-MM-dd")}.pdf`;
    a.click();
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
        <SchedulePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} extracurriculars={extracurriculars} routine={routine} liturgyOn={!!tradition} />
      ).toBlob();

      const { default: ActivityGuidePDFComp } = await import("@/components/pdf/ActivityGuidePDF");
      const guideBlob = await pdf(
        <ActivityGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} weekFocus={weekFocusByChild} weekTheme={weeklyReadingTheme || weekTheme} routine={routine} liturgy={weekLiturgy(weekStart, tradition)} />
      ).toBlob();

      const toBase64 = (blob: Blob): Promise<string> =>
        new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res((reader.result as string).split(",")[1]);
          reader.readAsDataURL(blob);
        });

      const scheduleB64 = await toBase64(scheduleBlob);
      const guideB64 = await toBase64(guideBlob);
      // R-11: o mapa da semana de cada criança (a função só o anexa depois de publicada de novo)
      const { default: ChildWeekMapPDFComp } = await import("@/components/pdf/ChildWeekMapPDF");
      const mapB64 = await toBase64(await pdf(<ChildWeekMapPDFComp children={children} planItems={planItems} weekStart={weekStart} />).toBlob());

      // Guia de Leitura — opcional, só gerado se existirem episódios
      let readingGuideB64: string | null = null;
      const readingItems = planItems.filter((i) => i.discipline === "reading");
      if (readingItems.length > 0) {
        const { default: ReadingGuidePDFComp } = await import("@/components/pdf/ReadingGuidePDF");
        const readingGuideBlob = await pdf(
          <ReadingGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
        ).toBlob();
        readingGuideB64 = await toBase64(readingGuideBlob);
      }

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
          readingGuideB64,
          readingGuideName: `nexseed-leitura-${format(weekStart, "yyyy-MM-dd")}.pdf`,
          mapB64,
          mapName: `nexseed-mapa-criancas-${format(weekStart, "yyyy-MM-dd")}.pdf`,
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

      track("plan_emailed", {});
      setSent(true);
    } catch (e: unknown) {
      setError(errorText(e, "Erro ao enviar email"));
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
            weeklyContent={weeklyContent}
            onWeeklyContentChange={(childId, discipline, value) =>
              setWeeklyContent((prev) => ({
                ...prev,
                [childId]: { ...(prev[childId] ?? {}), [discipline]: value },
              }))
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
            childrenWithoutFocus={childrenWithoutFocus}
            weekFocusByChild={weekFocusByChild}
            routine={routine}
            liturgy={weekLiturgy(weekStart, tradition)}
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
              onDownloadCompact={handleDownloadCompact}
              onSendEmail={handleSendEmail}
            />

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {(isNewGeneration || restoredDraft) && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
                <span className="flex-1 text-foreground">
                  {restoredDraft
                    ? "Recuperámos o plano que estavam a preparar. Ainda não está guardado."
                    : "Este plano ainda não está guardado. Se saírem da página, fica à vossa espera neste dispositivo."}
                </span>
                {restoredDraft && (
                  <Button size="sm" variant="ghost" onClick={discardDraft}>Descartar</Button>
                )}
              </div>
            )}

            <div data-tour="plano-versoes">
              <VersionBadge
                version={planVersion}
                history={planHistory}
                isUnsaved={isNewGeneration && !planId}
                onRestore={handleRestoreVersion}
              />
            </div>

            <ExtracurricularsCard
              extracurriculars={extracurriculars}
              children={children}
            />

            <FinancinhasWeekCard
              sessions={finSessions}
              names={Object.fromEntries(children.map((c) => [c.id, c.name]))}
            />

            <PlanPreview
              children={children}
              planItems={planItems}
              weekTheme={weeklyReadingTheme || weekTheme}
              onRegenerateItem={handleRegenerateItem}
              regeneratingKey={regeneratingKey}
              hours={showsHours(routine)}
            />
          </div>
        )}
      </div>

      {/* P-19/P-20: antes da semana nova, como correu a anterior (tema a tema) */}
      <WeekCloseDialog
        open={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        familyChildren={children}
        date={new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7)}
        title="Antes da semana nova: como correu a anterior?"
      />
    </AppLayout>
  );
}
