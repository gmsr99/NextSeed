import { useState } from "react";
import { Loader2, BookOpen, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChildren } from "@/hooks/useChildren";
import { useChildCurriculum } from "@/hooks/useChildCurriculum";
import {
  GC_DISCIPLINE_LABELS,
  PERIOD_LABELS,
  STATUS_CONFIG,
  STATUS_ORDER,
} from "@/lib/gcConstants";
import type { ContentProgressStatus } from "@/lib/types";
import type { DomainGroup, DisciplineGroup, ContentWithProgress } from "@/hooks/useChildCurriculum";

// ── Rating selector ───────────────────────────────────────────────────────────

const RATING_ICONS = [
  { status: "a_aprender"   as ContentProgressStatus, icon: Circle,       label: "1 — A aprender"   },
  { status: "em_progresso" as ContentProgressStatus, icon: Clock,        label: "2 — Em progresso"  },
  { status: "dominado"     as ContentProgressStatus, icon: CheckCircle2, label: "3 — Dominado"      },
];

function RatingPicker({
  item,
  onRate,
  saving,
}: {
  item: ContentWithProgress;
  onRate: (contentId: string, status: ContentProgressStatus) => void;
  saving: boolean;
}) {
  const current = item.progress?.status ?? "a_aprender";
  return (
    <div className="flex gap-1.5 shrink-0">
      {RATING_ICONS.map(({ status, icon: Icon, label }) => (
        <button
          key={status}
          title={label}
          disabled={saving}
          onClick={() => onRate(item.id, status)}
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center border transition-all duration-150",
            current === status
              ? cn("border-transparent", STATUS_CONFIG[status].classes)
              : "border-border/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground bg-transparent"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

// ── Domain section ────────────────────────────────────────────────────────────

function DomainSection({
  group,
  onRate,
  saving,
}: {
  group: DomainGroup;
  onRate: (contentId: string, status: ContentProgressStatus) => void;
  saving: boolean;
}) {
  const [open, setOpen] = useState(true);
  const mastered = group.contents.filter((c) => c.progress?.status === "dominado").length;
  const total = group.contents.length;

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <span className="text-sm font-medium truncate">{group.domain}</span>
          {group.period !== "all" && (
            <Badge variant="outline" className="text-xs shrink-0">{PERIOD_LABELS[group.period] ?? group.period}</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0 ml-3">{mastered}/{total} dominados</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/30">
              {group.contents.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors",
                    item.progress?.status === "dominado" && "bg-emerald-50/40"
                  )}
                >
                  <p className={cn(
                    "flex-1 text-sm leading-relaxed",
                    item.progress?.status === "dominado" && "line-through text-muted-foreground"
                  )}>
                    {item.content}
                  </p>
                  <RatingPicker item={item} onRate={onRate} saving={saving} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Discipline panel ──────────────────────────────────────────────────────────

function DisciplinePanel({
  group,
  onRate,
  saving,
}: {
  group: DisciplineGroup;
  onRate: (contentId: string, status: ContentProgressStatus) => void;
  saving: boolean;
}) {
  const pctMastered = group.total > 0 ? Math.round((group.mastered / group.total) * 100) : 0;
  const pctStarted  = group.total > 0 ? Math.round((group.started  / group.total) * 100) : 0;

  // Group domains by period
  const periods = [...new Set(group.domains.map((d) => d.period))].sort();

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",      value: group.total,        sub: "conteúdos" },
          { label: "Iniciados",  value: `${pctStarted}%`,   sub: `${group.started} conteúdos` },
          { label: "Dominados",  value: `${pctMastered}%`,  sub: `${group.mastered} conteúdos` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-lg border bg-muted/30 px-3 py-2.5 text-center">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold font-heading">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[s].bar)} />
            {STATUS_CONFIG[s].label}
          </div>
        ))}
      </div>

      {/* Domains by period */}
      {periods.map((period) => {
        const periodDomains = group.domains.filter((d) => d.period === period);
        return (
          <div key={period}>
            {period !== "all" && (
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {PERIOD_LABELS[period] ?? period}
              </h4>
            )}
            <div className="space-y-2">
              {periodDomains.map((d) => (
                <DomainSection key={d.domain} group={d} onRate={onRate} saving={saving} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LearningAreas() {
  const { children, isLoading: childrenLoading } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>("__first__");
  const [saving, setSaving] = useState(false);
  const [activeDisc, setActiveDisc] = useState<string | null>(null);

  const child = selectedChildId === "__first__" ? children[0] : children.find((c) => c.id === selectedChildId);

  const { grouped, isLoading, hasData, upsertProgress } = useChildCurriculum(
    child?.id ?? null,
    child?.school_year ?? null
  );

  // Set active discipline when data loads
  if (grouped.length > 0 && activeDisc === null) {
    setActiveDisc(grouped[0].discipline);
  }

  const handleRate = async (contentId: string, status: ContentProgressStatus) => {
    if (!child) return;
    setSaving(true);
    try {
      await upsertProgress.mutateAsync({ contentId, status });
    } finally {
      setSaving(false);
    }
  };

  const activeGroup = grouped.find((g) => g.discipline === activeDisc);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Áreas de Aprendizagem</h1>
            <p className="text-muted-foreground mt-1">
              Gestão de Conteúdos por criança — avalia de 1 (a aprender) a 3 (dominado).
            </p>
          </div>
          {children.length > 1 && (
            <Select
              value={selectedChildId}
              onValueChange={(v) => { setSelectedChildId(v); setActiveDisc(null); }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar criança" />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Loading */}
        {(childrenLoading || isLoading) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* No child */}
        {!childrenLoading && !child && (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <BookOpen className="h-8 w-8 opacity-30" />
              <p className="text-muted-foreground text-sm">Adiciona uma criança primeiro na página Crianças.</p>
            </CardContent>
          </Card>
        )}

        {/* No GC data for this year */}
        {!childrenLoading && !isLoading && child && !hasData && (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <BookOpen className="h-8 w-8 opacity-30" />
              <p className="font-medium">{child.name} — {child.school_year}</p>
              <p className="text-sm text-muted-foreground">
                Ainda não há conteúdos GC para este ano letivo.<br />
                Disponível para Pré-escolar e 1º ao 4º ano.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main content */}
        {!childrenLoading && !isLoading && child && hasData && grouped.length > 0 && (
          <div className="flex gap-6">
            {/* Discipline sidebar */}
            <div className="w-52 shrink-0 space-y-1">
              {grouped.map((g) => {
                const pct = g.total > 0 ? Math.round((g.mastered / g.total) * 100) : 0;
                const isActive = g.discipline === activeDisc;
                return (
                  <button
                    key={g.discipline}
                    onClick={() => setActiveDisc(g.discipline)}
                    className={cn(
                      "w-full text-left px-3 py-3 rounded-xl transition-all duration-150 border",
                      isActive
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-transparent border-transparent text-foreground hover:bg-muted/50"
                    )}
                  >
                    <p className="text-sm font-medium leading-tight">
                      {GC_DISCIPLINE_LABELS[g.discipline] ?? g.discipline}
                    </p>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pct}% dominado</p>
                  </button>
                );
              })}
            </div>

            {/* Content area */}
            <div className="flex-1 min-w-0">
              {activeGroup && (
                <Card className="border-border/60">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-heading text-lg">
                      {GC_DISCIPLINE_LABELS[activeGroup.discipline] ?? activeGroup.discipline}
                    </CardTitle>
                    <CardDescription>
                      {child.name} · {child.school_year}
                      {saving && <span className="ml-2 text-primary animate-pulse">A guardar...</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DisciplinePanel
                      group={activeGroup}
                      onRate={handleRate}
                      saving={saving}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
