import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FinProfile } from "@/lib/types";
import { WEEKDAYS, parseEuros } from "./StartProfileCard";

export default function ProfileDialog({ open, onOpenChange, profile, firstName, canUseOriginal, saving, onSave }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  profile: FinProfile;
  firstName: string;
  /** Personagens de marca: só em uso familiar privado (equipa). */
  canUseOriginal: boolean;
  saving: boolean;
  onSave: (p: { stage: "trilho" | "ciclo"; allowance_cents: number | null; ritual_weekday: number; character_mode: "generico" | "original" }) => void;
}) {
  const [stage, setStage] = useState(profile.stage);
  const [allowance, setAllowance] = useState("");
  const [weekday, setWeekday] = useState(String(profile.ritual_weekday));
  const [original, setOriginal] = useState(profile.character_mode === "original");

  useEffect(() => {
    setStage(profile.stage);
    setAllowance(profile.allowance_cents != null ? (profile.allowance_cents / 100).toFixed(2).replace(".", ",") : "");
    setWeekday(String(profile.ritual_weekday));
    setOriginal(profile.character_mode === "original");
  }, [profile, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Financinhas de {firstName}</DialogTitle>
          <DialogDescription>A semanada sobe no aniversário e acompanha a idade. Mudar de fase não apaga nada.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Fase</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as "trilho" | "ciclo")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trilho">Trilho de Iniciação (12 sessões)</SelectItem>
                <SelectItem value="ciclo">Ciclo semanal adaptativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-allowance">Semanada (€)</Label>
              <Input id="pf-allowance" inputMode="decimal" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Dia do ritual</Label>
              <Select value={weekday} onValueChange={setWeekday}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WEEKDAYS.map((d, i) => <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {canUseOriginal && (
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-3">
                <Switch id="pf-original" checked={original} onCheckedChange={setOriginal} />
                <Label htmlFor="pf-original" className="font-normal">Personagens de marca pelo nome (uso familiar privado)</Label>
              </div>
              <p className="text-xs text-muted-foreground">Só para a família do fundador, nunca em material público nem para outras famílias. Com personagens Disney o NotebookLM falha sem avisar: nesses casos nomeia a marca só no texto.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={saving} onClick={() => onSave({ stage, allowance_cents: parseEuros(allowance), ritual_weekday: Number(weekday), character_mode: canUseOriginal && original ? "original" : "generico" })}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
