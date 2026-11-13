// Rumo do ano (P-13 fase 1): o ano letivo semana a semana, calculado a partir
// do currículo. A família vê o ano inteiro de uma vez e o plano semanal segue
// este rumo, sem lhe perguntar o que quer ensinar (doc 10, INS-14).
import { useState } from "react";
import { Link } from "react-router-dom";
import { Map as MapIcon, CheckCircle2, Circle, Clock, CalendarDays, Sparkles, BookMarked } from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChildren } from "@/hooks/useChildren";
import { useAnnualPlans } from "@/hooks/useAnnualPlan";
import ManualsCard from "@/components/ManualsCard";
import FamilyCalendarCard from "@/components/FamilyCalendarCard";
import { GC_DISCIPLINE_LABELS } from "@/lib/gcConstants";
import {
  planWeekFor, weekFocus, formatWeekShort, mondayOf,
  type AnnualContent, type AnnualPlan, type Period, type PlanWeek,
} from "@/lib/annualPlan";

const PERIOD_LABELS: Record<Period, string> = { "1": "1.º período", "2": "2.º período", "3": "3.º período" };
const PERIODS: Period[] = ["1", "2", "3"];

type Status = Record<string, string>;

function StatusIcon({ status }: { status?: string }) {
  if (status === "dominado") return <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />;
  if (status === "em_progresso") return <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />;
  return <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />;
}

function ContentList({ items, status }: { items: AnnualContent[]; status: Status }) {
  return (
    <ul className="space-y-1">
      {items.map((c) => (
        <li key={c.id} className="flex gap-2 text-sm">
          {c.fromManual
            ? <BookMarked className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
            : <StatusIcon status={status[c.id]} />}
          <span className={cn(status[c.id] === "dominado" && "text-muted-foreground line-through decoration-muted-foreground/40")}>
            {c.content}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Disciplines({ byDiscipline, status }: { byDiscipline: Record<string, AnnualContent[]>; status: Status }) {
  return (
    <div className="space-y-3">
      {Object.entries(byDiscipline).map(([d, items]) => (
        <div key={d}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {GC_DISCIPLINE_LABELS[d] ?? d}
            {items[0]?.fromManual && <span className="font-normal normal-case tracking-normal"> · {items[0].domain}</span>}
          </p>
          <ContentList items={items} status={status} />
        </div>
      ))}
    </div>
  );
}

function WeekRow({ week, isCurrent, isPast, status }: { week: PlanWeek; isCurrent: boolean; isPast: boolean; status: Status }) {
  const hasContents = Object.keys(week.byDiscipline).length > 0;
  return (
    <div
      id={isCurrent ? "semana-atual" : undefined}
      className={cn(
        "rounded-xl border p-4 sm:flex sm:gap-5",
        isCurrent ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30" : "border-border/60 bg-card",
        isPast && "opacity-70",
      )}
    >
      <div className="mb-2 flex items-baseline gap-2 sm:mb-0 sm:w-28 sm:shrink-0 sm:flex-col sm:gap-0.5">
        <p className="font-heading font-semibold text-foreground">Semana {week.number}</p>
        <p className="text-xs text-muted-foreground">{formatWeekShort(week.monday)}</p>
        {isCurrent && <Badge className="sm:mt-1">Esta semana</Badge>}
      </div>
      <div className="min-w-0 flex-1">
        {week.isReview ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Semana de balanço.</span> Sem conteúdos novos: rever o que
            ficou menos seguro e escolher o que entra no portefólio.
          </p>
        ) : hasContents ? (
          <Disciplines byDiscipline={week.byDiscipline} status={status} />
        ) : (
          <p className="text-sm text-muted-foreground">Semana para consolidar o que já foi trabalhado.</p>
        )}
      </div>
    </div>
  );
}

function ByDiscipline({ plan, status }: { plan: AnnualPlan; status: Status }) {
  const disciplines = [...new Set([
    ...plan.weeks.flatMap((w) => Object.keys(w.byDiscipline)),
    ...Object.keys(plan.yearRound),
  ])].sort();
  return (
    <div className="space-y-4">
      {disciplines.map((d) => (
        <Card key={d} className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base">{GC_DISCIPLINE_LABELS[d] ?? d}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {PERIODS.map((p) => {
              const items = plan.weeks.filter((w) => w.period === p).flatMap((w) => w.byDiscipline[d] ?? []);
              if (items.length === 0) return null;
              return (
                <div key={p}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{PERIOD_LABELS[p]}</p>
                  <ContentList items={items} status={status} />
                </div>
              );
            })}
            {plan.yearRound[d]?.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ao longo do ano</p>
                <ContentList items={plan.yearRound[d]} status={status} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RoteiroAnual() {
  const { children } = useChildren();
  const today = new Date();
  const { plans, progress, isLoading } = useAnnualPlans(children, today);
  const [selectedId, setSelectedId] = useState<string>("");

  const withPlan = children.filter((c) => plans[c.id]);
  const selected = children.find((c) => c.id === selectedId) ?? withPlan[0] ?? children[0];
  const plan = selected ? plans[selected.id] : undefined;
  const status: Status = selected ? progress[selected.id] ?? {} : {};
  const currentMonday = mondayOf(today).getTime();
  const anyPlan = plan ?? (withPlan[0] ? plans[withPlan[0].id] : undefined);
  const currentWeek = anyPlan ? planWeekFor(anyPlan, today) : null;
  const yearRoundCount = plan ? Object.values(plan.yearRound).flat().length : 0;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <h1 className="flex items-center gap-2 font-heading text-3xl font-bold text-foreground">
              <MapIcon className="h-7 w-7 text-primary" /> Rumo do ano
            </h1>
            <p className="mt-1 text-muted-foreground">
              O ano inteiro, semana a semana. A NexSeed distribui o currículo pelas semanas e o plano semanal segue este rumo.
            </p>
          </div>
          {children.length > 1 && selected && (
            <Select value={selected.id} onValueChange={setSelectedId}>
              <SelectTrigger className="w-[180px]" aria-label="Criança">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="space-y-3 p-5">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && children.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <MapIcon className="mx-auto mb-3 h-10 w-10 opacity-20" />
              <p className="font-semibold">Ainda não há rumo para mostrar</p>
              <p className="mt-1 text-sm">Adiciona uma criança para ver aqui o ano dela, semana a semana.</p>
            </CardContent>
          </Card>
        )}

        {/* Esta semana, para todas as crianças de uma vez */}
        {!isLoading && withPlan.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-wrap items-center gap-2 font-heading text-base">
                <CalendarDays className="h-4 w-4 text-primary" />
                Esta semana
                {currentWeek && (
                  <span className="text-sm font-normal text-muted-foreground">
                    semana {currentWeek.number} de {anyPlan!.weeks.length} · {formatWeekShort(currentWeek.monday)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!currentWeek && (
                <p className="text-sm text-muted-foreground">
                  Esta semana fica fora das vossas semanas com aulas. O rumo continua aqui quando quiserem retomar.
                </p>
              )}
              {currentWeek?.isReview && (
                <p className="text-sm text-muted-foreground">
                  Semana de balanço: sem conteúdos novos. É uma boa altura para rever e escolher o que entra no portefólio.
                </p>
              )}
              {currentWeek && !currentWeek.isReview && (
                <div className={cn("grid gap-4", withPlan.length > 1 && "sm:grid-cols-2")}>
                  {withPlan.map((c) => {
                    const focus = weekFocus(plans[c.id], today, (id) => progress[c.id]?.[id] === "dominado");
                    return (
                      <div key={c.id} className="rounded-lg border border-border/60 bg-card p-3">
                        <p className="mb-2 font-semibold text-foreground">
                          {c.name} <span className="text-xs font-normal text-muted-foreground">{c.school_year}</span>
                        </p>
                        {focus ? (
                          <Disciplines byDiscipline={focus} status={progress[c.id] ?? {}} />
                        ) : (
                          <p className="text-sm text-muted-foreground">Tudo dominado por aqui. Semana para consolidar.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <Button asChild size="sm">
                <Link to="/weekly-planner"><Sparkles className="mr-1.5 h-4 w-4" /> Gerar o plano desta semana</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && children.length > 0 && <FamilyCalendarCard />}

        {!isLoading && selected && <ManualsCard child={selected} />}

        {!isLoading && selected && !plan && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{selected.name} ainda não tem rumo</p>
              <p className="mt-1">
                O currículo da app vai do 1.º ao 4.º ano. Para os outros anos, o rumo nasce do índice dos manuais que usam.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && plan && (
          <Tabs defaultValue="semanas">
            <TabsList>
              <TabsTrigger value="semanas">Semana a semana</TabsTrigger>
              <TabsTrigger value="disciplinas">Por disciplina</TabsTrigger>
            </TabsList>

            <TabsContent value="semanas" className="space-y-6">
              {PERIODS.map((p) => {
                const weeks = plan.weeks.filter((w) => w.period === p);
                return (
                  <section key={p} className="space-y-2">
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                      {PERIOD_LABELS[p]}{" "}
                      <span className="text-sm font-normal text-muted-foreground">{weeks.length} semanas</span>
                    </h2>
                    {weeks.map((w) => (
                      <WeekRow
                        key={w.number}
                        week={w}
                        status={status}
                        isCurrent={w.monday.getTime() === currentMonday}
                        isPast={w.monday.getTime() < currentMonday}
                      />
                    ))}
                  </section>
                );
              })}
              {yearRoundCount > 0 && (
                <section className="space-y-2">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Ao longo do ano{" "}
                    <span className="text-sm font-normal text-muted-foreground">sem semana marcada</span>
                  </h2>
                  <div className="rounded-xl border border-border/60 bg-card p-4">
                    <Disciplines byDiscipline={plan.yearRound} status={status} />
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="disciplinas">
              <ByDiscipline plan={plan} status={status} />
            </TabsContent>
          </Tabs>
        )}

        {!isLoading && plan && (
          <p className="text-xs text-muted-foreground">
            As semanas seguem o vosso calendário ou, se não o ajustaram, o calendário escolar. Nas disciplinas com manual, o
            rumo segue o índice que escreveram; nas outras, o currículo. O rumo é uma orientação, não uma
            dívida: se uma semana correr de outra maneira, ele continua aqui e o plano semanal ajusta-se ao que já está dominado.
          </p>
        )}
      </motion.div>
    </AppLayout>
  );
}
