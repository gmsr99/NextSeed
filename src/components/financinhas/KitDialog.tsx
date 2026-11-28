// Kit de arranque do Financinhas (I-20, corrigido em I-30).
// Os PDFs são os desenhos originais do Financinhas, gerados uma vez por
// scripts/financinhas-kit/build.py e servidos tal e qual a partir de
// public/financinhas/kit. Nada é desenhado no browser: sai igual em qualquer
// browser e impressora. Nenhuma folha leva nomes nem valores de uma família.
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

const BASE = "/financinhas/kit/";

const SHEETS: { file: string; title: string; who: string; pages: string }[] = [
  { file: "etiquetas-mealheiros.pdf", title: "Etiquetas dos mealheiros", who: "Três jogos para os frascos e a faixa do chão.", pages: "1 página" },
  { file: "caderninho.pdf", title: "O meu caderninho", who: "Capa, as contas de hoje, o meu sonho e três páginas da semana (7–12 anos).", pages: "6 páginas" },
  { file: "pagina-da-semana.pdf", title: "Página da semana", who: "Para imprimir mais semanas do caderninho.", pages: "1 página" },
  { file: "folha-de-contas.pdf", title: "As minhas contas", who: "Uma folha para oito semanas, com os quatro mealheiros lado a lado.", pages: "1 página" },
  { file: "folha-o-meu-sonho.pdf", title: "O meu sonho", who: "A folha do sonho, com a barra para pintar.", pages: "1 página" },
  { file: "mapa-de-moedas.pdf", title: "Mapa de moedas", who: "Para os 5–6 anos: sem escrita, uma casinha por moeda.", pages: "1 página" },
  { file: "fotografia-inicial.pdf", title: "Fotografia inicial", who: "Para ti: as seis perguntas, à entrada e no fim do trilho.", pages: "1 página" },
];

export default function KitDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kit de arranque</DialogTitle>
          <DialogDescription>
            Folhas para imprimir em A4, a cores e em tamanho real (sem "ajustar à página"). Os espaços em branco são para a criança preencher.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {SHEETS.map((s) => (
            <li key={s.file} className="flex items-start gap-3 rounded-lg border p-3">
              <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.title} <span className="text-xs text-muted-foreground font-normal">· {s.pages}</span></p>
                <p className="text-xs text-muted-foreground">{s.who}</p>
              </div>
              <Button asChild size="sm" variant="ghost" aria-label={`Abrir ${s.title}`}>
                <a href={BASE + s.file} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
              </Button>
            </li>
          ))}
        </ul>
        <Button asChild>
          <a href={BASE + "kit-completo.pdf"} download="nexseed-financinhas-kit-de-arranque.pdf">
            <Download className="h-4 w-4 mr-2" /> Descarregar o kit completo
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
