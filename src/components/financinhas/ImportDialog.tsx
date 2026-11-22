// Importar o histórico de aulas feitas antes da app (FIN_10 passo 4).
// O ficheiro tem dados reais: entra só por aqui, nunca pelo repositório.
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { parseImport, planImport, type ImportBundle } from "@/lib/financinhas/importer";
import type { FinLesson } from "@/lib/types";
import type { useFinancinhas } from "@/hooks/useFinancinhas";

type Importer = ReturnType<typeof useFinancinhas>["importHistory"];

export default function ImportDialog({ open, onOpenChange, kids, existing, importer, onDone }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  kids: { id: string; name: string }[];
  existing: FinLesson[];
  importer: Importer;
  onDone: (msg: string) => void;
}) {
  const [text, setText] = useState("");
  const [bundle, setBundle] = useState<ImportBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const preview = useMemo(() => {
    if (!bundle) return null;
    const m = Object.fromEntries(bundle.keys.map((k) => [k, mapping[k] && mapping[k] !== "none" ? mapping[k] : null]));
    return planImport(bundle, m, existing);
  }, [bundle, mapping, existing]);

  const read = () => {
    try {
      const b = parseImport(text);
      setBundle(b);
      setError(null);
      setMapping(Object.fromEntries(b.keys.map((k) => [k, "none"])));
    } catch (e) {
      setBundle(null);
      setError((e as Error).message);
    }
  };

  const reset = () => { setText(""); setBundle(null); setError(null); setMapping({}); };
  const nameOf = (id: string) => kids.find((c) => c.id === id)?.name.split(" ")[0] ?? "";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar histórico de aulas</DialogTitle>
          <DialogDescription>
            Para aulas feitas antes da app. Cola o conteúdo do ficheiro JSON do histórico. Nada é gravado sem veres a lista primeiro, e as aulas que já existem (mesma criança, título e data) são ignoradas.
          </DialogDescription>
        </DialogHeader>

        {!bundle ? (
          <div className="space-y-2">
            <Label htmlFor="imp-text">Conteúdo do ficheiro</Label>
            <Textarea id="imp-text" rows={10} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-xs" placeholder='{ "aulas": [ … ], "niveis": { … } }' />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">Encontrei {bundle.lessons.length} aulas e {bundle.levels.length} níveis. A que criança corresponde cada identificador do ficheiro?</p>
            {bundle.keys.map((k) => (
              <div key={k} className="flex items-center gap-3">
                <span className="text-sm font-mono w-24">{k}</span>
                <Select value={mapping[k] ?? "none"} onValueChange={(v) => setMapping({ ...mapping, [k]: v })}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não importar</SelectItem>
                    {kids.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {preview && (
              <div className="rounded-lg border p-3 space-y-1 text-sm max-h-64 overflow-y-auto">
                <p className="font-medium">Vai entrar:</p>
                {preview.lessons.length === 0 && <p className="text-muted-foreground">Nenhuma aula nova.</p>}
                {preview.lessons.map((l, i) => (
                  <p key={i}>{nameOf(l.child_id)} · {l.given_on ? l.given_on.split("-").reverse().join("/") : "sem data (fica por dar)"} · {l.title}{l.discovery_mode ? ` · ${l.discovery_mode}` : ""}</p>
                ))}
                {preview.levels.length > 0 && <p className="text-muted-foreground pt-1">{preview.levels.length} níveis como ponto de partida (só para crianças que ainda não têm fotografia).</p>}
                {preview.skipped > 0 && <p className="text-muted-foreground">{preview.skipped} já existia{preview.skipped === 1 ? "" : "m"}: ficam como estão.</p>}
                {bundle.warnings.map((w) => <p key={w} className="text-xs text-muted-foreground">{w}</p>)}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {bundle && <Button variant="ghost" onClick={() => setBundle(null)}>Voltar</Button>}
          {!bundle ? (
            <Button disabled={!text.trim()} onClick={read}>Ler</Button>
          ) : (
            <Button
              disabled={importer.isPending || !preview || (preview.lessons.length === 0 && preview.levels.length === 0)}
              onClick={() => preview && importer.mutate(preview, {
                onSuccess: (r) => { onDone(`Importadas ${r.lessons} aulas e ${r.levels} níveis.`); reset(); onOpenChange(false); },
                onError: (e) => setError((e as Error).message),
              })}
            >
              {importer.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Importar
            </Button>
          )}
        </DialogFooter>
        {bundle && error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
