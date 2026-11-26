// Catecismo em família (I-08, fase 2), dentro da Tradição da família em
// Definições. A família cola os números e os títulos das perguntas do seu
// livro; as respostas ficam no livro. Uma pergunta por semana, para todos.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFamilyCatechism } from "@/hooks/useFamilyCatechism";
import { catechismToText, parseCatechism, weekCatechism } from "@/lib/tradicao/catechism";

export default function CatechismSettings() {
  const { catechism, available, isLoading, save, step, clear } = useFamilyCatechism();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [start, setStart] = useState("1");

  if (isLoading) return null;

  if (!available) {
    return (
      <div className="rounded-lg border border-border/60 p-3">
        <p className="text-sm font-medium text-foreground">Catecismo em família</p>
        <p className="text-sm text-muted-foreground">Fica disponível depois de uma atualização da base de dados.</p>
      </div>
    );
  }

  const parsed = parseCatechism(text);
  const week = weekCatechism(catechism);

  const openEditor = () => {
    setName(catechism?.name ?? "");
    setText(catechism ? catechismToText(catechism.questions) : "");
    setStart(String((catechism?.pos ?? 0) + 1));
    setEditing(true);
  };

  const onSave = async () => {
    const pos = Math.min(Math.max(1, Number(start) || 1), Math.max(1, parsed.length)) - 1;
    try {
      await save.mutateAsync({ name, questions: parsed, pos });
      setEditing(false);
      toast({ title: "Catecismo guardado", description: "A pergunta da semana aparece no Planeador e no Guia de Atividades." });
    } catch {
      toast({ title: "Não foi possível guardar", description: "Tenta outra vez daqui a pouco.", variant: "destructive" });
    }
  };

  return (
    <div className="rounded-lg border border-border/60 p-3 space-y-2">
      <p className="text-sm font-medium text-foreground">Catecismo em família</p>

      {!editing && !catechism && (
        <>
          <p className="text-sm text-muted-foreground">
            Uma pergunta por semana, para todos juntos, aprendida de cor por etapas: ler, repetir com ajuda, sem ajuda,
            sozinho e, à sexta, em família. Colem as perguntas do vosso livro; as respostas ficam no livro.
          </p>
          <Button variant="outline" size="sm" onClick={openEditor}>Acrescentar o catecismo</Button>
        </>
      )}

      {!editing && catechism && (
        <>
          <p className="text-sm text-foreground">
            {catechism.name ? `${catechism.name} · ` : ""}
            {week ? `esta semana: ${week.label} (${week.index} de ${week.total})` : `chegaram ao fim das ${catechism.questions.length} perguntas.`}
          </p>
          <div className="flex flex-wrap gap-2">
            {week && (
              <Button variant="outline" size="sm" onClick={() => step.mutate(1)} disabled={step.isPending}>
                Já sabem de cor: passar à seguinte
              </Button>
            )}
            {catechism.pos > 0 && (
              <Button variant="ghost" size="sm" onClick={() => step.mutate(-1)} disabled={step.isPending}>Voltar à anterior</Button>
            )}
            <Button variant="ghost" size="sm" onClick={openEditor}>Editar a lista</Button>
            <Button variant="ghost" size="sm" onClick={() => clear.mutate()} disabled={clear.isPending}>Tirar o catecismo</Button>
          </div>
        </>
      )}

      {editing && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="catechism-name">Livro (opcional)</Label>
            <Input id="catechism-name" maxLength={120} placeholder="Ex.: Catecismo de S. Pio X" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="catechism-list">Perguntas, uma por linha</Label>
            <Textarea
              id="catechism-list" rows={8} placeholder={"1. Quem nos criou?\n2. Quem é Deus?\n3. …"}
              value={text} onChange={(e) => setText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Só o número e a pergunta. As respostas ficam no vosso livro: a NexSeed não as guarda nem as escreve.
              {parsed.length > 0 && ` ${parsed.length} ${parsed.length === 1 ? "pergunta" : "perguntas"}.`}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="catechism-start">Em que pergunta vão? (posição na lista)</Label>
            <Input id="catechism-start" type="number" min={1} max={Math.max(1, parsed.length)} className="w-28" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            Fica guardado só para a vossa família, dentro da Tradição da família: não vai para a inteligência artificial e
            apaga-se se desligarem a tradição.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onSave} disabled={parsed.length === 0 || save.isPending}>{save.isPending ? "A guardar…" : "Guardar"}</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
