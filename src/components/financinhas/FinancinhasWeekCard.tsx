// I-21: a sessão Financinhas da semana no Plano Semanal. Mostra, por criança com
// perfil, o dia da semanada e a aula por dar, com o prompt para copiar. Não gera
// aulas aqui: isso faz-se na página Financinhas, onde o adulto revê tudo.
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WeekSession } from "@/lib/financinhas/weekSession";

export default function FinancinhasWeekCard({ sessions, names }: { sessions: WeekSession[]; names: Record<string, string> }) {
  const [copied, setCopied] = useState<string | null>(null);
  if (sessions.length === 0) return null;

  const copy = async (s: WeekSession) => {
    if (!s.lesson?.notebook_prompt) return;
    try {
      await navigator.clipboard.writeText(s.lesson.notebook_prompt);
      setCopied(s.childId);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* sem acesso à área de transferência: o prompt continua na página Financinhas */
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <PiggyBank className="h-4 w-4 text-primary" /> Financinhas desta semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((s) => (
          <div key={s.childId} className="rounded-lg border border-border/60 p-3 text-sm">
            <p className="font-semibold text-foreground">
              {names[s.childId] ?? "Criança"}{" "}
              <span className="font-normal text-muted-foreground">· no dia da semanada ({s.weekdayLabel})</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Primeiro o ritual de 5 minutos (os quatro mealheiros), depois a sessão.
              {!s.inPlanDays && " É ao fim de semana, por isso não entra no horário."}
            </p>
            {s.lesson ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="flex-1 text-foreground">{s.lesson.title ?? "Aula por dar"}</span>
                {s.lesson.notebook_prompt && (
                  <Button size="sm" variant="outline" onClick={() => copy(s)}>
                    {copied === s.childId ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                    {copied === s.childId ? "Copiado" : "Copiar o prompt"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="flex-1 text-muted-foreground">Ainda não há aula preparada para esta semana.</span>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/financinhas">Preparar em Financinhas</Link>
                </Button>
              </div>
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          O guia do adulto, o quiz e as atividades saem num PDF próprio em Descarregar PDFs, quando há aula preparada.
        </p>
      </CardContent>
    </Card>
  );
}
