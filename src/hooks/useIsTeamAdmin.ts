import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Verifica se o utilizador atual é membro da equipa (team_admins).
// Usa a RLS de team_admins (SELECT só das próprias linhas).
export function useIsTeamAdmin() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["is-team-admin", user?.id],
    enabled: !!user,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("team_admins")
        .select("user_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });
  return { isAdmin: data ?? false, isLoading };
}
