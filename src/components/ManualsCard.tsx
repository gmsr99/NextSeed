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
import { MANUAL_DISCIPLINES, formatIndex, hasUsablePages, parseIndex } from "@/lib/manualIndex";
import { useChildManuals, type ChildManual } from "@/hooks/useChildManuals";
import { schoolYearStartFor } from "@/lib/annualPlan";
import type { Child } from "@/lib/types";

const EXAMPLE = "Unidade 1 — Números até 100 ... 6\nUnidade 2 — Adição e subtração ... 24\nUnidade 3 — Figuras geométricas ... 40";

export default function ManualsCard({ child }: { child: Child }) {
  const { manuals, available, isLoading, save, remove } = useChildManuals();
  const { toast } = useToast();
  const mine = manuals.filter((m) => m.child_id === child.id);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [discipline, setDiscipline] = useState<string>("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  // "now" = a partir desta semana; "year" = desde o início do ano letivo; "keep" = como estava
  const [startMode, setStartMode] = useState<"now" | "year" | "keep">("now");

  const entries = useMemo(() => parseIndex(text), [text]);
  const paged = hasUsablePages(entries);
  const taken = new Set(mine.filter((m) => m.id !== editingId).map((m) => m.discipline));
  const free = MANUAL_DISCIPLINES.filter((d) => !taken.has(d));

  const openNew = () => {
    setEditingId(null);
    setDiscipline(free[0] ?? "");
    setTitle("");
    setText("");
    setStartMode("now");
    setOpen(true);
  };
  const openEdit = (m: ChildManual) => {
    setEditingId(m.id);
    setDiscipline(m.discipline);
    setTitle(m.title);
    setText(formatIndex(m.entries));
    setStartMode(m.start_date ? "keep" : "year");
    setOpen(true);
  };

  const onSave = async () => {
    try {
      const previous = mine.find((m) => m.id === editingId);
      const today = new Date();
      const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const start_date =
        startMode === "keep" && previous?.start_date ? previous.start_date
        : startMode === "year" ? `${schoolYearStartFor(today)}-09-01`
        : iso(today);
      await save.mutateAsync({ child_id: child.id, discipline, title: title.trim(), entries, start_date });
      // Mudou de disciplina ao editar: o registo antigo deixa de fazer sentido
      if (previous && previous.discipline !== discipline) await remove.mutateAsync(previous.id);
      setOpen(false);
      toast({ title: "Manual guardado", description: "O rumo do ano já segue este índice." });
    } catch {
      toast({ title: "Não foi possível guardar", description: "Tenta outra vez daqui a pouco.", variant: "destructive" });
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
          <BookMarked className="h-4 w-4 text-primary" /> Manuais de {child.name}
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
              Se trabalham com um manual, escrevam aqui o índice. Nessa disciplina, o rumo do ano e o plano semanal
              passam a seguir o manual, unidade a unidade.
            </p>
            {mine.length > 0 && (
              <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                {mine.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {GC_DISCIPLINE_LABELS[m.discipline] ?? m.discipline} · {m.entries.length}{" "}
                        {m.entries.length === 1 ? "unidade" : "unidades"}
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
            {free.length > 0 && (
              <Button variant="outline" size="sm" onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" /> Adicionar manual
              </Button>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar manual" : "Adicionar manual"}</DialogTitle>
            <DialogDescription>
              Só o índice: os títulos das unidades e, se quiserem, a página onde cada uma começa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="manual-discipline">Disciplina</Label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger id="manual-discipline"><SelectValue placeholder="Escolher" /></SelectTrigger>
                  <SelectContent>
                    {free.map((d) => (
                      <SelectItem key={d} value={d}>{GC_DISCIPLINE_LABELS[d] ?? d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="manual-title">Nome do manual</Label>
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
                Uma unidade por linha. Com o número da página no fim da linha, a NexSeed dá mais semanas às unidades
                maiores e diz que páginas trabalhar em cada semana.
              </p>
              <p className="text-xs font-medium text-foreground" aria-live="polite">
                {entries.length === 0
                  ? "Ainda sem unidades."
                  : `${entries.length} ${entries.length === 1 ? "unidade" : "unidades"}${
                      paged ? ", com páginas" : entries.some((e) => e.page) ? ". Faltam páginas em algumas linhas: reparte por igual" : ", sem páginas: reparte por igual"
                    }.`}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manual-start">Repartir o manual</Label>
              <Select value={startMode} onValueChange={(v) => setStartMode(v as typeof startMode)}>
                <SelectTrigger id="manual-start"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {editingId && <SelectItem value="keep">Como está agora</SelectItem>}
                  <SelectItem value="now">A partir desta semana, até ao fim do ano letivo</SelectItem>
                  <SelectItem value="year">Desde o início do ano letivo</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se já vão a meio do manual, escrevam só as unidades que faltam.
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
