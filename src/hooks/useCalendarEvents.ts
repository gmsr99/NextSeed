// src/hooks/useCalendarEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import type { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from '@/lib/types';

export function useCalendarEvents(monthStart: Date, monthEnd: Date) {
  const { family } = useAuth();
  const qc = useQueryClient();
  const cacheKey = ['calendar_events', family?.id, format(monthStart, 'yyyy-MM')];

  const { data: events = [], isLoading } = useQuery({
    queryKey: cacheKey,
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: cacheKey });

  const createEvent = useMutation({
    mutationFn: async (input: Omit<CalendarEventInsert, 'family_id'>) => {
      const { error } = await supabase
        .from('calendar_events')
        .insert({ ...input, family_id: family!.id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...patch }: CalendarEventUpdate) => {
      const { error } = await supabase
        .from('calendar_events')
        .update(patch)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { events, isLoading, createEvent, updateEvent, deleteEvent };
}
