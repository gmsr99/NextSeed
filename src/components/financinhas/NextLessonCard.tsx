import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { SKILLS, modeByCode, skillByCode, themeByNumber, trackSession } from "@/lib/financinhas/catalog";
import type { LessonPlan } from "@/lib/financinhas/engine";
import type { FinLesson } from "@/lib/types";
import LessonView from "./LessonView";

export interface PlanOptions { focusSkill: string | null; continueModule: boolean }

export interface GenerateRequest {
  plan: LessonPlan;
  interest: string;
  situation: string;
  extra: string;
  withChallenge: boolean;
}

export default function NextLessonCard({
  makePlan, canContinueModule, pendingLesson, defaultInterest, generating, busy,
  onGenerate, onMarkGiven, onDelete,
}: {
  makePlan: (o: PlanOptions) => LessonPlan;
  canContinueModule: boolean;
  pendingLesson: FinLesson | null;
  defaultInterest: string;
  generating: boolean;
  busy: boolean;
  onGenerate: (r: GenerateRequest) => void;
  onMarkGiven: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}) {
  const [focusSkill, setFocusSkill] = useState<string>("auto");
  const [continueModule, setContinueModule] = useState(false);
  const [interest, setInterest] = useState(defaultInterest);
  const [situation, setSituation] = useState("");
  const [extra, setExtra] = useState("");
  const [withChallenge, setWithChallenge] = useState(false);

  const plan = useMemo(
    () => makePlan({ focusSkill: focusSkill === "auto" ? null : focusSkill, continueModule }),
    [makePlan, focusSkill, continueModule],
  );

  if (pendingLesson) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aula desta semana: {pendingLesson.title ?? "por dar"}</CardTitle>
          <CardDescription>Gerada e por dar. Prepara-a com calma, dá-a quando der jeito e marca-a como dada. Depois, a app propõe a seguinte.</CardDescription>
        </CardHeader>
        <CardContent>
          <LessonView
            lesson={pendingLesson}
            busy={busy}
            onMarkGiven={(date) => onMarkGiven(pendingLesson.id, date)}
            onDelete={() => onDelete(pendingLesson.id)}
          />
        </CardContent>
      </Card>
    );
  }

  const session = plan.trackSession ? trackSession(plan.trackSession) : null;
  const theme = plan.themeNumbers[0] ? themeByNumber(plan.themeNumbers[0]) : null;
  const mode = modeByCode(plan.mode);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próxima aula</CardTitle>
        <CardDescription>
          {session ? `Sessão ${session.number} de 12 · ${session.title}` : theme ? `Tema ${theme.number} · ${theme.title}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-sm">
          {plan.reasons.map((r) => <p key={r}>{r}</p>)}
          <div className="flex flex-wrap gap-2 pt-1">
            {plan.skills.map((c) => <Badge key={c} title={skillByCode(c)?.observable}>{c} · {skillByCode(c)?.name}</Badge>)}
            {plan.reinforce.map((c) => <Badge key={c} variant="outline" title={skillByCode(c)?.observable}>reforço: {c}</Badge>)}
          </div>
          <p className="text-xs text-muted-foreground">
            Protagonista: <strong>{plan.protagonist}</strong> (fictício, nunca o nome da criança) · forma da descoberta: {mode?.name ?? plan.mode}
            {plan.previousMode && ` (a anterior foi ${modeByCode(plan.previousMode)?.name ?? plan.previousMode})`}. A forma é só para ti: não se diz nem se nomeia na história.
          </p>
          {session && <p className="text-xs text-muted-foreground">Atividade da sessão: {session.activity}</p>}
        </div>

        {plan.kind === "ciclo" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Competência a trabalhar</Label>
              <Select value={focusSkill} onValueChange={setFocusSkill} disabled={continueModule}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Deixar a app escolher (as mais frágeis)</SelectItem>
                  {SKILLS.map((s) => <SelectItem key={s.code} value={s.code}>{s.code} · {s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {canContinueModule && (
              <div className="flex items-center gap-3 pt-6">
                <Switch id="fin-module" checked={continueModule} onCheckedChange={setContinueModule} />
                <Label htmlFor="fin-module" className="font-normal">Continuar a história da última aula (módulo de até 3 semanas)</Label>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="fin-interest">Universo: o interesse do momento</Label>
          <Input id="fin-interest" value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="ex.: dinossauros, futebol, LEGO" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fin-situation">Situação real desta semana (opcional)</Label>
          <Textarea id="fin-situation" rows={2} value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="ex.: pediu um brinquedo no supermercado; quer juntar para uma bicicleta" />
          <p className="text-xs text-muted-foreground">Quanto mais real, mais forte a ligação. Não escrevas nomes de pessoas: este texto vai para a IA.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fin-extra">Pedido especial (opcional)</Label>
          <Input id="fin-extra" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="ex.: versão mais curta; incluir a irmã mais nova" />
        </div>
        <div className="flex items-center gap-3">
          <Switch id="fin-challenge" checked={withChallenge} onCheckedChange={setWithChallenge} />
          <Label htmlFor="fin-challenge" className="font-normal">Incluir um Desafio da Semana (projeto que atravessa a semana)</Label>
        </div>

        <Button disabled={generating} onClick={() => onGenerate({ plan, interest, situation, extra, withChallenge })}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {generating ? "A preparar a aula (pode demorar um minuto)…" : "Gerar a aula"}
        </Button>
      </CardContent>
    </Card>
  );
}
