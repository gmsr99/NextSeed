import { motion, type Easing } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useDashboard } from "@/hooks/useDashboard";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS } from "@/lib/planGenerator";
import {
  BookOpen,
  Users,
  CalendarCheck,
  Clock,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as Easing },
  }),
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

const Index = () => {
  const {
    isLoading,
    hasPlan,
    planStatus,
    totalActivities,
    todayItems,
    children,
    pastPlans,
    isWeekend,
    weekStart,
    familyName,
  } = useDashboard();

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: pt });

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* Welcome */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground capitalize">
            {greeting()}, {familyName || "família"} 🌿
          </h1>
          <p className="text-muted-foreground mt-1 text-lg capitalize">{todayLabel}</p>
        </motion.div>

        {/* Stats */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> A carregar...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
              <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Atividades esta semana</p>
                      <p className="text-2xl font-heading font-bold mt-1">
                        {hasPlan ? totalActivities : "—"}
                      </p>
                      {hasPlan && planStatus === "sent" && (
                        <span className="text-xs font-semibold text-accent">Plano enviado</span>
                      )}
                    </div>
                    <div className="rounded-xl p-2.5 bg-primary/10 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
              <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Crianças</p>
                      <p className="text-2xl font-heading font-bold mt-1">{children.length}</p>
                      <span className="text-xs text-muted-foreground">
                        {children.map((c) => c.name.split(" ")[0]).join(" · ")}
                      </span>
                    </div>
                    <div className="rounded-xl p-2.5 bg-accent/10 text-accent">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
              <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Semana de</p>
                      <p className="text-2xl font-heading font-bold mt-1">
                        {format(weekStart, "d MMM", { locale: pt })}
                      </p>
                      <span className={`text-xs font-semibold ${hasPlan ? "text-accent" : "text-orange-500"}`}>
                        {hasPlan ? "Plano gerado" : "Sem plano"}
                      </span>
                    </div>
                    <div className="rounded-xl p-2.5 bg-nexseed-moss/10 text-nexseed-moss">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* CTA se não há plano */}
        {!isLoading && !hasPlan && (
          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <Card className="border-orange-200 bg-orange-50/50 shadow-card">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Ainda não há plano para esta semana</p>
                    <p className="text-sm text-muted-foreground">Gera o plano agora e recebe os PDFs por email.</p>
                  </div>
                </div>
                <Button asChild size="sm" className="shrink-0 gap-2">
                  <Link to="/weekly-planner">
                    <Sparkles className="h-4 w-4" /> Gerar Plano
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Atividades de hoje */}
        <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
          <Card className="shadow-card border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="font-heading text-lg">
                  {isWeekend ? "Fim de semana" : "Hoje"}
                </CardTitle>
                <CardDescription>
                  {isWeekend
                    ? "Descansem e recarreguem energias!"
                    : hasPlan && todayItems.length > 0
                    ? `${todayItems.length} atividades planeadas`
                    : "Sem atividades planeadas"}
                </CardDescription>
              </div>
              {hasPlan && (
                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                  <Link to="/weekly-planner">
                    Ver plano <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> A carregar...
                </div>
              ) : isWeekend ? (
                <p className="text-sm text-muted-foreground py-4 text-center">🌳 Tempo livre</p>
              ) : !hasPlan ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Gera o plano semanal para ver as atividades de hoje.
                </p>
              ) : todayItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma atividade para hoje.</p>
              ) : (
                todayItems.map((item) => {
                  const color = DISCIPLINE_COLORS[item.discipline] ?? "#E5E7EB";
                  const label = DISCIPLINE_LABELS[item.discipline] ?? item.discipline;
                  const child = children.find((c) => c.id === item.child_id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.time_slot} · {label}
                          {child ? ` · ${child.name.split(" ")[0]}` : ""}
                        </p>
                      </div>
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Planos anteriores */}
        {!isLoading && pastPlans.length > 0 && (
          <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp}>
            <Card className="shadow-card border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg">Planos anteriores</CardTitle>
                <CardDescription>Últimas semanas geradas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {pastPlans.map((plan) => {
                  const d = new Date(plan.week_start + "T00:00:00");
                  const label = format(d, "'Semana de' d 'de' MMMM", { locale: pt });
                  const interests = plan.child_interests as Record<string, string[]> | null;
                  const allInterests = interests
                    ? [...new Set(Object.values(interests).flat())].slice(0, 4).join(", ")
                    : null;
                  return (
                    <div key={plan.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        {allInterests && (
                          <p className="text-xs text-muted-foreground truncate">{allInterests}</p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                        plan.status === "sent" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                      }`}>
                        {plan.status === "sent" ? "Enviado" : "Gerado"}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </AppLayout>
  );
};

export default Index;
