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
  Coins,
  Monitor,
  FileImage,
  MessagesSquare,
  MessageCircle,
  HeartHandshake,
  Globe,
  CalendarCheck,
  LogOut,
  Trophy,
  BookHeart,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import NexSeedLogo from "@/components/NexSeedLogo";
import { useAuth } from "@/contexts/AuthContext";
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
};

// ─── Grupos de navegação ──────────────────────────────────────────────────────

const planearItems: NavItem[] = [
  { title: "Dashboard",         url: "/",               icon: Home },
  { title: "Planeador Semanal", url: "/weekly-planner", icon: CalendarCheck },
  { title: "Agenda",            url: "/calendar",        icon: CalendarDays },
  { title: "Crianças",          url: "/children",        icon: Users },
  { title: "Metodologias",      url: "/metodologias",    icon: BookHeart },
];

const aprenderItems: NavItem[] = [
  { title: "Áreas de Aprendizagem", url: "/learning-areas",  icon: BookOpen },
  { title: "Motor Criativo",        url: "/creative-engine", icon: Sparkles },
  { title: "Projetos",              url: "/projects",         icon: FolderKanban },
  { title: "Diário",                url: "/activities",       icon: FlaskConical },
  { title: "Portfólio",             url: "/portfolio",        icon: FileImage },
  { title: "Relatórios",            url: "/reports",          icon: BarChart3 },
];

const explorarItems: NavItem[] = [
  { title: "Missões do Mundo",     url: "/world-missions",     icon: Globe },
  { title: "Extracurriculares",    url: "/extracurricular",    icon: Trophy },
  { title: "Literacia Financeira", url: "/financial-literacy", icon: Coins },
  { title: "Literacia Digital",    url: "/digital-literacy",   icon: Monitor },
];

const comunidadeItems: NavItem[] = [
  { title: "Formação para Pais", url: "/parent-training", icon: HeartHandshake, disabled: true },
  { title: "Comunidade",         url: "/community",        icon: MessagesSquare, disabled: true },
  { title: "Fórum",              url: "/forum",            icon: MessageCircle,  disabled: true },
];

const sistemaItems: NavItem[] = [
  { title: "Definições", url: "/settings", icon: Settings },
];

// ─── Grupos com label ─────────────────────────────────────────────────────────
const navGroups = [
  { label: "Planear",     items: planearItems },
  { label: "Aprender",    items: aprenderItems },
  { label: "Explorar",    items: explorarItems },
  { label: "Comunidade",  items: comunidadeItems },
  { label: "Sistema",     items: sistemaItems },
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
    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
      <NavLink
        to={item.url}
        end
        className="rounded-lg px-3 py-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
        activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="truncate">{item.title}</span>}
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

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} gradient-sidebar border-r-0`}
      collapsible="icon"
    >
      <div className="p-4 pb-2">
        <NexSeedLogo collapsed={collapsed} />
      </div>

      <SidebarContent className="px-2">
        {navGroups.map(({ label, items }) => (
          <SidebarGroup key={label}>
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
