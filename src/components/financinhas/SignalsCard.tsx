import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";
import { LEVEL_LABELS, skillByCode } from "@/lib/financinhas/catalog";
import type { FinSignal } from "@/lib/types";

const todayIso = () => new Date().toISOString().slice(0, 10);

function SignalRow({ s, current, busy, onResolve }: {
  s: FinSignal; current: number | undefined; busy: boolean;
  onResolve: (confirm: boolean, date: string, note: string) => void;
}) {
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const skill = skillByCode(s.skill_code);
  return (
    <li className="rounded-lg border p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{s.skill_code} · {skill?.name}</Badge>
        <span className="text-xs text-muted-foreground">
          {s.origin === "ritual" ? "do ritual" : "da aula"} · se confirmares: {current ?? "—"} → {Math.max(current ?? 0, s.target_level)} ({LEVEL_LABELS[Math.max(current ?? 0, s.target_level)]})
        </span>
      </div>
      <p className="text-sm">{s.description}</p>
      <div className="flex flex-wrap items-end gap-2">
        <Input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} className="w-40" aria-label="Quando viste" />
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="O que viste (opcional)" className="flex-1 min-w-[12rem]" />
        <Button size="sm" disabled={busy} onClick={() => onResolve(true, date, note)}><Eye className="h-4 w-4 mr-1" /> Vi isto</Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onResolve(false, date, note)}><X className="h-4 w-4 mr-1" /> Descartar</Button>
      </div>
    </li>
  );
}

export default function SignalsCard({ signals, levels, busy, onResolve }: {
  signals: FinSignal[];
  levels: Record<string, number>;
  busy: boolean;
  onResolve: (s: FinSignal, confirm: boolean, date: string, note: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>O que observar</CardTitle>
        <CardDescription>
          A aula cria a oportunidade; o nível só sobe quando vês o comportamento acontecer, sozinho, na vida real. Confirmar nunca faz descer um nível.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {signals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem sinais à espera. Aparecem aqui depois de cada aula e de cada ritual.</p>
        ) : (
          <ul className="space-y-3">
            {signals.map((s) => (
              <SignalRow key={s.id} s={s} current={levels[s.skill_code]} busy={busy} onResolve={(c, d, n) => onResolve(s, c, d, n)} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
