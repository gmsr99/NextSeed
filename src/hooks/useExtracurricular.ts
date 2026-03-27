/**
 * Hook partilhado para ler atividades extracurriculares da família.
 * Utilizado em WeeklyPlanner, Extracurricular e futuramente no CalendarPage.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { ExtracurricularItem } from "@/lib/types";

export function useExtracurricular() {
  const { family } = useAuth();
  const qc = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["extracurricular", family?.id],
    enabled: !!family,
    staleTime: 5 * 60 * 1000, // 5 minutos
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracurricular_activities")
        .select("id, child_id, name, type, location, day_of_week, start_time, end_time, travel_time_minutes")
        .eq("family_id", family!.id)
        .eq("is_active", true)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return (data ?? []) as ExtracurricularItem[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("extracurricular_activities")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["extracurricular", family?.id] }),
  });

  return { activities, isLoading, remove };
}
