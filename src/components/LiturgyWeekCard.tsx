// Tradição da família (I-08): o tempo litúrgico da semana no Planeador.
// Só aparece a quem tem a tradição ligada.
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { WeekLiturgy } from "@/lib/tradicao/week";

export default function LiturgyWeekCard({ liturgy }: { liturgy: WeekLiturgy | null }) {
  if (!liturgy) return null;
  return (
    <Card className="border-border/60">
      <CardContent className="flex gap-3 p-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">Esta semana na liturgia: {liturgy.label}</p>
          {liturgy.antiphon && <p className="text-xs text-muted-foreground">Antífona do tempo: {liturgy.antiphon}</p>}
          {liturgy.celebrations.length > 0 ? (
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {liturgy.celebrations.map((c) => (
                <li key={c.day + c.name}><span className="text-foreground">{c.day} · {c.name}.</span> {c.desafio}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              As celebrações da semana, com um desafio curto, aparecem aqui depois de as fichas estarem revistas.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
