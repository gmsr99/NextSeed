import {
  Home,
  BookOpen,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  FlaskConical,
  FolderKanban,
  Sparkles,
  FileImage,
  Globe,
  CalendarCheck,
  LogOut,
  BookHeart,
  Map,
  LifeBuoy,
  MessageSquareText,
} from "lucide-react";
import { useMemo } from "react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import NexSeedLogo from "@/components/NexSeedLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  disabled?: boolean;
  badge?: string;
};

// ─── Grupos de navegação ──────────────────────────────────────────────────────

const planearItems: NavItem[] = [
  { title: "Dashboard",         url: "/",               icon: Home },
  { title: "Planeador Semanal", url: "/weekly-planner", icon: CalendarCheck },
  { title: "Agenda",            url: "/calendar",        icon: CalendarDays },
];

const aprenderItems: NavItem[] = [
  { title: "Áreas de Aprendizagem", url: "/learning-areas",     icon: BookOpen },
  { title: "Projetos",              url: "/projects",            icon: FolderKanban },
  { title: "Ideias Rápidas",        url: "/creative-engine",     icon: Sparkles },
  { title: "Missões do Mundo",      url: "/world-missions",      icon: Globe },
];

const registarItems: NavItem[] = [
  { title: "Diário",     url: "/activities", icon: FlaskConical },
  { title: "Portfólio",  url: "/portfolio",  icon: FileImage },
  { title: "Relatórios", url: "/reports",    icon: BarChart3 },
];

const sistemaItems: NavItem[] = [
  { title: "Crianças",        url: "/children",       icon: Users },
  { title: "Metodologias",    url: "/metodologias",   icon: BookHeart },
  { title: "Currículo Anual", url: "/roteiro-anual",  icon: Map },
  { title: "Ajuda / Manual",  url: "/ajuda",          icon: LifeBuoy },
  { title: "Definições",      url: "/settings",       icon: Settings },
];

// Só visível a membros da equipa (team_admins). A página tem o seu próprio
// guard — isto apenas evita que o link apareça a quem não pode lá entrar.
const adminItems: NavItem[] = [
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquareText, badge: "Admin" },
];

// ─── Grupos com label ─────────────────────────────────────────────────────────
// tourId liga cada grupo aos passos da visita de boas-vindas (lib/tours.ts).
const navGroups = [
  { label: "Planear",           items: planearItems,  tourId: "nav-planear" },
  { label: "Aprender",          items: aprenderItems, tourId: "nav-aprender" },
  { label: "Registar & Provar", items: registarItems, tourId: "nav-registar" },
  { label: "Sistema",           items: sistemaItems,  tourId: "nav-sistema" },
];

// ─── Item renderer ────────────────────────────────────────────────────────────
function NavItem({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  if (item.disabled) {
    return (
      <div className="rounded-lg px-3 py-2 flex items-center gap-2 text-sidebar-foreground/25 cursor-default select-none">
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && (
          <span className="flex-1 truncate">{item.title}</span>
        )}
      </div>
    );
  }

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={item.badge ? `${item.title} (${item.badge})` : item.title}
    >
      <NavLink
        to={item.url}
        end
        className="rounded-lg px-3 py-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
        activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="truncate">{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto shrink-0 rounded border border-sidebar-primary/30 bg-sidebar-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-primary">
            {item.badge}
          </span>
        )}
      </NavLink>
    </SidebarMenuButton>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function AppSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar?.state === "collapsed";
  const location = useLocation();
  const { family, signOut } = useAuth();
  const { isAdmin } = useIsTeamAdmin();

  const groups = useMemo(
    () =>
      navGroups.map((group) =>
        group.label === "Sistema" && isAdmin
          ? { ...group, items: [...group.items, ...adminItems] }
          : group,
      ),
    [isAdmin],
  );

  const isActive = (url: string) =>
    url === "/"
      ? location.pathname === "/"
      : location.pathname === url || location.pathname.startsWith(url + "/");

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} gradient-sidebar border-r-0`}
      collapsible="icon"
    >
      <div className="p-4 pb-2">
        <NexSeedLogo collapsed={collapsed} />
      </div>

      <SidebarContent className="px-2">
        {groups.map(({ label, items, tourId }) => (
          <SidebarGroup key={label} data-tour={tourId}>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider font-semibold mb-1">
              {!collapsed && label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavItem item={item} collapsed={collapsed} isActive={isActive(item.url)} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User area */}
      <div className="p-3 mt-auto">
        <div className="rounded-xl bg-sidebar-accent/60 p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full gradient-warmth flex items-center justify-center text-xs font-bold text-white shrink-0">
              {family?.name?.slice(0, 2).toUpperCase() ?? "NX"}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {family?.name ?? "NexSeed"}
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
