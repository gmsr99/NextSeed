// src/hooks/useTodayDashboard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek, format, getISODay, addWeeks } from 'date-fns';

export interface TodayPlanItem {
  id: string;
  child_id: string;
  day_of_week: number;
  time_slot: string;
  discipline: string;
  title: string;
  is_friday_world: boolean;
  completed_at: string | null;
}

export function useTodayDashboard() {
  const { family } = useAuth();
  const qc = useQueryClient();
  const today = new Date();
  const todayDow = getISODay(today); // 1=Mon ... 7=Sun
  const isWeekend = todayDow >= 6;
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(weekStart, 1);

  const planQueryKey = ['today_plan', family?.id, format(weekStart, 'yyyy-MM-dd')];

  // ── Plano ativo desta semana ────────────────────────────────────
  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: planQueryKey,
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: plan } = await supabase
        .from('weekly_plans')
        .select('id, week_start, status, sent_at')
        .gte('week_start', format(weekStart, 'yyyy-MM-dd'))
        .lte('week_start', format(weekEnd, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan) return { plan: null, todayItems: [] as TodayPlanItem[], allItems: [] as TodayPlanItem[] };

      const { data: items } = await supabase
        .from('weekly_plan_items')
        .select('id, child_id, day_of_week, time_slot, discipline, title, is_friday_world, completed_at')
        .eq('plan_id', plan.id)
        .order('time_slot', { ascending: true });

      const allItems = (items ?? []) as TodayPlanItem[];
      const todayItems = allItems.filter(i => i.day_of_week === todayDow);
      return { plan, todayItems, allItems };
    },
  });

  // ── Conclusão de um item (checkbox do dashboard) ─────────────────
  const toggleItemDone = useMutation({
    mutationFn: async ({ itemId, done }: { itemId: string; done: boolean }) => {
      const { error } = await supabase
        .from('weekly_plan_items')
        .update({ completed_at: done ? new Date().toISOString() : null })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: planQueryKey }),
  });

  // ── Já existe plano para a próxima semana? (CTA de sexta-feira) ──
  const { data: nextWeekPlanned = true } = useQuery({
    queryKey: ['next_week_plan', family?.id, format(nextWeekStart, 'yyyy-MM-dd')],
    enabled: !!family?.id && todayDow >= 5,
    staleTime: 60_000,
    queryFn: async () => {
      const { count } = await supabase
        .from('weekly_plans')
        .select('id', { count: 'exact', head: true })
        .eq('week_start', format(nextWeekStart, 'yyyy-MM-dd'));
      return (count ?? 0) > 0;
    },
  });

  // ── Atividades registadas esta semana ───────────────────────────
  const { data: weekActivities = [] } = useQuery({
    queryKey: ['week_activities', family?.id, format(weekStart, 'yyyy-MM-dd')],
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('activities')
        .select('id, discipline, title, child_id, activity_date')
        .gte('activity_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('activity_date', format(weekEnd, 'yyyy-MM-dd'));
      return data ?? [];
    },
  });

  // ── Crianças ────────────────────────────────────────────────────
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['children', family?.id],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('children')
        .select('id, name, school_year, birth_date')
        .order('name');
      return data ?? [];
    },
  });

  // ── Próximos extracurriculares (hoje e restante semana) ─────────
  const { data: upcomingExtras = [] } = useQuery({
    queryKey: ['upcoming_extras', family?.id, format(weekStart, 'yyyy-MM-dd'), todayDow],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('extracurricular_activities')
        .select('id, name, type, day_of_week, start_time, child_id')
        .eq('is_active', true)
        .gte('day_of_week', todayDow)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);
      return data ?? [];
    },
  });

  const totalPlannedWeek = planData?.allItems.length ?? 0;
  const totalRegistered = weekActivities.length;

  // CTA contextual: a partir de sexta-feira, sem plano para a próxima semana
  const showNextWeekCta = todayDow >= 5 && !nextWeekPlanned;

  return {
    isLoading: planLoading || childrenLoading,
    hasPlan: !!planData?.plan,
    todayItems: planData?.todayItems ?? [],
    totalRegistered,
    totalPlannedWeek,
    children,
    upcomingExtras,
    isWeekend,
    familyName: family?.name ?? '',
    toggleItemDone,
    showNextWeekCta,
  };
}
