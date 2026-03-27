import { useState, useMemo } from "react";
import { parseISO, format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Trophy, Leaf, ImageIcon, Filter, ChevronDown, Trash2,
  Sparkles, Loader2, BookOpen, FolderKanban, CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function Portfolio() {
  const { children, isLoading: childrenLoading } = useChildren();
  const { entries, isLoading: portfolioLoading, analyze, deleteActivity } = usePortfolio();

  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [typeFilter, setTypeFilter]            = useState<"all" | "activity" | "project">("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [showFilters, setShowFilters]          = useState(false);
  const [entryToDelete, setEntryToDelete]      = useState<string | null>(null);
  const [analyzing, setAnalyzing]              = useState(false);

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
                        {hasPhotos && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {(entry as typeof entry & { photos: string[] }).photos.slice(0, 5).map((url, j) => (
                              <img
                                key={j}
                                src={url}
                                className="h-16 w-16 rounded-lg object-cover border border-border"
                              />
                            ))}
                            {(entry as typeof entry & { photos: string[] }).photos.length > 5 && (
                              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                +{(entry as typeof entry & { photos: string[] }).photos.length - 5}
                              </div>
                            )}
                          </div>
                        )}

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
    </AppLayout>
  );
}
