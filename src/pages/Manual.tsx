import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, LifeBuoy } from "lucide-react";
import { MANUAL_SECTIONS, type ManualBlock, type ManualSection } from "@/content/manual";

// ─── Formatação inline: **negrito** e [texto](rota/url) ─────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const label = m[1];
      const url = m[2];
      if (url.startsWith("/")) {
        nodes.push(
          <Link key={key++} to={url} className="text-primary font-medium underline underline-offset-2 hover:opacity-80">
            {label}
          </Link>,
        );
      } else {
        nodes.push(
          <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2 hover:opacity-80">
            {label}
          </a>,
        );
      }
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={key++} className="font-semibold text-foreground">{m[3]}</strong>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function Block({ block }: { block: ManualBlock }) {
  switch (block.type) {
    case "h":
      return <h3 className="text-lg font-semibold text-foreground mt-7 mb-2">{renderInline(block.text)}</h3>;
    case "p":
      return <p className="text-[15px] leading-relaxed text-muted-foreground mb-3">{renderInline(block.text)}</p>;
    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-1.5 mb-4 text-[15px] leading-relaxed text-muted-foreground marker:text-primary/60">
          {block.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-5 space-y-1.5 mb-4 text-[15px] leading-relaxed text-muted-foreground marker:text-primary/70 marker:font-semibold">
          {block.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </ol>
      );
    case "callout":
      return (
        <div className="my-4 rounded-xl border-l-4 border-primary/50 bg-primary/5 px-4 py-3 text-[15px] leading-relaxed text-foreground/80">
          {renderInline(block.text)}
        </div>
      );
  }
}

function sectionMatches(section: ManualSection, q: string): boolean {
  const haystack = [
    section.title,
    section.summary,
    ...section.keywords,
    ...section.blocks.flatMap((b) =>
      b.type === "ul" || b.type === "ol" ? b.items : [b.text],
    ),
  ].join(" ").toLowerCase();
  return haystack.includes(q);
}

export default function Manual() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visibleSections = useMemo(
    () => (q ? MANUAL_SECTIONS.filter((s) => sectionMatches(s, q)) : MANUAL_SECTIONS),
    [q],
  );

  const active =
    MANUAL_SECTIONS.find((s) => s.slug === slug) ?? visibleSections[0] ?? MANUAL_SECTIONS[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-warmth flex items-center justify-center shrink-0">
            <LifeBuoy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manual de Instruções</h1>
            <p className="text-muted-foreground text-sm">Tudo o que precisam de saber para tirar o máximo da NexSeed.</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar no manual…"
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Índice */}
          <nav className="space-y-1 lg:sticky lg:top-20">
            {visibleSections.length === 0 && (
              <p className="text-sm text-muted-foreground px-3 py-2">Sem resultados para “{query}”.</p>
            )}
            {visibleSections.map((s) => {
              const isActive = s.slug === active?.slug;
              const Icon = s.icon;
              return (
                <button
                  key={s.slug}
                  onClick={() => navigate(`/ajuda/${s.slug}`)}
                  className={`w-full text-left rounded-lg px-3 py-2 flex items-center gap-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Conteúdo */}
          {active && (
            <Card className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-1">
                <active.icon className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-xl font-bold tracking-tight">{active.title}</h2>
              </div>
              <p className="text-muted-foreground mb-5">{active.summary}</p>
              <div>
                {active.blocks.map((b, i) => <Block key={i} block={b} />)}
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
