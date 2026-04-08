import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  YEAR_MAP,
  PLAN_TO_GC,
  GC_DISCIPLINE_LABELS,
  STATUS_CONFIG,
  STATUS_ORDER,
} from "@/lib/gcConstants";
import type { Child, ContentProgressStatus } from "@/lib/types";
import type { GeneratedPlanItem } from "@/lib/planGenerator";

type ContentRow = {
  id: string;
  discipline: string;
  domain: string;
  content: string;
  currentStatus: ContentProgressStatus;
  newStatus: ContentProgressStatus;
};

type Props = {
  open: boolean;
  onClose: () => void;
  familyChildren: Child[];
  planItems: GeneratedPlanItem[];
};

export default function PostWeekProgressDialog({ open, onClose, familyChildren: children, planItems }: Props) {
  const [loading, setLoading]                       = useState(false);
  const [saving, setSaving]                         = useState(false);
  const [done, setDone]                             = useState(false);
  const [saveError, setSaveError]                   = useState<string | null>(null);
  const [contentsByChild, setContentsByChild]       = useState<Record<string, ContentRow[]>>({});

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setSaveError(null);
    loadContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, children, planItems]);

  const loadContents = async () => {
    setLoading(true);
    try {
      const result: Record<string, ContentRow[]> = {};

      for (const child of children) {
        const dbYear = YEAR_MAP[child.school_year];
        if (!dbYear) continue;

        // Disciplinas GC trabalhadas esta semana por esta criança
        const planDisciplines = [...new Set(
          planItems
            .filter((p) => p.child_id === child.id)
            .flatMap((p) => PLAN_TO_GC[p.discipline] ?? [])
        )];
        if (planDisciplines.length === 0) continue;

        // Conteúdos GC para estas disciplinas neste ano
        const { data: contents } = await supabase
          .from("curriculum_contents")
          .select("id, discipline, domain, content")
          .eq("school_year", dbYear)
          .in("discipline", planDisciplines)
          .order("discipline")
          .order("sort_order");

        if (!contents?.length) continue;

        // Progresso existente
        const contentIds = contents.map((c) => c.id);
        const { data: progress } = await supabase
          .from("child_content_progress")
          .select("content_id, status")
          .eq("child_id", child.id)
          .in("content_id", contentIds);

        const progressMap = new Map(
          (progress ?? []).map((p) => [p.content_id, p.status as ContentProgressStatus])
        );

        // Filtra conteúdos já consolidados/dominados — não precisam de atenção
        const rows = contents
          .map((c) => {
            const current: ContentProgressStatus = progressMap.get(c.id) ?? "a_aprender";
            return {
              id: c.id,
              discipline: c.discipline,
              domain: c.domain,
              content: c.content,
              currentStatus: current,
              newStatus: current,
            };
          })
          .filter((r) => r.currentStatus !== "dominado");

        if (rows.length > 0) result[child.id] = rows;
      }

      setContentsByChild(result);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (childId: string, contentId: string, status: ContentProgressStatus) => {
    setContentsByChild((prev) => ({
      ...prev,
      [childId]: prev[childId].map((c) =>
        c.id === contentId ? { ...c, newStatus: status } : c
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      for (const child of children) {
        const rows = contentsByChild[child.id];
        if (!rows) continue;
        const changed = rows.filter((r) => r.newStatus !== r.currentStatus);
        if (!changed.length) continue;

        const { error } = await supabase
          .from("child_content_progress")
          .upsert(
            changed.map((r) => ({
              child_id: child.id,
              content_id: r.id,
              status: r.newStatus,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: "child_id,content_id" }
          );

        if (error) throw error;
      }
      setDone(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao guardar progresso.");
    } finally {
      setSaving(false);
    }
  };

  const hasChildren = Object.keys(contentsByChild).length > 0;
  const childrenWithContents = children.filter((c) => contentsByChild[c.id]?.length);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Atualizar progresso curricular</DialogTitle>
          <DialogDescription>
            Regista o que foi trabalhado esta semana. Conteúdos já consolidados ou dominados não aparecem aqui.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {done && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="font-medium">Progresso guardado!</p>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        )}

        {!loading && !done && (
          <>
            {!hasChildren && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum conteúdo GC pendente para as disciplinas desta semana.<br />
                Certifica-te que as crianças têm anos 1º–4º e conteúdos na BD.
              </p>
            )}

            {childrenWithContents.map((child) => {
              const rows = contentsByChild[child.id] ?? [];
              const byDisc = rows.reduce<Record<string, ContentRow[]>>((acc, r) => {
                if (!acc[r.discipline]) acc[r.discipline] = [];
                acc[r.discipline].push(r);
                return acc;
              }, {});

              return (
                <div key={child.id} className="mb-6">
                  <h3 className="font-heading font-semibold text-base mb-3 pb-1 border-b">
                    {child.name}
                  </h3>
                  {Object.entries(byDisc).map(([disc, items]) => (
                    <div key={disc} className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {GC_DISCIPLINE_LABELS[disc] ?? disc}
                      </p>
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                          <div className="flex-1 text-sm leading-relaxed pt-0.5">
                            <span className="text-xs text-muted-foreground">{item.domain} — </span>
                            {item.content}
                          </div>
                          <Select
                            value={item.newStatus}
                            onValueChange={(v) => updateStatus(child.id, item.id, v as ContentProgressStatus)}
                            disabled={saving}
                          >
                            <SelectTrigger className={cn(
                              "h-7 w-36 shrink-0 text-xs border rounded-full px-2.5 font-medium",
                              STATUS_CONFIG[item.newStatus].classes
                            )}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_ORDER.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {STATUS_CONFIG[s].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {item.newStatus !== item.currentStatus && (
                            <Badge variant="outline" className="text-xs h-5 px-1.5 text-primary border-primary/30 shrink-0 self-center">
                              alterado
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}

            {saveError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mb-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {saveError}
              </div>
            )}

            {hasChildren && (
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button variant="ghost" onClick={onClose} disabled={saving}>Ignorar</Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar progresso
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
