// Convites de piloto por família (tabela pilot_features, migração 032).
// Uma linha (family_id, feature) abre um módulo em piloto a essa família.
// Se a tabela ainda não existir ou a leitura falhar, conta como sem convite.
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export type PilotFeature = "tradicao" | "financinhas";

export function usePilotFeature(feature: PilotFeature) {
  const { family } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["pilot-feature", family?.id, feature],
    enabled: !!family,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pilot_features").select("feature")
        .eq("family_id", family!.id).eq("feature", feature).maybeSingle();
      return !error && !!data;
    },
  });
  return { invited: data ?? false, isLoading: !!family && isLoading };
}
