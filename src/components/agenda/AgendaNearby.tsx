// "Perto de nós": eventos e encontros da comunidade, por blocos de distância.
// Ordem dentro de cada bloco: o que a família prefere, depois as idades, depois a data.
// O território escolhido aqui não vai para o servidor; guardar o concelho é opcional.
// "Usar a minha localização" calcula o concelho no aparelho e as coordenadas não saem dele.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Inbox, LocateFixed, Loader2, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";
import {
  useEventSettings, useJoinEvent, useJoinedEventIds, usePendingEvents, usePublishedEvents, type CommunityEvent,
} from "@/hooks/useCommunityEvents";
import {
  CATEGORIES, RING_LABEL, ageOn, buildList, isHidden, nearestMunicipality, prefsFromInterests,
  type ListedEvent, type Ring,
} from "@/lib/agenda";
import type { Child } from "@/lib/types";
import CommunityEventCard from "./CommunityEventCard";
import MunicipalityPicker from "./MunicipalityPicker";
import {
  KIND_STYLE, MUNICIPALITIES, MUNICIPALITY_BY_CODE, TERRITORY_PURPOSE, localIsoDate, localTime, readLocalTerritory, writeLocalTerritory,
} from "./agendaUi";

const WINDOWS = { semana: 7, mes: 31, tudo: 365 } as const;
type WindowKey = keyof typeof WINDOWS;

export default function AgendaNearby({ children }: { children: Child[] }) {
  const { toast } = useToast();
  const { isAdmin } = useIsTeamAdmin();
  const published = usePublishedEvents();
  const pending = usePendingEvents(isAdmin);
  const { settings, save } = useEventSettings();
  const joined = useJoinedEventIds();
  const join = useJoinEvent();

  const [picked, setPicked] = useState<string | null>(() => readLocalTerritory());
  const [locating, setLocating] = useState(false);
  const [win, setWin] = useState<WindowKey>("mes");
  const [onlyFree, setOnlyFree] = useState(false);
  const [kind, setKind] = useState<"todos" | "encontro" | "evento">("todos");
  const [category, setCategory] = useState<string>("todas");
  const [showHidden, setShowHidden] = useState(false);

  const saved = settings?.municipality_code ?? null;
  const territory = picked ?? saved;
  const home = territory ? MUNICIPALITY_BY_CODE.get(territory) ?? null : null;

  // Sem preferências guardadas, as dos interesses das crianças (só em memória).
  const prefs = useMemo(() => {
    if (settings?.prefsChosen) return settings.preferences;
    return prefsFromInterests(children.flatMap((c) => c.interests ?? []));
  }, [settings, children]);

  const childAges = useMemo(() => {
    const now = new Date();
    return children.filter((c) => c.birth_date).map((c) => ageOn(c.birth_date, now));
  }, [children]);

  const { list, hiddenCount } = useMemo(() => {
    const events = published.data ?? [];
    const from = new Date();
    const to = new Date(from.getTime() + WINDOWS[win] * 86_400_000);
    const opts = { from, to, home, municipalities: MUNICIPALITY_BY_CODE, prefs, childAges, onlyFree, kind, category };
    const shown = buildList(events, { ...opts, showHidden });
    const all = showHidden ? shown : buildList(events, { ...opts, showHidden: true });
    return { list: shown, hiddenCount: all.filter((x) => isHidden(x.event, prefs)).length };
  }, [published.data, win, home, prefs, childAges, onlyFree, kind, category, showHidden]);

  const byRing = useMemo(() => {
    const g: Record<Ring, ListedEvent<CommunityEvent>[]> = { 0: [], 1: [], 2: [], 3: [] };
    for (const x of list) g[x.ring].push(x);
    return g;
  }, [list]);

  const choose = (code: string) => {
    setPicked(code);
    writeLocalTerritory(code);
  };

  const locateMe = () => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Este aparelho não partilha a localização", description: "Escolham o concelho na lista." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const m = nearestMunicipality({ lat: pos.coords.latitude, lng: pos.coords.longitude }, MUNICIPALITIES);
        setLocating(false);
        if (m) {
          choose(m.code);
          toast({ title: `Perto de ${m.name}`, description: "A localização ficou no vosso aparelho. Não a guardámos." });
        }
      },
      () => {
        setLocating(false);
        toast({ title: "Não conseguimos saber a localização", description: "Escolham o concelho na lista." });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    );
  };

  const saveTerritory = async () => {
    if (!territory) return;
    try {
      await save.mutateAsync({ municipality_code: territory });
      toast({ title: "Concelho guardado", description: "Podem mudá-lo ou apagá-lo nas Definições." });
    } catch {
      toast({ title: "Não foi possível guardar", description: "Tentem outra vez daqui a pouco.", variant: "destructive" });
    }
  };

  const onJoin = async (x: ListedEvent<CommunityEvent>) => {
    const ev = x.event;
    const now = new Date();
    const startsLater = x.occurrence.start > now;
    const day = startsLater ? x.occurrence.start : now;
    const sameDay = x.occurrence.start.toDateString() === x.occurrence.end.toDateString();
    const withTimes = !ev.all_day && sameDay && startsLater;
    const place = MUNICIPALITY_BY_CODE.get(ev.municipality_code)?.name;
    try {
      await join.mutateAsync({
        eventId: ev.id,
        title: ev.title,
        date: localIsoDate(day),
        start_time: withTimes ? localTime(x.occurrence.start) : null,
        end_time: withTimes ? localTime(x.occurrence.end) : null,
        notes: [`Organizado por ${ev.organizer_name}.`, [ev.venue, place].filter(Boolean).join(", "), ev.url].filter(Boolean).join("\n"),
      });
      toast({
        title: "Está na vossa agenda",
        description: `No dia ${day.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}, em "Minha família".`,
      });
    } catch {
      toast({ title: "Não foi possível juntar", description: "Tentem outra vez daqui a pouco.", variant: "destructive" });
    }
  };

  const unavailable = published.isError;

  return (
    <div className="space-y-5">
      {/* Território */}
      <section className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Label htmlFor="agenda-territorio" className="shrink-0 text-sm font-medium">Ver perto de</Label>
          <MunicipalityPicker id="agenda-territorio" value={territory} onChange={choose} className="sm:w-64" />
          <Button variant="ghost" size="sm" onClick={locateMe} disabled={locating} className="sm:ml-1">
            {locating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <LocateFixed className="h-4 w-4 mr-1" />}
            Usar a minha localização
          </Button>
        </div>
        {!territory && (
          <p className="text-sm text-muted-foreground">
            Escolham um concelho para vermos primeiro o que está perto. Também podem só espreitar outro sítio, sem guardar nada.
          </p>
        )}
        {territory && territory !== saved && settings && (
          <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{TERRITORY_PURPOSE}</p>
            <Button size="sm" variant="outline" onClick={saveTerritory} disabled={save.isPending} className="shrink-0">
              Guardar como o nosso concelho
            </Button>
          </div>
        )}
      </section>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link to="/agenda/propor"><Plus className="h-4 w-4 mr-1" />Propor um evento</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/agenda/propostas"><Inbox className="h-4 w-4 mr-1" />As nossas propostas</Link>
        </Button>
        {isAdmin && (
          <Button asChild size="sm" variant="outline">
            <Link to="/agenda/triagem">
              <ShieldCheck className="h-4 w-4 mr-1" />Triagem{pending.data ? ` (${pending.data.length})` : ""}
            </Link>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup type="single" size="sm" variant="outline" value={win} onValueChange={(v) => v && setWin(v as WindowKey)}>
          <ToggleGroupItem value="semana">Esta semana</ToggleGroupItem>
          <ToggleGroupItem value="mes">Este mês</ToggleGroupItem>
          <ToggleGroupItem value="tudo">Tudo</ToggleGroupItem>
        </ToggleGroup>
        <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
          <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Encontros e eventos</SelectItem>
            <SelectItem value="encontro">Só encontros</SelectItem>
            <SelectItem value="evento">Só eventos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id="agenda-gratis" checked={onlyFree} onCheckedChange={setOnlyFree} />
          <Label htmlFor="agenda-gratis" className="text-sm">Só grátis</Label>
        </div>
        {(hiddenCount > 0 || showHidden) && (
          <div className="flex items-center gap-2">
            <Switch id="agenda-tudo" checked={showHidden} onCheckedChange={setShowHidden} />
            <Label htmlFor="agenda-tudo" className="text-sm">Mostrar tudo{!showHidden && hiddenCount ? ` (+${hiddenCount})` : ""}</Label>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        {(["encontro", "evento"] as const).map((k) => {
          const s = KIND_STYLE[k];
          const Icon = s.icon;
          return (
            <span key={k} className="flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${s.dot}`} />
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {k === "encontro" ? "Encontro de comunidade" : "Evento"}
            </span>
          );
        })}
      </div>

      {/* Lista */}
      {published.isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : unavailable ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          A agenda da comunidade ainda está a ser preparada. Entretanto, o calendário da família continua em "Minha família".
        </p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Ainda há poucos encontros perto de vós. Conhecem um grupo, uma biblioteca ou uma oficina que faça coisas para famílias? Propõe-o aqui, demora 2 minutos.
          </p>
          <Button asChild size="sm"><Link to="/agenda/propor"><Plus className="h-4 w-4 mr-1" />Propor um evento</Link></Button>
        </div>
      ) : (
        <div className="space-y-6">
          {([0, 1, 2] as Ring[]).map((r) =>
            byRing[r].length === 0 ? null : (
              <section key={r} className="space-y-3">
                {home && <h2 className="font-semibold">{RING_LABEL[r]}</h2>}
                {byRing[r].map((x) => (
                  <CommunityEventCard
                    key={x.event.id}
                    event={x.event}
                    occurrence={x.occurrence}
                    distanceKm={x.distanceKm}
                    joined={joined.data?.has(x.event.id)}
                    joining={join.isPending && join.variables?.eventId === x.event.id}
                    onJoin={() => onJoin(x)}
                  />
                ))}
              </section>
            ),
          )}
          {byRing[3].length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="font-semibold">{RING_LABEL[3]} ({byRing[3].length})</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {byRing[3].map((x) => (
                  <CommunityEventCard
                    key={x.event.id}
                    event={x.event}
                    occurrence={x.occurrence}
                    distanceKm={x.distanceKm}
                    joined={joined.data?.has(x.event.id)}
                    joining={join.isPending && join.variables?.eventId === x.event.id}
                    onJoin={() => onJoin(x)}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
}
