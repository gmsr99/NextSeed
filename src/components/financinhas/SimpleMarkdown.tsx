// Mostra os textos da aula (markdown simples: títulos, listas, **negrito**,
// _itálico_, citações). Sem HTML vindo da IA: tudo é texto escapado pelo React.
import { Fragment } from "react";

function inline(text: string, key: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={`${key}-${i}`}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("_") && p.endsWith("_") && p.length > 2) return <em key={`${key}-${i}`} className="text-muted-foreground">{p.slice(1, -1)}</em>;
    return <Fragment key={`${key}-${i}`}>{p}</Fragment>;
  });
}

export default function SimpleMarkdown({ text, className = "" }: { text: string | null | undefined; className?: string }) {
  if (!text?.trim()) return <p className="text-sm text-muted-foreground">Sem conteúdo.</p>;
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className={`space-y-3 text-sm leading-relaxed ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const k = `b${bi}`;
        if (/^#{1,3} /.test(lines[0]) && lines.length === 1) {
          return <p key={k} className="font-heading font-semibold text-base">{inline(lines[0].replace(/^#+ /, ""), k)}</p>;
        }
        if (lines.every((l) => /^\s*([-*]|\d+\.|[a-c]\))\s/.test(l) || /^\s{2,}\S/.test(l))) {
          return (
            <ul key={k} className="space-y-1">
              {lines.map((l, li) => (
                <li key={li} className={/^\s{2,}/.test(l) ? "pl-6 text-muted-foreground" : ""}>{inline(l.trim().replace(/^[-*]\s/, "• "), `${k}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => l.startsWith(">"))) {
          return (
            <div key={k} className="border-l-2 border-primary/40 pl-3 text-muted-foreground space-y-0.5">
              {lines.map((l, li) => <p key={li}>{inline(l.replace(/^>\s?/, ""), `${k}-${li}`)}</p>)}
            </div>
          );
        }
        return (
          <p key={k} className="whitespace-pre-line">
            {lines.map((l, li) => (
              <Fragment key={li}>{li > 0 && "\n"}{inline(l.replace(/^#+ /, ""), `${k}-${li}`)}</Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
