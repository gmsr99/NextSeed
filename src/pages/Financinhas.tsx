// Financinhas: literacia financeira e mentalidade empreendedora (5–12 anos).
// Ensinar decisões, não finanças. A app é do adulto: a criança não tem conta,
// ecrã, pontos nem badges; o caderninho fica em papel.
import { useCallback, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PiggyBank, Settings2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";
import { useFinancinhas } from "@/hooks/useFinancinhas";
import { ageOn, formatEuros, planNextLesson, tierForAge, type EngineLesson } from "@/lib/financinhas/engine";
import { currentLevels, lastEventBySkill } from "@/lib/financinhas/levels";
import { weekStart } from "@/lib/financinhas/ritual";
import { TRACK_SESSIONS, type Tier } from "@/lib/financinhas/catalog";
import { canSeeFinancinhas } from "@/lib/financinhas/access";
import type { Child, FinLesson } from "@/lib/types";
import StartProfileCard, { WEEKDAYS } from "@/components/financinhas/StartProfileCard";
import NextLessonCard, { type GenerateRequest, type PlanOptions } from "@/components/financinhas/NextLessonCard";
import RitualCard from "@/components/financinhas/RitualCard";
import SignalsCard from "@/components/financinhas/SignalsCard";
import SkillsCard from "@/components/financinhas/SkillsCard";
import HistoryCard from "@/components/financinhas/HistoryCard";
import ImportDialog from "@/components/financinhas/ImportDialog";
import ProfileDialog from "@/components/financinhas/ProfileDialog";
import SnapshotForm from "@/components/financinhas/SnapshotForm";

const todayIso = () => new Date().toISOString().slice(0, 10);
const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? n;

type Fin = ReturnType<typeof useFinancinhas>;

function errorText(e: unknown) {
  return (e as Error)?.message ?? "Erro desconhecido";
}

function ChildPanel({ child, age, tier, fin, isAdmin }: { child: Child; age: number; tier: Tier; fin: Fin; isAdmin: boolean }) {
  const { toast } = useToast();
  const today = todayIso();
  const { data } = fin;
  const [profileOpen, setProfileOpen] = useState(false);
  const [exitAnswers, setExitAnswers] = useState<Record<string, string>>({});
  const [entryAnswers, setEntryAnswers] = useState<Record<string, string>>({});

  const profile = data.profiles.find((p) => p.child_id === child.id) ?? null;
  const lessons = useMemo(() => data.lessons.filter((l) => l.child_id === child.id), [data.lessons, child.id]);
  const siblingLessons = useMemo(() => data.lessons.filter((l) => l.child_id !== child.id), [data.lessons, child.id]);
  const events = useMemo(() => data.events.filter((e) => e.child_id === child.id), [data.events, child.id]);
  const levels = useMemo(() => currentLevels(events), [events]);
  const lastEvents = useMemo(() => lastEventBySkill(events), [events]);
  const pendingSignals = data.signals.filter((s) => s.child_id === child.id && s.status === "pendente");
  const week = weekStart(today);
  const rituals = data.rituals.filter((r) => r.child_id === child.id);
  const currentRitual = rituals.find((r) => r.week_start === week) ?? null;
  const previousRitual = [...rituals].filter((r) => r.week_start < week).sort((a, b) => b.week_start.localeCompare(a.week_start))[0] ?? null;
  const entry = data.snapshots.find((s) => s.child_id === child.id && s.kind === "entrada") ?? null;
  const exit = data.snapshots.find((s) => s.child_id === child.id && s.kind === "saida") ?? null;

  const makePlan = useCallback(
    (o: PlanOptions) => planNextLesson({
      today, tier, stage: profile?.stage ?? "trilho",
      lessons: lessons as EngineLesson[], siblingLessons: siblingLessons as EngineLesson[],
      levels, focusSkill: o.focusSkill, continueModule: o.continueModule,
    }),
    [today, tier, profile?.stage, lessons, siblingLessons, levels],
  );
  const basePlan = useMemo(() => makePlan({ focusSkill: null, continueModule: false }), [makePlan]);
  const pendingLesson = basePlan.existingLessonId ? lessons.find((l) => l.id === basePlan.existingLessonId) ?? null : null;
  const given = lessons.filter((l) => l.status === "dada").sort((a, b) => String(b.given_on).localeCompare(String(a.given_on)));
  const undated = lessons.filter((l) => l.status === "por_dar" && l.id !== pendingLesson?.id);
  const lastGiven = given[0];
  const canContinueModule = !!lastGiven && !lastGiven.track_session && (lastGiven.module_week ?? 1) < 3 && (lastGiven.theme_numbers ?? []).length > 0;
  const trackDone = new Set(given.map((l) => l.track_session).filter(Boolean)).size;

  const onError = (title: string) => (e: unknown) => toast({ title, description: errorText(e), variant: "destructive" });

  if (!profile) {
    return (
      <StartProfileCard
        firstName={firstName(child.name)} age={age} tier={tier} saving={fin.saveProfile.isPending}
        onStart={(p) => fin.saveProfile.mutate(
          { child_id: child.id, stage: p.stage, allowance_cents: p.allowance_cents, ritual_weekday: p.ritual_weekday, isNew: true },
          {
            onSuccess: () => {
              if (Object.keys(p.snapshot).length) fin.saveSnapshot.mutate({ child_id: child.id, kind: "entrada", answers: p.snapshot });
              toast({ title: "Financinhas começado", description: "A primeira aula está pronta para gerar." });
            },
            onError: onError("Não foi possível guardar"),
          },
        )}
      />
    );
  }

  const handleGenerate = (r: GenerateRequest) => fin.createLesson.mutate(
    { childId: child.id, ctx: { plan: r.plan, interest: r.interest, situation: r.situation, extra: r.extra, withChallenge: r.withChallenge, characterMode: profile.character_mode } },
    { onSuccess: () => toast({ title: "Aula pronta", description: "Revê-a antes de a dares." }), onError: onError("Não foi possível gerar a aula") },
  );
  const markGiven = (id: string, date: string) => fin.markGiven.mutate({ id, date }, {
    onSuccess: () => toast({ title: "Aula marcada como dada", description: "Nos próximos dias, confirma em \"O que observar\" o que vires acontecer." }),
    onError: onError("Não foi possível marcar"),
  });
  const del = (id: string) => fin.deleteLesson.mutate(id, { onError: onError("Não foi possível apagar") });
  const busy = fin.markGiven.isPending || fin.deleteLesson.isPending;

  const showEntrySnapshot = profile.stage === "trilho" && !entry && trackDone < 2;
  const showExitSnapshot = (basePlan.trackComplete || trackDone >= TRACK_SESSIONS.length) && profile.stage === "trilho";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{age} anos · escalão {tier}</Badge>
        <Badge variant="secondary">{profile.stage === "trilho" ? `Trilho de Iniciação · ${trackDone} de 12` : "Ciclo semanal"}</Badge>
        {profile.allowance_cents != null && <Badge variant="outline">Semanada {formatEuros(profile.allowance_cents)} · {WEEKDAYS[profile.ritual_weekday - 1]}</Badge>}
        {profile.character_mode === "original" && <Badge variant="outline">Personagens de marca (uso privado)</Badge>}
        <Button size="sm" variant="ghost" onClick={() => setProfileOpen(true)}><Settings2 className="h-4 w-4 mr-1" /> Ajustar</Button>
      </div>

      <Tabs defaultValue="semana">
        <TabsList>
          <TabsTrigger value="semana">Esta semana{pendingSignals.length ? ` · ${pendingSignals.length} por confirmar` : ""}</TabsTrigger>
          <TabsTrigger value="competencias">Competências</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="semana" className="space-y-4">
          {showEntrySnapshot && (
            <Card>
              <CardHeader>
                <CardTitle>Fotografia inicial</CardTitle>
                <CardDescription>3 minutos, só para ti, antes da S1. No fim do trilho respondes às mesmas seis: a diferença é a avaliação.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SnapshotForm value={entryAnswers} onChange={setEntryAnswers} idPrefix={`in-${child.id}`} />
                <Button disabled={!Object.keys(entryAnswers).length || fin.saveSnapshot.isPending} onClick={() => fin.saveSnapshot.mutate({ child_id: child.id, kind: "entrada", answers: entryAnswers }, { onError: onError("Não foi possível guardar") })}>Guardar fotografia</Button>
              </CardContent>
            </Card>
          )}

          {showExitSnapshot && (
            <Card>
              <CardHeader>
                <CardTitle>Fim do trilho: fotografia de saída</CardTitle>
                <CardDescription>
                  As mesmas seis perguntas. Estão prontos para o ciclo semanal quando: o caderninho tem 8 ou mais semanas de registos; ela já explicou sozinha porque escolheu A em vez de B; o Teste das 3 Semanas foi feito até ao fim; e consegues nomear 3 competências fortes e 3 frágeis (marca-as em Competências).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SnapshotForm value={exit ? (exit.answers as unknown as Record<string, string>) : exitAnswers} onChange={setExitAnswers} previous={(entry?.answers ?? null) as unknown as Record<string, string> | null} idPrefix={`out-${child.id}`} />
                <div className="flex flex-wrap gap-2">
                  {!exit && <Button disabled={!Object.keys(exitAnswers).length || fin.saveSnapshot.isPending} onClick={() => fin.saveSnapshot.mutate({ child_id: child.id, kind: "saida", answers: exitAnswers }, { onError: onError("Não foi possível guardar") })}>Guardar fotografia de saída</Button>}
                  <Button variant="secondary" disabled={fin.saveProfile.isPending} onClick={() => fin.saveProfile.mutate({ child_id: child.id, stage: "ciclo", allowance_cents: profile.allowance_cents, ritual_weekday: profile.ritual_weekday, character_mode: profile.character_mode }, { onError: onError("Não foi possível mudar") })}>Passar ao ciclo semanal</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-5 gap-4 items-start">
            <div className="lg:col-span-3 space-y-4">
              <NextLessonCard
                key={`${child.id}-${pendingLesson?.id ?? "new"}-${profile.stage}`}
                makePlan={makePlan}
                canContinueModule={canContinueModule}
                pendingLesson={pendingLesson}
                defaultInterest={(child.interests ?? []).join(", ")}
                generating={fin.createLesson.isPending}
                busy={busy}
                onGenerate={handleGenerate}
                onMarkGiven={markGiven}
                onDelete={del}
              />
              <SignalsCard
                signals={pendingSignals}
                levels={levels}
                busy={fin.resolveSignal.isPending}
                onResolve={(s, confirm, date, note) => fin.resolveSignal.mutate({ signal: s, confirm, date, note }, { onError: onError("Não foi possível guardar") })}
              />
            </div>
            <div className="lg:col-span-2">
              {profile.stage === "trilho" && !lessons.some((l) => (l.track_session ?? 0) >= 2) ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Ritual da semanada</CardTitle>
                    <CardDescription>Os quatro mealheiros, o chão e o caderninho nascem na S2. Se já deres dinheiro esta semana, é uma semana de observação: pouco, numa só caixinha, sem regras nem correções.</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <RitualCard
                  tier={tier} weekday={profile.ritual_weekday} allowanceCents={profile.allowance_cents}
                  weekStart={week} current={currentRitual} previous={previousRitual}
                  saving={fin.saveRitual.isPending}
                  onSave={(entry) => fin.saveRitual.mutate({ childId: child.id, weekStart: week, entry }, {
                    onSuccess: () => toast({ title: "Ritual registado", description: "Se houver sinais para confirmar, aparecem em \"O que observar\"." }),
                    onError: onError("Não foi possível registar"),
                  })}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="competencias">
          <SkillsCard
            levels={levels} lastEvents={lastEvents} busy={fin.addEvent.isPending}
            onSave={(e) => fin.addEvent.mutate({ ...e, child_id: child.id }, {
              onSuccess: () => toast({ title: "Guardado" }),
              onError: onError("Não foi possível guardar"),
            })}
          />
        </TabsContent>

        <TabsContent value="historico">
          <HistoryCard lessons={given} undated={undated} busy={busy} onMarkGiven={markGiven} onDelete={del} />
        </TabsContent>
      </Tabs>

      <ProfileDialog
        open={profileOpen} onOpenChange={setProfileOpen} profile={profile} firstName={firstName(child.name)}
        canUseOriginal={isAdmin} saving={fin.saveProfile.isPending}
        onSave={(p) => fin.saveProfile.mutate({ child_id: child.id, ...p }, {
          onSuccess: () => { setProfileOpen(false); toast({ title: "Guardado" }); },
          onError: onError("Não foi possível guardar"),
        })}
      />
    </div>
  );
}

export default function Financinhas() {
  const { children, isLoading: childrenLoading } = useChildren();
  const fin = useFinancinhas();
  const { isAdmin, isLoading: adminLoading } = useIsTeamAdmin();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const today = todayIso();

  const withAge = children.map((c) => {
    const age = ageOn(c.birth_date, today);
    return { child: c, age, tier: tierForAge(age) };
  });
  const eligible = withAge.filter((x): x is { child: Child; age: number; tier: Tier } => x.tier !== null);
  const outside = withAge.filter((x) => x.tier === null);
  const current = eligible.find((x) => x.child.id === selected) ?? eligible[0] ?? null;

  if (!adminLoading && !canSeeFinancinhas(isAdmin)) {
    return (
      <AppLayout>
        <Alert>
          <AlertTitle>Financinhas: em breve</AlertTitle>
          <AlertDescription>Estamos a preparar este módulo com algumas famílias. Avisamos quando estiver disponível para todas.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-forest flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold">Financinhas</h1>
              <p className="text-muted-foreground">Aprender a decidir com dinheiro: uma história por semana e um ritual de 5 minutos.</p>
            </div>
          </div>
          {fin.data.available && eligible.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4 mr-1" /> Importar histórico</Button>
          )}
        </div>

        {(childrenLoading || fin.isLoading) && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}

        {!childrenLoading && !fin.isLoading && !fin.data.available && (
          <Alert>
            <AlertTitle>O Financinhas está quase pronto</AlertTitle>
            <AlertDescription>Falta ativar a base de dados deste módulo. Volta a esta página dentro de pouco tempo.</AlertDescription>
          </Alert>
        )}

        {!childrenLoading && eligible.length === 0 && (
          <Alert>
            <AlertTitle>O Financinhas é para crianças dos 5 aos 12 anos</AlertTitle>
            <AlertDescription>Nenhuma das crianças da família está nesta idade. Quando estiver, aparece aqui.</AlertDescription>
          </Alert>
        )}

        {fin.data.available && current && (
          <>
            {eligible.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {eligible.map((x) => (
                  <Button key={x.child.id} size="sm" variant={x.child.id === current.child.id ? "default" : "secondary"} onClick={() => setSelected(x.child.id)}>
                    {firstName(x.child.name)}
                  </Button>
                ))}
              </div>
            )}
            <ChildPanel key={current.child.id} child={current.child} age={current.age} tier={current.tier} fin={fin} isAdmin={isAdmin} />
            {outside.length > 0 && (
              <p className="text-xs text-muted-foreground">Fora dos 5–12 anos, por agora: {outside.map((x) => firstName(x.child.name)).join(", ")}.</p>
            )}
            <ImportDialog
              open={importOpen} onOpenChange={setImportOpen}
              kids={eligible.map((x) => ({ id: x.child.id, name: x.child.name }))}
              existing={fin.data.lessons as FinLesson[]}
              importer={fin.importHistory}
              onDone={(msg) => toast({ title: "Histórico importado", description: msg })}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
