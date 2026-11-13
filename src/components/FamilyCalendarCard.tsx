// Calendário da família (P-24): quando começa e acaba o ano e em que datas se
// pára. O Rumo do ano reparte tudo por estas semanas.
import { useMemo, useState } from "react";
import { CalendarRange, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFamilyCalendar } from "@/hooks/useFamilyCalendar";
import {
  familyWeeks, isValidCalendar, officialCalendar, parseDay, schoolYearStartFor, MAX_CALENDAR_WEEKS,
  type FamilyCalendar,
} from "@/lib/annualPlan";

function longDay(iso: string): string {
  return parseDay(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export default function FamilyCalendarCard() {
  const { calendar, available, isLoading, save, reset } = useFamilyCalendar();
  const { toast } = useToast();
  const official = useMemo(() => officialCalendar(schoolYearStartFor(new Date())), []);
  const current = calendar ?? official;
  const currentWeeks = useMemo(() => familyWeeks(current).length, [current]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FamilyCalendar>(current);
  const complete = !!draft.year_start && !!draft.year_end && draft.breaks.every((b) => b.from && b.to);
  const valid = complete && isValidCalendar(draft);
  const draftWeeks = useMemo(() => (valid ? familyWeeks(draft).length : 0), [draft, valid]);

  const openDialog = () => {
    setDraft({ ...current, breaks: current.breaks.map((b) => ({ ...b })) });
    setOpen(true);
  };
  const setBreak = (i: number, key: "from" | "to", value: string) =>
    setDraft((d) => ({ ...d, breaks: d.breaks.map((b, j) => (j === i ? { ...b, [key]: value } : b)) }));

  const onSave = async () => {
    try {
      await save.mutateAsync(draft);
      setOpen(false);
      toast({ title: "Calendário guardado", description: "O rumo do ano já segue as vossas semanas." });
    } catch {
      toast({ title: "Não foi possível guardar", description: "Tenta outra vez daqui a pouco.", variant: "destructive" });
    }
  };
  const onReset = async () => {
    try {
      await reset.mutateAsync();
      setOpen(false);
      toast({ title: "Calendário escolar reposto" });
    } catch {
      toast({ title: "Não foi possível repor", variant: "destructive" });
    }
  };

  if (isLoading) return null;

  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <CalendarRange className="hidden h-5 w-5 shrink-0 text-primary sm:block" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {calendar ? "O vosso calendário" : "Calendário escolar"}: {currentWeeks} semanas com aulas
          </p>
          <p className="text-xs text-muted-foreground">
            De {longDay(current.year_start)} a {longDay(current.year_end)}
            {current.breaks.length > 0
              ? `, com ${current.breaks.length} ${current.breaks.length === 1 ? "pausa" : "pausas"}`
              : ", sem pausas"}
            .
          </p>
        </div>
        {available && (
          <Button variant="outline" size="sm" onClick={openDialog}>Ajustar as semanas</Button>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>As vossas semanas</DialogTitle>
            <DialogDescription>
              Digam quando começa e acaba o vosso ano e quando param. O rumo do ano reparte tudo por estas semanas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cal-start">O ano começa a</Label>
                <Input id="cal-start" type="date" value={draft.year_start}
                  onChange={(e) => setDraft((d) => ({ ...d, year_start: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cal-end">E acaba a</Label>
                <Input id="cal-end" type="date" value={draft.year_end}
                  onChange={(e) => setDraft((d) => ({ ...d, year_end: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pausas</Label>
              {draft.breaks.length === 0 && (
                <p className="text-xs text-muted-foreground">Sem pausas: todas as semanas contam.</p>
              )}
              {draft.breaks.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="date" value={b.from} aria-label={`Pausa ${i + 1}: de`} onChange={(e) => setBreak(i, "from", e.target.value)} />
                  <span className="text-xs text-muted-foreground">a</span>
                  <Input type="date" value={b.to} aria-label={`Pausa ${i + 1}: até`} onChange={(e) => setBreak(i, "to", e.target.value)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Retirar a pausa ${i + 1}`}
                    onClick={() => setDraft((d) => ({ ...d, breaks: d.breaks.filter((_, j) => j !== i) }))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm"
                onClick={() => setDraft((d) => ({ ...d, breaks: [...d.breaks, { from: "", to: "" }] }))}>
                <Plus className="mr-1.5 h-4 w-4" /> Acrescentar pausa
              </Button>
              <p className="text-xs text-muted-foreground">
                Uma semana deixa de contar quando tem menos de três dias de aulas.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Switch id="cal-review" checked={draft.review_weeks}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, review_weeks: v }))} />
              <div>
                <Label htmlFor="cal-review">Semanas de balanço</Label>
                <p className="text-xs text-muted-foreground">
                  A última semana de cada período fica sem conteúdos novos, para rever e arrumar o portefólio.
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-foreground" aria-live="polite">
              {valid
                ? `${draftWeeks} semanas com aulas.`
                : !complete
                  ? "Faltam datas por preencher."
                  : `Confirmem as datas: o fim tem de vir depois do início, cada pausa tem de acabar depois de começar e o ano pode ter até ${MAX_CALENDAR_WEEKS} semanas.`}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {calendar ? (
              <Button variant="ghost" onClick={onReset} disabled={reset.isPending}>Voltar ao calendário escolar</Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={onSave} disabled={!valid || draftWeeks === 0 || save.isPending}>
                {save.isPending ? "A guardar…" : "Guardar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
