// A nossa semana (P-18, versão mínima do P-04): que dias estudam, quais são
// curtos e se há saída "Ver Mundo" à sexta. O plano semanal, o horário e o
// guia seguem isto. Sem nada escolhido, fica a semana de sempre.
import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFamilyRoutine } from "@/hooks/useFamilyRoutine";
import { DAY_MODE_LABELS, DEFAULT_ROUTINE, routineSummary, type DayMode, type WeekRoutine } from "@/lib/familyRoutine";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const MODES: DayMode[] = ["full", "short", "off"];

export default function FamilyRoutineCard() {
  const { routine, available, isLoading, save, reset } = useFamilyRoutine();
  const { toast } = useToast();
  const current = routine ?? DEFAULT_ROUTINE;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<WeekRoutine>(current);
  const noStudy = draft.days.every((d) => d === "off");

  const openDialog = () => {
    setDraft({ days: [...current.days], outing: current.outing });
    setOpen(true);
  };
  const setDay = (i: number, mode: DayMode) =>
    setDraft((d) => ({ ...d, days: d.days.map((x, j) => (j === i ? mode : x)) }));

  const onSave = async () => {
    try {
      await save.mutateAsync(draft);
      setOpen(false);
      toast({ title: "Semana guardada", description: "Os próximos planos seguem os vossos dias." });
    } catch {
      toast({ title: "Não foi possível guardar", description: "Tenta outra vez daqui a pouco.", variant: "destructive" });
    }
  };
  const onReset = async () => {
    try {
      await reset.mutateAsync();
      setOpen(false);
      toast({ title: "Semana de sempre reposta", description: "Segunda a sexta, com saída à sexta." });
    } catch {
      toast({ title: "Não foi possível repor", variant: "destructive" });
    }
  };

  if (isLoading) return null;

  return (
    <Card className="border-border/60" data-tour="nossa-semana">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <CalendarClock className="hidden h-5 w-5 shrink-0 text-primary sm:block" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">A vossa semana: {routineSummary(routine)}</p>
          <p className="text-xs text-muted-foreground">
            {available
              ? "Escolham os dias em que estudam, os que são curtos e se há saída à sexta. O plano segue a vossa rotina."
              : "Escolher os vossos dias de estudo fica disponível depois de uma atualização que já pedimos. Até lá, o plano usa segunda a sexta."}
          </p>
        </div>
        {available && (
          <Button variant="outline" size="sm" onClick={openDialog}>Ajustar a semana</Button>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>A nossa semana</DialogTitle>
            <DialogDescription>
              Como é uma semana normal de estudo cá em casa. O plano só põe atividades nos dias de estudo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              {DAYS.map((day, i) => (
                <div key={day} className="flex items-center gap-3">
                  <Label htmlFor={`day-${i}`} className="w-20 shrink-0">{day}</Label>
                  <Select value={draft.days[i]} onValueChange={(v) => setDay(i, v as DayMode)}>
                    <SelectTrigger id={`day-${i}`} className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODES.map((m) => (
                        <SelectItem key={m} value={m}>{DAY_MODE_LABELS[m]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Dia curto: só a manhã, com Português e Matemática (cerca de 1 hora). Bom para dias com outras atividades
                fora de casa.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Switch
                id="routine-outing" checked={draft.outing && draft.days[4] !== "off"} disabled={draft.days[4] === "off"}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, outing: v }))}
              />
              <div>
                <Label htmlFor="routine-outing">Saída "Ver Mundo" à sexta</Label>
                <p className="text-xs text-muted-foreground">
                  {draft.days[4] === "off"
                    ? "A sexta está sem estudo, por isso não há saída."
                    : draft.outing
                      ? "Uma saída da família, a um sítio perto, com as crianças todas."
                      : "Sem saída: a sexta é um dia de estudo em casa, como os outros."}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground" aria-live="polite">
              {noStudy ? "Escolham pelo menos um dia de estudo." : `Fica assim: ${routineSummary(draft)}.`}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {routine ? (
              <Button variant="ghost" onClick={onReset} disabled={reset.isPending}>Repor a semana de sempre</Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={onSave} disabled={noStudy || save.isPending}>
                {save.isPending ? "A guardar…" : "Guardar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
