import { useState, useMemo } from "react";
import { parseISO, format } from "date-fns";
import { pt } from "date-fns/locale";
import { Trophy, Leaf, ImageIcon, Filter, ChevronDown, Trash2 } from "lucide-react";
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
import { useActivities } from "@/hooks/useActivities";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS } from "@/lib/planGenerator";
import { toast } from "@/hooks/use-toast";

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

// Discipline badge colour derived from DISCIPLINE_COLORS (hex → Tailwind-style inline)
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

export default function Portfolio() {
  const { children, isLoading: childrenLoading } = useChildren();
  const { activities, isLoading: activitiesLoading, deleteActivity } = useActivities();

  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!activityToDelete) return;
    try {
      await deleteActivity.mutateAsync(activityToDelete);
      toast({ title: "Atividade removida." });
    } catch (e) {
      toast({
        title: "Erro ao remover",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setActivityToDelete(null);
    }
  };

  const isLoading = childrenLoading || activitiesLoading;

  // Activities for the selected child, sorted newest first
  const childActivities = useMemo(
    () =>
      activities
        .filter((a) => selectedChildId === "all" || a.child_id === selectedChildId)
        .filter((a) => disciplineFilter === "all" || a.discipline === disciplineFilter)
        .sort((a, b) => b.activity_date.localeCompare(a.activity_date)),
    [activities, selectedChildId, disciplineFilter]
  );

  // Disciplines present in the filtered activities (for the filter dropdown)
  const presentDisciplines = useMemo(() => {
    const base = activities.filter(
      (a) => selectedChildId === "all" || a.child_id === selectedChildId
    );
    return [...new Set(base.map((a) => a.discipline).filter(Boolean))] as string[];
  }, [activities, selectedChildId]);

  // Stats for the banner
  const statsChild = useMemo(
    () =>
      activities.filter(
        (a) => selectedChildId === "all" || a.child_id === selectedChildId
      ),
    [activities, selectedChildId]
  );
  const totalCount   = statsChild.length;
  const photosCount  = statsChild.filter((a) => a.photos.length > 0).length;
  const disciplinesCount = new Set(statsChild.map((a) => a.discipline).filter(Boolean)).size;

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-7 w-7 text-primary" /> Portfólio
            </h1>
            <p className="text-muted-foreground mt-1">O percurso de aprendizagem, passo a passo.</p>
          </div>
          <Select value={selectedChildId} onValueChange={(v) => { setSelectedChildId(v); setDisciplineFilter("all"); }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todas as crianças" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as crianças</SelectItem>
              {children.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    { value: totalCount,       label: "Atividades" },
                    { value: photosCount,       label: "Com fotos" },
                    { value: disciplinesCount,  label: "Áreas" },
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

        {/* Filters */}
        {presentDisciplines.length > 1 && (
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" /> Filtrar por área
              <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
            </Button>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-wrap gap-2 mt-3"
              >
                <button
                  onClick={() => setDisciplineFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                    disciplineFilter === "all"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  Todas
                </button>
                {presentDisciplines.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDisciplineFilter(d)}
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
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Loading skeletons */}
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
                    <div className="flex gap-2">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <Skeleton className="h-16 w-16 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        {!isLoading && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent hidden sm:block" />

            <div className="space-y-4">
              {childActivities.map((act, i) => {
                const child = children.find((c) => c.id === act.child_id);
                const d = parseISO(act.activity_date + "T00:00:00");
                const hasPhotos = act.photos.length > 0;

                return (
                  <motion.div
                    key={act.id}
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
                        hasPhotos
                          ? "gradient-warmth"
                          : "bg-card border-2 border-primary/20"
                      )}>
                        {hasPhotos
                          ? <ImageIcon className="h-4 w-4 text-white" />
                          : <Leaf className="h-4 w-4 text-primary/60" />
                        }
                      </div>
                    </div>

                    {/* Card */}
                    <Card className={cn(
                      "flex-1 hover:shadow-md transition-shadow border-primary/10",
                      hasPhotos && "ring-1 ring-primary/20"
                    )}>
                      <CardContent className="p-4 sm:p-5">
                        {/* Meta row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <DisciplineBadge discipline={act.discipline} />
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
                            <button
                              onClick={() => setActivityToDelete(act.id)}
                              className="text-muted-foreground/40 hover:text-destructive transition-colors p-0.5"
                              title="Remover atividade"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title + description */}
                        <h3 className="font-semibold text-foreground">{act.title}</h3>
                        {act.description && (
                          <p className="text-sm text-muted-foreground mt-1">{act.description}</p>
                        )}

                        {/* Photos */}
                        {hasPhotos && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {act.photos.slice(0, 5).map((url, j) => (
                              <img
                                key={j}
                                src={url}
                                className="h-16 w-16 rounded-lg object-cover border border-border"
                              />
                            ))}
                            {act.photos.length > 5 && (
                              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                +{act.photos.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty state */}
            {childActivities.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <Trophy className="h-12 w-12 mx-auto text-primary/20 mb-3" />
                <p className="font-heading font-semibold text-foreground">Portfólio vazio</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalCount > 0
                    ? "Nenhuma atividade com este filtro."
                    : "Regista atividades para construir o portfólio."}
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover atividade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. As fotos associadas também serão eliminadas.
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
