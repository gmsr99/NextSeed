// Definições → Agenda: o concelho guardado (opcional) e "O que preferimos" (I-03a).
// Sem preferências guardadas, mostra as sugeridas pelos interesses das crianças;
// só ficam guardadas quando a família muda alguma.
import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { useEventSettings } from "@/hooks/useCommunityEvents";
import { PREFERENCE_OPTIONS, PREF_LABEL, prefsFromInterests, type Pref, type Preferences } from "@/lib/agenda";
import MunicipalityPicker from "./MunicipalityPicker";
import { TERRITORY_PURPOSE } from "./agendaUi";

export default function EventPreferencesCard() {
  const { settings, isLoading, isError, save } = useEventSettings();
  const { children } = useChildren();
  const { toast } = useToast();

  const suggested = useMemo(() => prefsFromInterests(children.flatMap((c) => c.interests ?? [])), [children]);
  const stored = settings?.preferences ?? {};
  const usingSuggested = !!settings && !settings.prefsChosen;
  const prefs: Preferences = usingSuggested ? suggested : stored;

  if (isLoading || isError || !settings) return null;

  const persist = async (patch: Parameters<typeof save.mutateAsync>[0], ok: string) => {
    try {
      await save.mutateAsync(patch);
      toast({ title: ok });
    } catch {
      toast({ title: "Não foi possível guardar", description: "Tentem outra vez daqui a pouco.", variant: "destructive" });
    }
  };

  const setPref = (id: string, v: Pref) => {
    const next: Preferences = { ...prefs };
    if (v === "normal") delete next[id];
    else next[id] = v;
    persist({ preferences: next }, "Preferências guardadas");
  };

  return (
    <section className="rounded-2xl border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Agenda da comunidade</h2>
      </div>

      <div className="space-y-2">
        <Label htmlFor="our-municipality">O nosso concelho</Label>
        <p className="text-xs text-muted-foreground">{TERRITORY_PURPOSE}</p>
        <div className="flex flex-wrap items-center gap-2">
          <MunicipalityPicker
            id="our-municipality"
            value={settings.municipality_code}
            onChange={(code) => persist({ municipality_code: code }, "Concelho guardado")}
            placeholder="Sem concelho guardado"
            className="w-64"
          />
          {settings.municipality_code && (
            <Button variant="ghost" size="sm" onClick={() => persist({ municipality_code: null }, "Concelho apagado")}>
              Apagar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-medium">O que preferimos</h3>
          <p className="text-xs text-muted-foreground">
            {usingSuggested
              ? "Sugerido a partir dos interesses das crianças. Mudem o que quiserem."
              : "O que fica em \"Mostrar primeiro\" sobe dentro de cada distância. O que fica em \"Não mostrar\" sai da lista."}
          </p>
        </div>
        <ul className="divide-y">
          {PREFERENCE_OPTIONS.map((o) => (
            <li key={o.id} className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm">{o.label}</span>
              <ToggleGroup
                type="single"
                size="sm"
                variant="outline"
                value={prefs[o.id] ?? "normal"}
                onValueChange={(v) => v && setPref(o.id, v as Pref)}
                aria-label={o.label}
              >
                {(["primeiro", "normal", "esconder"] as Pref[]).map((p) => (
                  <ToggleGroupItem key={p} value={p} className="text-xs">{PREF_LABEL[p]}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
