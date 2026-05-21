import { useState, useMemo } from "react";
import { Map as MapIcon, CheckCircle2, Circle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChildren } from "@/hooks/useChildren";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { YEAR_MAP, GC_DISCIPLINE_LABELS } from "@/lib/gcConstants";

type ProgressStatus = "a_aprender" | "em_progresso" | "dominado";

interface CurriculumContent {
  id: string;
  discipline: string;
  domain: string | null;
  content: string;
}

interface ContentProgress {
  content_id: string;
  status: ProgressStatus;
}

const PERIOD_LABELS = ["1º Período", "2º Período", "3º Período"];
const PERIOD_MONTHS = ["Set – Dez", "Jan – Mar", "Abr – Jun"];

function StatusIcon({ status }: { status: ProgressStatus }) {
  if (status === "dominado") return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (status === "em_progresso") return <Clock className="h-4 w-4 text-amber-500 shrink-0" />;
  return <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />;
}

export default function RoteiroAnual() {
  const { children } = useChildren();
  const { family } = useAuth();

  // Only show children with a mapped school year
  const eligibleChildren = children.filter((c) => YEAR_MAP[c.school_year]);

  const [selectedChildId, setSelectedChildId] = useState<string>(() => eligibleChildren[0]?.id ?? "");

  const selectedChild = eligibleChildren.find((c) => c.id === selectedChildId);
  const dbYear = selectedChild ? YEAR_MAP[selectedChild.school_year] : null;

  const { data: contents = [], isLoading: loadingContents } = useQuery<CurriculumContent[]>({
    queryKey: ["curriculum_contents_roadmap", dbYear],
    enabled: !!dbYear,
    queryFn: async () => {
      const { data } = await supabase
        .from("curriculum_contents")
        .select("id, discipline, domain, content")
        .eq("school_year", dbYear!)
        .order("discipline")
        .order("id");
      return (data ?? []) as CurriculumContent[];
    },
  });

  const { data: progress = [], isLoading: loadingProgress } = useQuery<ContentProgress[]>({
    queryKey: ["child_progress_roadmap", selectedChildId],
    enabled: !!selectedChildId && !!family,
    queryFn: async () => {
      const { data } = await supabase
        .from("child_content_progress")
        .select("content_id, status")
        .eq("child_id", selectedChildId);
      return (data ?? []) as ContentProgress[];
    },
  });

  const progressMap = useMemo(
    () => new Map(progress.map((p) => [p.content_id, p.status])),
    [progress],
  );

  // Group contents by discipline, split into 3 periods
  const roadmap = useMemo(() => {
    const byDiscipline = new Map<string, CurriculumContent[]>();
    for (const c of contents) {
      if (!byDiscipline.has(c.discipline)) byDiscipline.set(c.discipline, []);
      byDiscipline.get(c.discipline)!.push(c);
    }

    return [...byDiscipline.entries()].map(([disc, items]) => {
      const chunkSize = Math.ceil(items.length / 3);
      const periods = [
        items.slice(0, chunkSize),
        items.slice(chunkSize, chunkSize * 2),
        items.slice(chunkSize * 2),
      ];
      return { discipline: disc, periods };
    });
  }, [contents]);

  const isLoading = loadingContents || loadingProgress;

  const totalContents = contents.length;
  const dominated = contents.filter((c) => progressMap.get(c.id) === "dominado").length;
  const inProgress = contents.filter((c) => progressMap.get(c.id) === "em_progresso").length;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <MapIcon className="h-7 w-7 text-primary" /> Roteiro Anual
            </h1>
            <p className="text-muted-foreground mt-1">
              Conteúdos curriculares organizados por período escolar.
            </p>
          </div>
          {eligibleChildren.length > 1 && (
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar criança" />
              </SelectTrigger>
              <SelectContent>
                {eligibleChildren.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* No eligible children */}
        {eligibleChildren.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <MapIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">Nenhuma criança com currículo nacional</p>
              <p className="text-sm mt-1">Adiciona uma criança com ano escolar (1º ao 4º ano) para ver o roteiro.</p>
            </CardContent>
          </Card>
        )}

        {/* Progress summary */}
        {selectedChild && !isLoading && totalContents > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total de conteúdos", value: totalContents, className: "text-foreground" },
              { label: "Em progresso", value: inProgress, className: "text-amber-600" },
              { label: "Dominados", value: dominated, className: "text-emerald-600" },
            ].map((s) => (
              <Card key={s.label} className="border-border/60 text-center">
                <CardContent className="pt-4 pb-3">
                  <p className={cn("text-2xl font-bold", s.className)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Roadmap by discipline */}
        {!isLoading && roadmap.map(({ discipline, periods }) => (
          <Card key={discipline} className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">
                {GC_DISCIPLINE_LABELS[discipline] ?? discipline}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {periods.map((items, pIdx) => {
                if (items.length === 0) return null;
                const dominated = items.filter((c) => progressMap.get(c.id) === "dominado").length;
                const inProg = items.filter((c) => progressMap.get(c.id) === "em_progresso").length;
                return (
                  <div key={pIdx}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {PERIOD_LABELS[pIdx]}
                      </span>
                      <span className="text-xs text-muted-foreground">{PERIOD_MONTHS[pIdx]}</span>
                      <div className="flex-1" />
                      {(dominated > 0 || inProg > 0) && (
                        <div className="flex gap-2">
                          {inProg > 0 && (
                            <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 gap-1">
                              <Clock className="h-3 w-3" /> {inProg}
                            </Badge>
                          )}
                          {dominated > 0 && (
                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> {dominated}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {items.map((c) => {
                        const status = progressMap.get(c.id) ?? "a_aprender";
                        return (
                          <div
                            key={c.id}
                            className={cn(
                              "flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm",
                              status === "dominado"
                                ? "border-emerald-100 bg-emerald-50/50"
                                : status === "em_progresso"
                                  ? "border-amber-100 bg-amber-50/50"
                                  : "border-border bg-card"
                            )}
                          >
                            <StatusIcon status={status} />
                            <div className="flex-1">
                              {c.domain && (
                                <p className="text-xs text-muted-foreground mb-0.5">{c.domain}</p>
                              )}
                              <p className={cn(
                                status === "dominado" && "text-emerald-800 font-medium",
                                status === "em_progresso" && "text-amber-800",
                              )}>
                                {c.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {!isLoading && selectedChild && roadmap.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <MapIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">Currículo não encontrado</p>
              <p className="text-sm mt-1">
                Não há conteúdos curriculares registados para {selectedChild.school_year}.
              </p>
            </CardContent>
          </Card>
        )}

      </motion.div>
    </AppLayout>
  );
}
