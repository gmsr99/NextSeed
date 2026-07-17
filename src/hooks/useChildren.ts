import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { removePhotos } from "@/lib/photoStorage";
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

  const deleteChild = useMutation({
    mutationFn: async (id: string) => {
      // O cascade da BD apaga as linhas das atividades mas não os ficheiros:
      // recolhemos os paths antes, para que as fotos do menor não sobrevivam
      // ao perfil.
      const { data: acts, error: photosError } = await supabase
        .from("activities")
        .select("photos")
        .eq("child_id", id);
      if (photosError) throw photosError;
      const photos = (acts ?? []).flatMap((a) => a.photos ?? []);

      const { error } = await supabase.from("children").delete().eq("id", id);
      if (error) throw error;

      await removePhotos(photos);
    },
    onSuccess: () => {
      // As tabelas dependentes têm FK on delete cascade/set null,
      // por isso invalidamos tudo o que possa referir a criança.
      queryClient.invalidateQueries();
    },
  });

  return { children, isLoading, createChild, updateChild, deleteChild };
}
