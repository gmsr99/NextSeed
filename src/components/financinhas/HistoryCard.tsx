import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { FinLesson } from "@/lib/types";
import LessonView, { lessonLabel } from "./LessonView";

const fmt = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "sem data");

export default function HistoryCard({ lessons, undated, busy, onMarkGiven, onDelete }: {
  lessons: FinLesson[];
  /** Importadas sem data: estavam produzidas, não se sabe se foram dadas. */
  undated: FinLesson[];
  busy: boolean;
  onMarkGiven: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico</CardTitle>
        <CardDescription>{lessons.length} aula{lessons.length === 1 ? "" : "s"} dada{lessons.length === 1 ? "" : "s"}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {undated.length > 0 && (
          <div className="space-y-2 pb-2">
            <p className="text-sm font-medium">Por dar (importadas sem data)</p>
            {undated.map((l) => (
              <Collapsible key={l.id} className="rounded-lg border">
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-left text-sm">
                  <span><strong>{l.title ?? "Aula"}</strong> · {lessonLabel(l)}</span><ChevronDown className="h-4 w-4 shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <LessonView lesson={l} busy={busy} onMarkGiven={(d) => onMarkGiven(l.id, d)} onDelete={() => onDelete(l.id)} />
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
        {lessons.length === 0 && undated.length === 0 && <p className="text-sm text-muted-foreground">Ainda nenhuma aula dada.</p>}
        {lessons.map((l) => (
          <Collapsible key={l.id} className="rounded-lg border">
            <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm">
              <span className="flex-1"><span className="text-muted-foreground">{fmt(l.given_on)}</span> · <strong>{l.title ?? "Aula"}</strong> · {lessonLabel(l)}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <LessonView lesson={l} busy={busy} onDelete={() => onDelete(l.id)} />
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
