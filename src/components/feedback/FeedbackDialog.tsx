import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImagePlus, X, MessageCircleHeart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";
import {
  FEEDBACK_D_TYPES,
  FEEDBACK_CONFIRMATION,
  RGPD_NOTE,
} from "@/lib/feedback/instruments";
import {
  createSubmission,
  saveAnswer,
  completeSubmission,
  uploadScreenshot,
  notifyTeam,
} from "@/lib/feedback/submit";

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

type Step = "tipo" | "detalhe" | "done";

export default function FeedbackDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, family } = useAuth();
  const [step, setStep] = useState<Step>("tipo");
  const [tipo, setTipo] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep("tipo");
    setTipo(null);
    setMensagem("");
    setFile(null);
    setFileError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    // Pequeno atraso para o reset não piscar durante a animação de fecho.
    setTimeout(reset, 200);
  };

  const pickTipo = (value: string) => {
    setTipo(value);
    setStep("detalhe");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!f) return setFile(null);
    if (!ACCEPTED.includes(f.type)) {
      setFileError("Formato não suportado (PNG, JPEG ou WebP).");
      return;
    }
    if (f.size > MAX_SCREENSHOT_BYTES) {
      setFileError("A imagem excede 5 MB.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!tipo || !mensagem.trim() || submitting) return;
    setSubmitting(true);
    try {
      const submissionId = await createSubmission({
        instrument: "D",
        eventoGatilho: "user_initiated",
        familyId: family?.id ?? null,
      });

      const tipoLabel = FEEDBACK_D_TYPES.find((t) => t.value === tipo)?.label ?? tipo;
      await saveAnswer(submissionId, "D_tipo", { choice: tipoLabel });
      await saveAnswer(submissionId, "D_mensagem", { text: mensagem.trim() });

      if (file && user) {
        try {
          const path = await uploadScreenshot(user.id, submissionId, file);
          await saveAnswer(submissionId, "D_screenshot", { screenshot_path: path });
        } catch {
          // Upload falhou — submete na mesma sem screenshot (degradação suave).
        }
      }

      await completeSubmission(submissionId);
      track("feedback_submitted", { instrument: "D" });
      notifyTeam(submissionId);
      setStep("done");
      // Fecha sozinho após a confirmação.
      setTimeout(handleClose, 2600);
    } catch {
      // Falha total — não bloqueia o utilizador; permite tentar de novo.
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        {step === "tipo" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-bold text-foreground">Conta-nos</h2>
              <p className="text-sm text-muted-foreground">O que nos queres dizer?</p>
            </div>
            <div className="space-y-2">
              {FEEDBACK_D_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => pickTipo(t.value)}
                  className="w-full text-left rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:border-primary/50 hover:bg-muted transition"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "detalhe" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-bold text-foreground">
                {FEEDBACK_D_TYPES.find((t) => t.value === tipo)?.label}
              </h2>
              <p className="text-sm text-muted-foreground">Descreve com as tuas palavras.</p>
            </div>

            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Escreve aqui…"
              rows={4}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">{RGPD_NOTE}</p>

            {/* Screenshot opcional */}
            {file ? (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <ImagePlus className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
                <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground cursor-pointer hover:border-primary/50 transition">
                <ImagePlus className="h-4 w-4" />
                Anexar screenshot (opcional)
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileChange} />
              </label>
            )}
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" onClick={handleClose} className="flex-1" disabled={submitting}>
                Agora não
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={!mensagem.trim() || submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="py-6 text-center space-y-3">
            <MessageCircleHeart className="h-10 w-10 text-primary mx-auto" />
            <p className="text-sm text-foreground leading-relaxed max-w-xs mx-auto">
              {FEEDBACK_CONFIRMATION}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
