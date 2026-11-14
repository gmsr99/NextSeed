// Estrutura comum da Política de Privacidade e dos Termos (B-07, B-08).
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import NexSeedLogo from "@/components/NexSeedLogo";
import { LEGAL_UPDATED, legalPending } from "@/lib/legal";

export function LegalSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-heading text-xl font-semibold">
        {n}. {title}
      </h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export function Mail({ to }: { to: string }) {
  return (
    <a href={`mailto:${to}`} className="text-primary underline">
      {to}
    </a>
  );
}

export default function LegalPage({ title, summary, children }: { title: string; summary?: ReactNode; children: ReactNode }) {
  const pending = legalPending();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <Link to="/login">
            <NexSeedLogo dark={false} />
          </Link>
        </div>

        <h1 className="mb-2 font-heading text-3xl font-bold">{title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">Última atualização: {LEGAL_UPDATED}</p>

        {pending.length > 0 && (
          <div role="note" className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Rascunho em revisão. Falta: {pending.join(", ")}.
          </div>
        )}

        {summary && (
          <div className="mb-8 rounded-xl border border-primary/25 bg-primary/5 p-5 text-sm leading-relaxed text-foreground">
            {summary}
          </div>
        )}

        <div className="max-w-none space-y-8 text-sm text-foreground">{children}</div>

        <div className="mt-12 border-t pt-6">
          <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            ← Voltar ao início de sessão
          </Link>
        </div>
      </div>
    </div>
  );
}
