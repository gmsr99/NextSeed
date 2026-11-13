// Calendário da família (P-24). Tabela family_calendars (migração 027).
// Sem linha (ou sem a tabela), a app usa o calendário escolar oficial.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { CalendarBreak, FamilyCalendar } from "@/lib/annualPlan";
import type { Json } from "@/lib/types";

type Result = { available: boolean; calendar: FamilyCalendar | null };

async function load(familyId: string): Promise<Result> {
  const { data, error } = await supabase
    .from("family_calendars")
    .select("year_start, year_end, breaks, review_weeks")
    .eq("family_id", familyId)
    .maybeSingle();
  if (error) return { available: false, calendar: null };
  if (!data) return { available: true, calendar: null };
  return {
    available: true,
    calendar: {
      year_start: data.year_start,
      year_end: data.year_end,
      breaks: Array.isArray(data.breaks) ? (data.breaks as unknown as CalendarBreak[]) : [],
      review_weeks: data.review_weeks,
    },
  };
}

/** Para usar fora de componentes (geração do plano). */
export async function fetchFamilyCalendar(familyId: string): Promise<FamilyCalendar | null> {
  return (await load(familyId)).calendar;
}

export function useFamilyCalendar() {
  const { family } = useAuth();
  const qc = useQueryClient();
  const key = ["family-calendar", family?.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!family,
    staleTime: 5 * 60 * 1000,
    queryFn: () => load(family!.id),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const save = useMutation({
    mutationFn: async (cal: FamilyCalendar) => {
      const { error } = await supabase.from("family_calendars").upsert(
        { ...cal, breaks: cal.breaks as unknown as Json, family_id: family!.id, updated_at: new Date().toISOString() },
        { onConflict: "family_id" },
      );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reset = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("family_calendars").delete().eq("family_id", family!.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { calendar: data?.calendar ?? null, available: !!data?.available, isLoading, save, reset };
}
