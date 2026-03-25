import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, subWeeks, getISODay, format } from "date-fns";

export function useDashboard() {
  const { family } = useAuth();

  // Plano da semana actual
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const todayDow = getISODay(new Date()); // 1=Seg ... 7=Dom

  const { data: weekPlan, isLoading: planLoading } = useQuery({
    queryKey: ["dashboard-plan", family?.id, format(weekStart, "yyyy-MM-dd")],
    enabled: !!family,
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_plans")
        .select("id, week_start, status, sent_at")
        .eq("family_id", family!.id)
        .gte("week_start", format(weekStart, "yyyy-MM-dd"))
        .lte("week_start", format(weekEnd, "yyyy-MM-dd"))
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data ?? null;
    },
  });

  // Items do plano desta semana
  const { data: planItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["dashboard-items", weekPlan?.id],
    enabled: !!weekPlan?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_plan_items")
        .select("id, child_id, day_of_week, time_slot, discipline, title, is_friday_world")
        .eq("plan_id", weekPlan!.id)
        .order("day_of_week")
        .order("sort_order");
      return data ?? [];
    },
  });

  // Crianças
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["dashboard-children", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data } = await supabase
        .from("children")
        .select("id, name, school_year")
        .eq("family_id", family!.id);
      return data ?? [];
    },
  });

  // Planos anteriores (últimas 8 semanas, excluindo a actual)
  const eightWeeksAgo = format(subWeeks(weekStart, 8), "yyyy-MM-dd");
  const { data: pastPlans = [] as { id: string; week_start: string; status: string | null; sent_at: string | null; child_interests: unknown }[], isLoading: pastLoading } = useQuery({
    queryKey: ["dashboard-past-plans", family?.id, format(weekStart, "yyyy-MM-dd")],
    enabled: !!family,
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_plans")
        .select("id, week_start, status, sent_at, child_interests")
        .eq("family_id", family!.id)
        .lt("week_start", format(weekStart, "yyyy-MM-dd"))
        .gte("week_start", eightWeeksAgo)
        .order("week_start", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const totalActivities = planItems.length;
  const todayItems = planItems.filter((i) => i.day_of_week === todayDow);
  const isWeekend = todayDow >= 6;

  return {
    isLoading: planLoading || itemsLoading || childrenLoading || pastLoading,
    hasPlan: !!weekPlan,
    planStatus: weekPlan?.status ?? null,
    planSentAt: weekPlan?.sent_at ?? null,
    totalActivities,
    todayItems,
    children,
    pastPlans,
    isWeekend,
    weekStart,
    familyName: family?.name ?? "",
  };
}
