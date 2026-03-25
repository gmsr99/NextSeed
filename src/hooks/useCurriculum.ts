import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CurriculumDiscipline {
  id: string;
  school_year: string;
  discipline_key: string;
  discipline_name: string;
  weekly_minutes: number | null;
  objectives: string[];
}

export function useCurriculum(schoolYear: string | null | undefined) {
  const { data: disciplines = [], isLoading } = useQuery({
    queryKey: ["curriculum", schoolYear],
    enabled: !!schoolYear,
    staleTime: 24 * 60 * 60 * 1000, // static data — cache 24h
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_disciplines")
        .select("*")
        .eq("school_year", schoolYear!)
        .order("discipline_key");
      if (error) throw error;
      return (data ?? []) as CurriculumDiscipline[];
    },
  });

  return { disciplines, isLoading };
}
