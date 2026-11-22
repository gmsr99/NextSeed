import { useState } from "react";
import FamilyRoutineCard from "@/components/FamilyRoutineCard";
import LiturgyWeekCard from "@/components/LiturgyWeekCard";
import type { WeekLiturgy } from "@/lib/tradicao/week";
import { hasOuting, routineSummary, type WeekRoutine } from "@/lib/familyRoutine";
import { CalendarDays, Sparkles, Loader2, ChevronLeft, ChevronRight, BookOpen, ChevronDown, ChevronUp, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import TagInput from "@/components/TagInput";
import type { Child } from "@/lib/types";
import { formatWeekRange } from "@/lib/planGenerator";
import { GC_DISCIPLINE_LABELS } from "@/lib/gcConstants";
import { manualLabel } from "@/lib/annualPlan";
import type { ChildWeekFocus } from "@/hooks/useAnnualPlan";

// Disciplines shown per school year type
const PRESCHOOL_DISCIPLINES = [
  { key: "language", label: "Linguagem", placeholder: "Ex: sons das letras M e P, rimas..." },
  { key: "math", label: "Matemática", placeholder: "Ex: contagem até 10, formas geométricas..." },
  { key: "expression", label: "Expressão Artística", placeholder: "Ex: pintura com esponjas, modelagem..." },
  { key: "world", label: "Explorar o Mundo", placeholder: "Ex: animais da quinta, estações do ano..." },
];
const PRIMARY_DISCIPLINES = [
  { key: "language", label: "Português", placeholder: "Ex: sílabas AR, ER, IR; letra J e G..." },
  { key: "math", label: "Matemática", placeholder: "Ex: adição com transporte até 20..." },
  { key: "world", label: "Estudo do Meio", placeholder: "Ex: partes das plantas, ciclo da água..." },
  { key: "english", label: "Inglês", placeholder: "Ex: cores, números 1-10, greetings..." },
  { key: "expression", label: "Expressão Artística", placeholder: "Ex: aguarela, colagem com materiais naturais..." },
];

function getDisciplines(schoolYear: string) {
  return schoolYear.toLowerCase().startsWith("pré") ? PRESCHOOL_DISCIPLINES : PRIMARY_DISCIPLINES;
}

interface PlannerFormProps {
  children: Child[];
  childInterests: Record<string, string[]>;
  onChildInterestsChange: (childId: string, tags: string[]) => void;
  weeklyContent: Record<string, Record<string, string>>;
  onWeeklyContentChange: (childId: string, discipline: string, value: string) => void;
  fridayActivity: string;
  onFridayActivityChange: (val: string) => void;
  weeklyReadingTheme: string;
  onWeeklyReadingThemeChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  generating: boolean;
  generatingStep: string;
  onGenerate: () => void;
  /** Crianças sem conteúdos marcados como "em progresso" (aviso P-02) */
  childrenWithoutFocus?: Set<string>;
  /** Conteúdos da semana no rumo do ano, por criança (P-12) */
  weekFocusByChild?: Record<string, ChildWeekFocus>;
  /** P-18: a semana da família (null = semana de sempre) */
  routine?: WeekRoutine | null;
  /** I-08: o tempo litúrgico da semana (só com a Tradição da família ligada) */
  liturgy?: WeekLiturgy | null;
}

export function PlannerForm({
  children,
  childInterests,
  onChildInterestsChange,
  weeklyContent,
  onWeeklyContentChange,
  fridayActivity,
  onFridayActivityChange,
  weeklyReadingTheme,
  onWeeklyReadingThemeChange,
  notes,
  onNotesChange,
  weekStart,
  onPrevWeek,
  onNextWeek,
  generating,
  generatingStep,
  weekFocusByChild,
  onGenerate,
  childrenWithoutFocus,
  routine = null,
  liturgy = null,
}: PlannerFormProps) {
  const outing = hasOuting(routine);
  const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>({});

  const toggleContent = (childId: string) =>
    setExpandedContent((prev) => ({ ...prev, [childId]: !prev[childId] }));

  return (
    <div className="space-y-6">
      {/* Week selector */}
      <Card className="border-border/60" data-tour="planner-semana">
        <CardContent className="flex items-center gap-3 p-5">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Semana de {formatWeekRange(weekStart)}</p>
            <p className="text-sm text-muted-foreground">{routineSummary(routine)}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrevWeek} title="Semana anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNextWeek} title="Próxima semana">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Children interests + weekly content */}
      {children.map((child, childIdx) => {
        const isExpanded = expandedContent[child.id] ?? false;
        const disciplines = getDisciplines(child.school_year);
        const childContent = weeklyContent[child.id] ?? {};
        const hasContent = Object.values(childContent).some((v) => v.trim());

        return (
          <Card key={child.id} className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">{child.name}</CardTitle>
              <CardDescription>{child.school_year} · {child.curriculum}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* As âncoras do walkthrough só apontam para a primeira criança */}
              <div className="space-y-2" data-tour={childIdx === 0 ? "planner-interesses" : undefined}>
                <Label>Interesses desta semana</Label>
                <TagInput
                  value={childInterests[child.id] ?? child.interests ?? []}
                  onChange={(tags) => onChildInterestsChange(child.id, tags)}
                  placeholder="Escreve os interesses separados por vírgulas (ex: vulcões, Sonic)"
                />
                <p className="text-xs text-muted-foreground">
                  Os interesses são usados para tematizar as atividades — não como objetivo de ensino.
                </p>
              </div>

              {/* P-12 / I-01: o que o rumo do ano traz para esta semana. Com conteúdos
                  marcados como "em progresso", o plano parte desses (P-02), exceto nas
                  disciplinas com manual, que seguem sempre o manual. */}
              {(() => {
                const wf = weekFocusByChild?.[child.id];
                const noMarks = !!childrenWithoutFocus?.has(child.id);
                const rows = Object.entries(wf?.focus ?? {}).filter(
                  ([, list]) => noMarks || list.some((c) => c.fromManual),
                );
                const isPreschool = child.school_year.toLowerCase().startsWith("pré");
                if (rows.length === 0 && (!noMarks || isPreschool)) return null;
                return (
                  <div
                    role="note"
                    className="flex gap-2 rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs text-foreground"
                  >
                    <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {wf && rows.length > 0 ? (
                      <div className="min-w-0 space-y-1.5">
                        <p className="font-medium">
                          Esta semana no rumo do ano (semana {wf.week.number} de {wf.totalWeeks})
                        </p>
                        <ul className="space-y-1">
                          {rows.map(([d, list]) => (
                            <li key={d}>
                              <span className="font-medium">
                                {GC_DISCIPLINE_LABELS[d] ?? d}
                                {list[0]?.fromManual ? ` (${manualLabel(list)})` : ""}:
                              </span>{" "}
                              <span className="text-muted-foreground">{list.map((c) => c.content).join(" · ")}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-muted-foreground">O plano parte daqui. Não precisas de escolher nada.</p>
                        <Link to="/roteiro-anual" className="inline-flex font-medium text-primary hover:underline">
                          Ver o rumo do ano →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p>
                          Esta semana não tem conteúdos novos no rumo do ano. O plano parte dos conteúdos deste período,
                          para rever e consolidar.
                        </p>
                        <Link to="/roteiro-anual" className="inline-flex font-medium text-primary hover:underline">
                          Ver o rumo do ano →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Weekly curriculum content toggle */}
              <div className="border-t pt-3" data-tour={childIdx === 0 ? "planner-conteudos" : undefined}>
                <button
                  type="button"
                  onClick={() => toggleContent(child.id)}
                  className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Ajustar os conteúdos desta semana (opcional)
                    {hasContent && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        preenchido
                      </span>
                    )}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {!isExpanded && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Não precisas de preencher: a NexSeed escolhe os conteúdos a partir do currículo desta altura do ano. Abre só se quiseres trocar algum.
                  </p>
                )}

                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Preenche apenas as disciplinas que queres trabalhar esta semana. A IA vai gerar atividades que ensinam directamente estes conteúdos, usando os interesses como contexto.
                    </p>
                    {disciplines.map((disc) => (
                      <div key={disc.key} className="space-y-1">
                        <Label className="text-xs font-medium text-foreground">{disc.label}</Label>
                        <Input
                          value={childContent[disc.key] ?? ""}
                          onChange={(e) => onWeeklyContentChange(child.id, disc.key, e.target.value)}
                          placeholder={disc.placeholder}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* A nossa semana (P-18): dias de estudo, dias curtos, saída à sexta */}
      <LiturgyWeekCard liturgy={liturgy} />
      <FamilyRoutineCard />

      {/* Friday activity */}
      <Card className="border-border/60" data-tour="planner-sexta">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Sexta-feira — Ver Mundo</CardTitle>
          <CardDescription>
            {outing
              ? "Actividade de saída planeada (opcional)"
              : "Esta semana não tem saída: é a vossa escolha em \"A nossa semana\", logo acima."}
          </CardDescription>
        </CardHeader>
        {outing && (
          <CardContent>
            <Input
              value={fridayActivity}
              onChange={(e) => onFridayActivityChange(e.target.value)}
              placeholder="Ex: Visita ao Museu de História Natural..."
            />
          </CardContent>
        )}
      </Card>

      {/* Tema Semanal de Leitura */}
      <Card className="border-border/60" data-tour="planner-leitura">
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
            onChange={(e) => onWeeklyReadingThemeChange(e.target.value)}
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
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Ex: esta semana temos consulta na quarta de manhã..."
            rows={3}
          />
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full gap-2"
        onClick={onGenerate}
        disabled={children.length === 0 || generating}
        data-tour="planner-gerar"
      >
        {generating ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> {generatingStep || "A preparar..."}</>
        ) : (
          <><Sparkles className="h-5 w-5" /> Gerar Plano com IA</>
        )}
      </Button>

      {generating && generatingStep && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          <span>{generatingStep}</span>
        </div>
      )}
    </div>
  );
}
