import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import {
  Sparkles, Wand2, BookmarkPlus, Play, BookOpen, Target,
  Lightbulb, Loader2, CheckCircle2, CalendarClock, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { useActivities } from "@/hooks/useActivities";
import { useProjects } from "@/hooks/useProjects";
import { DISCIPLINE_LABELS } from "@/lib/planGenerator";
import { getCurriculumObjectives } from "@/lib/curriculumLoader";

// ── Types ─────────────────────────────────────────────────────────────────────

type OutputType = "activity" | "project" | "";

interface CurriculumItem {
  id: string;
  discipline: string;
  disciplineLabel: string;
  objective: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: string;
  phases?: string[];
}

// ── Curriculum helpers ─────────────────────────────────────────────────────────

const PRESCHOOL_ITEMS: CurriculumItem[] = [
  { id: "ps-1", discipline: "language",   disciplineLabel: "Português",  objective: "Escuta ativa de histórias e recontar com as suas palavras" },
  { id: "ps-2", discipline: "language",   disciplineLabel: "Português",  objective: "Rimas, lengalengas e jogos com sons e fonemas" },
  { id: "ps-3", discipline: "math",       disciplineLabel: "Matemática", objective: "Contagem até 10 com objetos concretos" },
  { id: "ps-4", discipline: "math",       disciplineLabel: "Matemática", objective: "Reconhecimento de formas geométricas simples" },
  { id: "ps-5", discipline: "expression", disciplineLabel: "Artes",      objective: "Pintura livre com diferentes materiais; exploração de cores" },
  { id: "ps-6", discipline: "expression", disciplineLabel: "Artes",      objective: "Música, dança e movimento rítmico expressivo" },
  { id: "ps-7", discipline: "world",      disciplineLabel: "Est. Meio",  objective: "Observação do ambiente natural próximo" },
];

function getCurriculumItems(schoolYear: string): CurriculumItem[] {
  const objectives = getCurriculumObjectives(schoolYear);
  const items: CurriculumItem[] = [];

  for (const [discipline, objs] of Object.entries(objectives)) {
    const label = DISCIPLINE_LABELS[discipline] ?? discipline;
    for (let i = 0; i < Math.min((objs as string[]).length, 5); i++) {
      items.push({
        id: `${discipline}-${i}`,
        discipline,
        disciplineLabel: label,
        objective: (objs as string[])[i],
      });
    }
  }

  return items.length > 0 ? items : PRESCHOOL_ITEMS;
}

// ── Gemini call ────────────────────────────────────────────────────────────────

async function generateWithGemini(
  childName: string,
  schoolYear: string,
  interests: string[],
  disciplineLabel: string,
  objective: string,
  outputType: "activity" | "project",
): Promise<Suggestion[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

  const interestStr = interests.join(", ") || "variados";

  const prompt = outputType === "activity"
    ? `Gera 3 sugestões de ATIVIDADES para uma criança portuguesa do ${schoolYear}, chamada ${childName}, com os seguintes interesses: ${interestStr}.

Uma atividade realiza-se numa única sessão de 30 a 90 minutos, dentro de uma aula ou momento de estudo. Deve ser concreta, prática e completável num só dia.

A atividade deve trabalhar o seguinte objetivo curricular de ${disciplineLabel}:
"${objective}"

Responde APENAS com um array JSON válido, sem markdown, sem texto adicional.
Formato exato:
[
  {
    "title": "Nome criativo da atividade (máx 6 palavras)",
    "description": "Descrição em 2-3 frases de como realizar a atividade numa sessão, mencionando os interesses da criança",
    "type": "Prática"
  }
]
O campo "type" deve ser um de: Prática, Escrita, Investigação, Jogo, Criativa.`

    : `Gera 3 sugestões de PROJETOS para uma criança portuguesa do ${schoolYear}, chamada ${childName}, com os seguintes interesses: ${interestStr}.

Um projeto desenvolve-se ao longo de vários dias, semanas ou meses (ex: plantar e cuidar de uma árvore, escrever um diário, construir algo progressivamente). Tem fases distintas que se sucedem no tempo.

O projeto deve trabalhar o seguinte objetivo curricular de ${disciplineLabel}:
"${objective}"

Responde APENAS com um array JSON válido, sem markdown, sem texto adicional.
Formato exato:
[
  {
    "title": "Nome criativo do projeto (máx 6 palavras)",
    "description": "Descrição em 2-3 frases do projeto e como se desenvolve ao longo do tempo, mencionando os interesses da criança",
    "type": "Projeto",
    "phases": ["Fase 1: descrição curta", "Fase 2: descrição curta", "Fase 3: descrição curta"]
  }
]
Cada projeto deve ter entre 3 e 5 fases. O campo "type" é sempre "Projeto".`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();

  const parts: { text: string; thought?: boolean }[] =
    data.candidates?.[0]?.content?.parts ?? [];
  const responsePart = parts.filter((p) => !p.thought).pop();
  const raw = responsePart?.text ?? "";

  const cleaned = raw
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  const startIdx = cleaned.indexOf("[");
  const endIdx   = cleaned.lastIndexOf("]");

  if (startIdx === -1 || endIdx <= startIdx) {
    console.error("Gemini raw response:", raw);
    throw new Error("Resposta da IA sem JSON válido");
  }

  const jsonStr = cleaned.slice(startIdx, endIdx + 1);

  let parsed: { title: string; description: string; type: string; phases?: string[] }[];
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    console.error("JSON parse failed:", jsonStr);
    throw new Error("Resposta da IA com JSON mal-formado");
  }

  return parsed.map((s, i) => ({ ...s, id: String(i) }));
}

// ── Type badge colours ─────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Projeto:      "bg-accent/15 text-accent-foreground",
  Prática:      "bg-primary/15 text-primary",
  Escrita:      "bg-orange-100 text-orange-700",
  Investigação: "bg-teal-100 text-teal-700",
  Jogo:         "bg-violet-100 text-violet-700",
  Criativa:     "bg-pink-100 text-pink-700",
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function CreativeEngine() {
  const { children } = useChildren();
  const { createActivity } = useActivities();
  const { createProject } = useProjects();

  const [selectedChildId, setSelectedChildId]           = useState("");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [outputType, setOutputType]                     = useState<OutputType>("");
  const [suggestions, setSuggestions]                   = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating]                 = useState(false);
  const [hasGenerated, setHasGenerated]                 = useState(false);
  const [realizingId, setRealizingId]                   = useState<string | null>(null);
  const [savingId, setSavingId]                         = useState<string | null>(null);
  const [doneIds, setDoneIds]                           = useState<Set<string>>(new Set());

  const selectedChild   = children.find((c) => c.id === selectedChildId);
  const curriculumItems = useMemo(
    () => selectedChild ? getCurriculumItems(selectedChild.school_year) : [],
    [selectedChild],
  );
  const selectedCurriculum = curriculumItems.find((c) => c.id === selectedCurriculumId);
  const canGenerate        = !!selectedChild && !!selectedCurriculum && !!outputType;

  const curriculumByDiscipline = useMemo(() => {
    const map: Record<string, CurriculumItem[]> = {};
    for (const item of curriculumItems) {
      if (!map[item.disciplineLabel]) map[item.disciplineLabel] = [];
      map[item.disciplineLabel].push(item);
    }
    return map;
  }, [curriculumItems]);

  const resetSuggestions = () => {
    setSuggestions([]);
    setHasGenerated(false);
    setDoneIds(new Set());
  };

  const handleGenerate = async () => {
    if (!selectedChild || !selectedCurriculum || !outputType) return;
    setIsGenerating(true);
    resetSuggestions();
    try {
      const results = await generateWithGemini(
        selectedChild.name.split(" ")[0],
        selectedChild.school_year,
        selectedChild.interests ?? [],
        selectedCurriculum.disciplineLabel,
        selectedCurriculum.objective,
        outputType,
      );
      setSuggestions(results);
      setHasGenerated(true);
    } catch (e) {
      toast({
        title: "IA indisponível",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // "Realizar" → registar como atividade feita hoje
  const handleRealizar = async (s: Suggestion) => {
    if (!selectedChild || !selectedCurriculum) return;
    setRealizingId(s.id);
    try {
      await createActivity.mutateAsync({
        child_id: selectedChild.id,
        title: s.title,
        description: s.description,
        discipline: selectedCurriculum.discipline,
        activity_date: format(new Date(), "yyyy-MM-dd"),
      });
      setDoneIds((prev) => new Set(prev).add(s.id));
      toast({ title: "Atividade registada no portfólio! 🌱" });
    } catch (e) {
      toast({ title: "Erro ao registar", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setRealizingId(null);
    }
  };

  // "Guardar como Projeto" → criar projeto com fases
  const handleGuardar = async (s: Suggestion) => {
    if (!selectedChild) return;
    setSavingId(s.id);
    try {
      const phases = s.phases?.length
        ? s.phases.map((p) => ({ title: p }))
        : [{ title: "Realizar o projeto" }];

      await createProject.mutateAsync({
        child_id: selectedChild.id,
        title: s.title,
        description: s.description,
        phases,
      });
      setDoneIds((prev) => new Set(prev).add(s.id));
      toast({ title: "Projeto guardado! 🚀" });
    } catch (e) {
      toast({ title: "Erro ao guardar", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl gradient-warmth flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold">Motor Criativo</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-[52px]">
            A IA transforma objetivos curriculares em atividades ou projetos personalizados para cada criança.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* 1. Criança */}
          <Card className="shadow-soft border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                1. Criança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedChildId}
                onValueChange={(v) => {
                  setSelectedChildId(v);
                  setSelectedCurriculumId("");
                  resetSuggestions();
                }}
              >
                <SelectTrigger><SelectValue placeholder="Escolher criança…" /></SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.school_year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AnimatePresence mode="wait">
                {selectedChild && (
                  <motion.div
                    key={selectedChild.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Interesses</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedChild.interests ?? []).length > 0
                          ? selectedChild.interests.map((i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                            ))
                          : <span className="text-xs text-muted-foreground italic">Sem interesses definidos</span>
                        }
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* 2. Objetivo */}
          <Card className="shadow-soft border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                2. Objetivo Curricular
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedCurriculumId}
                onValueChange={(v) => { setSelectedCurriculumId(v); resetSuggestions(); }}
                disabled={!selectedChild}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedChild ? "Escolher objetivo…" : "Seleciona uma criança primeiro"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {Object.entries(curriculumByDiscipline).map(([label, items]) => (
                    <SelectGroup key={label}>
                      <SelectLabel>{label}</SelectLabel>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.objective.length > 60 ? item.objective.slice(0, 60) + "…" : item.objective}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>

              <AnimatePresence mode="wait">
                {selectedCurriculum && (
                  <motion.div
                    key={selectedCurriculum.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1.5">
                      <Badge variant="outline" className="text-xs">{selectedCurriculum.disciplineLabel}</Badge>
                      <p className="text-sm leading-relaxed">{selectedCurriculum.objective}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* 3. O que gerar */}
          <Card className="shadow-soft border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-500" />
                3. O que criar?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                onClick={() => { setOutputType("activity"); resetSuggestions(); }}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                  outputType === "activity"
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm">Atividade</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Realiza-se numa única sessão (30–90 min). Concreta e imediata.
                </p>
              </button>

              <button
                type="button"
                onClick={() => { setOutputType("project"); resetSuggestions(); }}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                  outputType === "project"
                    ? "border-accent bg-accent/5"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CalendarClock className="h-4 w-4 text-accent shrink-0" />
                  <span className="font-semibold text-sm">Projeto</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Desenvolve-se ao longo de dias ou meses, com fases progressivas.
                </p>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Generate button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!canGenerate || isGenerating}
            onClick={handleGenerate}
            className="gap-2 px-10 text-base"
          >
            {isGenerating ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> A gerar com IA…</>
            ) : (
              <><Wand2 className="h-5 w-5" /> Gerar Sugestões com IA</>
            )}
          </Button>
        </div>

        {/* Loading */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full gradient-warmth animate-pulse flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full gradient-warmth opacity-30 animate-ping" />
              </div>
              <p className="text-muted-foreground text-sm font-medium animate-pulse">
                {outputType === "project"
                  ? "A criar projetos com fases…"
                  : "A cruzar interesses com o currículo…"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-heading font-bold">
                  {outputType === "project" ? "Projetos" : "Atividades"} para {selectedChild?.name.split(" ")[0]}
                </h2>
                <span className="text-xs text-muted-foreground ml-1">gerados pela IA</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {suggestions.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 * i, duration: 0.4 }}
                  >
                    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/60 hover:-translate-y-1 h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedCurriculum?.disciplineLabel}
                          </Badge>
                          <Badge className={`text-xs ${TYPE_COLORS[s.type] ?? "bg-muted text-muted-foreground"}`}>
                            {s.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-base leading-snug">{s.title}</CardTitle>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <CardDescription className="text-sm leading-relaxed">
                            {s.description}
                          </CardDescription>

                          {/* Fases do projeto */}
                          {outputType === "project" && s.phases && s.phases.length > 0 && (
                            <div className="space-y-1.5">
                              {s.phases.map((phase, pi) => (
                                <div key={pi} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <span className="shrink-0 h-4 w-4 rounded-full bg-accent/15 text-accent flex items-center justify-center font-semibold text-[10px]">
                                    {pi + 1}
                                  </span>
                                  <span className="leading-relaxed">{phase.replace(/^Fase \d+:\s*/i, "")}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Ação única consoante o tipo */}
                        <div>
                          {outputType === "activity" ? (
                            <Button
                              size="sm"
                              className="w-full gap-1.5"
                              disabled={realizingId === s.id || doneIds.has(s.id)}
                              onClick={() => handleRealizar(s)}
                            >
                              {realizingId === s.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : doneIds.has(s.id) ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                              {doneIds.has(s.id) ? "Registado!" : "Registar atividade"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-1.5"
                              disabled={savingId === s.id || doneIds.has(s.id)}
                              onClick={() => handleGuardar(s)}
                            >
                              {savingId === s.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : doneIds.has(s.id) ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <BookmarkPlus className="h-3.5 w-3.5" />
                              )}
                              {doneIds.has(s.id) ? "Guardado!" : "Guardar projeto"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!isGenerating && !hasGenerated && (
          <div className="text-center py-12 text-muted-foreground">
            <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Seleciona uma criança, um objetivo e o tipo de conteúdo a criar.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
