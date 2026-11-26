// Tradição da família (I-08, fase 1). Em Definições, só para quem foi
// convidada para o piloto (ou é da equipa). Discreta: quem não a liga nunca a
// vê noutro sítio. Ligar pede consentimento explícito (convicção religiosa é
// categoria especial, Art. 9.º RGPD); desligar apaga a escolha e o consentimento.
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFamilyTradition } from "@/hooks/useFamilyTradition";
import { useFamilyCalendar } from "@/hooks/useFamilyCalendar";
import { officialCalendar, schoolYearStartFor } from "@/lib/annualPlan";
import { traditionBreaks, type LiturgicalCalendar } from "@/lib/tradicao/liturgical";
import CatechismSettings from "@/components/CatechismSettings";

const CALENDAR_LABELS: Record<LiturgicalCalendar, string> = {
  atual: "Atual (o da Missa de hoje)",
  tradicional: "Tradicional (1962)",
};

function day(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
}

export default function FamilyTraditionCard() {
  const { tradition, canSee, isLoading, save, remove } = useFamilyTradition();
  const { calendar, save: saveCalendar } = useFamilyCalendar();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [cal, setCal] = useState<LiturgicalCalendar>("atual");
  const [proprio, setProprio] = useState(true);
  const [agree, setAgree] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);

  const yearStart = schoolYearStartFor(new Date());
  const breaks = useMemo(() => traditionBreaks(yearStart), [yearStart]);

  if (isLoading || !canSee) return null;

  const openDialog = () => {
    setCal(tradition?.calendar ?? "atual");
    setProprio(tradition?.proprio_pt ?? true);
    setAgree(false);
    setOpen(true);
  };

  const onSave = async () => {
    try {
      await save.mutateAsync({ calendar: cal, proprio_pt: proprio });
      setOpen(false);
      toast({ title: "Tradição da família ligada", description: "O Planeador e o Guia de Atividades passam a mostrar o tempo litúrgico." });
    } catch {
      toast({ title: "Não foi possível guardar", description: "Tenta outra vez daqui a pouco.", variant: "destructive" });
    }
  };

  const onRemove = async () => {
    try {
      await remove.mutateAsync();
      setConfirmOff(false);
      toast({ title: "Tradição da família desligada", description: "Apagámos a vossa escolha, o consentimento e o catecismo." });
    } catch {
      toast({ title: "Não foi possível desligar", variant: "destructive" });
    }
  };

  // Acrescenta as pausas da tradição ao calendário da família (ou ao oficial, se
  // ainda não tiverem um próprio). Não repete pausas que já lá estejam.
  const onAddBreaks = async () => {
    const base = calendar ?? officialCalendar(yearStart);
    const have = new Set(base.breaks.map((b) => `${b.from}|${b.to}`));
    const add = breaks.filter((b) => !have.has(`${b.from}|${b.to}`)).map(({ from, to }) => ({ from, to }));
    if (add.length === 0) {
      toast({ title: "As pausas já estão no vosso calendário" });
      return;
    }
    try {
      await saveCalendar.mutateAsync({ ...base, breaks: [...base.breaks, ...add].sort((a, b) => a.from.localeCompare(b.from)) });
      toast({ title: "Pausas acrescentadas", description: "Nessas semanas não há currículo: a liturgia é o currículo. Podem ajustar as datas no calendário da família." });
    } catch {
      toast({ title: "Não foi possível acrescentar", description: "O calendário da família fica disponível depois de uma atualização.", variant: "destructive" });
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Tradição da família (opcional)</h2>
      </div>

      {!tradition ? (
        <>
          <p className="text-sm text-muted-foreground">
            Para famílias que querem que o ano siga o calendário da sua tradição: o tempo litúrgico de cada semana, a
            antífona do tempo e as pausas em que a liturgia é o currículo. Por agora, a tradição católica.
          </p>
          <Button variant="outline" onClick={openDialog}>Ligar a tradição da família</Button>
        </>
      ) : (
        <>
          <p className="text-sm text-foreground">
            Ligada: católica · calendário {tradition.calendar === "tradicional" ? "tradicional (1962)" : "atual"}
            {tradition.proprio_pt ? " · com o próprio de Portugal" : ""}.
          </p>
          <div className="rounded-lg border border-border/60 p-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              Pausas da tradição, para o vosso calendário: Natal ({day(breaks[0].from)} a {day(breaks[0].to)}) e Semana
              Santa e Oitava ({day(breaks[1].from)} a {day(breaks[1].to)}).
            </p>
            <Button variant="outline" size="sm" onClick={onAddBreaks} disabled={saveCalendar.isPending}>
              Acrescentar ao calendário da família
            </Button>
          </div>
          <CatechismSettings />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={openDialog}>Ajustar</Button>
            {confirmOff ? (
              <>
                <Button variant="destructive" size="sm" onClick={onRemove} disabled={remove.isPending}>Sim, desligar e apagar</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmOff(false)}>Cancelar</Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmOff(true)}>Desligar</Button>
            )}
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tradição da família</DialogTitle>
            <DialogDescription>Escolham a tradição e o calendário que seguem em casa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tradição</Label>
              <p className="text-sm text-foreground">Católica</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tradition-calendar">Calendário</Label>
              <Select value={cal} onValueChange={(v) => setCal(v as LiturgicalCalendar)}>
                <SelectTrigger id="tradition-calendar"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CALENDAR_LABELS) as LiturgicalCalendar[]).map((k) => (
                    <SelectItem key={k} value={k}>{CALENDAR_LABELS[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start gap-3">
              <Switch id="tradition-pt" checked={proprio} onCheckedChange={setProprio} />
              <Label htmlFor="tradition-pt" className="font-normal">
                Incluir as celebrações próprias de Portugal (por exemplo, a Imaculada Conceição como padroeira)
              </Label>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground">Antes de ligar</p>
              <p>
                Para isto funcionar, a NexSeed guarda que a vossa família escolheu a tradição católica e o calendário. É
                uma informação sensível, por isso:
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>fica guardada só para a vossa família, nunca por criança, e mais ninguém a vê;</li>
                <li>não é enviada à inteligência artificial;</li>
                <li>não aparece em portefólios, relatórios nem partilhas;</li>
                <li>podem desligar quando quiserem: nesse momento apagamos a escolha e este consentimento.</li>
              </ul>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="tradition-agree" checked={agree} onCheckedChange={(v) => setAgree(v === true)} />
              <Label htmlFor="tradition-agree" className="font-normal">
                Quero ligar a tradição da família e autorizo a NexSeed a guardar esta escolha.
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={onSave} disabled={!agree || save.isPending}>{save.isPending ? "A guardar…" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
