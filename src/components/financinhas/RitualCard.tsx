import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Loader2 } from "lucide-react";
import { FLOOR_BY_TIER, NOTEBOOK_BY_TIER, PIGGY_BANKS, RITUAL_STEPS, type Tier } from "@/lib/financinhas/catalog";
import { formatEuros } from "@/lib/financinhas/engine";
import { floorPending, type RitualEntry } from "@/lib/financinhas/ritual";
import type { FinRitual } from "@/lib/types";
import { WEEKDAYS, parseEuros } from "./StartProfileCard";

export default function RitualCard({
  tier, weekday, allowanceCents, weekStart, current, previous, saving, onSave,
}: {
  tier: Tier;
  weekday: number;
  allowanceCents: number | null;
  weekStart: string;
  current: FinRitual | null;
  previous: FinRitual | null;
  saving: boolean;
  onSave: (e: RitualEntry) => void;
}) {
  const young = tier === "5-6";
  const [amount, setAmount] = useState("");
  const [choice, setChoice] = useState("");
  const [floorUsed, setFloorUsed] = useState(false);
  const [floorRestored, setFloorRestored] = useState(false);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const cents = current?.amount_cents ?? allowanceCents;
    setAmount(cents != null ? (cents / 100).toFixed(2).replace(".", ",") : "");
    setChoice(current?.choice_text ?? "");
    setFloorUsed(current?.floor_used ?? false);
    setFloorRestored(current?.floor_restored ?? false);
    setQuestion(current?.question ?? "");
  }, [current, allowanceCents, weekStart]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ritual da semanada</CardTitle>
        <CardDescription>
          5 minutos, todas as semanas à {WEEKDAYS[weekday - 1]}{allowanceCents != null ? `, ${formatEuros(allowanceCents)}` : ""}. {current ? "Já registado esta semana: podes corrigir." : "Depois de o fazerem, regista em 30 segundos."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!current && floorPending(previous) && (
          <p className="text-sm rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
            Na semana passada o chão do 🐷 foi usado e ainda não foi reposto. Repõe-se antes de tudo nesta semanada. Se for ela a lembrar-se, é o momento mais importante do modelo: celebra.
          </p>
        )}

        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium text-primary">Os 5 passos e os mealheiros <ChevronDown className="h-4 w-4" /></CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3 text-sm">
            <ol className="list-decimal pl-5 space-y-1">{RITUAL_STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
            <ul className="space-y-1">
              {PIGGY_BANKS.map((p) => <li key={p.emoji}>{p.emoji} <strong>{young ? p.nameYoung : p.name}</strong>: {p.what}</li>)}
            </ul>
            <p><strong>O chão:</strong> {FLOOR_BY_TIER[tier]}</p>
            <p><strong>Caderninho (em papel, é dela):</strong> {NOTEBOOK_BY_TIER[tier]}</p>
          </CollapsibleContent>
        </Collapsible>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="rit-amount">Quanto recebeu (€)</Label>
            <Input id="rit-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rit-question">A pergunta que fizeste (opcional)</Label>
            <Input id="rit-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="o que é que quase compraste e não compraste?" />
          </div>
        </div>
        {!young && (
          <div className="space-y-1.5">
            <Label htmlFor="rit-choice">"Escolhi ___ em vez de ___" (o que ela escreveu, se escreveu)</Label>
            <Input id="rit-choice" value={choice} onChange={(e) => setChoice(e.target.value)} placeholder="escolhi o livro em vez dos cromos" />
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <Switch id="rit-floor" checked={floorUsed} onCheckedChange={(v) => { setFloorUsed(v); if (!v) setFloorRestored(false); }} />
            <Label htmlFor="rit-floor" className="font-normal">Usou o chão do 🐷</Label>
          </div>
          {floorUsed && (
            <div className="flex items-center gap-2">
              <Switch id="rit-restored" checked={floorRestored} onCheckedChange={setFloorRestored} />
              <Label htmlFor="rit-restored" className="font-normal">E já o repôs</Label>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Tu não escreves no caderninho nem corriges as contas. Isto fica só na app, para veres a evolução.</p>
        <Button
          disabled={saving}
          onClick={() => onSave({ done: true, amount_cents: parseEuros(amount), choice_text: choice, floor_used: floorUsed, floor_restored: floorRestored, question })}
        >
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {current ? "Atualizar o registo" : "Fizemos o ritual"}
        </Button>
      </CardContent>
    </Card>
  );
}
