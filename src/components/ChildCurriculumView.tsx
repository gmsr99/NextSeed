import { useState } from "react";
import { Loader2, BookOpen, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChildCurriculum } from "@/hooks/useChildCurriculum";
import { GC_DISCIPLINE_LABELS, PERIOD_LABELS, STATUS_CONFIG, STATUS_ORDER } from "@/lib/gcConstants";
import type { Child, ContentProgressStatus } from "@/lib/types";
import type { ContentWithProgress, DomainGroup } from "@/hooks/useChildCurriculum";

// ── Rating picker (3 botões) ──────────────────────────────────────────────────

const RATING_ICONS = [
  { status: "a_aprender"   as ContentProgressStatus, icon: Circle,       label: "1 — A aprender"  },
  { status: "em_progresso" as ContentProgressStatus, icon: Clock,        label: "2 — Em progresso" },
  { status: "dominado"     as ContentProgressStatus, icon: CheckCircle2, label: "3 — Dominado"     },
];

function RatingPicker({
  item,
  onChange,
  saving,
}: {
  item: ContentWithProgress;
  onChange: (contentId: string, status: ContentProgressStatus) => void;
  saving: boolean;
}) {
  const current = item.progress?.status ?? "a_aprender";
  return (
    <div className="flex gap-1 shrink-0">
      {RATING_ICONS.map(({ status, icon: Icon, label }) => (
        <button
          key={status}
          title={label}
          disabled={saving}
          onClick={() => onChange(item.id, status)}
          className={cn(
            "h-6 w-6 rounded-full flex items-center justify-center border transition-all duration-150",
            current === status
              ? cn("border-transparent", STATUS_CONFIG[status].classes)
              : "border-border/50 text-muted-foreground/50 hover:border-foreground/30 hover:text-foreground bg-transparent"
          )}
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ mastered, total }: { mastered: number; total: number }) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span>{mastered}/{total}</span>
    </div>
  );
}

// ── Domain section ────────────────────────────────────────────────────────────

function DomainSection({
  group,
  onChange,
  saving,
}: {
  group: DomainGroup;
  onChange: (contentId: string, status: ContentProgressStatus) => void;
  saving: boolean;
}) {
  const [open, setOpen] = useState(true);
  const mastered = group.contents.filter((c) => c.progress?.status === "dominado").length;

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left py-2 hover:text-foreground transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm font-medium">{group.domain}</span>
        {group.period !== "all" && (
          <Badge variant="outline" className="text-xs h-4 px-1.5">
            {PERIOD_LABELS[group.period] ?? group.period}
          </Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{mastered}/{group.contents.length}</span>
      </button>
      {open && (
        <div className="pl-5 space-y-0.5">
          {group.contents.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 py-2 border-b border-border/30 last:border-0",
                item.progress?.status === "dominado" && "opacity-60"
              )}
            >
              <p className={cn(
                "flex-1 text-sm leading-relaxed pt-0.5",
                item.progress?.status === "dominado" && "line-through text-muted-foreground"
              )}>
                {item.content}
              </p>
              <RatingPicker item={item} onChange={onChange} saving={saving} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChildCurriculumView({ child }: { child: Child }) {
  const { grouped, isLoading, upsertProgress, hasData } = useChildCurriculum(
    child.id,
    child.school_year
  );

  const handleChange = (contentId: string, status: ContentProgressStatus) => {
    upsertProgress.mutate({ contentId, status });
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
        <BookOpen className="h-8 w-8 opacity-40" />
        <p className="text-sm">Currículo GC não disponível para {child.school_year}.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <BookOpen className="h-8 w-8 opacity-40" />
        <p className="text-sm">Nenhum conteúdo encontrado.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={grouped[0].discipline} className="w-full">
      <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-4">
        {grouped.map((g) => (
          <TabsTrigger key={g.discipline} value={g.discipline} className="text-xs gap-2">
            {GC_DISCIPLINE_LABELS[g.discipline] ?? g.discipline}
            <ProgressBar mastered={g.mastered} total={g.total} />
          </TabsTrigger>
        ))}
      </TabsList>

      {grouped.map((g) => (
        <TabsContent key={g.discipline} value={g.discipline} className="mt-0">
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {g.domains.map((domain) => (
              <DomainSection
                key={domain.domain}
                group={domain}
                onChange={handleChange}
                saving={upsertProgress.isPending}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
