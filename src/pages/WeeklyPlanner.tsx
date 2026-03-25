import { useState, lazy, Suspense } from "react";
import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarDays, Sparkles, Download, Mail, Loader2, ChevronLeft, CheckCircle2 } from "lucide-react";
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

const SchedulePDF = lazy(() => import("@/components/pdf/SchedulePDF"));
const ActivityGuidePDF = lazy(() => import("@/components/pdf/ActivityGuidePDF"));

type Step = "form" | "preview";

export default function WeeklyPlanner() {
  const { children, isLoading: childrenLoading } = useChildren();
  const { family } = useAuth();

  const [weekStart] = useState<Date>(getNextMonday());
  const [childInterests, setChildInterests] = useState<Record<string, string[]>>({});
  const [fridayActivity, setFridayActivity] = useState("");
  const [notes, setNotes] = useState("");

  const [step, setStep] = useState<Step>("form");
  const [planItems, setPlanItems] = useState<GeneratedPlanItem[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const items = await generateWithGemini(children, childInterests, fridayActivity);
      setPlanItems(items);
      setStep("preview");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("AI falhou:", msg);
      const items = generateWeeklyPlan(children, childInterests, fridayActivity);
      setPlanItems(items);
      setStep("preview");
      setError(`IA indisponível (${msg}) — plano gerado com templates.`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!family) return;
    setSaving(true);
    setError(null);
    try {
      // 1. Upsert weekly_plan
      const { data: plan, error: planErr } = await supabase
        .from("weekly_plans")
        .upsert({
          family_id: family.id,
          week_start: format(weekStart, "yyyy-MM-dd"),
          child_interests: childInterests,
          friday_activity: fridayActivity || null,
          notes: notes || null,
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
      <SchedulePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
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
      const familyName = family.name;

      const { default: SchedulePDFComp } = await import("@/components/pdf/SchedulePDF");
      const scheduleBlob = await pdf(
        <SchedulePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
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

      const { error: fnErr } = await supabase.functions.invoke("send-weekly-plan", {
        body: {
          to: family.email,
          familyName,
          weekLabel: formatWeekRange(weekStart),
          scheduleB64,
          guideB64,
          scheduleName: `nexseed-horario-${format(weekStart, "yyyy-MM-dd")}.pdf`,
          guideName: `nexseed-guia-${format(weekStart, "yyyy-MM-dd")}.pdf`,
        },
      });

      if (fnErr) throw new Error(fnErr.message);

      // Mark as sent
      if (planId) {
        await supabase
          .from("weekly_plans")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", planId);
      }
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao enviar email");
    } finally {
      setSending(false);
    }
  };

  if (childrenLoading) {
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
              ? "Preenche os interesses e recebe o plano completo por email."
              : `Plano gerado · ${formatWeekRange(weekStart)}`}
          </p>
        </div>

        {step === "form" ? (
          <div className="space-y-6">
            {/* Week info */}
            <Card className="border-border/60">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Semana de {formatWeekRange(weekStart)}</p>
                  <p className="text-sm text-muted-foreground">Segunda-feira a sexta-feira</p>
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
                <ChevronLeft className="h-4 w-4" /> Editar
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={handleSavePlan} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar no Supabase
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
      <Suspense>{/* lazy PDF imports */}</Suspense>
    </AppLayout>
  );
}
