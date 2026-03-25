import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Activity } from "@/lib/types";

export type { Activity };

export interface CreateActivityInput {
  child_id: string;
  title: string;
  description?: string;
  discipline?: string;
  activity_date: string;
  photoFiles?: File[];
}

export function useActivities() {
  const { family } = useAuth();
  const qc = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("family_id", family!.id)
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false });
      return (data ?? []) as Activity[];
    },
  });

  const createActivity = useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      if (!family) throw new Error("Sem família");

      const activityId = crypto.randomUUID();
      const photoUrls: string[] = [];

      if (input.photoFiles?.length) {
        for (const file of input.photoFiles) {
          const path = `${family.id}/${activityId}/${crypto.randomUUID()}-${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from("activity-photos")
            .upload(path, file, { upsert: false });
          if (uploadErr) throw uploadErr;
          const { data: { publicUrl } } = supabase.storage
            .from("activity-photos")
            .getPublicUrl(path);
          photoUrls.push(publicUrl);
        }
      }

      const { error } = await supabase.from("activities").insert({
        id: activityId,
        family_id: family.id,
        child_id: input.child_id,
        title: input.title,
        description: input.description || null,
        discipline: input.discipline || null,
        activity_date: input.activity_date,
        photos: photoUrls,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities", family?.id] });
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities", family?.id] });
    },
  });

  return { activities, isLoading, createActivity, deleteActivity };
}
