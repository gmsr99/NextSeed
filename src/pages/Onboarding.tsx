import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/hooks/useChildren";
import { useAllMethodologies, useSetFamilyMethodologies } from "@/hooks/useMethodologies";
import { track } from "@/lib/analytics";
import { daysSince } from "@/lib/feedback/time";
import InterestPicker from "@/components/InterestPicker";
import { SCHOOL_YEARS } from "@/lib/planGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Sprout, CalendarCheck, ListChecks, BookHeart, BarChart3,
  Plus, ArrowRight, ArrowLeft, Check, Trash2, Loader2, PartyPopper,
} from "lucide-react";

const STEPS = ["Boas-vindas", "Família", "Crianças", "Metodologia", "Pronto"];

const VERBS = [
  { icon: CalendarCheck, title: "Planear", text: "Todas as semanas, podem gerar um plano de atividades para cada criança: currículo, metodologia e os interesses do momento." },
  { icon: ListChecks, title: "Fazer", text: "Recebem o plano em PDF, com horário e guia de materiais. Só têm de o seguir e aproveitar o tempo com as crianças." },
  { icon: BookHeart, title: "Registar", text: "Ao longo da semana, podem registar no Diário as atividades e projetos realizados, com fotografias e notas. Demora apenas alguns segundos." },
  { icon: BarChart3, title: "Provar", text: "Os registos transformam-se automaticamente no Portfólio da criança e nos relatórios para a escola, sem trabalho duplicado." },
];

const MAX_METHODOLOGIES = 3;
const PRIORITY_HINTS = ["Principal", "Secundária", "Complementar"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { family, updateFamilyName, updateOnboarding } = useAuth();
  const { children, createChild } = useChildren();
  const { data: methodologies = [] } = useAllMethodologies();
  const setFamilyMethodologies = useSetFamilyMethodologies();

  const initialStep = Math.min(Math.max(family?.onboarding_step ?? 0, 0), STEPS.length - 1);
  const [step, setStep] = useState(initialStep);
  const [familyName, setFamilyName] = useState(family?.name ?? "");
  const [busy, setBusy] = useState(false);

  // Formulário da criança
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  // Ordem de seleção = prioridade (1=principal). A IA cruza as escolhidas.
  const [methodologyIds, setMethodologyIds] = useState<string[]>([]);

  const toggleMethodology = (id: string) => {
    setMethodologyIds((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id);
      if (prev.length >= MAX_METHODOLOGIES) {
        toast({
          title: "Máximo de 3 metodologias",
          description: "Remove uma antes de escolher outra. Podem ajustar depois em Metodologias.",
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const go = async (next: number) => {
    setStep(next);
    await updateOnboarding({ onboarding_step: next });
  };

  const saveFamilyName = async () => {
    if (familyName.trim() && familyName.trim() !== family?.name) {
      await updateFamilyName(familyName.trim());
    }
    await go(2);
  };

  const addChild = async () => {
    if (!childName.trim() || !birthDate || !schoolYear || !family) {
      toast({ title: "Faltam dados", description: "Indica nome, data de nascimento e ano de escolaridade.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await createChild.mutateAsync({
        family_id: family.id,
        name: childName.trim(),
        birth_date: birthDate,
        school_year: schoolYear,
        school: null,
        curriculum: null,
        manuals: null,
        interests,
        learning_preferences: null,
        learning_pace: null,
      });
      setChildName(""); setBirthDate(""); setSchoolYear(""); setInterests([]);
      toast({ title: "Criança adicionada 🌱" });
    } catch (e) {
      toast({ title: "Não foi possível adicionar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const applyMethodologyAndContinue = async () => {
    setBusy(true);
    try {
      await setFamilyMethodologies.mutateAsync(methodologyIds);
    } catch (e) {
      toast({ title: "Não foi possível guardar as metodologias", description: (e as Error).message, variant: "destructive" });
      setBusy(false);
      return;
    }
    setBusy(false);
    await go(4);
  };

  const finish = async (destination: string) => {
    setBusy(true);
    await updateOnboarding({ onboarding_completed_at: new Date().toISOString(), onboarding_step: STEPS.length - 1 });
    track("onboarding_completed", {
      days_since_signup: family?.created_at ? daysSince(family.created_at) : null,
    });
    toast({ title: "Tudo pronto!", description: "Bem-vindos à NexSeed 🌱" });
    navigate(destination, { replace: true });
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Topo */}
      <header className="border-b">
        <div className="max-w-2xl mx-auto w-full px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl gradient-warmth flex items-center justify-center">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold leading-tight">NexSeed</p>
            <p className="text-xs text-muted-foreground">Passo {step + 1} de {STEPS.length} · {STEPS[step]}</p>
          </div>
          {step === 0 && (
            <Button variant="ghost" size="sm" onClick={() => go(1)}>Saltar introdução</Button>
          )}
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        {/* 0 — Boas-vindas */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Bem-vindos à NexSeed 🌱</h1>
              <p className="text-muted-foreground text-lg">A plataforma que simplifica o ensino doméstico. Agilizamos o planeamento e simplificamos a burocracia para ganharem tempo para ensinar, aprender e desfrutar deste percurso em família. Funciona em quatro passos:</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {VERBS.map((v, i) => (
                <Card key={v.title} className="p-4 flex gap-3 items-start">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{i + 1}. {v.title}</p>
                    <p className="text-sm text-muted-foreground leading-snug">{v.text}</p>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button size="lg" onClick={() => go(1)}>Começar <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* 1 — Família */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">A vossa família</h1>
              <p className="text-muted-foreground">Como querem que a vossa família apareça na app?</p>
            </div>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="famname">Nome da família</Label>
              <Input id="famname" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Ex: Família Malta" />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => go(0)}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
              <Button onClick={saveFamilyName}>Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* 2 — Crianças */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">As crianças</h1>
              <p className="text-muted-foreground">Adicionem pelo menos uma criança. Podem adicionar mais agora ou depois.</p>
            </div>

            {children.length > 0 && (
              <div className="space-y-2">
                {children.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="h-8 w-8 rounded-full gradient-warmth flex items-center justify-center text-xs font-bold text-white">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.school_year}{c.interests?.length ? ` · ${c.interests.slice(0, 3).join(", ")}` : ""}</p>
                    </div>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                ))}
              </div>
            )}

            <Card className="p-4 space-y-4">
              <p className="font-semibold text-sm">{children.length > 0 ? "Adicionar outra criança" : "Adicionar criança"}</p>
              <div className="space-y-2">
                <Label htmlFor="cname">Nome</Label>
                <Input id="cname" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Primeiro nome" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bdate">Data de nascimento</Label>
                  <Input id="bdate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
                </div>
                <div className="space-y-2">
                  <Label>Ano de escolaridade</Label>
                  <Select value={schoolYear} onValueChange={setSchoolYear}>
                    <SelectTrigger><SelectValue placeholder="Escolher" /></SelectTrigger>
                    <SelectContent>
                      {SCHOOL_YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Interesses atuais</Label>
                <InterestPicker value={interests} onChange={setInterests} />
              </div>
              <Button variant="outline" onClick={addChild} disabled={busy} className="w-full">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Adicionar esta criança
              </Button>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => go(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
              <Button onClick={() => go(3)} disabled={children.length === 0}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 3 — Metodologia */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Metodologia (opcional)</h1>
              <p className="text-muted-foreground">
                Escolham até {MAX_METHODOLOGIES} metodologias. A IA combina as suas características ao criar as atividades, dando maior prioridade à primeira opção. Se não tiverem uma preferência definida, deixem “Sem preferência”.{" "}
                <Link to="/ajuda/metodologias" className="text-primary underline underline-offset-2">Saber mais</Link>.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setMethodologyIds([])}
                className={`text-left rounded-xl border p-4 transition-colors ${methodologyIds.length === 0 ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-accent"}`}
              >
                <p className="font-semibold">Sem preferência</p>
                <p className="text-sm text-muted-foreground">A IA combina diferentes abordagens para um plano equilibrado.</p>
              </button>
              {methodologies.map((m) => {
                const rank = methodologyIds.indexOf(m.id);
                const selected = rank >= 0;
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMethodology(m.id)}
                    aria-pressed={selected}
                    className={`text-left rounded-xl border p-4 transition-colors ${selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-accent"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{m.name}</p>
                      {selected && (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full gradient-warmth px-2 py-0.5 text-[10px] font-semibold text-white">
                          {rank + 1} · {PRIORITY_HINTS[rank]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{m.short_description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => go(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
              <Button onClick={applyMethodologyAndContinue} disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 4 — Pronto */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl gradient-warmth flex items-center justify-center">
                <PartyPopper className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Está tudo pronto!</h1>
              <p className="text-muted-foreground">
                {children.length === 1 ? "Uma criança configurada" : `${children.length} crianças configuradas`}. Agora o passo mais importante: gerar o primeiro plano semanal.
              </p>
            </div>
            <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
              <Button size="lg" onClick={() => finish("/weekly-planner")} disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck className="mr-2 h-4 w-4" />}
                Gerar o primeiro plano
              </Button>
              <Button variant="ghost" onClick={() => finish("/")} disabled={busy}>Ir para o painel</Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Nas próximas páginas vamos guiar-vos passo a passo. A qualquer momento, o botão de ajuda no canto
              do ecrã dá acesso às visitas guiadas e ao <Link to="/ajuda" className="underline">Manual de Instruções</Link>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
