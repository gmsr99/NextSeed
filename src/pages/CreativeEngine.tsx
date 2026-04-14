import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import {
  Sparkles, Wand2, BookmarkPlus, BookOpen, Target,
  Lightbulb, Loader2, CheckCircle2, BookHeart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { useProjects } from "@/hooks/useProjects";
import { useMethodologies } from "@/hooks/useMethodologies";
import { DISCIPLINE_LABELS } from "@/lib/planGenerator";
import { getCurriculumObjectives } from "@/lib/curriculumLoader";
import type { FamilyMethodology } from "@/lib/types";
import { PRIORITY_LABELS } from "@/components/methodology/constants";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Constrói o bloco de contexto pedagógico a partir das metodologias ativas ──

function buildMethodologyContext(methodologies: FamilyMethodology[]): string {
  if (methodologies.length === 0) return "";

  const priorityLabel = (p: 1 | 2 | 3) =>
    p === 1 ? "METODOLOGIA PRINCIPAL" : p === 2 ? "METODOLOGIA SECUNDÁRIA" : "METODOLOGIA COMPLEMENTAR";

  const blocks = methodologies
    .sort((a, b) => a.priority - b.priority)
    .map((fm) => {
      const m = fm.methodology;
      if (!m) return null;
      const keywordsStr = m.keywords?.length ? `\nPalavras-chave: ${m.keywords.join(", ")}` : "";
      return `${priorityLabel(fm.priority)}: ${m.name}\nAbordagem: "${m.ai_generation_style}"${keywordsStr}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return blocks
    ? `[CONTEXTO PEDAGÓGICO DA FAMÍLIA]\n${blocks}\n\nOs projetos gerados DEVEM refletir esta(s) abordagem(ns) pedagógica(s), especialmente a principal.\n`
    : "";
}

async function generateWithGemini(
  childName: string,
  schoolYear: string,
  interests: string[],
  disciplineLabel: string,
  objective: string,
  activeMethodologies: FamilyMethodology[],
): Promise<Suggestion[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

  const interestStr = interests.join(", ") || "variados";
  const methodologyContext = buildMethodologyContext(activeMethodologies);

  const prompt = `${methodologyContext}Gera 3 sugestões de PROJETOS para uma criança portuguesa do ${schoolYear}, chamada ${childName}, com os seguintes interesses: ${interestStr}.

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

// ── Component ──────────────────────────────────────────────────────────────────

export default function CreativeEngine() {
  const { children } = useChildren();
  const { createProject } = useProjects();
  const { familyMethodologies } = useMethodologies();

  const [selectedChildId, setSelectedChildId]           = useState("");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [suggestions, setSuggestions]                   = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating]                 = useState(false);
  const [hasGenerated, setHasGenerated]                 = useState(false);
  const [savingId, setSavingId]                         = useState<string | null>(null);
  const [doneIds, setDoneIds]                           = useState<Set<string>>(new Set());

  const selectedChild   = children.find((c) => c.id === selectedChildId);
  const curriculumItems = useMemo(
    () => selectedChild ? getCurriculumItems(selectedChild.school_year) : [],
    [selectedChild],
  );
  const selectedCurriculum = curriculumItems.find((c) => c.id === selectedCurriculumId);
  const canGenerate        = !!selectedChild && !!selectedCurriculum;

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
    if (!selectedChild || !selectedCurriculum) return;
    setIsGenerating(true);
    resetSuggestions();
    try {
      const results = await generateWithGemini(
        selectedChild.name.split(" ")[0],
        selectedChild.school_year,
        selectedChild.interests ?? [],
        selectedCurriculum.disciplineLabel,
        selectedCurriculum.objective,
        familyMethodologies,
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
            A IA transforma objetivos curriculares em projetos personalizados para cada criança.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

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
                          ? (selectedChild.interests ?? []).map((i) => (
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
        </div>

        {/* Metodologias ativas */}
        <div className="flex flex-col items-center gap-2">
          {familyMethodologies.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <BookHeart className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {familyMethodologies
                .sort((a, b) => a.priority - b.priority)
                .map((fm) => (
                  <span
                    key={fm.methodology_id}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    <span className="font-semibold text-primary">{fm.priority}</span>
                    {fm.methodology?.name ?? "—"}
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
              <BookHeart className="h-3.5 w-3.5" />
              Sem metodologias selecionadas — os projetos serão gerados de forma genérica.
            </p>
          )}
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
              <><Wand2 className="h-5 w-5" /> Gerar Projetos com IA</>
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
                A criar projetos com fases…
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
                  Projetos para {selectedChild?.name.split(" ")[0]}
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
                          <Badge className="text-xs bg-accent/15 text-accent-foreground">
                            Projeto
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
                          {s.phases && s.phases.length > 0 && (
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

                        <div>
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
            <p className="text-sm">Seleciona uma criança e um objetivo curricular para gerar projetos.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
