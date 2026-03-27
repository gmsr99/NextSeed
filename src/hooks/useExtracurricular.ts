/**
 * Hook partilhado para ler e gerir atividades extracurriculares da família.
 * Utilizado em WeeklyPlanner, Extracurricular, SchedulePDF e CalendarPage.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { ExtracurricularActivity } from "@/lib/types";

export function useExtracurricular() {
  const { family } = useAuth();
  const qc = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["extracurricular", family?.id],
    enabled: !!family,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extracurricular_activities")
        .select("*")
        .eq("family_id", family!.id)
        .eq("is_active", true)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return (data ?? []) as ExtracurricularActivity[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["extracurricular", family?.id] });

  const create = useMutation({
    mutationFn: async (payload: Omit<ExtracurricularActivity, "id" | "created_at" | "is_active">) => {
      const { error } = await supabase.from("extracurricular_activities").insert({ ...payload, is_active: true });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<ExtracurricularActivity> & { id: string }) => {
      const { error } = await supabase.from("extracurricular_activities").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("extracurricular_activities")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { activities, isLoading, create, update, remove };
}
