// Triagem da Agenda (I-03a): só para a equipa (team_admins). A RLS e o trigger da 041
// garantem o mesmo no servidor; esta página só arruma o trabalho. Meta: ≤ 10 min por semana.
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";
import { useCommunityEventMutations, usePendingEvents, type CommunityEvent } from "@/hooks/useCommunityEvents";
import { REJECTION_REASONS } from "@/lib/agenda";
import CommunityEventCard from "@/components/agenda/CommunityEventCard";

const CRITERIA = [
  "É para crianças ou famílias?",
  "É real, com data e local?",
  "Quem organiza está identificado?",
  "A informação chega para uma família decidir?",
  "Não é só publicidade?",
];

function Row({ ev }: { ev: CommunityEvent }) {
  const { review } = useCommunityEventMutations();
  const { toast } = useToast();
  const [reason, setReason] = useState<string>("");
  const busy = review.isPending;

  const act = async (status: "publicado" | "recusado") => {
    try {
      await review.mutateAsync({ id: ev.id, status, reason });
      toast({ title: status === "publicado" ? "Publicado" : "Recusado" });
    } catch (e) {
      toast({ title: "Não foi possível guardar", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <CommunityEventCard event={ev} compact>
      <div className="space-y-2 border-t pt-3 text-xs text-muted-foreground">
        <p>Organizado por {ev.organizer_name} · proposto a {new Date(ev.created_at).toLocaleDateString("pt-PT")}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button size="sm" onClick={() => act("publicado")} disabled={busy}>
            <Check className="h-4 w-4 mr-1" />Publicar
          </Button>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-9 sm:w-[240px]"><SelectValue placeholder="Motivo para recusar" /></SelectTrigger>
            <SelectContent>
              {REJECTION_REASONS.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => act("recusado")} disabled={busy || !reason}>
            <X className="h-4 w-4 mr-1" />Recusar
          </Button>
        </div>
      </div>
    </CommunityEventCard>
  );
}

export default function AgendaTriage() {
  const { isAdmin, isLoading } = useIsTeamAdmin();
  const pending = usePendingEvents(isAdmin);

  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/calendar" replace />;

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link to="/calendar?separador=perto"><ArrowLeft className="h-4 w-4 mr-1" />Agenda</Link>
          </Button>
          <h1 className="text-2xl font-heading font-bold">Triagem da Agenda</h1>
          <ul className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            {CRITERIA.map((c) => <li key={c}>· {c}</li>)}
          </ul>
        </div>
        {pending.isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : pending.isError ? (
          <p className="text-sm text-muted-foreground">A tabela da agenda ainda não existe nesta base de dados (migração 041).</p>
        ) : (pending.data ?? []).length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Não há propostas à espera.</p>
        ) : (
          <div className="space-y-4">
            {pending.data!.map((ev) => <Row key={ev.id} ev={ev} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
