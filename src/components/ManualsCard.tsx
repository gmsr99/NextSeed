// Manuais de uma criança (I-01): a família escreve o índice e o Rumo do ano
// passa a seguir o manual nessa disciplina. Só títulos e páginas (INS-05).
import { useMemo, useState } from "react";
import { BookMarked, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GC_DISCIPLINE_LABELS } from "@/lib/gcConstants";
import {
  MANUAL_DISCIPLINES, applyCurrentPage, applyCurrentTopic, countGroups, currentPageOf, currentTopicOf, formatIndex,
  hasUsablePages, isNextLesson, NEXT_LESSON_ENTRIES, parseIndex, type ManualEntry,
} from "@/lib/manualIndex";
import { useChildManuals, type ChildManual } from "@/hooks/useChildManuals";
import { formatWeekShort, isoDay, planningMonday } from "@/lib/annualPlan";
import type { Child } from "@/lib/types";

const EXAMPLE = "Unidade 1 — Números até 100 ... 6\nUnidade 1 — Contar de 2 em 2 ... 10\nUnidade 1 — Maior, menor, igual ... 14\nUnidade 2 — Adição até 100 ... 24\nUnidade 2 — Subtração até 100 ... 30";

/** Onde vão neste manual, em texto curto para a lista. */
function progressLabel(entries: ManualEntry[]): string {
  if (isNextLesson(entries)) return "lição seguinte";
  const page = currentPageOf(entries);
  if (page) return `vão na página ${page}`;
  const topic = currentTopicOf(entries);
  if (topic !== null) return `vão em "${entries[topic].title}"`;
  return "começa no 1.º tema";
}

export default function ManualsCard({ child }: { child: Child }) {
  const { manuals, available, isLoading, save, remove } = useChildManuals();
  const { toast } = useToast();
  const mine = manuals.filter((m) => m.child_id === child.id);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [discipline, setDiscipline] = useState<string>("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  // Como seguem o livro: "index" (a NexSeed reparte o índice) ou "next" (lição seguinte)
  const [mode, setMode] = useState<"index" | "next">("index");
  // Onde vão: "new" = ainda não começaram; "started" = já vão a meio
  const [progress, setProgress] = useState<"new" | "started">("new");
  // Já começaram: última página feita (índice com páginas) ou tema onde vão (sem páginas)
  const [pageText, setPageText] = useState("");
  const [topicIdx, setTopicIdx] = useState<string>("");
  // Como estava guardado, para não mexer na data quando nada mudou
  const [savedMarks, setSavedMarks] = useState<string>("");

  const entries = useMemo(() => parseIndex(text), [text]);
  const paged = hasUsablePages(entries);
  const groups = countGroups(entries);
  const currentPage = /^\d{1,4}$/.test(pageText.trim()) ? Number(pageText.trim()) : null;
  const currentTopic = topicIdx !== "" && Number(topicIdx) < entries.length ? Number(topicIdx) : null;
  const lastPage = paged ? entries[entries.length - 1].page! : null;
  const pageOutOfRange = currentPage !== null && lastPage !== null && currentPage >= lastPage + 200;
  // Já começaram mas ainda não disseram onde vão: não deixa guardar
  const missingProgress = mode === "index" && progress === "started" && (paged ? !currentPage : currentTopic === null);
  const startWeek = formatWeekShort(planningMonday(new Date()));
  const marked = (): ManualEntry[] =>
    mode === "next" ? NEXT_LESSON_ENTRIES
    : progress === "new" ? applyCurrentPage(entries, null)
    : paged ? applyCurrentPage(entries, currentPage)
    : applyCurrentTopic(entries, currentTopic);

  const openNew = () => {
    setEditingId(null);
    setDiscipline(MANUAL_DISCIPLINES.find((d) => !mine.some((m) => m.discipline === d)) ?? MANUAL_DISCIPLINES[0]);
    setTitle("");
    setText("");
    setMode("index");
    setPageText("");
    setTopicIdx("");
    setSavedMarks("");
    setProgress("new");
    setOpen(true);
  };
  const openEdit = (m: ChildManual) => {
    setEditingId(m.id);
    setDiscipline(m.discipline);
    setTitle(m.title);
    const next = isNextLesson(m.entries);
    setMode(next ? "next" : "index");
    setText(next ? "" : formatIndex(m.entries));
    const p = currentPageOf(m.entries);
    const t = currentTopicOf(m.entries);
    setPageText(p ? String(p) : "");
    setTopicIdx(!p && t !== null ? String(t) : "");
    setProgress(p || t !== null ? "started" : "new");
    setSavedMarks(JSON.stringify(m.entries));
    setOpen(true);
  };

  const onSave = async () => {
    try {
      const previous = mine.find((m) => m.id === editingId);
      const next = marked();
      // O que falta reparte-se a partir da semana que estão a preparar (ao fim de
      // semana, a seguinte). Se só mudou o nome, o rumo fica como estava.
      const unchanged = !!previous?.start_date && JSON.stringify(next) === savedMarks;
      const start_date = unchanged ? previous!.start_date! : isoDay(planningMonday(new Date()));
      await save.mutateAsync({ id: editingId, child_id: child.id, discipline, title: title.trim(), entries: next, start_date });
      setOpen(false);
      toast({
        title: "Manual guardado",
        description: unchanged ? "O rumo do ano continua como estava." : `O rumo continua daqui a partir da semana de ${startWeek}.`,
      });
    } catch (e) {
      const dup = (e as { code?: string } | null)?.code === "23505";
      toast({
        title: "Não foi possível guardar",
        description: dup
          ? "Um segundo manual na mesma disciplina fica disponível depois de uma atualização que já pedimos. Por agora, podem juntar os dois índices num só."
          : "Tenta outra vez daqui a pouco.",
        variant: "destructive",
      });
    }
  };

  const onRemove = async (m: ChildManual) => {
    try {
      await remove.mutateAsync(m.id);
      toast({ title: "Manual retirado", description: "Esta disciplina volta a seguir o currículo." });
    } catch {
      toast({ title: "Não foi possível retirar", variant: "destructive" });
    }
  };

  if (isLoading) return null;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <BookMarked className="h-4 w-4 text-primary" /> Manuais, cursos e PDF de {child.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!available ? (
          <p className="text-sm text-muted-foreground">
            Aqui vão poder escrever o índice dos manuais que usam, para o rumo do ano seguir o manual. Esta parte ainda
            está a ser ligada; por agora o rumo segue o currículo.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Se trabalham com um manual, um curso ou um PDF que compraram, escrevam ou colem aqui o índice. Nessa
              disciplina, o rumo do ano e o plano semanal passam a segui-lo, tema a tema. O ficheiro fica convosco: a
              NexSeed só precisa dos títulos e das páginas. Se seguem o livro lição a lição, basta o nome: escolham "Lição seguinte".
            </p>
            {mine.length > 0 && (
              <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                {mine.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {GC_DISCIPLINE_LABELS[m.discipline] ?? m.discipline}
                        {isNextLesson(m.entries) ? "" : ` · ${m.entries.length} ${m.entries.length === 1 ? "tema" : "temas"}`}
                        {` · ${progressLabel(m.entries)}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)} aria-label={`Editar ${m.title}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(m)} aria-label={`Retirar ${m.title}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" onClick={openNew}>
              <Plus className="mr-1.5 h-4 w-4" /> {mine.length > 0 ? "Adicionar outro" : "Adicionar manual"}
            </Button>
            {mine.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Podem ter mais do que um na mesma disciplina, por exemplo o manual e o caderno de fichas.
                {mine.some((m) => progressLabel(m.entries) === "começa no 1.º tema")
                  ? " Se já vão mais à frente num que diz \"começa no 1.º tema\", toquem no lápis e digam onde vão: o rumo continua daí."
                  : ""}
              </p>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar manual, curso ou PDF" : "Adicionar manual, curso ou PDF"}</DialogTitle>
            <DialogDescription>
              Só o índice: os títulos dos temas e, se quiserem, a página onde cada um começa. Podem copiá-lo do PDF e colar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="manual-discipline">Disciplina</Label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger id="manual-discipline"><SelectValue placeholder="Escolher" /></SelectTrigger>
                  <SelectContent>
                    {MANUAL_DISCIPLINES.map((d) => (
                      <SelectItem key={d} value={d}>{GC_DISCIPLINE_LABELS[d] ?? d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="manual-title">Nome</Label>
                <Input id="manual-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Ex: Matemática 2" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manual-mode">Como seguem este livro?</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                <SelectTrigger id="manual-mode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="index">Pelo índice: a NexSeed reparte os temas e as páginas pelo ano</SelectItem>
                  <SelectItem value="next">Lição seguinte: o livro marca onde ficámos</SelectItem>
                </SelectContent>
              </Select>
              {mode === "next" && (
                <p className="text-xs text-muted-foreground">
                  Não precisam de índice nem de páginas. Cada semana, o plano diz "lição seguinte" deste livro e prepara o
                  resto à volta. Como é o livro que marca onde ficaram, o plano nunca fica desatualizado.
                </p>
              )}
            </div>
            {mode === "index" && (
            <div className="space-y-1.5">
              <Label htmlFor="manual-index">Índice</Label>
              <Textarea
                id="manual-index"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={9}
                placeholder={EXAMPLE}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Colem o índice completo, desde o início, mesmo que já vão a meio: logo a seguir dizem onde vão. Uma
                linha por tema; se o manual tem unidades com vários temas, repitam a unidade no início de cada linha,
                como no exemplo. Com o número da página no fim, a NexSeed dá mais semanas aos temas maiores e diz que
                páginas trabalhar em cada semana.
              </p>
              <p className="text-xs font-medium text-foreground" aria-live="polite">
                {entries.length === 0
                  ? "Ainda sem temas."
                  : `${entries.length} ${entries.length === 1 ? "tema" : "temas"}${
                      groups > 1 && groups < entries.length ? `, em ${groups} unidades` : ""
                    }${
                      paged ? ", com páginas" : entries.some((e) => e.page) ? ". Faltam páginas em algumas linhas: reparte por igual" : ", sem páginas: reparte por igual"
                    }.`}
              </p>
            </div>
            )}
            {mode === "index" && entries.length > 0 && (
              <div className="space-y-2 rounded-lg border border-border/60 p-3">
                <Label htmlFor="manual-progress">Onde vão neste manual?</Label>
                <Select value={progress} onValueChange={(v) => setProgress(v as typeof progress)}>
                  <SelectTrigger id="manual-progress"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Ainda não começámos</SelectItem>
                    <SelectItem value="started">Já começámos</SelectItem>
                  </SelectContent>
                </Select>
                {progress === "started" && paged && (
                  <div className="space-y-1.5">
                    <Label htmlFor="manual-page">Última página que já fizeram</Label>
                    <Input
                      id="manual-page" inputMode="numeric" className="w-32" value={pageText}
                      onChange={(e) => setPageText(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="Ex: 39"
                    />
                    {pageOutOfRange && (
                      <p className="text-xs text-muted-foreground">Confirmem o número: é bem maior do que a última página do índice.</p>
                    )}
                  </div>
                )}
                {progress === "started" && !paged && (
                  <div className="space-y-1.5">
                    <Label htmlFor="manual-topic">Tema onde vão agora</Label>
                    <Select value={topicIdx} onValueChange={setTopicIdx}>
                      <SelectTrigger id="manual-topic"><SelectValue placeholder="Escolher o tema" /></SelectTrigger>
                      <SelectContent>
                        {entries.map((e, i) => (
                          <SelectItem key={i} value={String(i)}>{e.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {progress === "new"
                    ? `O rumo começa no primeiro tema, na semana de ${startWeek}.`
                    : missingProgress
                      ? paged
                        ? "Escrevam a última página que já fizeram. Colem o índice completo: assim a NexSeed sabe o que já aprenderam."
                        : "Escolham o tema onde vão. Os anteriores ficam feitos e a NexSeed sabe o que já aprenderam."
                      : paged
                        ? `Até à página ${currentPage} fica feito. Na semana de ${startWeek} continuam na página ${currentPage! + 1}.`
                        : `Os temas antes deste ficam feitos. Na semana de ${startWeek} continuam em "${entries[currentTopic!].title}".`}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={onSave} disabled={!discipline || !title.trim() || (mode === "index" && entries.length === 0) || missingProgress || save.isPending}>
              {save.isPending ? "A guardar…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
