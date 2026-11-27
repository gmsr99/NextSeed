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
import { DAY_MODE_LABELS, DEFAULT_ROUTINE, OUTING_LABELS, routineOutings, routineSummary, type DayMode, type OutingPart, type WeekRoutine } from "@/lib/familyRoutine";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const MODES: DayMode[] = ["full", "short", "free", "off"];
const OUTING_PARTS: OutingPart[] = ["none", "morning", "afternoon", "day"];

export default function FamilyRoutineCard() {
  const { routine, available, isLoading, save, reset } = useFamilyRoutine();
  const { toast } = useToast();
  const current = routine ?? DEFAULT_ROUTINE;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<WeekRoutine>(current);
  const noStudy = draft.days.every((d) => d === "off");

  const openDialog = () => {
    setDraft({ days: [...current.days], outing: current.outing, outings: routineOutings(current), hours: current.hours === true });
    setOpen(true);
  };
  const setDay = (i: number, mode: DayMode) =>
    setDraft((d) => {
      const days = d.days.map((x, j) => (j === i ? mode : x));
      // Dia sem estudo: sem saída
      const outings = routineOutings(d).map((o, j) => (j === i && mode === "off" ? "none" : o));
      return { ...d, days, outings, outing: outings[4] === "day" };
    });
  const setOuting = (i: number, part: OutingPart) =>
    setDraft((d) => {
      const outings = routineOutings(d).map((o, j) => (j === i ? part : o));
      return { ...d, outings, outing: outings[4] === "day" };
    });
  const draftOutings = routineOutings(draft);

  const onSave = async () => {
    try {
      await save.mutateAsync(draft);
      setOpen(false);
      toast({ title: "Semana guardada", description: "Os próximos planos seguem os vossos dias." });
    } catch (e) {
      const msg = e instanceof Error && e.message.startsWith("A opção das horas") ? e.message : "Tenta outra vez daqui a pouco.";
      toast({ title: "Não foi possível guardar tudo", description: msg, variant: "destructive" });
    }
  };
  const onReset = async () => {
    try {
      await reset.mutateAsync();
      setOpen(false);
      toast({ title: "Semana de sempre reposta", description: "Segunda a sexta, sem Ver Mundo." });
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
              ? "Escolham os dias em que estudam, os que são curtos e se há um dia habitual de Ver Mundo. Em cada semana, o Planeador deixa mudar."
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
                <div key={day} className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
                  <Label htmlFor={`day-${i}`} className="w-20 shrink-0">{day}</Label>
                  <Select value={draft.days[i]} onValueChange={(v) => setDay(i, v as DayMode)}>
                    <SelectTrigger id={`day-${i}`} className="min-w-0 flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODES.map((m) => (
                        <SelectItem key={m} value={m}>{DAY_MODE_LABELS[m]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={draftOutings[i]} onValueChange={(v) => setOuting(i, v as OutingPart)} disabled={draft.days[i] === "off"}>
                    <SelectTrigger aria-label={`Ver Mundo à ${day.toLowerCase()}`} className="min-w-0 flex-1 sm:max-w-[11rem]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OUTING_PARTS.map((o) => (
                        <SelectItem key={o} value={o}>{OUTING_LABELS[o]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Dia curto: só a manhã, com Português e Matemática (cerca de 1 hora). Bom para dias com outras atividades
                fora de casa. Dia livre: sem currículo; fica o momento da manhã em família e a leitura em voz alta.
                Ver Mundo (uma visita, uma ida a uma comunidade, um passeio): em qualquer dia, de manhã, à tarde ou o dia
                todo, as vezes que quiserem; o plano prepara-a convosco e essa parte do dia fica sem currículo. É o vosso
                ponto de partida: em cada semana podem mudá-la no Planeador, ou não sair.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Switch
                id="routine-hours" checked={draft.hours === true}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, hours: v }))}
              />
              <div>
                <Label htmlFor="routine-hours">Mostrar horas no horário</Label>
                <p className="text-xs text-muted-foreground">
                  {draft.hours
                    ? "O horário sugere horas para cada bloco."
                    : "Sem horas: o horário mostra a ordem dos blocos e quanto tempo dura cada atividade, pela idade. As horas ficam convosco."}
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
