import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, Wand2, BookmarkPlus, Play, BookOpen, Target,
  Lightbulb, Palette, Music, FlaskConical, Gamepad2, ArrowRight, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ───────────────────────────────────────── */
interface Child {
  id: string;
  name: string;
  schoolYear: string;
  interests: string[];
  learningPreferences: string;
  learningPace: string;
}

interface CurriculumItem {
  id: string;
  subject: string;
  theme: string;
  objective: string;
  code: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: string;
}

/* ── Mock data ───────────────────────────────────── */
const children: Child[] = [
  { id: "1", name: "Bryan Malta", schoolYear: "2º ano", interests: ["Ciências", "Leitura", "Jogos"], learningPreferences: "Visual e prático", learningPace: "Moderado" },
  { id: "2", name: "Noa Malta", schoolYear: "Pré-escolar", interests: ["Arte", "Música"], learningPreferences: "Cinestésico", learningPace: "Calmo" },
];

const curriculumItems: CurriculumItem[] = [
  { id: "c1", subject: "Português", theme: "Oralidade", objective: "Produzir um discurso oral com correção e clareza.", code: "O4" },
  { id: "c2", subject: "Matemática", theme: "Números e Operações", objective: "Resolver problemas envolvendo adição, subtração e multiplicação.", code: "NO3" },
  { id: "c3", subject: "Estudo do Meio", theme: "Natureza e Ambiente", objective: "Identificar características dos seres vivos e seus habitats.", code: "NA1" },
  { id: "c4", subject: "Português", theme: "Leitura e Escrita", objective: "Ler textos diversos com fluência e expressividade.", code: "LE1" },
  { id: "c5", subject: "Matemática", theme: "Geometria e Medida", objective: "Identificar e classificar figuras geométricas planas.", code: "GM1" },
  { id: "c6", subject: "Estudo do Meio", theme: "Sociedade e Território", objective: "Conhecer factos e datas da história local e nacional.", code: "ST1" },
];

const interestIcons: Record<string, React.ReactNode> = {
  Arte: <Palette className="h-3 w-3" />,
  Leitura: <BookOpen className="h-3 w-3" />,
  Música: <Music className="h-3 w-3" />,
  Ciências: <FlaskConical className="h-3 w-3" />,
  Jogos: <Gamepad2 className="h-3 w-3" />,
};

const typeColors: Record<string, string> = {
  "Projeto": "bg-accent/15 text-accent-foreground",
  "Prática": "bg-primary/15 text-primary",
  "Escrita": "bg-nexseed-orange/15 text-foreground",
  "Investigação": "bg-nexseed-moss/15 text-foreground",
  "Jogo": "bg-nexseed-orange-light/15 text-foreground",
  "Criativa": "bg-primary/15 text-primary",
};

/* ── Mock generation ─────────────────────────────── */
const generateSuggestions = (child: Child, curriculum: CurriculumItem): Suggestion[] => {
  const templates: Record<string, Suggestion[]> = {
    Português: [
      { id: "s1", title: `Rádio ${child.name.split(" ")[0]}`, description: `Criar um programa de rádio onde ${child.name.split(" ")[0]} apresenta notícias inventadas usando vocabulário novo. Inclui entrevistas imaginárias a personagens de livros.`, subject: "Português", type: "Projeto" },
      { id: "s2", title: "Caça-Palavras no Jardim", description: `Uma expedição ao ar livre para encontrar e catalogar palavras escritas no meio envolvente — placas, sinais, embalagens — e criar um diário de campo ilustrado.`, subject: "Português", type: "Prática" },
      { id: "s3", title: "Carta ao Futuro", description: `Escrever uma carta ao \"eu\" do futuro, praticando estrutura de carta formal enquanto reflete sobre aprendizagens e sonhos pessoais.`, subject: "Português", type: "Escrita" },
    ],
    Matemática: [
      { id: "s1", title: "Mercado dos Números", description: `Montar uma banca de mercado simulada onde ${child.name.split(" ")[0]} pratica operações com preços reais, troco e receitas de culinária com medidas.`, subject: "Matemática", type: "Prática" },
      { id: "s2", title: "Geometria na Natureza", description: `Caminhar pelo bairro ou parque fotografando formas geométricas na natureza e arquitetura. Criar um álbum classificado por tipo de forma.`, subject: "Matemática", type: "Investigação" },
      { id: "s3", title: "Jogo de Tabuleiro Matemático", description: `Conceber um jogo de tabuleiro original que incorpora desafios de cálculo mental e resolução de problemas adaptados ao nível de ${child.name.split(" ")[0]}.`, subject: "Matemática", type: "Jogo" },
    ],
    "Estudo do Meio": [
      { id: "s1", title: "Detetives da Natureza", description: `Investigar o ecossistema local com lupa e caderno de campo, identificando seres vivos, as suas relações e habitats. Criar um mini-documentário fotográfico.`, subject: "Estudo do Meio", type: "Investigação" },
      { id: "s2", title: "Maquete do Bairro", description: `Construir uma maquete do bairro usando materiais reciclados, identificando instituições, espaços verdes e pontos de interesse histórico.`, subject: "Estudo do Meio", type: "Projeto" },
      { id: "s3", title: "Diário do Tempo", description: `Registar diariamente o estado do tempo, temperatura e observações do céu durante um mês. Analisar padrões e criar gráficos simples.`, subject: "Estudo do Meio", type: "Criativa" },
    ],
  };
  return templates[curriculum.subject] || templates["Português"];
};

/* ── Component ───────────────────────────────────── */
const CreativeEngine = () => {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const selectedCurriculum = curriculumItems.find((c) => c.id === selectedCurriculumId);
  const canGenerate = !!selectedChild && !!selectedCurriculum;

  const handleGenerate = async () => {
    if (!selectedChild || !selectedCurriculum) return;
    setIsGenerating(true);
    setSuggestions([]);
    // Simulate generation delay
    await new Promise((r) => setTimeout(r, 1800));
    setSuggestions(generateSuggestions(selectedChild, selectedCurriculum));
    setIsGenerating(false);
    setHasGenerated(true);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl gradient-warmth flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold">Motor Criativo</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-[52px]">
            Transforma conteúdos curriculares em atividades personalizadas e inspiradoras.
          </p>
        </div>

        {/* Context panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Select child */}
          <Card className="shadow-soft border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                1. Selecionar Criança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolher criança…" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.schoolYear}
                    </SelectItem>
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
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1.5">Interesses</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedChild.interests.map((i) => (
                            <Badge key={i} variant="secondary" className="gap-1 text-xs">
                              {interestIcons[i] || null} {i}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Preferências</p>
                          <p className="font-medium">{selectedChild.learningPreferences}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ritmo</p>
                          <p className="font-medium">{selectedChild.learningPace}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Select curriculum */}
          <Card className="shadow-soft border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                2. Conteúdo Curricular
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedCurriculumId} onValueChange={setSelectedCurriculumId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolher conteúdo…" />
                </SelectTrigger>
                <SelectContent>
                  {curriculumItems.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      [{c.code}] {c.subject} — {c.objective.slice(0, 50)}…
                    </SelectItem>
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
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5">{selectedCurriculum.code}</Badge>
                        <Badge variant="outline" className="text-xs">{selectedCurriculum.subject}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Tema: {selectedCurriculum.theme}</p>
                      <p className="text-sm font-medium leading-relaxed">{selectedCurriculum.objective}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Generate button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            variant="warmth"
            disabled={!canGenerate || isGenerating}
            onClick={handleGenerate}
            className="gap-2 px-10 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                A gerar sugestões…
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Gerar Sugestões Criativas
              </>
            )}
          </Button>
        </div>

        {/* Generating animation */}
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
                A contextualizar interesses e conteúdos…
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
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-heading font-bold">Sugestões para {selectedChild?.name.split(" ")[0]}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {suggestions.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 * i, duration: 0.45, ease: "easeOut" }}
                  >
                    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/60 hover:-translate-y-1 h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{s.subject}</Badge>
                          <Badge className={`text-xs ${typeColors[s.type] || "bg-muted text-muted-foreground"}`}>{s.type}</Badge>
                        </div>
                        <CardTitle className="text-lg leading-snug">{s.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between gap-4">
                        <CardDescription className="text-sm leading-relaxed">
                          {s.description}
                        </CardDescription>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 gap-1.5">
                            <Play className="h-3.5 w-3.5" /> Realizar
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <BookmarkPlus className="h-3.5 w-3.5" /> Guardar
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
            <p className="text-sm">Seleciona uma criança e um conteúdo curricular para começar a criar.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CreativeEngine;
