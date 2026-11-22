import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FinLesson } from "@/lib/types";
import { NOTEBOOK_PROMPT_LIMIT } from "@/lib/financinhas/generator";
import { modeByCode, themeByNumber, trackSession } from "@/lib/financinhas/catalog";
import SimpleMarkdown from "./SimpleMarkdown";

export function lessonLabel(l: Pick<FinLesson, "track_session" | "theme_numbers">): string {
  if (l.track_session) return `Trilho · S${l.track_session} · ${trackSession(l.track_session)?.title ?? ""}`;
  const t = l.theme_numbers?.[0] ? themeByNumber(l.theme_numbers[0]) : null;
  return t ? `Tema ${t.number} · ${t.title}` : "Aula";
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { toast } = useToast();
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm" variant="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          toast({ title: "Não consegui copiar", description: "Seleciona o texto e copia à mão.", variant: "destructive" });
        }
      }}
    >
      {done ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />} {done ? "Copiado" : label}
    </Button>
  );
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function LessonView({
  lesson, onMarkGiven, onDelete, busy,
}: {
  lesson: FinLesson;
  onMarkGiven?: (date: string) => void;
  onDelete?: () => void;
  busy?: boolean;
}) {
  const [date, setDate] = useState(todayIso());
  const isCase = lesson.tier === "9-12";
  const mode = lesson.discovery_mode ? modeByCode(lesson.discovery_mode) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">{lessonLabel(lesson)}</Badge>
        {lesson.protagonist && <Badge variant="outline">Protagonista: {lesson.protagonist}</Badge>}
        {(lesson.skill_codes ?? []).length > 0 && <Badge variant="outline">{lesson.skill_codes.join(" · ")}</Badge>}
        {mode && <Badge variant="outline" title="Linguagem interna: não aparece no texto para a criança">Descoberta: {mode.name}</Badge>}
        {lesson.module_week > 1 && <Badge variant="outline">Módulo, semana {lesson.module_week} de 3</Badge>}
        {lesson.source === "importada" && <Badge variant="outline">Importada</Badge>}
      </div>

      <Tabs defaultValue={isCase ? "caso" : lesson.notebook_prompt ? "apresentacao" : "aula"}>
        <TabsList className="flex flex-wrap h-auto">
          {!isCase && lesson.notebook_prompt && <TabsTrigger value="apresentacao">Apresentação</TabsTrigger>}
          <TabsTrigger value={isCase ? "caso" : "quiz"}>{isCase ? "Ficha de caso" : "Quiz"}</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="guia">Guia do adulto</TabsTrigger>
          <TabsTrigger value="tracking">O que observar</TabsTrigger>
          <TabsTrigger value="aula">Aula completa</TabsTrigger>
        </TabsList>

        {!isCase && lesson.notebook_prompt && (
          <TabsContent value="apresentacao" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Copia e cola no Gemini Notebook (ou NotebookLM) para gerar a apresentação ilustrada. Revê-a antes de a mostrares: nenhum conteúdo chega à criança sem passar por ti.
            </p>
            <div className="flex items-center gap-3">
              <CopyButton text={lesson.notebook_prompt} label="Copiar prompt" />
              <span className="text-xs text-muted-foreground">{lesson.notebook_prompt.length} de {NOTEBOOK_PROMPT_LIMIT} caracteres</span>
            </div>
            <pre className="whitespace-pre-wrap text-xs bg-muted/50 rounded-lg p-3 max-h-96 overflow-auto">{lesson.notebook_prompt}</pre>
          </TabsContent>
        )}
        <TabsContent value={isCase ? "caso" : "quiz"}><SimpleMarkdown text={lesson.quiz_md} /></TabsContent>
        <TabsContent value="atividades" className="space-y-4">
          <SimpleMarkdown text={lesson.activities_md} />
          {lesson.challenge_md && (
            <div className="rounded-lg border p-3">
              <p className="text-sm font-semibold mb-1">Desafio da Semana</p>
              <SimpleMarkdown text={lesson.challenge_md} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="guia"><SimpleMarkdown text={lesson.adult_guide_md} /></TabsContent>
        <TabsContent value="tracking"><pre className="whitespace-pre-wrap text-xs bg-muted/50 rounded-lg p-3">{lesson.tracking_md || "Sem bloco de tracking."}</pre></TabsContent>
        <TabsContent value="aula" className="space-y-3">
          {lesson.content_md && <CopyButton text={lesson.content_md} label="Copiar a aula toda" />}
          <SimpleMarkdown text={lesson.content_md} />
        </TabsContent>
      </Tabs>

      {(onMarkGiven || onDelete) && (
        <div className="flex flex-wrap items-end gap-3 border-t pt-4">
          {onMarkGiven && (
            <>
              <div className="space-y-1">
                <label htmlFor={`given-${lesson.id}`} className="text-xs text-muted-foreground">Dada em</label>
                <Input id={`given-${lesson.id}`} type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} className="w-40" />
              </div>
              <Button disabled={busy || !date} onClick={() => onMarkGiven(date)}><Check className="h-4 w-4 mr-1" /> Marcar como dada</Button>
            </>
          )}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" disabled={busy}><Trash2 className="h-4 w-4 mr-1" /> Apagar</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apagar esta aula?</AlertDialogTitle>
                  <AlertDialogDescription>A aula e os sinais "o que observar" que ainda não confirmaste desaparecem. Os níveis já confirmados ficam.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Apagar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
}
