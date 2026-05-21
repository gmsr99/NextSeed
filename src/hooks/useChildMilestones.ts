import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Milestone {
  id: string;
  family_id: string;
  child_id: string;
  date: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  category: string;
  created_at: string;
}

export interface CreateMilestoneInput {
  child_id: string;
  date: string;
  title: string;
  description?: string;
  category?: string;
}

export const MILESTONE_CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: "motor", label: "Motor", emoji: "🏃" },
  { key: "linguagem", label: "Linguagem", emoji: "💬" },
  { key: "social", label: "Social", emoji: "🤝" },
  { key: "cognitivo", label: "Cognitivo", emoji: "🧠" },
  { key: "geral", label: "Geral", emoji: "⭐" },
];

export function useChildMilestones(childId?: string) {
  const { family } = useAuth();
  const qc = useQueryClient();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ["child_milestones", family?.id, childId],
    enabled: !!family,
    queryFn: async () => {
      let query = supabase
        .from("child_milestones")
        .select("*")
        .eq("family_id", family!.id)
        .order("date", { ascending: false });

      if (childId && childId !== "all") {
        query = query.eq("child_id", childId);
      }

      const { data } = await query;
      return (data ?? []) as Milestone[];
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (input: CreateMilestoneInput) => {
      if (!family) throw new Error("Sem família");
      const { data, error } = await supabase
        .from("child_milestones")
        .insert({
          family_id: family.id,
          child_id: input.child_id,
          date: input.date,
          title: input.title,
          description: input.description || null,
          category: input.category ?? "geral",
        })
        .select()
        .single();
      if (error) throw error;
      return data as Milestone;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["child_milestones", family?.id] });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("child_milestones")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["child_milestones", family?.id] });
    },
  });

  return { milestones, isLoading, createMilestone, deleteMilestone };
}
