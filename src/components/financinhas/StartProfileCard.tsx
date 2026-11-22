import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Loader2, PiggyBank } from "lucide-react";
import { formatEuros, suggestedAllowanceCents } from "@/lib/financinhas/engine";
import type { Tier } from "@/lib/financinhas/catalog";
import SnapshotForm from "./SnapshotForm";

export const WEEKDAYS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

export function parseEuros(text: string): number | null {
  const t = text.replace(",", ".").replace(/[^\d.]/g, "");
  if (!t) return null;
  const n = Math.round(Number(t) * 100);
  return Number.isFinite(n) && n >= 0 && n <= 20000 ? n : null;
}

export default function StartProfileCard({
  firstName, age, tier, saving, onStart,
}: {
  firstName: string;
  age: number;
  tier: Tier;
  saving: boolean;
  onStart: (p: { stage: "trilho" | "ciclo"; allowance_cents: number | null; ritual_weekday: number; snapshot: Record<string, string> }) => void;
}) {
  const [stage, setStage] = useState<"trilho" | "ciclo">("trilho");
  const [allowance, setAllowance] = useState(((suggestedAllowanceCents(age) / 100).toFixed(2)).replace(".", ","));
  const [weekday, setWeekday] = useState("6");
  const [snapshot, setSnapshot] = useState<Record<string, string>>({});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5 text-primary" /> Começar o Financinhas com {firstName}</CardTitle>
        <CardDescription>
          {age} anos · escalão {tier}. Uma sessão por semana e um ritual de 5 minutos no dia da semanada. A app é só para ti: a criança não tem conta, pontos nem ecrã.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Por onde começar</Label>
          <RadioGroup value={stage} onValueChange={(v) => setStage(v as "trilho" | "ciclo")} className="space-y-2">
            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
              <RadioGroupItem value="trilho" className="mt-1" />
              <span className="text-sm"><strong>Trilho de Iniciação</strong> (recomendado)<br /><span className="text-muted-foreground">12 sessões por ordem, uma por semana. Não tens de escolher nada: a app propõe a sessão seguinte e tu escolhes o universo (o interesse do momento).</span></span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
              <RadioGroupItem value="ciclo" className="mt-1" />
              <span className="text-sm"><strong>Ciclo semanal</strong><br /><span className="text-muted-foreground">Para quem já fez o trilho ou já trabalha estes temas em casa. A app escolhe o tema pelas competências mais frágeis.</span></span>
            </label>
          </RadioGroup>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fin-allowance">Semanada (€)</Label>
            <Input id="fin-allowance" inputMode="decimal" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
            <p className="text-xs text-muted-foreground">Sugestão: metade da idade ({formatEuros(suggestedAllowanceCents(age))}). É uma orientação: a regularidade vale mais do que o valor. Nunca é prémio nem castigo.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Dia do ritual da semanada</Label>
            <Select value={weekday} onValueChange={setWeekday}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((d, i) => <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Sempre o mesmo dia e a mesma hora.</p>
          </div>
        </div>

        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium text-primary">
            Fotografia inicial (3 minutos, opcional agora) <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <p className="text-xs text-muted-foreground mb-3">Seis perguntas só para ti, para teres um antes e um depois. No fim do trilho fazes as mesmas. Não é uma avaliação da criança.</p>
            <SnapshotForm value={snapshot} onChange={setSnapshot} idPrefix="start" />
          </CollapsibleContent>
        </Collapsible>

        <Button
          disabled={saving}
          onClick={() => onStart({ stage, allowance_cents: parseEuros(allowance), ritual_weekday: Number(weekday), snapshot })}
        >
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Começar
        </Button>
      </CardContent>
    </Card>
  );
}
