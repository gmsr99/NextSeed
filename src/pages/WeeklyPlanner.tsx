import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { format, addDays } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarDays, Sparkles, Download, Mail, Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock, MapPin } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TagInput from "@/components/TagInput";
import { useChildren } from "@/hooks/useChildren";
import { useExtracurricular } from "@/hooks/useExtracurricular";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  generateWeeklyPlan,
  getNextMonday,
  formatWeekRange,
  DISCIPLINE_LABELS,
  DISCIPLINE_COLORS,
  DAY_LABELS,
  type GeneratedPlanItem,
} from "@/lib/planGenerator";
import { generateWithGemini } from "@/lib/geminiPlanner";

type Step = "form" | "preview";

// ─── Persistência do campo "notes" (backward compat) ─────────────────────────
function parseNotesField(raw: string | null): { notes: string; readingTheme: string } {
  if (!raw) return { notes: "", readingTheme: "" };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "notes" in parsed) {
      return { notes: parsed.notes ?? "", readingTheme: parsed.readingTheme ?? "" };
    }
  } catch { /* string simples */ }
  return { notes: raw, readingTheme: "" };
}

function serializeNotesField(notes: string, readingTheme: string): string | null {
  if (!notes && !readingTheme) return null;
  if (!readingTheme) return notes; // compatibilidade retroativa
  return JSON.stringify({ notes, readingTheme });
}

const DAY_LABELS_EXT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const ACTIVITY_COLORS_EXT: Record<string, string> = {
  "Desporto": "#90BE6D", "Música": "#E9C46A",
  "Teatro / Artes Performativas": "#F4A261", "Natação": "#4CC9F0",
  "Dança": "#F77F00", "Artes Visuais": "#9B72CF",
  "Língua Estrangeira": "#43AA8B", "Escuteiros / Grupos": "#2EC4B6",
  "Tecnologia / Robótica": "#6366F1", "Outro": "#9CA3AF",
};

export default function WeeklyPlanner() {
  const { children, isLoading: childrenLoading } = useChildren();
  const { family } = useAuth();
  const { activities: extracurriculars } = useExtracurricular();

  const [weekStart, setWeekStart] = useState<Date>(getNextMonday());
  const [weekStartReady, setWeekStartReady] = useState(false);
  const [childInterests, setChildInterests] = useState<Record<string, string[]>>({});
  const [fridayActivity, setFridayActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [weeklyReadingTheme, setWeeklyReadingTheme] = useState("");

  const [step, setStep] = useState<Step>("form");
  const [planItems, setPlanItems] = useState<GeneratedPlanItem[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Seleciona automaticamente a semana mais próxima sem plano
  useEffect(() => {
    if (!family || childrenLoading) return;

    const pickInitialWeek = async () => {
      const thisMonday = getNextMonday();
      const nextMonday = addDays(thisMonday, 7);

      const { data: plans } = await supabase
        .from("weekly_plans")
        .select("week_start")
        .eq("family_id", family.id)
        .in("week_start", [format(thisMonday, "yyyy-MM-dd"), format(nextMonday, "yyyy-MM-dd")]);

      const planned = new Set(plans?.map((p) => p.week_start) ?? []);

      if (!planned.has(format(thisMonday, "yyyy-MM-dd"))) {
        setWeekStart(thisMonday);
      } else if (!planned.has(format(nextMonday, "yyyy-MM-dd"))) {
        setWeekStart(nextMonday);
      } else {
        setWeekStart(thisMonday);
      }

      setWeekStartReady(true);
    };

    pickInitialWeek();
  }, [family, childrenLoading]);

  // Carrega (ou limpa) o plano sempre que a semana selecionada muda
  useEffect(() => {
    if (!family || !weekStartReady) return;

    // Reset de estado ao trocar de semana
    setPlanId(null);
    setPlanItems([]);
    setSent(false);
    setError(null);
    setStep("form");
    setWeeklyReadingTheme("");
    setLoadingExisting(true);

    const loadExisting = async () => {
      try {
        const { data: plan } = await supabase
          .from("weekly_plans")
          .select("id, child_interests, friday_activity, notes, reading_theme, status")
          .eq("family_id", family.id)
          .eq("week_start", format(weekStart, "yyyy-MM-dd"))
          .maybeSingle();

        if (!plan) {
          // Sem plano — pré-preenche interesses a partir dos perfis das crianças
          const defaultInterests: Record<string, string[]> = {};
          children.forEach((c) => {
            if (c.interests?.length) defaultInterests[c.id] = c.interests;
          });
          setChildInterests(defaultInterests);
          setFridayActivity("");
          setNotes("");
          setWeeklyReadingTheme("");
          return;
        }

        const { data: items } = await supabase
          .from("weekly_plan_items")
          .select("child_id, day_of_week, time_slot, discipline, title, description, materials, is_friday_world, sort_order")
          .eq("plan_id", plan.id)
          .order("day_of_week")
          .order("sort_order");

        if (!items?.length) return;

        setPlanId(plan.id);
        setPlanItems(items as GeneratedPlanItem[]);
        setFridayActivity(plan.friday_activity ?? "");

        // reading_theme: prioridade à coluna dedicada; fallback ao JSON em notes (registos antigos)
        if (plan.reading_theme != null) {
          setWeeklyReadingTheme(plan.reading_theme);
          setNotes(plan.notes ?? "");
        } else {
          const parsedNotes = parseNotesField(plan.notes);
          setNotes(parsedNotes.notes);
          setWeeklyReadingTheme(parsedNotes.readingTheme);
        }

        const interests = plan.child_interests as Record<string, string[]> | null;
        if (interests) setChildInterests(interests);
        if (plan.status === "sent") setSent(true);
        setStep("preview");
      } finally {
        setLoadingExisting(false);
      }
    };

    loadExisting();
  }, [family, weekStart, weekStartReady]);

  const goToPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goToNextWeek = () => setWeekStart((d) => addDays(d, 7));

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      // Buscar currículo NexSeed da BD para triangulação (national + NexSeed + interests)
      const schoolYears = [...new Set(children.map((c) => c.school_year))];
      const { data: nexseedRows } = await supabase
        .from("nexseed_curriculum")
        .select("school_year, discipline_key, objective")
        .in("school_year", schoolYears);

      const nexseedByYear: Record<string, Record<string, string[]>> = {};
      for (const row of nexseedRows ?? []) {
        if (!nexseedByYear[row.school_year]) nexseedByYear[row.school_year] = {};
        if (!nexseedByYear[row.school_year][row.discipline_key]) nexseedByYear[row.school_year][row.discipline_key] = [];
        nexseedByYear[row.school_year][row.discipline_key].push(row.objective);
      }

      const items = await generateWithGemini(children, childInterests, fridayActivity, weeklyReadingTheme, nexseedByYear);
      setPlanItems(items);
      setStep("preview");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("AI falhou:", msg);
      const items = generateWeeklyPlan(children, childInterests, fridayActivity, weeklyReadingTheme);
      setPlanItems(items);
      setStep("preview");
      setError(`IA indisponível (${msg}) — plano gerado com templates.`);
    } finally {
      setGenerating(false);
    }
  };

  // Lógica de persistência partilhada — retorna o planId guardado
  const persistPlan = async (): Promise<string> => {
    if (!family) throw new Error("Família não encontrada");

    // 1. Upsert weekly_plan
    const { data: plan, error: planErr } = await supabase
      .from("weekly_plans")
      .upsert({
        family_id: family.id,
        week_start: format(weekStart, "yyyy-MM-dd"),
        child_interests: childInterests,
        friday_activity: fridayActivity || null,
        // Usa coluna dedicada reading_theme; notes é texto simples (sem JSON)
        notes: notes || null,
        reading_theme: weeklyReadingTheme || null,
        status: "generated",
        generated_at: new Date().toISOString(),
      }, { onConflict: "family_id,week_start" })
      .select()
      .single();

    if (planErr) throw planErr;
    setPlanId(plan.id);

    // 2. Delete previous items for this plan and reinsert
    await supabase.from("weekly_plan_items").delete().eq("plan_id", plan.id);

    const itemsToInsert = planItems.map((item) => ({ ...item, plan_id: plan.id }));
    const { error: itemsErr } = await supabase.from("weekly_plan_items").insert(itemsToInsert);
    if (itemsErr) throw itemsErr;

    // 3. Guardar interesses actuais no perfil de cada criança
    await Promise.all(
      Object.entries(childInterests).map(([childId, interests]) =>
        interests.length > 0
          ? supabase.from("children").update({ interests, updated_at: new Date().toISOString() }).eq("id", childId)
          : Promise.resolve()
      )
    );

    return plan.id;
  };

  const handleSavePlan = async () => {
    setSaving(true);
    setError(null);
    try {
      await persistPlan();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDFs = async () => {
    const familyName = family?.name ?? "Família";

    // PDF 1 — Horário
    const { default: SchedulePDFComp } = await import("@/components/pdf/SchedulePDF");
    const scheduleBlob = await pdf(
      <SchedulePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} extracurriculars={extracurriculars} />
    ).toBlob();
    const scheduleUrl = URL.createObjectURL(scheduleBlob);
    const a1 = document.createElement("a");
    a1.href = scheduleUrl;
    a1.download = `nexseed-horario-${format(weekStart, "yyyy-MM-dd")}.pdf`;
    a1.click();

    // PDF 2 — Guia
    const { default: ActivityGuidePDFComp } = await import("@/components/pdf/ActivityGuidePDF");
    const guideBlob = await pdf(
      <ActivityGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
    ).toBlob();
    const guideUrl = URL.createObjectURL(guideBlob);
    const a2 = document.createElement("a");
    a2.href = guideUrl;
    a2.download = `nexseed-guia-${format(weekStart, "yyyy-MM-dd")}.pdf`;
    a2.click();
  };

  const handleSendEmail = async () => {
    if (!family) return;
    setSending(true);
    setError(null);
    try {
      // Garante sessão válida antes de invocar a edge function
      const { error: sessionErr } = await supabase.auth.refreshSession();
      if (sessionErr) throw new Error("Sessão expirada. Por favor recarrega a página.");

      // Garante que o plano está guardado antes de enviar
      const savedPlanId = planId ?? await persistPlan();

      const familyName = family.name;

      const { default: SchedulePDFComp } = await import("@/components/pdf/SchedulePDF");
      const scheduleBlob = await pdf(
        <SchedulePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} extracurriculars={extracurriculars} />
      ).toBlob();

      const { default: ActivityGuidePDFComp } = await import("@/components/pdf/ActivityGuidePDF");
      const guideBlob = await pdf(
        <ActivityGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
      ).toBlob();

      // Convert blobs to base64
      const toBase64 = (blob: Blob): Promise<string> =>
        new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res((reader.result as string).split(",")[1]);
          reader.readAsDataURL(blob);
        });

      const scheduleB64 = await toBase64(scheduleBlob);
      const guideB64 = await toBase64(guideBlob);

      const { data: fnData, error: fnErr } = await supabase.functions.invoke("send-weekly-plan", {
        body: {
          to: family.email,
          familyId: family.id,
          familyName,
          weekLabel: formatWeekRange(weekStart),
          scheduleB64,
          guideB64,
          scheduleName: `nexseed-horario-${format(weekStart, "yyyy-MM-dd")}.pdf`,
          guideName: `nexseed-guia-${format(weekStart, "yyyy-MM-dd")}.pdf`,
        },
      });

      // Extrair erro real do body da resposta (o SDK devolve mensagem genérica)
      if (fnErr) {
        let detail = fnErr.message;
        try {
          const body = await (fnErr as unknown as { context: Response }).context.json();
          detail = body?.error ?? JSON.stringify(body);
        } catch {
          try {
            detail = await (fnErr as unknown as { context: Response }).context.text();
          } catch { /* usa mensagem original */ }
        }
        throw new Error(detail);
      }

      // Marca como enviado
      await supabase
        .from("weekly_plans")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", savedPlanId);

      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao enviar email");
    } finally {
      setSending(false);
    }
  };

  if (childrenLoading || loadingExisting) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Planeador Semanal</h1>
          <p className="text-muted-foreground mt-1">
            {step === "form"
              ? (planId ? "Ajusta os interesses e regenera o plano." : "Preenche os interesses e recebe o plano completo por email.")
              : `${planId ? "Plano guardado" : "Plano gerado"} · ${formatWeekRange(weekStart)}`}
          </p>
        </div>

        {step === "form" ? (
          <div className="space-y-6">
            {/* Week selector */}
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">Semana de {formatWeekRange(weekStart)}</p>
                  <p className="text-sm text-muted-foreground">Segunda-feira a sexta-feira</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevWeek} title="Semana anterior">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextWeek} title="Próxima semana">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Children interests */}
            {children.map((child) => (
              <Card key={child.id} className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg">{child.name}</CardTitle>
                  <CardDescription>{child.school_year} · {child.curriculum}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Interesses desta semana</Label>
                    <TagInput
                      value={childInterests[child.id] ?? child.interests ?? []}
                      onChange={(tags) =>
                        setChildInterests((prev) => ({ ...prev, [child.id]: tags }))
                      }
                      placeholder="Escreve um interesse e pressiona Enter (ex: vulcões, Sonic...)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Os interesses são usados para personalizar todas as atividades da semana.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Friday activity */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg">Sexta-feira — Ver Mundo</CardTitle>
                <CardDescription>Actividade de saída planeada (opcional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={fridayActivity}
                  onChange={(e) => setFridayActivity(e.target.value)}
                  placeholder="Ex: Visita ao Museu de História Natural..."
                />
              </CardContent>
            </Card>

            {/* Tema Semanal — Leitura e Portefólio */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg">Leitura e Portefólio — Tema da semana</CardTitle>
                <CardDescription>
                  A mini-série de 4 episódios (Seg a Qui) será gerada a partir deste tema.
                  Se deixares em branco, usa o interesse principal da criança.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={weeklyReadingTheme}
                  onChange={(e) => setWeeklyReadingTheme(e.target.value)}
                  placeholder="Ex: O Sistema Solar, Os Dinossauros, A Floresta Amazónica..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  4 episódios sequenciais: Ep.1 O Começo · Ep.2 O Desafio · Ep.3 A Descoberta · Ep.4 O Final
                </p>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg">Notas para a semana</CardTitle>
                <CardDescription>Informações adicionais para o plano (opcional)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: esta semana temos consulta na quarta de manhã..."
                  rows={3}
                />
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleGeneratePlan}
              disabled={children.length === 0 || generating}
            >
              {generating ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> A gerar com IA...</>
              ) : (
                <><Sparkles className="h-5 w-5" /> Gerar Plano com IA</>
              )}
            </Button>
          </div>
        ) : (
          /* ── Preview ── */
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setStep("form")} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> {planId ? "Regenerar" : "Editar"}
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={handleSavePlan} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {planId ? "Atualizar" : "Guardar"}
              </Button>
              <Button variant="outline" onClick={handleDownloadPDFs} className="gap-2">
                <Download className="h-4 w-4" /> Descarregar PDFs
              </Button>
              <Button onClick={handleSendEmail} disabled={sending || sent} className="gap-2">
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : sent ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {sent ? "Email enviado!" : "Enviar por Email"}
              </Button>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Extracurriculares da semana */}
            {extracurriculars.length > 0 && (
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg">Extracurriculares da Semana</CardTitle>
                  <CardDescription>Atividades fora do horário académico</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extracurriculars.map((act) => {
                      const color = ACTIVITY_COLORS_EXT[act.type ?? "Outro"] ?? "#9CA3AF";
                      const dayLabel = act.day_of_week ? DAY_LABELS_EXT[act.day_of_week - 1] : "";
                      const timeLabel = act.start_time
                        ? `${act.start_time}${act.end_time ? `–${act.end_time}` : ""}`
                        : "";
                      const childName = act.child_id
                        ? children.find((c) => c.id === act.child_id)?.name ?? ""
                        : "Todos";
                      return (
                        <div
                          key={act.id}
                          className="flex gap-3 rounded-xl p-3"
                          style={{ backgroundColor: color + "18", borderLeft: `3px solid ${color}` }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {act.type && (
                                <Badge variant="secondary" className="text-xs" style={{ backgroundColor: color + "33" }}>
                                  {act.type}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{childName}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{act.name}</p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                              {dayLabel && <span className="font-medium">{dayLabel}</span>}
                              {timeLabel && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{timeLabel}
                                </span>
                              )}
                              {act.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />{act.location}
                                </span>
                              )}
                              {act.travel_time_minutes > 0 && (
                                <span>{act.travel_time_minutes}min deslocação</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plan preview by child */}
            <Tabs defaultValue={children[0]?.id}>
              <TabsList>
                {children.map((child) => (
                  <TabsTrigger key={child.id} value={child.id}>
                    {child.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {children.map((child) => {
                const childItems = planItems.filter((i) => i.child_id === child.id);

                return (
                  <TabsContent key={child.id} value={child.id} className="space-y-4 mt-4">
                    {[1, 2, 3, 4, 5].map((day) => {
                      const dayItems = childItems
                        .filter((i) => i.day_of_week === day)
                        .sort((a, b) => a.sort_order - b.sort_order);
                      if (dayItems.length === 0) return null;

                      return (
                        <Card key={day} className="border-border/60">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                              {DAY_LABELS[day - 1]}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {dayItems.map((item, idx) => {
                              const color = DISCIPLINE_COLORS[item.discipline] ?? "#E5E7EB";
                              return (
                                <div
                                  key={idx}
                                  className="flex gap-3 rounded-xl p-3"
                                  style={{ backgroundColor: color + "22", borderLeft: `3px solid ${color}` }}
                                >
                                  <div className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5">
                                    {item.time_slot}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                        style={{ backgroundColor: color + "44" }}
                                      >
                                        {DISCIPLINE_LABELS[item.discipline] ?? item.discipline}
                                      </Badge>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                    {item.materials.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {item.materials.map((m, mi) => (
                                          <span key={mi} className="text-xs bg-muted rounded px-2 py-0.5 text-muted-foreground">
                                            {m}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
