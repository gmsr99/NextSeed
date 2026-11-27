// Cartão de um evento ou encontro da comunidade. Sem imagens.
import type { ReactNode } from "react";
import { CalendarPlus, Check, ExternalLink, MapPin, Clock, Baby, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL, type Occurrence } from "@/lib/agenda";
import type { CommunityEvent } from "@/hooks/useCommunityEvents";
import { CONTACT_EMAIL, KIND_STYLE, MUNICIPALITY_BY_CODE, formatAges, formatWhen } from "./agendaUi";

interface Props {
  event: CommunityEvent;
  occurrence?: Occurrence<CommunityEvent>;
  distanceKm?: number | null;
  joined?: boolean;
  joining?: boolean;
  onJoin?: () => void;
  /** Na triagem e em "As nossas propostas" o rodapé e o botão não aparecem. */
  compact?: boolean;
  children?: ReactNode;
}

export default function CommunityEventCard({ event: ev, occurrence, distanceKm, joined, joining, onJoin, compact, children }: Props) {
  const kind = KIND_STYLE[ev.kind] ?? KIND_STYLE.evento;
  const Icon = kind.icon;
  const start = occurrence?.start ?? new Date(ev.starts_at);
  const end = occurrence?.end ?? new Date(ev.ends_at);
  const place = MUNICIPALITY_BY_CODE.get(ev.municipality_code)?.name ?? "";
  const reportHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Agenda: correção ou remoção de "${ev.title}"`)}&body=${encodeURIComponent(`Referência: ${ev.id}\n\n`)}`;

  return (
    <article className={cn("rounded-xl border border-l-4 bg-card p-4 space-y-3", kind.border)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", kind.chip)}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {kind.label}
        </span>
        {ev.categories.map((c) => (
          <Badge key={c} variant="outline" className="text-xs font-normal">
            {CATEGORY_LABEL[c] ?? c}
          </Badge>
        ))}
        {ev.recurrence === "weekly" && (
          <Badge variant="secondary" className="text-xs font-normal">Todas as semanas</Badge>
        )}
      </div>

      <div>
        <h3 className="font-semibold leading-snug">{ev.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{ev.description}</p>
      </div>

      <ul className="grid gap-1 text-sm sm:grid-cols-2">
        <li className="flex items-center gap-1.5"><Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />{formatWhen(start, end, ev.all_day)}</li>
        <li className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">
            {[ev.venue, place].filter(Boolean).join(", ")}
            {distanceKm != null && <span className="text-muted-foreground"> · ~{Math.round(distanceKm)} km</span>}
          </span>
        </li>
        <li className="flex items-center gap-1.5"><Baby className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />{formatAges(ev.age_min, ev.age_max)}</li>
        <li className="flex items-center gap-1.5"><Euro className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />{ev.is_free ? "Grátis" : ev.price_text || "Pago"}</li>
      </ul>

      {(ev.url || ev.public_contact) && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {ev.url && (
            <a href={ev.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
              Inscrição e informação <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          {ev.public_contact && <span className="text-muted-foreground">Contacto: {ev.public_contact}</span>}
        </div>
      )}

      {children}

      {!compact && (
        <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Organizado por {ev.organizer_name}. Confirma os detalhes com quem organiza.{" "}
            <a href={reportHref} className="underline underline-offset-2">Pedir correção ou remoção</a>
          </p>
          {onJoin && (
            <Button size="sm" variant={joined ? "secondary" : "default"} disabled={joined || joining} onClick={onJoin} className="shrink-0">
              {joined ? <Check className="h-4 w-4 mr-1" /> : <CalendarPlus className="h-4 w-4 mr-1" />}
              {joined ? "Já está na vossa agenda" : "Juntar à nossa agenda"}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
