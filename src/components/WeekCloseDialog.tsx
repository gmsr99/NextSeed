// Fecho da semana (DASH §4, v3.1; antes P-19/P-20). Por criança e disciplina,
// os temas do rumo dessa semana, as revisões e as unidades do manual. Por item:
//   não marcado → não foi dado; passa para a semana seguinte
//   marcado → dado (conta para o ritmo do ano), domínio ok
//   marcado + "precisa de mais" → dado e a consolidar; volta mais tarde
// A nota é à parte: texto livre, só para o adulto, guardada no Diário. Nunca
// vai para o plano nem para a IA.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RotateCcw, StickyNote } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { GC_DISCIPLINE_LABELS } from "@/lib/gcConstants";
import { useAnnualPlans } from "@/hooks/useAnnualPlan";
import { useChildManuals } from "@/hooks/useChildManuals";
import { planWeekFor, formatWeekShort, mondayOf, isoDay, type AnnualContent, type AnnualPlan } from "@/lib/annualPlan";
import { WEEK_CLOSE_TITLE } from "@/lib/weekClose";
import { closeStatus, closeSummary } from "@/lib/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import type { Child, Json } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  familyChildren: Child[];
  /** Qualquer dia da semana a fechar */
  date: Date;
  title?: string;
  /** Depois de guardar, propor preparar a semana seguinte (Início) */
  proposeNext?: boolean;
}

interface CloseItem {
  key: string;
  childId: string;
  discipline: string;
  label: string;
  kind: "tema" | "revisao" | "manual";
  contentId?: string;
  /** Manual: id da linha em child_manuals e posição no índice */
  manualId?: string;
  line?: number;
  /** Manual: é a última parte da unidade (marcar dado fecha a unidade) */
  lastPart?: boolean;
}

const MAX_REVIEWS = 2;
const labelOf = (d: string) => GC_DISCIPLINE_LABELS[d] ?? d;
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const closeShownKey = (monday: Date) => `nexseed:week-close:${isoDay(mondayOf(monday))}`;

export default function WeekCloseDialog({ open, onClose, familyChildren, date, title, proposeNext }: Props) {
  const { plans, progress, isLoading } = useAnnualPlans(familyChildren, date);
  const { manuals } = useChildManuals();
  const { family } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const monday = mondayOf(date);
  const [given, setGiven] = useState<Record<string, boolean>>({});
  const [needsMore, setNeedsMore] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSummary, setSavedSummary] = useState<string | null>(null);

  // Atividades do plano da semana: as que foram marcadas no Hoje pré-marcam a disciplina
  const { data: planItems = [] } = useQuery({
    queryKey: ["week-close-items", family?.id, isoDay(monday)],
    enabled: open && !!family,
    queryFn: async () => {
      const { data: plan } = await supabase
        .from("weekly_plans").select("id").eq("week_start", isoDay(monday))
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!plan) return [];
      const { data } = await supabase.from("weekly_plan_items").select("child_id, discipline, completed_at").eq("plan_id", plan.id);
      return data ?? [];
    },
  });

  const rows = useMemo(() => {
    return familyChildren.map((child) => {
      const plan: AnnualPlan | undefined = plans[child.id];
      const status: Record<string, string> = progress[child.id] ?? {};
      const items: CloseItem[] = [];
      const week = plan ? planWeekFor(plan, date) : null;
      const mine = manuals.filter((m) => m.child_id === child.id && m.entries.length > 0);
      if (plan) {
        // Revisões: o que está a consolidar e já passou no rumo (até duas por disciplina)
        const reviews: Record<string, number> = {};
        const seen = new Set<string>();
        for (const w of plan.weeks) {
          if (w.monday.getTime() > monday.getTime() + 12 * 3600 * 1000) break;
          for (const c of Object.values(w.byDiscipline).flat() as AnnualContent[]) {
            if (c.fromManual || status[c.id] !== "em_progresso" || seen.has(c.id)) continue;
            if ((reviews[c.discipline] ?? 0) >= MAX_REVIEWS) continue;
            seen.add(c.id);
            reviews[c.discipline] = (reviews[c.discipline] ?? 0) + 1;
            items.push({ key: `${child.id}|${c.id}`, childId: child.id, discipline: c.discipline, label: `Rever · ${c.content}`, kind: "revisao", contentId: c.id });
          }
        }
        for (const c of Object.values(week?.byDiscipline ?? {}).flat() as AnnualContent[]) {
          if (seen.has(c.id)) continue;
          if (c.fromManual) {
            const [, , k, line] = c.id.split(":");
            const m = mine[Number(k)];
            if (!m || line === "next" || !("id" in m)) continue;
            const parts = c.content.match(/parte (\d+) de (\d+)$/);
            items.push({
              key: `${child.id}|${c.id}`, childId: child.id, discipline: c.discipline, label: c.content, kind: "manual",
              manualId: (m as { id: string }).id, line: Number(line), lastPart: !parts || parts[1] === parts[2],
            });
          } else if (status[c.id] !== "dominado") {
            items.push({ key: `${child.id}|${c.id}`, childId: child.id, discipline: c.discipline, label: c.content, kind: "tema", contentId: c.id });
          }
        }
      }
      const byDiscipline = new Map<string, CloseItem[]>();
      for (const it of items) byDiscipline.set(it.discipline, [...(byDiscipline.get(it.discipline) ?? []), it]);
      return { child, groups: [...byDiscipline.entries()] };
    });
  }, [familyChildren, plans, progress, manuals, date, monday]);

  const allItems = rows.flatMap((r) => r.groups.flatMap(([, l]) => l));
  const week = Object.values(plans)[0] ? planWeekFor(Object.values(plans)[0], date) : null;

  // Ao abrir: limpar e pré-marcar as disciplinas com tudo feito no Hoje
  useEffect(() => {
    if (!open) return;
    setNeedsMore({});
    setNotes({});
    setNoteOpen({});
    setError(null);
    setSavedSummary(null);
    const pre: Record<string, boolean> = {};
    for (const it of allItems) {
      if (it.kind === "revisao") continue;
      const mineItems = planItems.filter((p) => p.child_id === it.childId && norm(p.discipline) === norm(labelOf(it.discipline)));
      if (mineItems.length > 0 && mineItems.every((p) => p.completed_at)) pre[it.key] = true;
    }
    setGiven(pre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allItems.length, planItems.length]);

  const counts = () => {
    const g = allItems.filter((i) => given[i.key]).length;
    const n = allItems.filter((i) => given[i.key] && needsMore[i.key]).length;
    return { g, n };
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const upserts = allItems
        .filter((i) => i.contentId)
        .map((i) => ({ i, s: closeStatus(!!given[i.key], !!needsMore[i.key], progress[i.childId]?.[i.contentId!]) }))
        .filter((x) => x.s)
        .map(({ i, s }) => ({ child_id: i.childId, content_id: i.contentId!, status: s!, updated_at: now }));
      if (upserts.length) {
        const { error: e } = await supabase.from("child_content_progress").upsert(upserts, { onConflict: "child_id,content_id" });
        if (e) throw e;
      }
      // Manual: unidade dada (na última parte) fica feita no índice
      const byManual = new Map<string, number[]>();
      for (const i of allItems) {
        if (i.kind !== "manual" || !given[i.key] || !i.lastPart || i.manualId === undefined) continue;
        byManual.set(i.manualId, [...(byManual.get(i.manualId) ?? []), i.line!]);
      }
      for (const [id, lines] of byManual) {
        const m = manuals.find((x) => (x as { id?: string }).id === id);
        if (!m) continue;
        const entries = m.entries.map((e, idx) => (lines.includes(idx) ? { ...e, done: true, from: undefined } : e));
        const { error: e } = await supabase.from("child_manuals").update({ entries: entries as unknown as Json, updated_at: now }).eq("id", id);
        if (e) throw e;
      }
      // Notas: só para o adulto, no Diário
      const entries = (Object.entries(notes) as [string, string][]).map(([child_id, t]) => ({ child_id, description: t.trim() })).filter((x) => x.description);
      if (entries.length && family) {
        const { error: e } = await supabase.from("activities").insert(
          entries.map((x) => ({ family_id: family.id, child_id: x.child_id, title: WEEK_CLOSE_TITLE, description: x.description, activity_date: isoDay(new Date()) })),
        );
        if (e) throw e;
        await qc.invalidateQueries({ queryKey: ["activities"] });
      }
      try { localStorage.setItem(closeShownKey(monday), "1"); } catch { /* sem armazenamento: volta a aparecer */ }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["children-progress"] }),
        qc.invalidateQueries({ queryKey: ["child_content_progress"] }),
        qc.invalidateQueries({ queryKey: ["progress-dates"] }),
        qc.invalidateQueries({ queryKey: ["child-manuals"] }),
      ]);
      const { g, n } = counts();
      if (proposeNext) setSavedSummary(allItems.length ? closeSummary(allItems.length, g, n) : "Semana fechada.");
      else onClose();
    } catch {
      setError("Não foi possível guardar. Tenta outra vez.");
    } finally {
      setSaving(false);
    }
  };

  if (!open || isLoading) return null;
  const { g, n } = counts();
  const hasNotes = (Object.values(notes) as string[]).some((t) => t.trim());

  if (savedSummary) {
    return (
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Semana fechada</DialogTitle>
            <DialogDescription>{savedSummary}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">O que não foi dado entra no plano da semana que vem, sem pressa.</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={onClose}>Fica para domingo</Button>
            <Button onClick={() => { onClose(); navigate("/weekly-planner?semana=proxima"); }}>Preparar a próxima semana</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title ?? "Fechar a semana"}</DialogTitle>
          <DialogDescription>
            {week ? `Semana ${week.number}, de ${formatWeekShort(week.monday)}. ` : ""}
            Marca o que foi dado. Se precisar de mais, diz: volta mais tarde, em revisão curta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {rows.map(({ child, groups }) => (
            <div key={child.id} className="space-y-3">
              {rows.length > 1 && <p className="font-semibold text-foreground">{child.name}</p>}
              {groups.length === 0 && <p className="text-xs text-muted-foreground">Sem temas do rumo nesta semana.</p>}
              {groups.map(([d, list]) => (
                <div key={d} className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{labelOf(d)}</p>
                  {list.map((it) => {
                    const on = !!given[it.key];
                    return (
                      <div key={it.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border/60 px-3 py-2">
                        <Checkbox
                          id={it.key} checked={on}
                          onCheckedChange={(c) => {
                            setGiven((p) => ({ ...p, [it.key]: c === true }));
                            if (c !== true) setNeedsMore((p) => ({ ...p, [it.key]: false }));
                          }}
                        />
                        <label htmlFor={it.key} className="min-w-0 flex-1 text-sm text-foreground">
                          {it.label}
                          {it.kind === "revisao" && <span className="block text-xs text-muted-foreground">voltou porque precisava de mais</span>}
                        </label>
                        {it.kind !== "manual" && (
                          <Button
                            type="button" size="sm" variant="ghost" disabled={!on}
                            aria-pressed={!!needsMore[it.key]}
                            className={cn("h-7 px-2 text-xs", needsMore[it.key] && "bg-amber-50 text-amber-800")}
                            onClick={() => setNeedsMore((p) => ({ ...p, [it.key]: !p[it.key] }))}
                          >
                            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Precisa de mais
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              {noteOpen[child.id] ? (
                <div className="space-y-1">
                  <Textarea rows={2} maxLength={600} placeholder="Ex.: hoje leu sozinha a história toda"
                    value={notes[child.id] ?? ""} onChange={(e) => setNotes((p) => ({ ...p, [child.id]: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">Só para ti · fica no Diário · não vai para o plano nem para a IA</p>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => setNoteOpen((p) => ({ ...p, [child.id]: true }))}>
                  <StickyNote className="mr-1 h-3.5 w-3.5" /> + nota
                </Button>
              )}
            </div>
          ))}
          {allItems.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" /> {closeSummary(allItems.length, g, n)}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Agora não</Button>
          <Button onClick={save} disabled={saving || (allItems.length === 0 && !hasNotes)}>
            {saving ? "A guardar…" : "Fechar a semana"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
