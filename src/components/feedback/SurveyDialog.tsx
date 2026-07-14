import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircleHeart, X } from "lucide-react";
import { nextQuestion, type AnswerMap } from "@/lib/feedback/engine";
import {
  type Instrument,
  type SurveyQuestion,
  RGPD_NOTE,
  OTHER_VALUE,
  FEEDBACK_CONFIRMATION,
} from "@/lib/feedback/instruments";
import { saveAnswer, completeSubmission, type AnswerValue } from "@/lib/feedback/submit";
import { track } from "@/lib/analytics";

interface SurveyDialogProps {
  instrument: Instrument;
  submissionId: string;
  activeFlags: Set<string>;
  /** Chamado quando o survey é concluído. Recebe o mapa de respostas final. */
  onComplete: (answers: AnswerMap) => void;
  /** Chamado no «Agora não». `hasAnswers` = já respondeu a pelo menos uma pergunta. */
  onDismiss: (hasAnswers: boolean, answers: AnswerMap) => void;
}

export default function SurveyDialog({
  instrument,
  submissionId,
  activeFlags,
  onComplete,
  onDismiss,
}: SurveyDialogProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const current = done ? null : nextQuestion(instrument, answers, visited, activeFlags);

  const advance = async (question: SurveyQuestion, answerVal: AnswerValue | null, mapVal: AnswerMap[string]) => {
    // Persiste a resposta (se houver) — respostas parciais garantidas.
    if (answerVal) {
      try {
        await saveAnswer(submissionId, question.key, answerVal);
      } catch { /* silencioso — não bloquear o fluxo */ }
    }
    const nextAnswers: AnswerMap = { ...answers, [question.key]: mapVal };
    const nextVisited = new Set(visited).add(question.key);
    setAnswers(nextAnswers);
    setVisited(nextVisited);

    const upcoming = nextQuestion(instrument, nextAnswers, nextVisited, activeFlags);
    if (!upcoming) {
      setDone(true);
      try { await completeSubmission(submissionId); } catch { /* silencioso */ }
      track("feedback_submitted", { instrument: instrument.id });
      // O host fecha o diálogo após a mensagem de confirmação.
      onComplete(nextAnswers);
    }
  };

  const dismiss = () => onDismiss(visited.size > 0, answers);

  const body = done ? (
    <div className="py-6 text-center space-y-3">
      <MessageCircleHeart className="h-10 w-10 text-primary mx-auto" />
      <p className="text-sm text-foreground leading-relaxed max-w-xs mx-auto">{FEEDBACK_CONFIRMATION}</p>
    </div>
  ) : current ? (
    <QuestionStep
      key={current.key}
      instrumentTitle={instrument.title}
      question={current}
      onNext={(a, m) => advance(current, a, m)}
      onDismiss={dismiss}
    />
  ) : null;

  // Instrumento B (micro-questionários): a spec pede "sobreposição leve" — um
  // cartão no canto que não bloqueia nem esconde o que a pessoa acabou de ver
  // (ex.: o plano recém-gerado), em vez de um modal a ecrã inteiro.
  if (instrument.presentation === "corner") {
    return (
      <div
        className="fixed z-50 inset-x-4 bottom-20 sm:inset-x-auto sm:right-4 sm:w-96 rounded-2xl border border-border bg-card p-5 shadow-elevated animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-label={instrument.title}
      >
        <button
          onClick={dismiss}
          aria-label="Fechar"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-4 w-4" />
        </button>
        {body}
      </div>
    );
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="max-w-md rounded-2xl p-6" onInteractOutside={(e) => { e.preventDefault(); dismiss(); }}>
        {body}
      </DialogContent>
    </Dialog>
  );
}

// ─── Uma pergunta ─────────────────────────────────────────────────────────────

function QuestionStep({
  instrumentTitle,
  question,
  onNext,
  onDismiss,
}: {
  instrumentTitle: string;
  question: SurveyQuestion;
  onNext: (answerVal: AnswerValue | null, mapVal: AnswerMap[string]) => void;
  onDismiss: () => void;
}) {
  const [text, setText] = useState("");
  const [single, setSingle] = useState<string | null>(null);
  const [multi, setMulti] = useState<string[]>([]);
  const [other, setOther] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [num, setNum] = useState("");

  const labelOf = (value: string) =>
    question.options?.find((o) => o.value === value)?.label ?? value;

  const submit = () => {
    switch (question.type) {
      case "free_text": {
        const t = text.trim();
        onNext(t ? { text: t } : null, t || undefined);
        break;
      }
      case "single_choice": {
        if (!single) { onNext(null, undefined); break; }
        if (single === OTHER_VALUE) {
          const t = otherText.trim();
          onNext({ choice: t || "Outra" }, OTHER_VALUE);
        } else {
          onNext({ choice: labelOf(single) }, single);
        }
        break;
      }
      case "multi_choice": {
        const labels = multi.map(labelOf);
        const otherTrim = otherText.trim();
        if (labels.length === 0 && !(other && otherTrim)) { onNext(null, undefined); break; }
        const value: AnswerValue = other && otherTrim
          ? { choices: labels, other: otherTrim }
          : { choices: labels };
        onNext(value, other ? [...multi, OTHER_VALUE] : multi);
        break;
      }
      case "number_eur": {
        const parsed = parseFloat(num.replace(",", "."));
        onNext(Number.isFinite(parsed) ? { number: parsed } : null, Number.isFinite(parsed) ? parsed : undefined);
        break;
      }
    }
  };

  const toggleMulti = (value: string) =>
    setMulti((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-primary/80">{instrumentTitle}</p>
        <h2 className="font-heading text-lg font-bold text-foreground leading-snug">{question.text}</h2>
      </div>

      {question.type === "free_text" && (
        <>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} autoFocus placeholder="Escreve aqui…" />
          <p className="text-xs text-muted-foreground">{RGPD_NOTE}</p>
        </>
      )}

      {question.type === "single_choice" && (
        <div className="space-y-2">
          {question.options?.map((o) => (
            <button
              key={o.value}
              onClick={() => setSingle(o.value)}
              className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                single === o.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              {o.label}
            </button>
          ))}
          {question.allowOther && (
            <button
              onClick={() => setSingle(OTHER_VALUE)}
              className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                single === OTHER_VALUE
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              {question.otherLabel ?? "Outra"}
            </button>
          )}
          {question.allowOther && single === OTHER_VALUE && (
            <Input value={otherText} onChange={(e) => setOtherText(e.target.value)} placeholder="Qual?" autoFocus />
          )}
        </div>
      )}

      {question.type === "multi_choice" && (
        <div className="space-y-2">
          {question.options?.map((o) => (
            <label key={o.value} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 cursor-pointer hover:border-primary/40 transition">
              <Checkbox checked={multi.includes(o.value)} onCheckedChange={() => toggleMulti(o.value)} />
              <span className="text-sm text-foreground">{o.label}</span>
            </label>
          ))}
          {question.allowOther && (
            <>
              <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 cursor-pointer hover:border-primary/40 transition">
                <Checkbox checked={other} onCheckedChange={() => setOther((v) => !v)} />
                <span className="text-sm text-foreground">{question.otherLabel ?? "Outra"}</span>
              </label>
              {other && (
                <>
                  <Input value={otherText} onChange={(e) => setOtherText(e.target.value)} placeholder="Qual?" />
                  <p className="text-xs text-muted-foreground">{RGPD_NOTE}</p>
                </>
              )}
            </>
          )}
        </div>
      )}

      {question.type === "number_eur" && (
        <div className="relative">
          <Input
            type="number"
            inputMode="decimal"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            placeholder="0"
            autoFocus
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="ghost" onClick={onDismiss} className="flex-1">Agora não</Button>
        <Button onClick={submit} className="flex-1">Continuar</Button>
      </div>
    </div>
  );
}
