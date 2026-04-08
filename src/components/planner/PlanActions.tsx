import { ChevronLeft, Loader2, Download, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanActionsProps {
  planId: string | null;
  saving: boolean;
  sending: boolean;
  sent: boolean;
  onBack: () => void;
  onSave: () => void;
  onDownload: () => void;
  onSendEmail: () => void;
}

export function PlanActions({
  planId,
  saving,
  sending,
  sent,
  onBack,
  onSave,
  onDownload,
  onSendEmail,
}: PlanActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
        <ChevronLeft className="h-4 w-4" /> {planId ? "Regenerar" : "Editar"}
      </Button>
      <div className="flex-1" />
      <Button variant="outline" onClick={onSave} disabled={saving} className="gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {planId ? "Atualizar" : "Guardar"}
      </Button>
      <Button variant="outline" onClick={onDownload} className="gap-2">
        <Download className="h-4 w-4" /> Descarregar PDFs
      </Button>
      <Button onClick={onSendEmail} disabled={sending || sent} className="gap-2">
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : sent ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        {sent ? "Email enviado!" : "Enviar por Email"}
      </Button>
    </div>
  );
}
