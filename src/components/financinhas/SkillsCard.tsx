import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DOMAINS, LEVEL_HINTS, LEVEL_LABELS, SKILLS, type Skill } from "@/lib/financinhas/catalog";
import type { FinSkillEvent } from "@/lib/types";

const todayIso = () => new Date().toISOString().slice(0, 10);
const fmt = (iso: string) => iso.split("-").reverse().join("/");

function LevelDots({ level }: { level: number | undefined }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={level ? `nível ${level}` : "por avaliar"}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={`h-2 w-4 rounded-full ${level && n <= level ? "bg-primary" : "bg-muted"}`} />
      ))}
    </span>
  );
}

export default function SkillsCard({ levels, lastEvents, busy, onSave }: {
  levels: Record<string, number>;
  lastEvents: Record<string, FinSkillEvent>;
  busy: boolean;
  onSave: (e: { skill_code: string; level: number; origin: "observacao" | "ajuste"; note: string; observed_on: string }) => void;
}) {
  const [editing, setEditing] = useState<Skill | null>(null);
  const [level, setLevel] = useState("2");
  const [origin, setOrigin] = useState<"observacao" | "ajuste">("observacao");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayIso());

  const open = (s: Skill) => {
    setEditing(s);
    setLevel(String(levels[s.code] ?? 2));
    setOrigin("observacao");
    setNote("");
    setDate(todayIso());
  };

  const assessed = Object.keys(levels).length;
  const current = editing ? levels[editing.code] : undefined;
  const lowersByObservation = origin === "observacao" && current !== undefined && Number(level) < current;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competências</CardTitle>
        <CardDescription>
          {assessed} de 26 avaliadas. 1 Emergente · 2 Em desenvolvimento · 3 Consolidado · 4 Autónomo. Isto é para ti: a criança não vê níveis nem pontos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {DOMAINS.map((d) => (
          <div key={d.code} className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{d.name}</p>
            <ul className="divide-y rounded-lg border">
              {SKILLS.filter((s) => s.domain === d.code).map((s) => {
                const ev = lastEvents[s.code];
                return (
                  <li key={s.code}>
                    <button type="button" onClick={() => open(s)} className="w-full text-left flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-muted/40">
                      <span className="text-xs font-mono w-8">{s.code}</span>
                      <span className="text-sm flex-1 min-w-[10rem]">{s.name}</span>
                      <LevelDots level={levels[s.code]} />
                      <span className="text-xs text-muted-foreground w-36 text-right">
                        {levels[s.code] ? `${LEVEL_LABELS[levels[s.code]]}${ev ? ` · ${fmt(ev.observed_on)}` : ""}` : "por avaliar"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.code} · {editing?.name}</DialogTitle>
            <DialogDescription>O que se vê: {editing?.observable}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={origin} onValueChange={(v) => setOrigin(v as "observacao" | "ajuste")} className="space-y-1">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="observacao" /> Observei isto na vida real</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="ajuste" /> Corrigir o nível (enganei-me antes)</label>
            </RadioGroup>
            <RadioGroup value={level} onValueChange={setLevel} className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((n) => (
                <label key={n} className="flex items-start gap-2 rounded-lg border p-2 text-sm">
                  <RadioGroupItem value={String(n)} className="mt-0.5" />
                  <span><strong>{n} · {LEVEL_LABELS[n]}</strong><br /><span className="text-xs text-muted-foreground">{LEVEL_HINTS[n]}</span></span>
                </label>
              ))}
            </RadioGroup>
            {lowersByObservation && (
              <p className="text-xs text-muted-foreground">Uma observação nunca faz descer o nível ({current}). Se te enganaste antes, escolhe "Corrigir o nível".</p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="sk-date">Data</Label>
                <Input id="sk-date" type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor="sk-note">Nota (o que viste)</Label>
                <Textarea id="sk-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button
              disabled={busy || !date || (origin === "ajuste" && !note.trim())}
              onClick={() => { if (editing) onSave({ skill_code: editing.code, level: Number(level), origin, note, observed_on: date }); setEditing(null); }}
            >
              Guardar
            </Button>
          </DialogFooter>
          {origin === "ajuste" && !note.trim() && <p className="text-xs text-muted-foreground text-right">Para corrigir, escreve uma nota a explicar.</p>}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
