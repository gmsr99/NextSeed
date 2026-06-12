import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  /** Rota para onde o CTA navega. Usa isto OU onAction. */
  actionTo?: string;
  /** Handler do CTA (ex: abrir um diálogo). Usa isto OU actionTo. */
  onAction?: () => void;
  /** Slug do Manual para o link "ver como funciona". */
  helpSlug?: string;
}

/**
 * Estado vazio orientado à ação: diz o que fazer a seguir e dá um caminho.
 * Reutilizável em qualquer lista/secção sem conteúdo.
 */
export default function EmptyState({
  icon: Icon, title, description, actionLabel, actionTo, onAction, helpSlug,
}: EmptyStateProps) {
  const hasAction = actionLabel && (actionTo || onAction);
  return (
    <div className="text-center py-16 px-4">
      <Icon className="h-12 w-12 mx-auto text-primary/20 mb-3" />
      <p className="font-heading font-semibold text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {hasAction && (
        <div className="mt-4">
          {actionTo ? (
            <Button asChild className="gap-2"><Link to={actionTo}>{actionLabel}</Link></Button>
          ) : (
            <Button onClick={onAction} className="gap-2">{actionLabel}</Button>
          )}
        </div>
      )}
      {helpSlug && (
        <p className="text-xs text-muted-foreground mt-3">
          <Link to={`/ajuda/${helpSlug}`} className="underline hover:text-foreground">
            Ver como funciona no Manual
          </Link>
        </p>
      )}
    </div>
  );
}
