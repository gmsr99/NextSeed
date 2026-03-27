import { useState, useMemo } from "react";
import { parseISO, differenceInCalendarWeeks } from "date-fns";
import { motion } from "framer-motion";
import { BarChart3, FileDown, BookOpen, FolderOpen, ImageIcon, Activity, TrendingUp, Award, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChildren } from "@/hooks/useChildren";
import { useActivities } from "@/hooks/useActivities";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS } from "@/lib/planGenerator";

const PERIODS = [
  { id: "week",    label: "Esta semana" },
  { id: "month",   label: "Este mês" },
  { id: "quarter", label: "Este trimestre (auto)" },
  { id: "q1",      label: "1º Trimestre (Set–Dez)" },
  { id: "q2",      label: "2º Trimestre (Jan–Mar)" },
  { id: "q3",      label: "3º Trimestre (Abr–Jun)" },
];

function getRange(period: string): { start: string; end: string; label: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const base = m >= 9 ? y : y - 1;

  if (period === "week") {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(monday.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10), label: "Esta semana" };
  }
  if (period === "month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: s.toISOString().slice(0, 10), end: today, label: "Este mês" };
  }
  if (period === "q1") return { start: `${base}-09-01`,   end: `${base}-12-31`,   label: "1º Trimestre" };
  if (period === "q2") return { start: `${base+1}-01-01`, end: `${base+1}-03-31`, label: "2º Trimestre" };
  if (period === "q3") return { start: `${base+1}-04-01`, end: `${base+1}-06-30`, label: "3º Trimestre" };
  // "quarter" = auto-detect trimestre actual
  if (m >= 9)  return { start: `${base}-09-01`,   end: `${base}-12-31`,   label: "1º Trimestre" };
  if (m <= 3)  return { start: `${base+1}-01-01`, end: `${base+1}-03-31`, label: "2º Trimestre" };
  return             { start: `${base+1}-04-01`, end: `${base+1}-06-30`, label: "3º Trimestre" };
}

function buildTrend(
  acts: { activity_date: string }[],
  range: { start: string; end: string },
  period: string,
): { bars: number[]; labels: string[] } {
  if (period === "week") {
    const monday = parseISO(range.start + "T00:00:00");
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const bars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return acts.filter(a => a.activity_date === d.toISOString().slice(0, 10)).length;
    });
    const labels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return dayNames[d.getDay()];
    });
    return { bars, labels };
  }
  const start = parseISO(range.start + "T00:00:00");
  const end   = parseISO(range.end   + "T00:00:00");
  const numWeeks = differenceInCalendarWeeks(end, start, { weekStartsOn: 1 }) + 1;
  const bars = Array(Math.max(numWeeks, 1)).fill(0);
  for (const a of acts) {
    const d = parseISO(a.activity_date + "T00:00:00");
    const idx = differenceInCalendarWeeks(d, start, { weekStartsOn: 1 });
    if (idx >= 0 && idx < bars.length) bars[idx]++;
  }
  return { bars, labels: bars.map((_, i) => `S${i + 1}`) };
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export default function Reports() {
  const { family } = useAuth();
  const { children, isLoading: childrenLoading } = useChildren();
  const { activities, isLoading: activitiesLoading } = useActivities();
  const { projects, isLoading: projectsLoading } = useProjects();

  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [exporting, setExporting] = useState(false);

  const isLoading = childrenLoading || activitiesLoading || projectsLoading;
  const range = useMemo(() => getRange(selectedPeriod), [selectedPeriod]);

  // Activities filtered by child + period
  const periodActivities = useMemo(() =>
    activities
      .filter(a => selectedChildId === "all" || a.child_id === selectedChildId)
      .filter(a => a.activity_date >= range.start && a.activity_date <= range.end),
    [activities, selectedChildId, range]
  );

  // KPIs
  const totalActivities  = periodActivities.length;
  const photosCount      = periodActivities.filter(a => a.photos.length > 0).length;
  const areasCount       = new Set(periodActivities.map(a => a.discipline).filter(Boolean)).size;
  const childProjects    = projects.filter(p => selectedChildId === "all" || p.child_id === selectedChildId);
  const activeProjects   = childProjects.filter(p => p.status !== "paused");

  // Discipline breakdown
  const subjectBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of periodActivities) {
      if (a.discipline) counts[a.discipline] = (counts[a.discipline] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([discipline, count]) => ({
        discipline,
        name:  DISCIPLINE_LABELS[discipline] ?? discipline,
        color: DISCIPLINE_COLORS[discipline] ?? "#9CA3AF",
        count,
        percentage: totalActivities > 0 ? Math.round((count / totalActivities) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [periodActivities, totalActivities]);

  // Trend
  const trend = useMemo(
    () => buildTrend(periodActivities, range, selectedPeriod),
    [periodActivities, range, selectedPeriod]
  );
  const maxTrend = Math.max(...trend.bars, 1);

  // Highlights = most recent activities with a description
  const highlights = useMemo(() =>
    periodActivities.filter(a => a.description).slice(0, 3),
    [periodActivities]
  );

  // PDF export — qualquer trimestre (auto ou específico)
  const canExportPDF = ["quarter", "q1", "q2", "q3"].includes(selectedPeriod) && selectedChildId !== "all";

  const handleExport = async () => {
    if (!canExportPDF) return;
    const child = children.find(c => c.id === selectedChildId);
    if (!child) return;
    setExporting(true);
    try {
      const [{ pdf }, { default: TrimesterReportPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/TrimesterReportPDF"),
      ]);
      const blob = await pdf(
        <TrimesterReportPDF
          activities={periodActivities}
          child={child}
          trimesterLabel={range.label}
          startDate={range.start}
          endDate={range.end}
          familyName={family?.name ?? "Família"}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_${child.name.replace(/\s+/g, "_")}_${range.label.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" /> Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">Visão geral do percurso de aprendizagem.</p>
          </div>
          <Button
            variant="warmth"
            onClick={handleExport}
            disabled={!canExportPDF || exporting}
            className="gap-2"
            title={!canExportPDF ? "Seleciona uma criança e o período 'Este trimestre' para exportar PDF" : undefined}
          >
            {exporting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <FileDown className="h-4 w-4" />}
            Exportar PDF
          </Button>
        </div>

        {/* Selectors */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="flex flex-wrap gap-3">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todas as crianças" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as crianças</SelectItem>
              {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {canExportPDF && (
            <Badge variant="outline" className="text-xs self-center text-primary border-primary/40">
              PDF disponível · {range.label}
            </Badge>
          )}
        </motion.div>

        {/* Loading skeletons */}
        {isLoading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-primary/10">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-6 w-10" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-primary/10">
                  <CardHeader className="pb-3"><Skeleton className="h-4 w-32" /></CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {!isLoading && (
          <>
            {/* KPI cards */}
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Atividades",     value: totalActivities,        icon: Activity,   color: "text-primary" },
                { label: "Com fotos",      value: photosCount,            icon: ImageIcon,  color: "text-accent" },
                { label: "Projetos",       value: activeProjects.length,  icon: FolderOpen, color: "text-secondary" },
                { label: "Áreas cobertas", value: areasCount,             icon: BookOpen,   color: "text-primary" },
              ].map(kpi => (
                <Card key={kpi.label} className="border-primary/10">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject breakdown */}
              <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
                <Card className="border-primary/10 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-heading flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" /> Áreas Curriculares
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subjectBreakdown.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem atividades neste período.</p>
                    ) : subjectBreakdown.map(s => (
                      <div key={s.discipline} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">{s.name}</span>
                          <span className="text-muted-foreground">{s.count} ativ. · {s.percentage}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: s.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${s.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Activity trend */}
              <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
                <Card className="border-primary/10 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-heading flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Tendência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trend.bars.every(v => v === 0) ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">Sem atividades neste período.</p>
                    ) : (
                      <>
                        <div className="flex items-end gap-1.5 h-32">
                          {trend.bars.map((val, i) => (
                            <motion.div
                              key={i}
                              className="flex-1 rounded-t-md gradient-warmth min-w-[8px]"
                              initial={{ height: 0 }}
                              animate={{ height: `${(val / maxTrend) * 100}%` }}
                              transition={{ duration: 0.6, delay: 0.4 + i * 0.04 }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          {trend.labels.map((l, i) => (
                            <p key={i} className="flex-1 text-center text-[10px] text-muted-foreground truncate">{l}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Projects */}
              <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
                <Card className="border-primary/10 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-heading flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary" /> Projetos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {childProjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem projetos.</p>
                    ) : childProjects.map(p => {
                      const done  = p.phases.filter(ph => ph.completed).length;
                      const total = p.phases.length;
                      const statusLabel = p.status === "completed" ? "Concluído" : p.status === "paused" ? "Em pausa" : "Em curso";
                      return (
                        <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{done}/{total} fases</p>
                          </div>
                          <Badge
                            variant={p.status === "completed" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Highlights */}
              <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
                <Card className="border-primary/10 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-heading flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" /> Destaques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {highlights.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {totalActivities === 0
                          ? "Sem atividades neste período."
                          : "Regista descrições nas atividades para ver destaques."}
                      </p>
                    ) : highlights.map(a => (
                      <div key={a.id} className="flex items-start gap-3 rounded-lg bg-primary/5 px-4 py-3">
                        <span className="text-lg mt-0.5">🌟</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{a.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}
