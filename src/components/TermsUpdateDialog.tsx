// Pede a aceitação dos Termos e da Política quando a versão atual ainda não
// foi aceite por esta pessoa (B-09). Não aparece enquanto os textos forem
// rascunho nem enquanto o registo de consentimentos não existir.
import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConsents } from "@/hooks/useConsents";
import { LEGAL_VERSION } from "@/lib/legal";
import { legalIsDraft } from "@/lib/consents";

export default function TermsUpdateDialog() {
  const { consents, set } = useConsents();
  const [failed, setFailed] = useState(false);
  const open = !!consents?.available && !legalIsDraft() && consents.termsVersion !== LEGAL_VERSION;
  if (!open) return null;

  const accept = async () => {
    setFailed(false);
    try {
      await set.mutateAsync({ purpose: "termos", granted: true });
    } catch {
      setFailed(true);
    }
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md [&>button]:hidden" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Atualizámos os nossos textos</DialogTitle>
          <DialogDescription>
            Revimos os Termos de Utilização e a Política de Privacidade para dizer com mais clareza o que fazemos com os
            dados da tua família, incluindo o que vai (e o que não vai) para a inteligência artificial.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 text-sm">
          <Link to="/termos" target="_blank" className="block text-primary underline">Ler os Termos de Utilização</Link>
          <Link to="/privacidade" target="_blank" className="block text-primary underline">Ler a Política de Privacidade</Link>
          <p className="pt-2 text-xs text-muted-foreground">
            Se não concordares, podes descarregar os teus dados e apagar a conta em Definições.
          </p>
          {failed && <p className="text-xs text-destructive">Não foi possível guardar. Tenta outra vez.</p>}
        </div>
        <DialogFooter>
          <Button onClick={accept} disabled={set.isPending}>{set.isPending ? "A guardar…" : "Li e aceito"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
