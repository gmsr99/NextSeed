import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Compass, HelpCircle, LifeBuoy, MessageCircle, Sprout } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useTour } from "@/contexts/TourContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { HELP_BY_ROUTE } from "@/lib/helpRoutes";
import { getToursForRoute, type TourDef } from "@/lib/tours";

// ─── HelpMenu ─────────────────────────────────────────────────────────────────
// Botão de ajuda sempre disponível, no canto inferior direito, empilhado por
// cima do botão «Conta-nos» (feedback). Abre um menu com: visita guiada da
// página atual, visita de boas-vindas, manual contextual, FAQ e contacto.

function MenuItem({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent/20 transition-colors"
    >
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        {subtitle && <span className="block text-xs text-muted-foreground">{subtitle}</span>}
      </span>
    </button>
  );
}

/** Tour da página atual. No planeador depende do estado: se o plano gerado está
 * no ecrã (âncora plano-acoes presente), a visita certa é a do plano. */
function resolvePageTour(pathname: string): TourDef | undefined {
  const tours = getToursForRoute(pathname);
  if (tours.length <= 1) return tours[0];
  const previewVisible = !!document.querySelector('[data-tour="plano-acoes"]');
  return tours.find((t) => (previewVisible ? t.id === "plano-gerado" : t.id === "planeador"));
}

export default function HelpMenu() {
  const { user, family } = useAuth();
  const { startTour, activeTour } = useTour();
  const { openFeedbackDialog } = useFeedback();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Mesmas condições do botão de feedback; visível durante um tour (é alvo do
  // último passo das boas-vindas), mas com o menu fechado.
  if (!user || !family?.onboarding_completed_at) return null;

  const pageTour = resolvePageTour(location.pathname);
  const helpSlug = HELP_BY_ROUTE[location.pathname];

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <Popover open={open && !activeTour} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Ajuda"
          data-tour="help-button"
          className="fixed bottom-[4.75rem] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-card text-primary border border-border shadow-elevated hover:scale-105 hover:shadow-glow transition-all"
        >
          <LifeBuoy className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" sideOffset={10} className="w-80 p-2">
        <p className="px-3 pt-2 pb-1 text-sm font-heading font-bold">Precisam de ajuda? 🌱</p>

        {pageTour && (
          <MenuItem
            icon={Compass}
            title="Visita guiada a esta página"
            subtitle={`${pageTour.name} · ~1 minuto`}
            onClick={() => run(() => startTour(pageTour.id))}
          />
        )}
        {pageTour?.id !== "boas-vindas" && (
          <MenuItem
            icon={Sprout}
            title="Rever a visita de boas-vindas"
            subtitle="O essencial da NexSeed, passo a passo"
            onClick={() => run(() => startTour("boas-vindas"))}
          />
        )}
        <MenuItem
          icon={BookOpen}
          title="Manual de instruções"
          subtitle={helpSlug ? "Abre na secção desta página" : "Guia completo da app"}
          onClick={() => run(() => navigate(helpSlug ? `/ajuda/${helpSlug}` : "/ajuda"))}
        />
        <MenuItem
          icon={HelpCircle}
          title="Perguntas frequentes"
          subtitle="Respostas rápidas às dúvidas comuns"
          onClick={() => run(() => navigate("/ajuda/faq"))}
        />
        <div className="my-1.5 border-t" />
        <MenuItem
          icon={MessageCircle}
          title="Falar connosco"
          subtitle="Enviem uma dúvida, ideia ou problema"
          onClick={() => run(openFeedbackDialog)}
        />
      </PopoverContent>
    </Popover>
  );
}
