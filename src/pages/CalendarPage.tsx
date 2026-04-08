import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays, MapPin, List, Clock, Users,
  ChevronLeft, ChevronRight,
  TreePine, FlaskConical, Palette, Hammer, BookOpen,
  Eye, Filter, Home, GraduationCap, Dumbbell, FlaskRound,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { addDays, format, startOfWeek, isSameDay, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useExtracurricular } from "@/hooks/useExtracurricular";
import { useChildren } from "@/hooks/useChildren";
import { supabase } from "@/lib/supabase";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS } from "@/lib/planGenerator";
import { EXTRACURRICULAR_COLORS } from "@/lib/constants";

// ─── Community events (static for now) ───────────────────────────────────────

const themeConfig: Record<string, { icon: typeof TreePine; color: string; bg: string }> = {
  Natureza:    { icon: TreePine,    color: "text-accent",                        bg: "bg-accent/10" },
  Ciência:     { icon: FlaskConical,color: "text-destructive",                   bg: "bg-destructive/10" },
  Arte:        { icon: Palette,     color: "text-[hsl(var(--nexseed-orange))]",  bg: "bg-[hsl(var(--nexseed-orange))]/10" },
  Construção:  { icon: Hammer,      color: "text-primary",                       bg: "bg-primary/10" },
  Leitura:     { icon: BookOpen,    color: "text-[hsl(var(--nexseed-moss))]",    bg: "bg-[hsl(var(--nexseed-moss))]/10" },
};

const themes = Object.keys(themeConfig);
const regions = ["Norte", "Porto", "Centro", "Lisboa", "Alentejo", "Algarve"] as const;

type CommunityEvent = {
  id: number; title: string; theme: string; date: Date; time: string;
  region: typeof regions[number]; location: string; spots: number; description: string;
};

const BASE = startOfWeek(new Date(), { weekStartsOn: 1 });

const communityEvents: CommunityEvent[] = [
  { id: 1, title: "Passeio Botânico no Jardim Gulbenkian",   theme: "Natureza",    date: addDays(BASE, 0), time: "10:00", region: "Lisboa",   location: "Jardim Gulbenkian, Lisboa",     spots: 12, description: "Exploração guiada de espécies vegetais com atividades de observação e registo científico." },
  { id: 2, title: "Oficina de Robótica com Reciclados",       theme: "Construção",  date: addDays(BASE, 1), time: "14:30", region: "Porto",    location: "Fábrica de Ciência, Porto",     spots: 8,  description: "Construção de robots com materiais reciclados. Introdução a circuitos simples." },
  { id: 3, title: "Laboratório de Cores Naturais",            theme: "Arte",        date: addDays(BASE, 2), time: "10:00", region: "Centro",   location: "Mata do Buçaco, Mealhada",      spots: 15, description: "Criar tintas e pigmentos a partir de elementos naturais. Pintura ao ar livre." },
  { id: 4, title: "Experiências com Água",                    theme: "Ciência",     date: addDays(BASE, 3), time: "15:00", region: "Algarve",  location: "Praia da Rocha, Portimão",      spots: 10, description: "Experiências científicas sobre flutuação, densidade e ciclo da água junto ao mar." },
  { id: 5, title: "Clube de Leitura ao Ar Livre",             theme: "Leitura",     date: addDays(BASE, 4), time: "11:00", region: "Alentejo", location: "Jardim Público, Évora",         spots: 20, description: "Sessão de leitura partilhada com atividades de escrita criativa para todas as idades." },
  { id: 6, title: "Construção de Abrigos na Floresta",        theme: "Natureza",    date: addDays(BASE, 5), time: "09:30", region: "Norte",    location: "Parque Peneda-Gerês",           spots: 10, description: "Aprender técnicas de construção de abrigos usando apenas materiais naturais." },
  { id: 7, title: "Pintura Mural Colaborativa",               theme: "Arte",        date: addDays(BASE, 6), time: "14:00", region: "Lisboa",   location: "LX Factory, Lisboa",            spots: 16, description: "Criação coletiva de um mural inspirado na biodiversidade portuguesa." },
  { id: 8, title: "Foguetões de Papel",                       theme: "Ciência",     date: addDays(BASE, 1), time: "10:30", region: "Centro",   location: "Exploratório, Coimbra",         spots: 12, description: "Construir e lançar foguetões de papel. Introdução à aerodinâmica." },
  { id: 9, title: "Tecelagem com Fibras Naturais",            theme: "Arte",        date: addDays(BASE, 3), time: "10:00", region: "Norte",    location: "Casa das Artes, Braga",         spots: 8,  description: "Oficina de tecelagem usando lã, algodão e fibras vegetais." },
];

const regionPositions: Record<string, { top: string; left: string }> = {
  Norte:    { top: "12%", left: "35%" },
  Porto:    { top: "22%", left: "28%" },
  Centro:   { top: "38%", left: "30%" },
  Lisboa:   { top: "55%", left: "18%" },
  Alentejo: { top: "68%", left: "40%" },
  Algarve:  { top: "88%", left: "38%" },
};

// ─── Family calendar event types ─────────────────────────────────────────────

type FamilyEventKind = "plan" | "extra" | "activity";

interface FamilyEvent {
  id: string;
  kind: FamilyEventKind;
  title: string;
  time: string;
  color: string;
  childName?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

const CalendarPage = () => {
  // Community events state
  const [commWeekOffset, setCommWeekOffset] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [themeFilter, setThemeFilter] = useState("all");

  // Family calendar state
  const [famWeekOffset, setFamWeekOffset] = useState(0);

  const { family } = useAuth();
  const { children } = useChildren();
  const { activities: extracurriculars } = useExtracurricular();

  // ── Community events helpers ────────────────────────────────────────────────
  const commWeekStart = addDays(BASE, commWeekOffset * 7);
  const commWeekDays  = Array.from({ length: 7 }, (_, i) => addDays(commWeekStart, i));

  const filteredByTheme  = themeFilter === "all" ? communityEvents : communityEvents.filter((e) => e.theme === themeFilter);
  const filteredByRegion = selectedRegion ? filteredByTheme.filter((e) => e.region === selectedRegion) : filteredByTheme;

  const showDetails = (ev: CommunityEvent) => {
    toast({ title: ev.title, description: `${ev.location} · ${ev.time} · ${ev.spots} vagas` });
  };

  // ── Family calendar helpers ────────────────────────────────────────────────
  const famWeekStart = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addDays(monday, famWeekOffset * 7);
  }, [famWeekOffset]);

  const famWeekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(famWeekStart, i)),
    [famWeekStart]
  );

  const weekKey = format(famWeekStart, "yyyy-MM-dd");

  // Query: weekly plan items for this week
  const { data: planItems = [] } = useQuery({
    queryKey: ["calendar-plan-items", family?.id, weekKey],
    enabled: !!family,
    queryFn: async () => {
      const { data: plans } = await supabase
        .from("weekly_plans")
        .select("id")
        .eq("family_id", family!.id)
        .eq("week_start", weekKey)
        .order("version", { ascending: false })
        .limit(1);

      if (!plans?.length) return [];

      const { data: items } = await supabase
        .from("weekly_plan_items")
        .select("day_of_week, time_slot, discipline, title, child_id")
        .eq("plan_id", plans[0].id)
        .order("day_of_week")
        .order("sort_order");

      return items ?? [];
    },
  });

  // Query: diary activities for this week
  const { data: diaryActivities = [] } = useQuery({
    queryKey: ["calendar-activities", family?.id, weekKey],
    enabled: !!family,
    queryFn: async () => {
      const weekEnd = format(addDays(famWeekStart, 6), "yyyy-MM-dd");
      const { data } = await supabase
        .from("activities")
        .select("id, title, activity_date, discipline, child_id")
        .eq("family_id", family!.id)
        .gte("activity_date", weekKey)
        .lte("activity_date", weekEnd)
        .order("activity_date");
      return data ?? [];
    },
  });

  // Build events per day for family calendar
  const familyEventsByDay = useMemo(() => {
    const map = new Map<string, FamilyEvent[]>();
    famWeekDays.forEach((d) => map.set(format(d, "yyyy-MM-dd"), []));

    // Plan items (Mon-Fri = day_of_week 1-5)
    for (const item of planItems) {
      const day = famWeekDays[item.day_of_week - 1];
      if (!day) continue;
      const key = format(day, "yyyy-MM-dd");
      const childName = children.find((c) => c.id === item.child_id)?.name;
      map.get(key)?.push({
        id: `plan-${key}-${item.time_slot}-${item.discipline}`,
        kind: "plan",
        title: item.title,
        time: item.time_slot?.split("-")[0] ?? "",
        color: DISCIPLINE_COLORS[item.discipline] ?? "#9CA3AF",
        childName,
      });
    }

    // Extracurriculars (recurring by day_of_week)
    for (const act of extracurriculars) {
      if (!act.day_of_week) continue;
      const day = famWeekDays[act.day_of_week - 1];
      if (!day) continue;
      const key = format(day, "yyyy-MM-dd");
      const childName = act.child_id ? children.find((c) => c.id === act.child_id)?.name : undefined;
      map.get(key)?.push({
        id: `extra-${act.id}`,
        kind: "extra",
        title: act.name,
        time: act.start_time ?? "",
        color: EXTRACURRICULAR_COLORS[act.type ?? "Outro"] ?? "#9CA3AF",
        childName,
      });
    }

    // Diary activities
    for (const act of diaryActivities) {
      const key = act.activity_date;
      if (!map.has(key)) continue;
      const childName = act.child_id ? children.find((c) => c.id === act.child_id)?.name : undefined;
      map.get(key)?.push({
        id: `diary-${act.id}`,
        kind: "activity",
        title: act.title,
        time: "",
        color: DISCIPLINE_COLORS[act.discipline ?? ""] ?? "#9CA3AF",
        childName,
      });
    }

    return map;
  }, [planItems, extracurriculars, diaryActivities, famWeekDays, children]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-xl gradient-forest flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-accent-foreground" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Agenda</h1>
            </div>
            <p className="text-muted-foreground">O teu plano semanal e eventos da comunidade homeschool.</p>
          </div>
        </div>

        <Tabs defaultValue="familia" className="space-y-6">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="familia" className="gap-1.5">
              <Home className="h-4 w-4" />
              Minha Família
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-1.5">
              <CalendarDays className="h-4 w-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5">
              <MapPin className="h-4 w-4" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="h-4 w-4" />
              Por Região
            </TabsTrigger>
          </TabsList>

          {/* ── Família tab ─────────────────────────────────────────────────── */}
          <TabsContent value="familia" className="space-y-4">
            {/* Week nav */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setFamWeekOffset((w) => w - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <p className="text-sm font-semibold text-muted-foreground">
                {format(famWeekDays[0], "d MMM", { locale: pt })} — {format(famWeekDays[4], "d MMM yyyy", { locale: pt })}
              </p>
              <Button variant="ghost" size="sm" onClick={() => setFamWeekOffset((w) => w + 1)}>
                Seguinte <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary inline-block" />Plano semanal</span>
              <span className="flex items-center gap-1.5"><Dumbbell className="h-3 w-3" />Extracurricular</span>
              <span className="flex items-center gap-1.5"><FlaskRound className="h-3 w-3" />Diário</span>
            </div>

            {/* Week grid — only Mon-Fri (5 days) */}
            <div className="grid grid-cols-5 gap-2">
              {famWeekDays.slice(0, 5).map((day) => {
                const key   = format(day, "yyyy-MM-dd");
                const evts  = familyEventsByDay.get(key) ?? [];
                const isToday = isSameDay(day, new Date());
                const planEvts  = evts.filter((e) => e.kind === "plan");
                const extraEvts = evts.filter((e) => e.kind === "extra");
                const diaryEvts = evts.filter((e) => e.kind === "activity");

                return (
                  <div key={key} className="min-h-[180px]">
                    {/* Day header */}
                    <div className={`text-center text-xs font-semibold mb-2 pb-1 border-b ${
                      isToday ? "text-primary border-primary" : "text-muted-foreground border-border"
                    }`}>
                      <span className="block uppercase">{format(day, "EEE", { locale: pt })}</span>
                      <span className={`block text-lg ${isToday ? "text-primary" : "text-foreground"}`}>
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Plan items */}
                      {planEvts.map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded-md px-1.5 py-1 text-[10px] leading-tight"
                          style={{ backgroundColor: ev.color + "22", borderLeft: `2px solid ${ev.color}` }}
                          title={ev.title + (ev.childName ? ` · ${ev.childName}` : "")}
                        >
                          {ev.time && <span className="text-muted-foreground block">{ev.time}</span>}
                          <span className="font-medium line-clamp-2 text-foreground">{ev.title}</span>
                        </div>
                      ))}

                      {/* Extracurriculars */}
                      {extraEvts.map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded-md px-1.5 py-1 text-[10px] leading-tight flex items-start gap-1"
                          style={{ backgroundColor: ev.color + "22", borderLeft: `2px solid ${ev.color}` }}
                          title={ev.title + (ev.childName ? ` · ${ev.childName}` : "")}
                        >
                          <Dumbbell className="h-2.5 w-2.5 shrink-0 mt-0.5" style={{ color: ev.color }} />
                          <span className="font-medium line-clamp-2 text-foreground">{ev.title}</span>
                        </div>
                      ))}

                      {/* Diary activities */}
                      {diaryEvts.map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded-md px-1.5 py-1 text-[10px] leading-tight flex items-start gap-1 bg-muted/60"
                          title={ev.title + (ev.childName ? ` · ${ev.childName}` : "")}
                        >
                          <FlaskRound className="h-2.5 w-2.5 shrink-0 mt-0.5 text-muted-foreground" />
                          <span className="line-clamp-2 text-muted-foreground">{ev.title}</span>
                        </div>
                      ))}

                      {evts.length === 0 && (
                        <p className="text-[10px] text-muted-foreground/40 text-center pt-2">-</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weekday empty state */}
            {planItems.length === 0 && extracurriculars.length === 0 && diaryActivities.length === 0 && (
              <div className="text-center py-10">
                <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">Sem eventos esta semana</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gera um plano no Planeador Semanal para ver os teus eventos aqui.
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── Community events — week view ───────────────────────────────── */}
          <TabsContent value="week" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setCommWeekOffset((w) => w - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <p className="text-sm font-semibold text-muted-foreground">
                {format(commWeekDays[0], "d MMM", { locale: pt })} — {format(commWeekDays[6], "d MMM yyyy", { locale: pt })}
              </p>
              <Button variant="ghost" size="sm" onClick={() => setCommWeekOffset((w) => w + 1)}>
                Seguinte <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={themeFilter} onValueChange={setThemeFilter}>
                <Select>
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                    <SelectValue placeholder="Tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os temas</SelectItem>
                    {themes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Select>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {commWeekDays.map((day) => {
                const dayEvents = filteredByTheme.filter((e) => isSameDay(e.date, day));
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={day.toISOString()} className="min-h-[140px]">
                    <div className={`text-center text-xs font-semibold mb-2 pb-1 border-b ${
                      isToday ? "text-primary border-primary" : "text-muted-foreground border-border"
                    }`}>
                      <span className="block uppercase">{format(day, "EEE", { locale: pt })}</span>
                      <span className={`block text-lg ${isToday ? "text-primary" : "text-foreground"}`}>
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {dayEvents.map((ev) => {
                        const cfg = themeConfig[ev.theme];
                        const Icon = cfg.icon;
                        return (
                          <motion.button
                            key={ev.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`w-full text-left rounded-lg p-2 ${cfg.bg} border border-transparent hover:border-border hover:shadow-soft transition-all duration-200 cursor-pointer`}
                            onClick={() => showDetails(ev)}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <Icon className={`h-3 w-3 ${cfg.color} shrink-0`} />
                              <span className="text-[10px] text-muted-foreground">{ev.time}</span>
                            </div>
                            <p className="text-[11px] font-semibold leading-tight line-clamp-2">{ev.title}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Map Tab ────────────────────────────────────────────────────── */}
          <TabsContent value="map" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="relative w-full max-w-[260px] mx-auto" style={{ aspectRatio: "0.5" }}>
                    <svg viewBox="0 0 200 400" className="w-full h-full" fill="none">
                      <path
                        d="M80 10 C120 10, 160 30, 155 60 C150 90, 170 100, 165 130 C160 160, 140 170, 135 190 C130 210, 145 230, 140 260 C135 290, 120 310, 115 330 C110 350, 90 370, 80 380 C70 390, 50 380, 45 360 C40 340, 30 320, 35 290 C40 260, 25 240, 30 210 C35 180, 45 170, 50 150 C55 130, 40 110, 45 80 C50 50, 60 30, 80 10Z"
                        fill="hsl(var(--accent) / 0.12)"
                        stroke="hsl(var(--accent))"
                        strokeWidth="2"
                      />
                    </svg>
                    {regions.map((region) => {
                      const pos = regionPositions[region];
                      const count = filteredByTheme.filter((e) => e.region === region).length;
                      const isSelected = selectedRegion === region;
                      return (
                        <button
                          key={region}
                          className={`absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                            isSelected ? "scale-125" : "hover:scale-110"
                          }`}
                          style={{ top: pos.top, left: pos.left }}
                          onClick={() => setSelectedRegion(isSelected ? null : region)}
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-soft transition-colors ${
                            isSelected ? "gradient-warmth text-primary-foreground" : "bg-card border-2 border-accent text-accent"
                          }`}>
                            {count}
                          </div>
                          <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">{region}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">
                  {selectedRegion ? `Eventos em ${selectedRegion}` : "Seleciona uma região no mapa"}
                </p>
                {selectedRegion && filteredByRegion.map((ev, i) => {
                  const cfg = themeConfig[ev.theme];
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={ev.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <EventCard ev={ev} cfg={cfg} Icon={Icon} onDetails={showDetails} />
                    </motion.div>
                  );
                })}
                {selectedRegion && filteredByRegion.length === 0 && (
                  <p className="text-sm text-muted-foreground py-8 text-center">Sem eventos nesta região esta semana.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── List by Region ─────────────────────────────────────────────── */}
          <TabsContent value="list" className="space-y-6">
            {regions.map((region) => {
              const regionEvents = filteredByTheme.filter((e) => e.region === region);
              if (regionEvents.length === 0) return null;
              return (
                <div key={region}>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-accent" />
                    <h2 className="font-heading font-bold text-lg">{region}</h2>
                    <Badge variant="secondary" className="text-[10px]">{regionEvents.length}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {regionEvents.map((ev, i) => {
                      const cfg = themeConfig[ev.theme];
                      const Icon = cfg.icon;
                      return (
                        <motion.div key={ev.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <EventCard ev={ev} cfg={cfg} Icon={Icon} onDetails={showDetails} />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

function EventCard({
  ev, cfg, Icon, onDetails,
}: {
  ev: CommunityEvent;
  cfg: { color: string; bg: string };
  Icon: typeof TreePine;
  onDetails: (ev: CommunityEvent) => void;
}) {
  return (
    <Card className="hover:shadow-elevated transition-shadow duration-300 group">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <div className={`h-9 w-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4 w-4 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-sm leading-tight group-hover:text-primary transition-colors">
              {ev.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{ev.theme}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{ev.description}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.time}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location.split(",")[0]}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ev.spots} vagas</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {format(ev.date, "EEEE, d MMM", { locale: pt })}
        </div>
        <Button variant="outline" size="sm" className="w-full gap-1.5 mt-1" onClick={() => onDetails(ev)}>
          <Eye className="h-3.5 w-3.5" />
          Ver Detalhes do Encontro
        </Button>
      </CardContent>
    </Card>
  );
}

export default CalendarPage;
