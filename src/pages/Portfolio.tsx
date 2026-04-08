import { useState, useMemo, useEffect, useCallback } from "react";
import { parseISO, format } from "date-fns";
import { pt } from "date-fns/locale";
import { pdf } from "@react-pdf/renderer";
import {
  Trophy, Leaf, ImageIcon, Filter, ChevronDown, Trash2,
  Sparkles, Loader2, BookOpen, FolderKanban, CheckCircle2, Download,
  X, ChevronLeft, ChevronRight, ZoomIn,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useChildren } from "@/hooks/useChildren";
import { usePortfolio, type PortfolioEntry } from "@/hooks/usePortfolio";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS } from "@/lib/planGenerator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { NexseedCurriculum } from "@/lib/types";

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

function DisciplineBadge({ discipline }: { discipline: string | null }) {
  if (!discipline) return null;
  const label = DISCIPLINE_LABELS[discipline] ?? discipline;
  const color = DISCIPLINE_COLORS[discipline] ?? "#E5E7EB";
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: color + "33", color: "#1F2937" }}
    >
      {label}
    </span>
  );
}

function CoverageTags({ coverage }: { coverage: PortfolioEntry["coverage"] }) {
  if (!coverage.length) return null;
  const sorted = [...coverage].sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {sorted.map((c) => (
        <span
          key={c.curriculum_id}
          title={`${c.objective} (${Math.round(c.confidence * 100)}% confiança)`}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
        >
          <BookOpen className="h-3 w-3 shrink-0" />
          {c.discipline_name}
          {c.confidence >= 0.8 && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
        </span>
      ))}
      {coverage.length > 3 && (
        <span className="text-xs text-muted-foreground px-1">+{coverage.length - 3}</span>
      )}
    </div>
  );
}

// ── Currículo NexSeed tab ─────────────────────────────────────────────────────

type CurriculumGroup = {
  discipline_key: string;
  discipline_name: string;
  objectives: (NexseedCurriculum & { coverageCount: number })[];
};

function NexseedCurriculumTab({
  schoolYears,
  coverageCountByCurriculum,
}: {
  schoolYears: string[];
  coverageCountByCurriculum: Map<string, number>;
}) {
  const { data: items = [], isLoading } = useQuery<NexseedCurriculum[]>({
    queryKey: ["nexseed_curriculum", schoolYears],
    enabled: schoolYears.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nexseed_curriculum")
        .select("*")
        .in("school_year", schoolYears)
        .eq("is_active", true)
        .order("discipline_key")
        .order("area");
      if (error) throw error;
      return (data ?? []) as NexseedCurriculum[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
        <BookOpen className="h-10 w-10 opacity-30" />
        <p className="font-semibold">Currículo NexSeed ainda não configurado</p>
        <p className="text-sm max-w-sm">
          O currículo NexSeed será preenchido com os objetivos pedagógicos da família. Por agora, a triangulação usa apenas o currículo nacional GC.
        </p>
      </div>
    );
  }

  // Agrupar por school_year → discipline
  const byYear = new Map<string, CurriculumGroup[]>();
  for (const item of items) {
    if (!byYear.has(item.school_year)) byYear.set(item.school_year, []);
    const yearGroups = byYear.get(item.school_year)!;
    let group = yearGroups.find((g) => g.discipline_key === item.discipline_key);
    if (!group) {
      group = { discipline_key: item.discipline_key, discipline_name: item.discipline_name, objectives: [] };
      yearGroups.push(group);
    }
    group.objectives.push({ ...item, coverageCount: coverageCountByCurriculum.get(item.id) ?? 0 });
  }

  return (
    <div className="space-y-8">
      {[...byYear.entries()].map(([year, groups]) => (
        <div key={year}>
          <h2 className="text-base font-heading font-bold mb-4 pb-1 border-b">{year}</h2>
          <div className="space-y-5">
            {groups.map((group) => {
              const covered = group.objectives.filter((o) => o.coverageCount > 0).length;
              return (
                <div key={group.discipline_key}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{group.discipline_name}</p>
                    <span className="text-xs text-muted-foreground">{covered}/{group.objectives.length} cobertos</span>
                  </div>
                  <div className="space-y-1.5">
                    {group.objectives.map((obj) => (
                      <div
                        key={obj.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm",
                          obj.coverageCount > 0
                            ? "border-primary/20 bg-primary/5"
                            : "border-border bg-card"
                        )}
                      >
                        <div className="flex-1">
                          {obj.area && (
                            <p className="text-xs text-muted-foreground mb-0.5">{obj.area}</p>
                          )}
                          <p className={cn(obj.coverageCount > 0 && "text-foreground font-medium")}>
                            {obj.objective}
                          </p>
                        </div>
                        {obj.coverageCount > 0 && (
                          <Badge variant="outline" className="shrink-0 text-xs border-primary/30 text-primary gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {obj.coverageCount}×
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Portfolio() {
  const { children, isLoading: childrenLoading } = useChildren();
  const { entries, isLoading: portfolioLoading, analyze, deleteActivity, coverageCountByCurriculum } = usePortfolio();

  const schoolYears = useMemo(() => [...new Set(children.map((c) => c.school_year))], [children]);

  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [typeFilter, setTypeFilter]            = useState<"all" | "activity" | "project">("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [showFilters, setShowFilters]          = useState(false);
  const [entryToDelete, setEntryToDelete]      = useState<string | null>(null);
  const [analyzing, setAnalyzing]              = useState(false);
  const [exportingPDF, setExportingPDF]        = useState(false);

  // Lightbox state
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

  const openLightbox = useCallback((photos: string[], index: number) => {
    setLightbox({ photos, index });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const lightboxPrev = useCallback(() =>
    setLightbox((lb) => lb ? { ...lb, index: (lb.index - 1 + lb.photos.length) % lb.photos.length } : lb),
  []);

  const lightboxNext = useCallback(() =>
    setLightbox((lb) => lb ? { ...lb, index: (lb.index + 1) % lb.photos.length } : lb),
  []);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, lightboxPrev, lightboxNext]);

  const isLoading = childrenLoading || portfolioLoading;

  // ─── Filtros ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() =>
    entries
      .filter((e) => selectedChildId === "all" || e.child_id === selectedChildId)
      .filter((e) => typeFilter === "all" || e.kind === typeFilter)
      .filter((e) => {
        if (disciplineFilter === "all") return true;
        return e.kind === "activity" && e.discipline === disciplineFilter;
      }),
    [entries, selectedChildId, typeFilter, disciplineFilter]
  );

  const presentDisciplines = useMemo(() => {
    const base = entries.filter(
      (e) => (selectedChildId === "all" || e.child_id === selectedChildId) && e.kind === "activity"
    );
    return [...new Set(base.map((e) => e.kind === "activity" ? e.discipline : null).filter(Boolean))] as string[];
  }, [entries, selectedChildId]);

  // ─── Estatísticas ──────────────────────────────────────────────────────────

  const statsBase = useMemo(() =>
    entries.filter((e) => selectedChildId === "all" || e.child_id === selectedChildId),
    [entries, selectedChildId]
  );

  const totalActivities = statsBase.filter((e) => e.kind === "activity").length;
  const totalProjects   = statsBase.filter((e) => e.kind === "project").length;
  const coveredCount    = statsBase.filter((e) => e.coverage.length > 0).length;

  const selectedChild = children.find((c) => c.id === selectedChildId);

  // ─── Analisar com IA ───────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    const toAnalyze = filtered.length > 0 ? filtered : entries.filter(
      (e) => selectedChildId === "all" || e.child_id === selectedChildId
    );
    if (!toAnalyze.length) return;

    setAnalyzing(true);
    try {
      const result = await analyze.mutateAsync(toAnalyze);
      toast({
        title: "Análise concluída",
        description: `${result.matched} ligações curriculares identificadas.`,
      });
    } catch (e) {
      toast({
        title: "Erro na análise",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── Exportar PDF ────────────────────────────────────────────────────────

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const { default: PortfolioPDFComp } = await import("@/components/pdf/PortfolioPDF");
      const entriesToExport = filtered.length > 0 ? filtered : entries;
      const blob = await pdf(
        <PortfolioPDFComp
          entries={entriesToExport}
          children={children}
          childId={selectedChildId}
          familyName={children[0] ? "Família NexSeed" : "NexSeed"}
        />
      ).toBlob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const childLabel = selectedChildId !== "all"
        ? (children.find((c) => c.id === selectedChildId)?.name ?? "portfolio")
        : "portfolio";
      a.download = `nexseed-portfolio-${childLabel}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      a.click();
    } catch (e) {
      toast({
        title: "Erro ao exportar PDF",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setExportingPDF(false);
    }
  };

  // ─── Apagar ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!entryToDelete) return;
    try {
      await deleteActivity.mutateAsync(entryToDelete);
      toast({ title: "Atividade removida." });
    } catch (e) {
      toast({
        title: "Erro ao remover",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setEntryToDelete(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-7 w-7 text-primary" /> Portfólio
            </h1>
            <p className="text-muted-foreground mt-1">Atividades e projetos, ligados ao currículo NexSeed.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedChildId} onValueChange={(v) => { setSelectedChildId(v); setDisciplineFilter("all"); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Todas as crianças" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as crianças</SelectItem>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing || isLoading}
              className="gap-2 shrink-0"
            >
              {analyzing
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Sparkles className="h-4 w-4" />}
              {analyzing ? "A analisar…" : "Analisar com IA"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={exportingPDF || isLoading || entries.length === 0}
              className="gap-2 shrink-0"
            >
              {exportingPDF
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Download className="h-4 w-4" />}
              PDF
            </Button>
          </div>
        </div>

        {/* Banner */}
        {!isLoading && (
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <Card className="border-primary/10 overflow-hidden">
              <div className="gradient-warmth p-5 flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {selectedChild
                    ? selectedChild.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
                    : "🌱"}
                </div>
                <div className="text-white flex-1">
                  <h2 className="text-xl font-heading font-bold">
                    {selectedChild ? selectedChild.name : "Família"}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {selectedChild ? `${selectedChild.school_year} · Ensino Doméstico` : "Todas as crianças"}
                  </p>
                </div>
                <div className="hidden sm:flex gap-3">
                  {[
                    { value: totalActivities, label: "Atividades",  icon: "🌿" },
                    { value: totalProjects,   label: "Projetos",    icon: "📁" },
                    { value: coveredCount,    label: "Analisados",  icon: "✨" },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-white/70">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="portfolio">
          <TabsList className="mb-4">
            <TabsTrigger value="portfolio" className="gap-1.5">
              <Trophy className="h-3.5 w-3.5" /> Portfólio
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Currículo NexSeed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="mt-0">
            <NexseedCurriculumTab
              schoolYears={schoolYears}
              coverageCountByCurriculum={coverageCountByCurriculum}
            />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-0">

        {/* Filtros */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="flex flex-wrap gap-2">
          {/* Tipo */}
          {(["all", "activity", "project"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1",
                typeFilter === t
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              {t === "all"      && "Todos"}
              {t === "activity" && <><ImageIcon className="h-3 w-3" /> Atividades</>}
              {t === "project"  && <><FolderKanban className="h-3 w-3" /> Projetos</>}
            </button>
          ))}

          {/* Filtro de disciplina (só quando a tab é activity ou all) */}
          {presentDisciplines.length > 1 && typeFilter !== "project" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1 h-7 px-3 text-xs"
              >
                <Filter className="h-3 w-3" /> Área
                <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
              </Button>
              {showFilters && presentDisciplines.map((d) => (
                <button
                  key={d}
                  onClick={() => setDisciplineFilter(disciplineFilter === d ? "all" : d)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                    disciplineFilter === d
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {DISCIPLINE_LABELS[d] ?? d}
                </button>
              ))}
            </>
          )}
        </motion.div>

        {/* Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="hidden sm:flex flex-col items-center pt-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Card className="flex-1 border-primary/10">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        {!isLoading && (
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent hidden sm:block" />

            <div className="space-y-4">
              {filtered.map((entry, i) => {
                const child = children.find((c) => c.id === entry.child_id);
                const d = parseISO(entry.date + "T00:00:00");
                const isActivity = entry.kind === "activity";
                const hasPhotos  = isActivity && (entry.photos?.length ?? 0) > 0;

                return (
                  <motion.div
                    key={entry.id}
                    initial="hidden"
                    animate="visible"
                    custom={i + 2}
                    variants={fadeUp}
                    className="flex gap-4"
                  >
                    {/* Dot */}
                    <div className="hidden sm:flex flex-col items-center pt-4">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10",
                        !isActivity
                          ? "bg-violet-100 border-2 border-violet-300"
                          : hasPhotos
                            ? "gradient-warmth"
                            : "bg-card border-2 border-primary/20"
                      )}>
                        {!isActivity
                          ? <FolderKanban className="h-4 w-4 text-violet-600" />
                          : hasPhotos
                            ? <ImageIcon className="h-4 w-4 text-white" />
                            : <Leaf className="h-4 w-4 text-primary/60" />
                        }
                      </div>
                    </div>

                    {/* Card */}
                    <Card className={cn(
                      "flex-1 hover:shadow-md transition-shadow border-primary/10",
                      !isActivity && "border-violet-200",
                      entry.coverage.length > 0 && "ring-1 ring-primary/15"
                    )}>
                      <CardContent className="p-4 sm:p-5">
                        {/* Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                !isActivity && "border-violet-300 text-violet-700"
                              )}
                            >
                              {isActivity ? "Atividade" : "Projeto"}
                            </Badge>
                            {isActivity && <DisciplineBadge discipline={entry.discipline} />}
                            {!isActivity && (
                              <Badge variant="outline" className="text-xs border-violet-200 text-violet-600">
                                {(entry as typeof entry & { status: string }).status}
                              </Badge>
                            )}
                            {selectedChildId === "all" && child && (
                              <Badge variant="outline" className="text-xs">
                                {child.name.split(" ")[0]}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(d, "d MMM yyyy", { locale: pt })}
                            </span>
                            {isActivity && (
                              <button
                                onClick={() => setEntryToDelete(entry.id)}
                                className="text-muted-foreground/40 hover:text-destructive transition-colors p-0.5"
                                title="Remover atividade"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Título + descrição */}
                        <h3 className="font-semibold text-foreground">{entry.title}</h3>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.description}</p>
                        )}

                        {/* Fases do projeto */}
                        {!isActivity && (entry as typeof entry & { phases: { title: string; completed: boolean }[] }).phases?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(entry as typeof entry & { phases: { title: string; completed: boolean }[] }).phases.slice(0, 4).map((phase, pi) => (
                              <span
                                key={pi}
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full border",
                                  phase.completed
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-muted border-border text-muted-foreground"
                                )}
                              >
                                {phase.completed ? "✓ " : ""}{phase.title}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Fotos (atividades) */}
                        {hasPhotos && (() => {
                          const photos = (entry as typeof entry & { photos: string[] }).photos;
                          const visible = photos.slice(0, 5);
                          const remaining = photos.length - visible.length;
                          return (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {visible.map((url, j) => (
                                <button
                                  key={j}
                                  onClick={() => openLightbox(photos, j)}
                                  className="relative group h-16 w-16 rounded-lg overflow-hidden border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                  title="Ver foto"
                                >
                                  <img src={url} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              ))}
                              {remaining > 0 && (
                                <button
                                  onClick={() => openLightbox(photos, 5)}
                                  className="h-16 w-16 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-xs font-semibold text-muted-foreground border border-border transition-colors"
                                >
                                  +{remaining}
                                </button>
                              )}
                            </div>
                          );
                        })()}

                        {/* Cobertura curricular */}
                        <CoverageTags coverage={entry.coverage} />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <Trophy className="h-12 w-12 mx-auto text-primary/20 mb-3" />
                <p className="font-heading font-semibold text-foreground">Portfólio vazio</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {entries.length > 0
                    ? "Nenhuma entrada com este filtro."
                    : "Regista atividades e projetos para construir o portfólio."}
                </p>
              </div>
            )}
          </div>
        )}

          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Confirm delete */}
      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover atividade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. As fotos e ligações curriculares também serão eliminadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Lightbox ────────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          {lightbox.photos.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightbox.index + 1} / {lightbox.photos.length}
            </span>
          )}

          {/* Prev */}
          {lightbox.photos.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-black/30 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={lightbox.photos[lightbox.index]}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {lightbox.photos.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-black/30 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Thumbnails strip */}
          {lightbox.photos.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox((lb) => lb ? { ...lb, index: i } : lb)}
                  className={`h-10 w-10 rounded-md overflow-hidden border-2 transition-all ${
                    i === lightbox.index ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={url} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
