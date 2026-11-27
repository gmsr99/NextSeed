// src/hooks/useCalendarData.ts
// Agrega plan items, extracurriculares e eventos manuais numa estrutura por data.
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays, startOfWeek } from 'date-fns';
import type { CalendarEvent } from '@/lib/types';
import { isOutingPlanItem, isValidDow, latestPlans, outingEntriesFromPlan } from '@/lib/familyAgenda';

export type AggregatedEvent = {
  id: string;
  kind: 'plan' | 'extra' | 'manual' | 'outing';
  title: string;
  time: string | null;
  color: string;          // Tailwind bg+text classes
  date: string;           // YYYY-MM-DD
  childName?: string;
  navigateTo?: string;    // route to navigate on click
  rawEvent?: CalendarEvent; // only for kind='manual'
};

/** Returns ISO date string for a day-of-week (1=Mon..7=Sun) within the week of weekStart (Monday) */
function isoDateForDow(weekStart: Date, dow: number): string {
  return format(addDays(weekStart, dow - 1), 'yyyy-MM-dd');
}

const NO_LINKS: Record<string, { kind: string; status: string }> = {};

export function useCalendarData(
  monthStart: Date,
  monthEnd: Date,
  calendarEvents: CalendarEvent[],
  children: { id: string; name: string }[],
  /** Estado dos eventos da comunidade juntados à agenda (I-03a): tipo e se foram cancelados. */
  linked: Record<string, { kind: string; status: string }> = NO_LINKS
) {
  const { family } = useAuth();

  const childName = (id: string | null) => id ? (children.find(c => c.id === id)?.name) : undefined;

  // ── Plan items for the month ────────────────────────────────────
  const { data: planItems = [] } = useQuery({
    queryKey: ['calendar_plan_items', family?.id, format(monthStart, 'yyyy-MM')],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: plans, error: plansError } = await supabase
        .from('weekly_plans')
        .select('id, week_start, version')
        .gte('week_start', format(addDays(monthStart, -6), 'yyyy-MM-dd'))
        .lte('week_start', format(monthEnd, 'yyyy-MM-dd'));
      if (plansError) throw plansError;

      if (!plans || plans.length === 0) return [];

      // Desde a 003 pode haver várias versões por semana: só a mais recente
      const latest = latestPlans(plans);
      const planIds = latest.map(p => p.id);
      const weekStarts = Object.fromEntries(
        latest.map(p => [p.id, new Date(p.week_start + 'T00:00:00')])
      );

      const { data: items, error: itemsError } = await supabase
        .from('weekly_plan_items')
        .select('id, plan_id, child_id, day_of_week, time_slot, discipline, title, is_friday_world')
        .in('plan_id', planIds);
      if (itemsError) throw itemsError;

      return (items ?? []).map(item => ({
        ...item,
        date: isoDateForDow(weekStarts[item.plan_id], item.day_of_week),
      }));
    },
  });

  // ── Active extracurriculars (recurring by day_of_week) ──────────
  const { data: extras = [] } = useQuery({
    queryKey: ['calendar_extras', family?.id],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('extracurricular_activities')
        .select('id, name, type, day_of_week, start_time, child_id')
        .eq('family_id', family!.id)
        .eq('is_active', true);
      return data ?? [];
    },
  });

  // ── Build aggregated map: date → AggregatedEvent[] ──────────────
  const eventsByDate = useMemo(() => {
    const map: Record<string, AggregatedEvent[]> = {};

    function push(date: string, ev: AggregatedEvent) {
      if (!map[date]) map[date] = [];
      map[date].push(ev);
    }

    const monthStartStr = format(monthStart, 'yyyy-MM-dd');
    const monthEndStr = format(monthEnd, 'yyyy-MM-dd');

    // Plan items. As saídas (Ver Mundo e outras) entram à parte, uma vez por dia:
    // só existem nas semanas em que o plano as tem.
    const inMonth = planItems.filter(item => item.date >= monthStartStr && item.date <= monthEndStr);
    for (const o of outingEntriesFromPlan(inMonth)) {
      push(o.date, {
        id: `outing-${o.date}-${o.title}`,
        kind: 'outing',
        title: o.title,
        time: null,
        color: 'bg-violet-100 text-violet-800',
        date: o.date,
        navigateTo: '/weekly-planner',
      });
    }
    for (const item of inMonth) {
      if (isOutingPlanItem(item)) continue;
      push(item.date, {
        id: item.id,
        kind: 'plan',
        title: item.title,
        time: item.time_slot ?? null,
        color: 'bg-blue-100 text-blue-800',
        date: item.date,
        childName: childName(item.child_id ?? null),
        navigateTo: '/weekly-planner',
      });
    }

    // Extracurriculars — repetidas em todas as semanas do mês (fins de semana incluídos)
    let cursor = startOfWeek(monthStart, { weekStartsOn: 1 });
    while (cursor <= monthEnd) {
      for (const extra of extras) {
        if (isValidDow(extra.day_of_week)) {
          const date = isoDateForDow(cursor, extra.day_of_week);
          if (date >= monthStartStr && date <= monthEndStr) {
            push(date, {
              id: `${extra.id}-${date}`,
              kind: 'extra',
              title: extra.name,
              time: extra.start_time?.slice(0, 5) ?? null,
              color: 'bg-orange-100 text-orange-800',
              date,
              childName: childName(extra.child_id ?? null),
              navigateTo: '/extracurricular',
            });
          }
        }
      }
      cursor = addDays(cursor, 7);
    }

    // Manual calendar events (os juntados da Agenda da comunidade levam a cor do tipo)
    for (const ev of calendarEvents) {
      const link = ev.community_event_id ? linked[ev.community_event_id] : undefined;
      const color = !ev.community_event_id
        ? 'bg-green-100 text-green-800'
        : link?.kind === 'encontro'
          ? 'bg-rose-100 text-rose-800'
          : 'bg-teal-100 text-teal-800';
      push(ev.date, {
        id: ev.id,
        kind: 'manual',
        title: link?.status === 'cancelado' ? `${ev.title} (cancelado)` : ev.title,
        time: ev.start_time?.slice(0, 5) ?? null,
        color: link?.status === 'cancelado' ? `${color} line-through opacity-70` : color,
        date: ev.date,
        childName: childName(ev.child_id),
        rawEvent: ev,
      });
    }

    return map;
  }, [planItems, extras, calendarEvents, children, linked, monthStart, monthEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  return { eventsByDate };
}
