import { Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EXTRACURRICULAR_COLORS, DAY_LABELS_FULL } from "@/lib/constants";
import type { ExtracurricularActivity } from "@/lib/types";
import type { Child } from "@/lib/types";

interface ExtracurricularsCardProps {
  extracurriculars: ExtracurricularActivity[];
  children: Child[];
}

export function ExtracurricularsCard({ extracurriculars, children }: ExtracurricularsCardProps) {
  if (extracurriculars.length === 0) return null;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Extracurriculares da Semana</CardTitle>
        <CardDescription>Atividades fora do horário académico</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {extracurriculars.map((act) => {
            const color = EXTRACURRICULAR_COLORS[act.type ?? "Outro"] ?? "#9CA3AF";
            const dayLabel = act.day_of_week ? DAY_LABELS_FULL[act.day_of_week - 1] : "";
            const timeLabel = act.start_time
              ? `${act.start_time}${act.end_time ? `-${act.end_time}` : ""}`
              : "";
            const childName = act.child_id
              ? children.find((c) => c.id === act.child_id)?.name ?? ""
              : "Todos";

            return (
              <div
                key={act.id}
                className="flex gap-3 rounded-xl p-3"
                style={{ backgroundColor: color + "18", borderLeft: `3px solid ${color}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {act.type && (
                      <Badge variant="secondary" className="text-xs" style={{ backgroundColor: color + "33" }}>
                        {act.type}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{childName}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{act.name}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    {dayLabel && <span className="font-medium">{dayLabel}</span>}
                    {timeLabel && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{timeLabel}
                      </span>
                    )}
                    {act.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{act.location}
                      </span>
                    )}
                    {act.travel_time_minutes > 0 && (
                      <span>{act.travel_time_minutes}min deslocação</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
