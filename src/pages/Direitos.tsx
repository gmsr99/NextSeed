// I-13 · Direitos e deveres no ensino doméstico: o essencial da lei, com o
// artigo ao lado, e modelos de requerimento para copiar. Sem chatbot.
// Enquanto os textos não estiverem revistos por um jurista, só a equipa vê.
import { useState } from "react";
import { Scale, Copy, Check, ExternalLink } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";
import { canSeeDireitos, DIREITOS_ATUALIZADO, DIREITOS_REVISTO, FONTES, SECTIONS, TEMPLATES } from "@/content/direitos";

function TemplateCard({ t }: { t: (typeof TEMPLATES)[number] }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(t.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setOpen(true);
    }
  };
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex-1 font-semibold text-foreground">{t.title}</p>
        <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>{open ? "Esconder" : "Ver"}</Button>
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{t.when}</p>
      {open && (
        <pre className="mt-3 whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-sans text-sm text-foreground">{t.body}</pre>
      )}
    </div>
  );
}

export default function Direitos() {
  const { isAdmin, isLoading } = useIsTeamAdmin();

  if (!isLoading && !canSeeDireitos(isAdmin)) {
    return (
      <AppLayout>
        <Alert>
          <AlertTitle>Direitos e deveres: em breve</AlertTitle>
          <AlertDescription>Estamos a preparar este guia com cuidado. Avisamos quando estiver disponível.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-3xl font-bold text-foreground">
            <Scale className="h-7 w-7 text-primary" /> Direitos e deveres
          </h1>
          <p className="mt-1 text-muted-foreground">
            O essencial da lei do ensino doméstico, com o artigo ao lado de cada ponto, para poderem confirmar e mostrar à escola.
          </p>
        </div>

        {!DIREITOS_REVISTO && (
          <Alert>
            <AlertTitle>Rascunho em revisão jurídica</AlertTitle>
            <AlertDescription>Só a equipa vê esta página até os textos estarem revistos.</AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-muted-foreground">
          Informação geral sobre o Decreto-Lei n.º 70/2021, de 3 de agosto, na redação em vigor, para Portugal continental. Não é
          aconselhamento jurídico: cada protocolo e cada caso têm os seus pormenores. Atualizado a {DIREITOS_ATUALIZADO}.
        </p>

        <nav className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-full border border-border/60 px-3 py-1 text-sm hover:bg-muted">{s.title}</a>
          ))}
          <a href="#modelos" className="rounded-full border border-border/60 px-3 py-1 text-sm hover:bg-muted">Modelos de requerimento</a>
        </nav>

        {SECTIONS.map((s) => (
          <Card key={s.id} id={s.id} className="scroll-mt-20 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">{s.title}</CardTitle>
              {s.intro && <p className="text-sm text-muted-foreground">{s.intro}</p>}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {s.points.map((p, i) => (
                  <li key={i} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:gap-3">
                    <span className="flex-1 text-foreground">{p.text}</span>
                    <Badge variant="outline" className="w-fit shrink-0 font-normal">{p.ref}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        <Card id="modelos" className="scroll-mt-20 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Modelos de requerimento</CardTitle>
            <p className="text-sm text-muted-foreground">
              Copiem, preencham o que está entre [ ] e enviem por email à escola. Ajustem o texto ao vosso caso; o tom calmo e o
              artigo certo costumam bastar.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {TEMPLATES.map((t) => <TemplateCard key={t.id} t={t} />)}
          </CardContent>
        </Card>

        <div className="space-y-1 text-sm">
          <p className="font-semibold text-foreground">Fontes oficiais</p>
          {FONTES.map((f) => (
            <a key={f.url} href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5" /> {f.label}
            </a>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
