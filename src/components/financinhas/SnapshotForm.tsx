// Fotografia leve (trilho §7): 6 perguntas, 3 minutos, só o adulto responde.
// Faz-se na S1 (entrada) e depois da S12 (saída); a diferença é a avaliação.
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SNAPSHOT_QUESTIONS } from "@/lib/financinhas/catalog";

export default function SnapshotForm({
  value, onChange, previous, idPrefix,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  /** Respostas da entrada, para mostrar ao lado na saída. */
  previous?: Record<string, string> | null;
  idPrefix: string;
}) {
  return (
    <div className="space-y-4">
      {SNAPSHOT_QUESTIONS.map((q, i) => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-medium">
            {i + 1}. {q.text} {q.key && <span className="text-xs text-primary font-normal">(a mais importante)</span>}
          </p>
          {previous?.[q.id] && <p className="text-xs text-muted-foreground">À entrada: {previous[q.id]}</p>}
          <RadioGroup
            value={value[q.id] ?? ""}
            onValueChange={(v) => onChange({ ...value, [q.id]: v })}
            className="flex flex-wrap gap-x-5 gap-y-2"
          >
            {q.options.map((o) => (
              <div key={o} className="flex items-center gap-2">
                <RadioGroupItem value={o} id={`${idPrefix}-${q.id}-${o}`} />
                <Label htmlFor={`${idPrefix}-${q.id}-${o}`} className="text-sm font-normal">{o}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
    </div>
  );
}
