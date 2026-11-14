// Registo de 2 minutos (R-10): três linhas sobre o dia, para uma ou várias
// crianças de uma vez. Cada criança fica com uma entrada "Registo do dia".
import { useState } from "react";
import { format } from "date-fns";
import { Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useActivities } from "@/hooks/useActivities";
import { DAY_LOG_TITLE, dayLogDescription } from "@/lib/dayLog";
import type { Child } from "@/lib/types";

const FIELDS = [
  { key: "done", label: "O que fizemos", placeholder: "Ex: herbário, contas com castanhas, leitura do episódio 2" },
  { key: "pending", label: "O que ficou por fazer", placeholder: "Ex: a ficha de inglês" },
  { key: "note", label: "Uma coisa que correu bem e uma que mudarias", placeholder: "Ex: adorou medir as folhas; a manhã foi comprida demais" },
] as const;

export default function QuickDayLog({ children }: { children: Child[] }) {
  const { createActivity } = useActivities();
  const [log, setLog] = useState({ done: "", pending: "", note: "" });
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = children.filter((c) => !excluded.has(c.id));
  const description = dayLogDescription(log);

  const save = async () => {
    if (!description || selected.length === 0) return;
    setSaving(true);
    try {
      const activity_date = format(new Date(), "yyyy-MM-dd");
      for (const child of selected) {
        await createActivity.mutateAsync({ child_id: child.id, title: DAY_LOG_TITLE, description, activity_date });
      }
      setLog({ done: "", pending: "", note: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ title: "Não foi possível guardar", description: "Tenta outra vez daqui a pouco.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (children.length === 0) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Clock className="h-4 w-4 text-primary" /> Registo de 2 minutos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Três linhas sobre o dia de hoje. Não precisam de estar todas preenchidas. No fim do período, estas notas são a
          base do relatório.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {children.length > 1 && (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {children.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={!excluded.has(c.id)}
                  onCheckedChange={(v) =>
                    setExcluded((prev) => {
                      const next = new Set(prev);
                      if (v) next.delete(c.id);
                      else next.add(c.id);
                      return next;
                    })
                  }
                />
                {c.name}
              </label>
            ))}
          </div>
        )}
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`daylog-${f.key}`}>{f.label}</Label>
            <Textarea
              id={`daylog-${f.key}`}
              rows={2}
              maxLength={600}
              value={log[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => setLog((p) => ({ ...p, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={!description || selected.length === 0 || saving}>
            {saving ? "A guardar…" : "Guardar o registo de hoje"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-700" role="status">
              <CheckCircle2 className="h-4 w-4" /> Guardado no Diário
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
