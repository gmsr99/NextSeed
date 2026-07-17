import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTour } from "@/contexts/TourContext";
import { initAnalytics } from "@/lib/analytics";
import FeedbackButton from "@/components/feedback/FeedbackButton";
import FeedbackDialog from "@/components/feedback/FeedbackDialog";
import SurveyDialog from "@/components/feedback/SurveyDialog";
import { INSTRUMENTS, type Instrument } from "@/lib/feedback/instruments";
import { pickAppOpenSurvey, shouldShowB1, shouldShowB3, shouldShowB4, type AnswerMap } from "@/lib/feedback/engine";
import {
  fetchAllTriggerState,
  fetchActiveConfigFlags,
  bumpCounter,
  markShown,
  markConsumed,
  scheduleB2,
  clearB2Schedule,
} from "@/lib/feedback/triggerState";
import { createSubmission, dismissSubmission, notifyTeam } from "@/lib/feedback/submit";

// ─── FeedbackProvider (FASE 5) ────────────────────────────────────────────────
// Orquestra analytics + os instrumentos de feedback: gatilhos na abertura da app
// (A/B2/C), gatilhos pós-evento (B1/B3/B4), o botão «Conta-nos» (D), o cap de
// 1 survey por sessão e a arbitragem de prioridades. Nunca bloqueia a app.

/** Pulso mensal (Instrumento C) — ativado no Passo 5.5. */
const MONTHLY_ENABLED = true;

/** Atraso pós-evento antes de mostrar B1/B3/B4 — dá tempo de ver o resultado
 * (plano/documento/ideias) antes do cartão leve aparecer no canto. */
const POST_EVENT_SURVEY_DELAY_MS = 6000;

export type FeedbackEventKind = "plan_generated" | "portfolio_report" | "ai_idea" | "community_post";

interface FeedbackContextValue {
  notifyEvent: (kind: FeedbackEventKind, meta?: Record<string, unknown>) => void;
  openFeedbackDialog: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const SESSION_CAP_KEY = "nexseed_survey_shown_session";
const APP_OPEN_EVALUATED_KEY = "nexseed_triggers_evaluated";

function sessionCapUsed(): boolean {
  try { return sessionStorage.getItem(SESSION_CAP_KEY) === "1"; } catch { return false; }
}
function markSessionCapUsed() {
  try { sessionStorage.setItem(SESSION_CAP_KEY, "1"); } catch { /* ignore */ }
}

interface ActiveSurvey {
  instrument: Instrument;
  submissionId: string;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const { user, family, registeredAt } = useAuth();
  const { isTourActive } = useTour();
  const location = useLocation();
  const initedRef = useRef(false);
  const showingRef = useRef(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<ActiveSurvey | null>(null);
  const [activeFlags, setActiveFlags] = useState<Set<string>>(new Set());

  const onboardingDone = !!family?.onboarding_completed_at;

  // Inicializa analytics assim que há utilizador (guard StrictMode / re-render).
  useEffect(() => {
    if (user && !initedRef.current) {
      initedRef.current = true;
      initAnalytics({ userId: user.id, familyId: family?.id ?? null });
    }
  }, [user, family]);

  // Mostra um survey (se o cap de sessão o permitir e não houver diálogo aberto).
  const showSurvey = useCallback(
    async (instrumentId: Instrument["id"], eventoGatilho: string) => {
      if (showingRef.current) return;
      if (activeSurvey || feedbackOpen) return;
      // Nunca sobrepor um survey a uma visita guiada — o gatilho não é
      // consumido e volta a ser avaliado na próxima sessão.
      if (isTourActive()) return;
      if (sessionCapUsed()) return;
      showingRef.current = true;
      try {
        const submissionId = await createSubmission({
          instrument: instrumentId,
          eventoGatilho,
          familyId: family?.id ?? null,
        });
        markSessionCapUsed();
        // Consumo no momento de mostrar — nunca voltar a incomodar por este gatilho.
        if (instrumentId === "A") await markConsumed("A");
        else if (instrumentId === "C") await markShown("C");
        else if (instrumentId === "B2") await clearB2Schedule();
        setActiveSurvey({ instrument: INSTRUMENTS[instrumentId], submissionId });
      } catch {
        /* falha a criar submissão — não mostra nada, não gasta o cap */
      } finally {
        showingRef.current = false;
      }
    },
    [activeSurvey, feedbackOpen, family, isTourActive],
  );

  // Gatilhos pós-evento (B1/B3/B4) + agendamento de B2.
  const notifyEvent = useCallback<FeedbackContextValue["notifyEvent"]>(
    (kind, meta) => {
      if (!onboardingDone) return;
      (async () => {
        try {
          if (kind === "plan_generated") {
            const n = await bumpCounter("plan_generated");
            await scheduleB2((meta?.planId as string) ?? null);
            if (shouldShowB1(n)) {
              setTimeout(() => showSurvey("B1", `plan_generated_n${n}`), POST_EVENT_SURVEY_DELAY_MS);
            }
          } else if (kind === "portfolio_report") {
            const n = await bumpCounter("portfolio_report");
            if (shouldShowB3(n)) setTimeout(() => showSurvey("B3", `portfolio_report_n${n}`), POST_EVENT_SURVEY_DELAY_MS);
          } else if (kind === "ai_idea") {
            const n = await bumpCounter("ai_idea");
            if (shouldShowB4(n)) setTimeout(() => showSurvey("B4", `ai_idea_n${n}`), POST_EVENT_SURVEY_DELAY_MS);
          }
          // community_post → B5 dormente (comunidade inativa).
        } catch { /* silencioso */ }
      })();
    },
    [onboardingDone, showSurvey],
  );

  const openFeedbackDialog = () => setFeedbackOpen(true);

  // Avaliação na abertura da app (A > B2 > C), 1× por sessão.
  useEffect(() => {
    if (!user || !family || !onboardingDone) return;
    if (location.pathname.startsWith("/onboarding")) return;
    let evaluated = false;
    try { evaluated = sessionStorage.getItem(APP_OPEN_EVALUATED_KEY) === "1"; } catch { /* ignore */ }
    if (evaluated) return;
    try { sessionStorage.setItem(APP_OPEN_EVALUATED_KEY, "1"); } catch { /* ignore */ }

    const timer = setTimeout(async () => {
      try {
        const [states, flags] = await Promise.all([fetchAllTriggerState(), fetchActiveConfigFlags()]);
        setActiveFlags(flags);
        const pick = pickAppOpenSurvey({
          registeredAt,
          now: new Date(),
          states: { A: states.A, B2: states.B2, C: states.C },
          monthlyEnabled: MONTHLY_ENABLED,
        });
        if (pick) await showSurvey(pick, pick === "A" ? "app_open_welcome" : pick === "B2" ? "b2_scheduled" : "app_open_monthly");
      } catch { /* silencioso */ }
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, family, onboardingDone, registeredAt]);

  // Carrega as flags de config uma vez (para o gating do C_Q7), caso o efeito
  // de abertura não corra (ex.: já avaliado nesta sessão).
  useEffect(() => {
    if (!user) return;
    fetchActiveConfigFlags().then(setActiveFlags).catch(() => { /* ignore */ });
  }, [user]);

  // Alerta de fricção (Instrumento A): dispara quando A_Q2 = "tentei_nao_consegui".
  const maybeFireFrictionAlert = (survey: ActiveSurvey | null, answers: AnswerMap) => {
    if (survey?.instrument.id === "A" && answers["A_Q2"] === "tentei_nao_consegui") {
      notifyTeam(survey.submissionId);
    }
  };

  const handleSurveyComplete = (answers: AnswerMap) => {
    maybeFireFrictionAlert(activeSurvey, answers);
    setTimeout(() => setActiveSurvey(null), 2600); // deixa ver a confirmação
  };

  const handleSurveyDismiss = (hasAnswers: boolean, answers: AnswerMap) => {
    if (activeSurvey) dismissSubmission(activeSurvey.submissionId, hasAnswers);
    maybeFireFrictionAlert(activeSurvey, answers);
    setActiveSurvey(null);
  };

  const showButton = !!user && onboardingDone;

  return (
    <FeedbackContext.Provider value={{ notifyEvent, openFeedbackDialog }}>
      {children}
      {showButton && <FeedbackButton onClick={openFeedbackDialog} />}
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      {activeSurvey && (
        <SurveyDialog
          instrument={activeSurvey.instrument}
          submissionId={activeSurvey.submissionId}
          activeFlags={activeFlags}
          onComplete={handleSurveyComplete}
          onDismiss={handleSurveyDismiss}
        />
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used inside FeedbackProvider");
  return ctx;
}
