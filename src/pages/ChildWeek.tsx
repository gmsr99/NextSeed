// R-14 (D-028, decisão do Elton a 26 e 27 nov): a semana da criança no ecrã.
// É a mesma página do mapa em papel (R-11/R-13), aberta pelo adulto na conta
// dele, para mostrar à criança e marcar com ela. A criança não tem conta,
// login, avatar nem notificações; não há pontos, prémios, streaks nem
// percentagens. As caixas usam o mesmo "feito" que o adulto marca no Início
// (weekly_plan_items.completed_at): não se guarda nada de novo.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, getISODay } from "date-fns";
import {
  ArrowLeft, BookOpen, Calculator, Check, Leaf, MessageCircle, Palette, Pencil, Star, Trees, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/hooks/useChildren";
import { useTodayDashboard, type TodayPlanItem } from "@/hooks/useTodayDashboard";
import { DAY_LABELS, DISCIPLINE_COLORS, getWeekDates } from "@/lib/planGenerator";
import { isOptional } from "@/lib/essentialPlan";
import {
  childStage, weekHeadline, themeLine, openingPrompt, closingPrompts, childItemText,
} from "@/lib/childWeek";

const ICONS: Record<string, typeof Pencil> = {
  language: Pencil,
  math: Calculator,
  world: Leaf,
  expression: Palette,
  english: MessageCircle,
  project: Star,
  reading: BookOpen,
  world_visit: Trees,
};

function ItemButton({ item, stage, small, onToggle }: {
  item: TodayPlanItem; stage: ReturnType<typeof childStage>; small?: boolean; onToggle: (done: boolean) => void;
}) {
  const done = !!item.completed_at;
  const Icon = ICONS[item.discipline] ?? Circle;
  const color = DISCIPLINE_COLORS[item.discipline] ?? "#9CA3AF";
  return (
    <button
      type="button"
      onClick={() => onToggle(!done)}
      aria-pressed={done}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl border text-left transition-colors",
        small ? "p-2" : "p-3",
        done ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/50",
      )}
    >
      <span
        className={cn("shrink-0 rounded-lg flex items-center justify-center", stage === "pre" ? "h-11 w-11" : "h-9 w-9", small && "h-7 w-7")}
        style={{ backgroundColor: color + "33" }}
      >
        <Icon className={cn(stage === "pre" ? "h-6 w-6" : "h-5 w-5", small && "h-4 w-4")} style={{ color }} />
      </span>
      <span className={cn("flex-1 leading-snug", stage === "pre" ? "text-lg" : "text-base", small && "text-sm text-muted-foreground", done && "line-through text-muted-foreground")}>
        {childItemText(item.title, stage)}
      </span>
      <span
        className={cn(
          "shrink-0 rounded-md border-2 flex items-center justify-center",
          stage === "pre" ? "h-8 w-8" : "h-7 w-7",
          small && "h-6 w-6",
          done ? "border-primary bg-primary text-primary-foreground" : "border-foreground/40",
        )}
      >
        {done && <Check className="h-5 w-5" />}
      </span>
    </button>
  );
}

export default function ChildWeek() {
  const navigate = useNavigate();
  const { family } = useAuth();
  const { children } = useChildren();
  const { allItems, hasPlan, weekStart, toggleItemDone, isLoading } = useTodayDashboard();
  const [selected, setSelected] = useState<string | null>(null);

  // Os interesses e o tema da semana vêm do plano desta semana
  const { data: planInfo } = useQuery({
    queryKey: ["child_week_plan_info", family?.id, format(weekStart, "yyyy-MM-dd")],
    enabled: !!family?.id && hasPlan,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_plans")
        .select("child_interests, reading_theme")
        .eq("week_start", format(weekStart, "yyyy-MM-dd"))
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const withItems = useMemo(
    () => children.filter((c) => allItems.some((i) => i.child_id === c.id)),
    [children, allItems],
  );
  const child = withItems.find((c) => c.id === selected) ?? withItems[0];
  const todayDow = getISODay(new Date());
  const dates = getWeekDates(weekStart);

  if (isLoading) return <div className="p-8 text-muted-foreground">A abrir a semana…</div>;

  if (!hasPlan || !child) {
    return (
      <div className="mx-auto max-w-xl p-8 space-y-4">
        <p className="text-lg">Esta semana ainda não tem plano.</p>
        <Button variant="outline" onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
      </div>
    );
  }

  const stage = childStage(child.school_year);
  const interests = (planInfo?.child_interests as Record<string, string[]> | null)?.[child.id] ?? child.interests;
  const headline = weekHeadline(interests);
  const theme = themeLine(planInfo?.reading_theme);
  const opening = openingPrompt(stage);
  const closing = closingPrompts(stage);
  const items = allItems.filter((i) => i.child_id === child.id);
  const days = [1, 2, 3, 4, 5].filter((d) => items.some((i) => i.day_of_week === d));
  const toggle = (id: string) => (done: boolean) => toggleItemDone.mutate({ itemId: id, done });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao Início</Button>
          {withItems.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist">
              {withItems.map((c) => (
                <Button
                  key={c.id}
                  size="sm"
                  role="tab"
                  aria-selected={c.id === child.id}
                  variant={c.id === child.id ? "default" : "outline"}
                  onClick={() => setSelected(c.id)}
                >
                  {c.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        <header className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
            {headline ?? `A semana de ${child.name}`}
          </h1>
          {headline && <p className="text-muted-foreground">A semana de {child.name}</p>}
          {theme && <p className="text-lg text-foreground pt-1">{theme}</p>}
          {opening && <p className="pt-1">{opening} <span className="text-sm text-muted-foreground">(diz em voz alta ou escreve no papel)</span></p>}
        </header>

        <div className="grid gap-4 md:grid-cols-5">
          {days.map((d) => {
            const dayItems = items
              .filter((i) => i.day_of_week === d)
              .sort((a, b) => a.time_slot.localeCompare(b.time_slot));
            const core = dayItems.filter((i) => !isOptional(i));
            const extra = dayItems.filter((i) => isOptional(i));
            const dayDone = core.length > 0 && core.every((i) => i.completed_at);
            return (
              <section
                key={d}
                className={cn("rounded-2xl border p-3 space-y-2", d === todayDow ? "border-primary bg-primary/5" : "border-border")}
                aria-label={DAY_LABELS[d - 1]}
              >
                <h2 className="flex items-center justify-between font-semibold">
                  <span>{DAY_LABELS[d - 1]} {dates[d - 1].getDate()}</span>
                  {dayDone && <span className="text-sm text-primary">Dia feito 🌱</span>}
                </h2>
                {core.map((i) => <ItemButton key={i.id} item={i} stage={stage} onToggle={toggle(i.id)} />)}
                {extra.length > 0 && <p className="pt-1 text-xs text-muted-foreground">Se houver tempo</p>}
                {extra.map((i) => <ItemButton key={i.id} item={i} stage={stage} small onToggle={toggle(i.id)} />)}
              </section>
            );
          })}
        </div>

        <section className="rounded-2xl border border-border p-4 space-y-2">
          <h2 className="font-semibold text-primary">No fim da semana</h2>
          <ul className="space-y-1">
            {closing.map((c) => <li key={c} className="text-base">{c}</li>)}
          </ul>
          <p className="text-sm text-muted-foreground">Conversem sobre isto juntos, ou escrevam e desenhem no papel da semana.</p>
        </section>
      </div>
    </div>
  );
}
