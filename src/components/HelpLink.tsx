import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Botão "?" que leva ao Manual de Instruções, opcionalmente na secção certa.
 * Usado no header global (AppLayout) de forma contextual à rota atual.
 */
export default function HelpLink({ slug, label = "Manual de instruções" }: { slug?: string; label?: string }) {
  const to = slug ? `/ajuda/${slug}` : "/ajuda";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          aria-label={label}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </Link>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
