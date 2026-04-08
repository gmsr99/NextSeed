import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Child } from "@/lib/types";

type NewChild = Omit<Child, "id" | "created_at" | "updated_at">;
type UpdateChild = Partial<Omit<Child, "id" | "created_at" | "updated_at" | "family_id">> & { id: string };

export function useChildren() {
  const queryClient = useQueryClient();
  const { family } = useAuth();

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("family_id", family!.id)  // defesa extra além do RLS
        .order("created_at");
      if (error) throw error;
      return data as Child[];
    },
  });

  const createChild = useMutation({
    mutationFn: async (input: NewChild) => {
      const { data, error } = await supabase
        .from("children")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Child;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["children", family?.id] }),
  });

  const updateChild = useMutation({
    mutationFn: async ({ id, ...input }: UpdateChild) => {
      const { data, error } = await supabase
        .from("children")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Child;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["children", family?.id] }),
  });

  return { children, isLoading, createChild, updateChild };
}
