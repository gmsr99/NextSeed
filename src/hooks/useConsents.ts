// Consentimentos registados (B-09). Tabela user_consents (migração 028).
// Enquanto a migração não estiver aplicada, `available` fica a false e a app
// funciona como antes (o consentimento do registo continua nos metadados).
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { setAnalyticsEnabled } from "@/lib/analytics";
import { recordConsent, type ConsentPurpose } from "@/lib/consents";


interface ConsentRow {
  purpose: ConsentPurpose;
  granted: boolean;
  terms_version: string;
  created_at: string;
}

export interface ConsentState {
  available: boolean;
  /** Versão dos Termos aceite mais recentemente (null = nenhuma registada) */
  termsVersion: string | null;
  /** Eventos de uso: ligado por defeito (interesse legítimo, com oposição) */
  productImprovement: boolean;
}

/** Estado atual: a linha mais recente de cada finalidade. */
export function currentConsents(rows: ConsentRow[]): Omit<ConsentState, "available"> {
  const latest = (p: ConsentPurpose) =>
    rows.filter((r) => r.purpose === p).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const terms = latest("termos");
  const improvement = latest("melhoria_produto");
  return {
    termsVersion: terms?.granted ? terms.terms_version : null,
    productImprovement: improvement ? improvement.granted : true,
  };
}

export function useConsents() {
  const { user, family } = useAuth();
  const qc = useQueryClient();
  const key = ["consents", user?.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ConsentState> => {
      const { data: rows, error } = await supabase
        .from("user_consents")
        .select("purpose, granted, terms_version, created_at")
        .eq("user_id", user!.id);
      if (error) return { available: false, termsVersion: null, productImprovement: true };
      const state = { available: true, ...currentConsents((rows ?? []) as ConsentRow[]) };
      setAnalyticsEnabled(state.productImprovement);
      return state;
    },
  });

  const set = useMutation({
    mutationFn: async ({ purpose, granted }: { purpose: ConsentPurpose; granted: boolean }) => {
      if (!(await recordConsent(purpose, granted, family?.id ?? null))) throw new Error("Não foi possível guardar.");
      if (purpose === "melhoria_produto") setAnalyticsEnabled(granted);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { consents: data, isLoading, set };
}
