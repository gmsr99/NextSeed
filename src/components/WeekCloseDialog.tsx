// Fecho da semana (P-19, P-20): tema a tema, ficou aprendido ou precisa de
// mais? Grava nas Áreas de Aprendizagem (child_content_progress): o que ficou
// aprendido deixa de entrar nos planos; o que precisa de mais volta nas
// semanas seguintes (P-14).
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { GC_DISCIPLINE_LABELS } from "@/lib/gcConstants";
import { useAnnualPlans } from "@/hooks/useAnnualPlan";
import { planWeekFor, formatWeekShort } from "@/lib/annualPlan";
import { weekContents, weekCloseNote, WEEK_CLOSE_TITLE } from "@/lib/weekClose";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Child } from "@/lib/types";

type Choice = "dominado" | "em_progresso";

interface Props {
  open: boolean;
  onClose: () => void;
  familyChildren: Child[];
  /** Qualquer dia da semana a fechar */
  date: Date;
  title?: string;
}

export default function WeekCloseDialog({ open, onClose, familyChildren, date, title }: Props) {
  const { plans, progress, isLoading } = useAnnualPlans(familyChildren, date);
  const qc = useQueryClient();
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  // Duas linhas opcionais por criança; ficam no Diário como "Fecho da semana"
  const [notes, setNotes] = useState<Record<string, { gains: string; hard: string }>>({});
  const { family } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      familyChildren
        .map((child) => ({
          child,
          items: weekContents(plans[child.id], date).filter((c) => progress[child.id]?.[c.id] !== "dominado"),
        }))
        ,
    [familyChildren, plans, progress, date],
  );
  const week = Object.values(plans)[0] ? planWeekFor(Object.values(plans)[0], date) : null;

  useEffect(() => {
    if (open) {
      setChoices({});
      setNotes({});
      setError(null);
    }
  }, [open]);

  const key = (childId: string, contentId: string) => `${childId}|${contentId}`;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const upserts = Object.entries(choices).map(([k, status]) => {
        const [child_id, content_id] = k.split("|");
        return { child_id, content_id, status, updated_at: new Date().toISOString() };
      });
      if (upserts.length) {
        const { error: e } = await supabase.from("child_content_progress").upsert(upserts, { onConflict: "child_id,content_id" });
        if (e) throw e;
      }
      const entries = Object.entries(notes)
        .map(([child_id, n]) => ({ child_id, description: weekCloseNote(n.gains, n.hard) }))
        .filter((e) => e.description);
      if (entries.length && family) {
        const today = new Date();
        const activity_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const { error: e } = await supabase.from("activities").insert(
          entries.map((x) => ({ family_id: family.id, child_id: x.child_id, title: WEEK_CLOSE_TITLE, description: x.description, activity_date })),
        );
        if (e) throw e;
        await qc.invalidateQueries({ queryKey: ["activities"] });
      }
      await qc.invalidateQueries({ queryKey: ["children-progress"] });
      await qc.invalidateQueries({ queryKey: ["child_content_progress"] });
      onClose();
    } catch {
      setError("Não foi possível guardar. Tenta outra vez.");
    } finally {
      setSaving(false);
    }
  };

  // Sem nada para marcar, não aparece (ex.: semana sem rumo ou tudo já marcado)
  if (!open || isLoading || rows.length === 0) return null;
  const hasNotes = Object.values(notes).some((n) => weekCloseNote(n.gains, n.hard));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title ?? "Como correu a semana?"}</DialogTitle>
          <DialogDescription>
            {week ? `Semana ${week.number}, de ${formatWeekShort(week.monday)}. ` : ""}
            Marca só o que sabes. O que ficou aprendido sai dos próximos planos; o que precisa de mais volta, sem pressa.
          </DialogDescription>
        </DialogHeader>

        {(
          <div className="space-y-5">
            {rows.map(({ child, items }) => (
              <div key={child.id} className="space-y-2">
                {rows.length > 1 && <p className="font-semibold text-foreground">{child.name}</p>}
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sem temas do rumo para marcar nesta semana.</p>
                )}
                {items.map((c) => {
                  const k = key(child.id, c.id);
                  const choice = choices[k];
                  return (
                    <div key={c.id} className="rounded-lg border border-border/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {GC_DISCIPLINE_LABELS[c.discipline] ?? c.discipline}
                      </p>
                      <p className="mt-0.5 text-sm text-foreground">{c.content}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          type="button" size="sm" variant="outline"
                          aria-pressed={choice === "dominado"}
                          className={cn(choice === "dominado" && "border-emerald-500 bg-emerald-50 text-emerald-800")}
                          onClick={() => setChoices((p) => ({ ...p, [k]: "dominado" }))}
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Ficou aprendido
                        </Button>
                        <Button
                          type="button" size="sm" variant="outline"
                          aria-pressed={choice === "em_progresso"}
                          className={cn(choice === "em_progresso" && "border-amber-500 bg-amber-50 text-amber-800")}
                          onClick={() => setChoices((p) => ({ ...p, [k]: "em_progresso" }))}
                        >
                          <RotateCcw className="mr-1.5 h-4 w-4" /> Precisa de mais
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor={`gains-${child.id}`} className="text-xs">O que ganhou esta semana (opcional)</Label>
                    <Textarea id={`gains-${child.id}`} rows={2} maxLength={400} placeholder="Ex: já lê sílabas sozinha"
                      value={notes[child.id]?.gains ?? ""}
                      onChange={(e) => setNotes((p) => ({ ...p, [child.id]: { gains: e.target.value, hard: p[child.id]?.hard ?? "" } }))} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`hard-${child.id}`} className="text-xs">Onde teve dificuldade (opcional)</Label>
                    <Textarea id={`hard-${child.id}`} rows={2} maxLength={400} placeholder="Ex: subtrair com empréstimo"
                      value={notes[child.id]?.hard ?? ""}
                      onChange={(e) => setNotes((p) => ({ ...p, [child.id]: { gains: p[child.id]?.gains ?? "", hard: e.target.value } }))} />
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              As duas linhas ficam guardadas no Diário de cada criança, para o relatório do período. Não são enviadas à inteligência artificial.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Agora não</Button>
          <Button onClick={save} disabled={saving || (Object.keys(choices).length === 0 && !hasNotes)}>
            {saving ? "A guardar…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
