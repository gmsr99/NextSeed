import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Child } from "@/lib/types";

type NewChild = Omit<Child, "id" | "created_at" | "updated_at">;

export function useChildren() {
  const queryClient = useQueryClient();

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["children"] }),
  });

  return { children, isLoading, createChild };
}
