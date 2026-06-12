import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Sprout } from "lucide-react";
import { useLocation } from "react-router-dom";
import HelpLink from "@/components/HelpLink";

interface AppLayoutProps {
  children: React.ReactNode;
}

/** Mapa rota → secção do Manual, para o botão de ajuda contextual no header. */
const HELP_BY_ROUTE: Record<string, string> = {
  "/": "comecar",
  "/weekly-planner": "planeador",
  "/children": "comecar",
  "/metodologias": "metodologias",
  "/activities": "diario-portfolio",
  "/portfolio": "diario-portfolio",
  "/reports": "relatorios",
  "/roteiro-anual": "roteiro-anual",
  "/world-missions": "missoes-recompensas",
  "/settings": "familia",
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const helpSlug = HELP_BY_ROUTE[location.pathname];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <HelpLink slug={helpSlug} />
                <div className="h-8 w-8 rounded-full gradient-warmth flex items-center justify-center animate-pulse-soft">
                  <Sprout className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </header>
          <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
