// src/hooks/useCalendarData.ts
// Agrega plan items, extracurriculares e eventos manuais numa estrutura por data.
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays, startOfWeek } from 'date-fns';
import type { CalendarEvent } from '@/lib/types';

export type AggregatedEvent = {
  id: string;
  kind: 'plan' | 'extra' | 'manual';
  title: string;
  time: string | null;
  color: string;          // Tailwind bg+text classes
  date: string;           // YYYY-MM-DD
  childName?: string;
  navigateTo?: string;    // route to navigate on click
  rawEvent?: CalendarEvent; // only for kind='manual'
};

/** Returns ISO date string for a day-of-week (1=Mon..5=Fri) within the week of weekStart (Monday) */
function isoDateForDow(weekStart: Date, dow: number): string {
  return format(addDays(weekStart, dow - 1), 'yyyy-MM-dd');
}

export function useCalendarData(
  monthStart: Date,
  monthEnd: Date,
  calendarEvents: CalendarEvent[],
  children: { id: string; name: string }[]
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
        .select('id, week_start')
        .gte('week_start', format(monthStart, 'yyyy-MM-dd'))
        .lte('week_start', format(monthEnd, 'yyyy-MM-dd'));
      if (plansError) throw plansError;

      if (!plans || plans.length === 0) return [];

      const planIds = plans.map(p => p.id);
      const weekStarts = Object.fromEntries(
        plans.map(p => [p.id, new Date(p.week_start + 'T00:00:00')])
      );

      const { data: items, error: itemsError } = await supabase
        .from('weekly_plan_items')
        .select('id, plan_id, child_id, day_of_week, time_slot, discipline, title')
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

    // Plan items
    for (const item of planItems) {
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

    // Extracurriculars — expand for every week in the month
    const monthStartStr = format(monthStart, 'yyyy-MM-dd');
    const monthEndStr = format(monthEnd, 'yyyy-MM-dd');
    let cursor = startOfWeek(monthStart, { weekStartsOn: 1 });
    while (cursor <= monthEnd) {
      for (const extra of extras) {
        if (extra.day_of_week >= 1 && extra.day_of_week <= 5) {
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

    // Manual calendar events
    for (const ev of calendarEvents) {
      push(ev.date, {
        id: ev.id,
        kind: 'manual',
        title: ev.title,
        time: ev.start_time?.slice(0, 5) ?? null,
        color: 'bg-green-100 text-green-800',
        date: ev.date,
        childName: childName(ev.child_id),
        rawEvent: ev,
      });
    }

    return map;
  }, [planItems, extras, calendarEvents, children]); // eslint-disable-line react-hooks/exhaustive-deps

  return { eventsByDate };
}
