import { BookOpen, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useChildCurriculum } from "@/hooks/useChildCurriculum";
import { GC_DISCIPLINE_LABELS, PERIOD_LABELS, STATUS_CONFIG, STATUS_ORDER } from "@/lib/gcConstants";
import type { Child, ContentProgressStatus } from "@/lib/types";
import type { DomainGroup, DisciplineGroup } from "@/hooks/useChildCurriculum";

// ── Helpers ───────────────────────────────────────────────────────────────────

function countByStatus(domains: DomainGroup[]): Record<ContentProgressStatus, number> {
  const counts: Record<ContentProgressStatus, number> = {
    a_aprender: 0, em_progresso: 0, dominado: 0,
  };
  for (const d of domains) {
    for (const c of d.contents) {
      const s: ContentProgressStatus = c.progress?.status ?? "a_aprender";
      counts[s]++;
    }
  }
  return counts;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StackedBar({ counts, total }: { counts: Record<ContentProgressStatus, number>; total: number }) {
  if (total === 0) return <div className="h-3 w-full rounded-full bg-gray-100" />;
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full">
      {STATUS_ORDER.map((s) => {
        const pct = (counts[s] / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={s}
            className={cn("h-full transition-all duration-500", STATUS_CONFIG[s].bar)}
            style={{ width: `${pct}%` }}
            title={`${STATUS_CONFIG[s].label}: ${counts[s]}`}
          />
        );
      })}
    </div>
  );
}

function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {STATUS_ORDER.map((s) => (
        <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className={cn("h-2.5 w-2.5 rounded-full", STATUS_CONFIG[s].bar)} />
          {STATUS_CONFIG[s].label}
        </div>
      ))}
    </div>
  );
}

function SummaryStats({ group }: { group: DisciplineGroup }) {
  const pctStarted  = group.total > 0 ? Math.round((group.started  / group.total) * 100) : 0;
  const pctMastered = group.total > 0 ? Math.round((group.mastered / group.total) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { label: "Total",     value: group.total,        sub: "conteúdos" },
        { label: "Iniciados", value: `${pctStarted}%`,   sub: `${group.started} conteúdos` },
        { label: "Dominados", value: `${pctMastered}%`,  sub: `${group.mastered} conteúdos` },
      ].map(({ label, value, sub }) => (
        <div key={label} className="rounded-lg border bg-muted/30 px-3 py-2.5 text-center">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold font-heading text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      ))}
    </div>
  );
}

function PeriodBreakdown({ group }: { group: DisciplineGroup }) {
  // Deriva períodos dos dados reais — evita ignorar "all" ou outros valores
  const periods = [...new Set(group.domains.map((d) => d.period))].sort();

  return (
    <div className="space-y-4">
      {periods.map((period) => {
        const periodDomains = group.domains.filter((d) => d.period === period);
        if (periodDomains.length === 0) return null;
        const counts = countByStatus(periodDomains);
        const total = periodDomains.reduce((s, d) => s + d.contents.length, 0);
        const started = periodDomains.reduce(
          (s, d) => s + d.contents.filter((c) => c.progress && c.progress.status !== "a_aprender").length,
          0
        );

        return (
          <div key={period}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium">{PERIOD_LABELS[period] ?? period}</p>
              <span className="text-xs text-muted-foreground">{started}/{total} iniciados</span>
            </div>
            <StackedBar counts={counts} total={total} />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {STATUS_ORDER.map((s) => {
                if (counts[s] === 0) return null;
                return (
                  <span key={s} className={cn("text-xs rounded px-1.5 py-0.5", STATUS_CONFIG[s].bg, STATUS_CONFIG[s].text)}>
                    {STATUS_CONFIG[s].label}: {counts[s]}
                  </span>
                );
              })}
            </div>

            {/* Domain detail */}
            <div className="mt-3 space-y-1.5 pl-1">
              {periodDomains.map((d) => {
                const dCounts = countByStatus([d]);
                const dTotal = d.contents.length;
                const dStarted = d.contents.filter((c) => c.progress && c.progress.status !== "not_started").length;
                return (
                  <div key={d.domain} className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground truncate w-40 shrink-0" title={d.domain}>
                      {d.domain}
                    </p>
                    <div className="flex-1">
                      <StackedBar counts={dCounts} total={dTotal} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 w-10 text-right">
                      {dStarted}/{dTotal}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CurriculumCoverageReport({ child }: { child: Child }) {
  const { grouped, isLoading, hasData } = useChildCurriculum(child.id, child.school_year);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
        <BookOpen className="h-8 w-8 opacity-40" />
        <p className="text-sm">Relatório não disponível para {child.school_year}.</p>
        <p className="text-xs">Disponível para 1º ao 4º ano.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <BookOpen className="h-8 w-8 opacity-40" />
        <p className="text-sm">Nenhum conteúdo encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <StatusLegend />
      <Tabs defaultValue={grouped[0].discipline} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-4">
          {grouped.map((g) => {
            const pct = g.total > 0 ? Math.round((g.started / g.total) * 100) : 0;
            return (
              <TabsTrigger key={g.discipline} value={g.discipline} className="text-xs gap-1.5">
                {GC_DISCIPLINE_LABELS[g.discipline] ?? g.discipline}
                <span className="font-normal text-muted-foreground">{pct}%</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {grouped.map((g) => (
          <TabsContent key={g.discipline} value={g.discipline} className="mt-0">
            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-5">
              <SummaryStats group={g} />
              <PeriodBreakdown group={g} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
