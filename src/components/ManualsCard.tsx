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
import { MANUAL_DISCIPLINES, applyCurrentPage, countGroups, currentPageOf, formatIndex, hasUsablePages, parseIndex } from "@/lib/manualIndex";
import { useChildManuals, type ChildManual } from "@/hooks/useChildManuals";
import { schoolYearStartFor } from "@/lib/annualPlan";
import { useFamilyCalendar } from "@/hooks/useFamilyCalendar";
import type { Child } from "@/lib/types";

const EXAMPLE = "Unidade 1 — Números até 100 ... 6\nUnidade 1 — Contar de 2 em 2 ... 10\nUnidade 1 — Maior, menor, igual ... 14\nUnidade 2 — Adição até 100 ... 24\nUnidade 2 — Subtração até 100 ... 30";

export default function ManualsCard({ child }: { child: Child }) {
  const { manuals, available, isLoading, save, remove } = useChildManuals();
  const { toast } = useToast();
  const { calendar } = useFamilyCalendar();
  // "Desde o início do ano": o início do calendário da família, se existir
  const yearStart = calendar?.year_start ?? `${schoolYearStartFor(new Date())}-09-01`;
  const mine = manuals.filter((m) => m.child_id === child.id);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [discipline, setDiscipline] = useState<string>("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  // "now" = a partir desta semana; "year" = desde o início do ano letivo; "keep" = como estava
  const [startMode, setStartMode] = useState<"now" | "year" | "keep">("now");
  // Página até onde já trabalharam (opcional)
  const [pageText, setPageText] = useState("");
  const [savedPage, setSavedPage] = useState<number | null>(null);

  const entries = useMemo(() => parseIndex(text), [text]);
  const paged = hasUsablePages(entries);
  const groups = countGroups(entries);
  const currentPage = /^\d{1,4}$/.test(pageText.trim()) ? Number(pageText.trim()) : null;
  const lastPage = paged ? entries[entries.length - 1].page! : null;
  const pageOutOfRange = currentPage !== null && lastPage !== null && currentPage >= lastPage + 200;

  const openNew = () => {
    setEditingId(null);
    setDiscipline(MANUAL_DISCIPLINES.find((d) => !mine.some((m) => m.discipline === d)) ?? MANUAL_DISCIPLINES[0]);
    setTitle("");
    setText("");
    setPageText("");
    setSavedPage(null);
    setStartMode("now");
    setOpen(true);
  };
  const openEdit = (m: ChildManual) => {
    setEditingId(m.id);
    setDiscipline(m.discipline);
    setTitle(m.title);
    setText(formatIndex(m.entries));
    const p = currentPageOf(m.entries);
    setSavedPage(p);
    setPageText(p ? String(p) : "");
    setStartMode(m.start_date ? "keep" : "year");
    setOpen(true);
  };

  const onSave = async () => {
    try {
      const previous = mine.find((m) => m.id === editingId);
      const today = new Date();
      const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      // Mudou a página onde vão: o que falta reparte-se a partir desta semana
      const pageChanged = currentPage !== savedPage;
      const start_date =
        currentPage && pageChanged ? iso(today)
        : startMode === "keep" && previous?.start_date ? previous.start_date
        : startMode === "year" ? yearStart
        : iso(today);
      await save.mutateAsync({
        id: editingId, child_id: child.id, discipline, title: title.trim(),
        entries: applyCurrentPage(entries, currentPage), start_date,
      });
      setOpen(false);
      toast({ title: "Manual guardado", description: "O rumo do ano já segue este índice." });
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
              NexSeed só precisa dos títulos e das páginas.
            </p>
            {mine.length > 0 && (
              <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                {mine.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {GC_DISCIPLINE_LABELS[m.discipline] ?? m.discipline} · {m.entries.length}{" "}
                        {m.entries.length === 1 ? "tema" : "temas"}
                        {currentPageOf(m.entries) ? ` · vão na página ${currentPageOf(m.entries)}` : ""}
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
                Uma linha por tema. Se o manual tem unidades com vários temas, repitam a unidade no início de cada
                linha, como no exemplo: a NexSeed percebe que são temas da mesma unidade. Com o número da página no fim,
                dá mais semanas aos temas maiores e diz que páginas trabalhar em cada semana.
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
            {paged && (
              <div className="space-y-1.5">
                <Label htmlFor="manual-page">Já fizeram até à página (opcional)</Label>
                <Input
                  id="manual-page" inputMode="numeric" className="w-32" value={pageText}
                  onChange={(e) => setPageText(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Ex: 39"
                />
                <p className="text-xs text-muted-foreground">
                  {currentPage
                    ? `Os temas antes da página ${currentPage + 1} ficam feitos e o rumo continua daí, a partir desta semana.`
                    : "Se já começaram, escrevam a última página trabalhada: o rumo continua a partir da seguinte."}
                  {pageOutOfRange ? " Confirmem o número: é bem maior do que a última página do índice." : ""}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="manual-start">Repartir o manual</Label>
              <Select value={startMode} onValueChange={(v) => setStartMode(v as typeof startMode)}>
                <SelectTrigger id="manual-start"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {editingId && <SelectItem value="keep">Como está agora</SelectItem>}
                  <SelectItem value="now">A partir desta semana, até ao fim do ano</SelectItem>
                  <SelectItem value="year">Desde o início do ano</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {paged ? "Com a página preenchida, reparte sempre a partir desta semana." : "Se já vão a meio, escrevam só os temas que faltam."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={onSave} disabled={!discipline || !title.trim() || entries.length === 0 || save.isPending}>
              {save.isPending ? "A guardar…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
