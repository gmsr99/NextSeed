// "As nossas propostas": o estado de cada evento que este utilizador propôs (I-03a).
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Pencil, Plus, XCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCommunityEventMutations, useMyProposals, type CommunityEvent } from "@/hooks/useCommunityEvents";
import { REJECTION_REASONS } from "@/lib/agenda";
import CommunityEventCard from "@/components/agenda/CommunityEventCard";

const STATUS: Record<CommunityEvent["status"], { label: string; cls: string }> = {
  pendente: { label: "À espera da equipa", cls: "bg-amber-100 text-amber-900" },
  publicado: { label: "Publicado", cls: "bg-emerald-100 text-emerald-900" },
  recusado: { label: "Não publicado", cls: "bg-muted text-foreground" },
  cancelado: { label: "Cancelado", cls: "bg-muted text-muted-foreground" },
};

const reasonLabel = (id: string | null) =>
  REJECTION_REASONS.find((r) => r.id === id)?.label.toLowerCase() ?? "outro motivo";

export default function AgendaProposals() {
  const mine = useMyProposals();
  const { cancel } = useCommunityEventMutations();
  const { toast } = useToast();

  const onCancel = async (ev: CommunityEvent) => {
    try {
      await cancel.mutateAsync(ev.id);
      toast({ title: "Evento cancelado", description: "Quem o juntou à agenda vai ver que foi cancelado." });
    } catch {
      toast({ title: "Não foi possível cancelar", description: "Tentem outra vez daqui a pouco.", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link to="/calendar?separador=perto"><ArrowLeft className="h-4 w-4 mr-1" />Agenda</Link>
          </Button>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-heading font-bold">As nossas propostas</h1>
            <Button asChild size="sm"><Link to="/agenda/propor"><Plus className="h-4 w-4 mr-1" />Propor</Link></Button>
          </div>
        </div>

        {mine.isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : mine.isError ? (
          <p className="text-sm text-muted-foreground">A agenda da comunidade ainda está a ser preparada.</p>
        ) : (mine.data ?? []).length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Ainda não propuseram nenhum evento. Conhecem um grupo ou uma oficina para famílias? Demora 2 minutos.
          </p>
        ) : (
          <div className="space-y-4">
            {mine.data!.map((ev) => (
              <CommunityEventCard key={ev.id} event={ev} compact>
                <div className="space-y-2 border-t pt-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[ev.status].cls}`}>
                    {STATUS[ev.status].label}
                  </span>
                  {ev.status === "recusado" && (
                    <p className="text-sm text-muted-foreground">
                      Desta vez não publicámos: {reasonLabel(ev.rejection_reason)}. Se quiserem, acertem os dados e voltem a propor.
                    </p>
                  )}
                  {ev.status !== "cancelado" && (
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/agenda/propor?editar=${ev.id}`}><Pencil className="h-4 w-4 mr-1" />Editar</Link>
                      </Button>
                      {ev.status === "publicado" && (
                        <Button size="sm" variant="ghost" onClick={() => onCancel(ev)} disabled={cancel.isPending}>
                          <XCircle className="h-4 w-4 mr-1" />Cancelar o evento
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CommunityEventCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
