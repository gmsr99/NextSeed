import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays, MapPin, List, Clock, Users,
  ChevronLeft, ChevronRight,
  TreePine, FlaskConical, Palette, Hammer, BookOpen,
  Eye, Filter, Home, Plus,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { addDays, format, startOfWeek, isSameDay, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { pt } from "date-fns/locale";
import { useChildren } from "@/hooks/useChildren";
import { MonthView } from '@/components/calendar/MonthView';
import { DayPanel } from '@/components/calendar/DayPanel';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarData } from '@/hooks/useCalendarData';

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

// ─── Main component ───────────────────────────────────────────────────────────

const CalendarPage = () => {
  // Community events state
  const [commWeekOffset, setCommWeekOffset] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [themeFilter, setThemeFilter] = useState("all");

  const { children } = useChildren();

  // ── Community events helpers ────────────────────────────────────────────────
  const commWeekStart = addDays(BASE, commWeekOffset * 7);
  const commWeekDays  = Array.from({ length: 7 }, (_, i) => addDays(commWeekStart, i));

  const filteredByTheme  = themeFilter === "all" ? communityEvents : communityEvents.filter((e) => e.theme === themeFilter);
  const filteredByRegion = selectedRegion ? filteredByTheme.filter((e) => e.region === selectedRegion) : filteredByTheme;

  const showDetails = (ev: CommunityEvent) => {
    toast({ title: ev.title, description: `${ev.location} · ${ev.time} · ${ev.spots} vagas` });
  };

  // ── Family calendar state ──────────────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  const { events: manualEvents } = useCalendarEvents(monthStart, monthEnd);
  const { eventsByDate } = useCalendarData(monthStart, monthEnd, manualEvents, children);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

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
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold capitalize text-lg">
                {format(currentMonth, 'MMMM yyyy', { locale: pt })}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/> Plano semanal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"/> Extracurricular</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/> Evento da família</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <MonthView
                  month={currentMonth}
                  eventsByDate={eventsByDate}
                  onDayClick={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </div>
              <div>
                {selectedDate ? (
                  <DayPanel
                    date={selectedDate}
                    events={selectedEvents}
                    children={children}
                    monthStart={monthStart}
                    monthEnd={monthEnd}
                    onClose={() => setSelectedDate(null)}
                  />
                ) : (
                  <div className="border-2 border-dashed rounded-xl p-6 text-center text-muted-foreground text-sm h-full flex items-center justify-center">
                    Clica num dia para ver os eventos e adicionar novos.
                  </div>
                )}
              </div>
            </div>
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
