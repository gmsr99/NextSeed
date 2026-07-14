import { supabase } from "@/lib/supabase";

// ─── Camada de analytics first-party (FASE 5, Secção 5 da spec) ───────────────
// Eventos gravados na tabela `analytics_events` do próprio Supabase (EU).
// Regra de ouro: fire-and-forget, nunca lançar, nunca bloquear a app.
// Vocabulário alinhado com FASE-4.3 para uma futura migração para PostHog.

export type AnalyticsEvent =
  | "session_start"
  | "signup"
  | "onboarding_completed"
  | "plan_generated"
  | "plan_edited"
  | "plan_viewed"
  | "plan_emailed"
  | "activity_logged"
  | "portfolio_generated"
  | "report_generated"
  | "ai_idea_generated"
  | "ai_idea_added_to_plan"
  | "community_post"
  | "community_comment"
  | "feedback_submitted";

interface AnalyticsContext {
  userId: string;
  familyId: string | null;
}

const SESSION_ID_KEY = "nexseed_session_id";
const SESSION_STARTED_KEY = "nexseed_session_started";

let context: AnalyticsContext | null = null;
// Eventos disparados antes de initAnalytics (ex.: durante o arranque) ficam aqui
// e são enviados assim que o contexto de utilizador resolve.
const buffer: Array<{ event: AnalyticsEvent; props: Record<string, unknown> }> = [];

const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "unknown";

/** UUID de sessão (por separador). Um refresh mantém-no; um novo separador cria outro. */
export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage indisponível (modo privado antigo, etc.) — sessão efémera.
    return "00000000-0000-0000-0000-000000000000";
  }
}

function currentScreen(): string {
  try {
    return window.location.pathname;
  } catch {
    return "";
  }
}

function send(event: AnalyticsEvent, props: Record<string, unknown>) {
  if (!context) {
    buffer.push({ event, props });
    return;
  }
  const row = {
    user_id: context.userId,
    family_id: context.familyId,
    event,
    props: props as never,
    screen: currentScreen(),
    session_id: getSessionId(),
    app_version: APP_VERSION,
  };
  // Fire-and-forget: erros são engolidos de propósito (analytics é best-effort).
  void supabase
    .from("analytics_events")
    .insert(row)
    .then(({ error }) => {
      if (error) console.debug("[analytics] insert falhou:", error.message);
    });
}

/**
 * Regista o contexto de utilizador, dispara `session_start` 1×/sessão e envia
 * os eventos que ficaram em buffer antes do arranque. Idempotente sob StrictMode.
 */
export function initAnalytics(ctx: AnalyticsContext) {
  context = ctx;

  let alreadyStarted = false;
  try {
    alreadyStarted = sessionStorage.getItem(SESSION_STARTED_KEY) === "1";
    if (!alreadyStarted) sessionStorage.setItem(SESSION_STARTED_KEY, "1");
  } catch {
    /* ignore */
  }
  if (!alreadyStarted) send("session_start", {});

  if (buffer.length) {
    const pending = buffer.splice(0, buffer.length);
    for (const item of pending) send(item.event, item.props);
  }
}

/** Regista um evento de analytics. Nunca lança. */
export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  try {
    send(event, props);
  } catch (e) {
    console.debug("[analytics] track falhou:", e);
  }
}
