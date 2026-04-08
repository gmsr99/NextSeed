import { CalendarDays, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import TagInput from "@/components/TagInput";
import type { Child } from "@/lib/types";
import { formatWeekRange } from "@/lib/planGenerator";

interface PlannerFormProps {
  children: Child[];
  childInterests: Record<string, string[]>;
  onChildInterestsChange: (childId: string, tags: string[]) => void;
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
}

export function PlannerForm({
  children,
  childInterests,
  onChildInterestsChange,
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
  onGenerate,
}: PlannerFormProps) {
  return (
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
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrevWeek} title="Semana anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNextWeek} title="Próxima semana">
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
                onChange={(tags) => onChildInterestsChange(child.id, tags)}
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
        <CardContent>
          <Input
            value={fridayActivity}
            onChange={(e) => onFridayActivityChange(e.target.value)}
            placeholder="Ex: Visita ao Museu de História Natural..."
          />
        </CardContent>
      </Card>

      {/* Tema Semanal de Leitura */}
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
