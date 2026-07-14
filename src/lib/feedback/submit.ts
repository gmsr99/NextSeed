import { supabase } from "@/lib/supabase";

// Helpers de persistência de feedback partilhados pelo Instrumento D e pelo
// SurveyDialog (Instrumentos A/B/C). Guardam contexto (Secção 0.4 da spec) e
// suportam respostas parciais (1 linha por pergunta, upsert).

export type AnswerValue =
  | { text: string }
  | { choice: string }
  | { choices: string[]; other?: string }
  | { number: number }
  | { screenshot_path: string };

const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "unknown";

function currentScreen(): string {
  try {
    return window.location.pathname;
  } catch {
    return "";
  }
}

function currentSessionId(): string | null {
  try {
    return sessionStorage.getItem("nexseed_session_id");
  } catch {
    return null;
  }
}

export type InstrumentId = "A" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "D";

/** Cria a submissão (estado inicial 'shown') e devolve o id. Lança em erro. */
export async function createSubmission(params: {
  instrument: InstrumentId;
  eventoGatilho: string;
  familyId: string | null;
}): Promise<string> {
  const { data, error } = await supabase
    .from("feedback_submissions")
    .insert({
      instrument: params.instrument,
      family_id: params.familyId,
      status: "shown",
      evento_gatilho: params.eventoGatilho,
      ecra_origem: currentScreen(),
      app_version: APP_VERSION,
      session_id: currentSessionId(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Guarda (ou substitui) a resposta a uma pergunta e marca a submissão como 'partial'. */
export async function saveAnswer(
  submissionId: string,
  questionKey: string,
  value: AnswerValue,
): Promise<void> {
  const { error } = await supabase
    .from("feedback_answers")
    .upsert(
      { submission_id: submissionId, question_key: questionKey, value: value as never },
      { onConflict: "submission_id,question_key" },
    );
  if (error) throw error;
  await supabase
    .from("feedback_submissions")
    .update({ status: "partial" })
    .eq("id", submissionId)
    .eq("status", "shown");
}

/** Marca a submissão como concluída. */
export async function completeSubmission(submissionId: string): Promise<void> {
  await supabase
    .from("feedback_submissions")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", submissionId);
}

/**
 * Marca a submissão como descartada ('dismissed' se sem respostas, senão fica
 * 'partial'). Nunca lança — o «Agora não» tem de ser sempre fluido.
 */
export async function dismissSubmission(submissionId: string, hasAnswers: boolean): Promise<void> {
  try {
    if (!hasAnswers) {
      await supabase
        .from("feedback_submissions")
        .update({ status: "dismissed" })
        .eq("id", submissionId);
    }
    // Se já tem respostas, mantém-se 'partial' (não se perde o respondido).
  } catch {
    /* silencioso */
  }
}

/** Faz upload do screenshot para o bucket privado; devolve o path. */
export async function uploadScreenshot(
  userId: string,
  submissionId: string,
  file: File,
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${submissionId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from("feedback-screenshots")
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

/** Invoca a edge function de notificação à equipa. Fire-and-forget. */
export function notifyTeam(submissionId: string): void {
  supabase.functions
    .invoke("notify-team", { body: { submissionId } })
    .catch(() => { /* silencioso: a notificação é secundária */ });
}
