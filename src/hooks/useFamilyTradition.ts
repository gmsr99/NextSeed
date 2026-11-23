// Tradição da família (I-08, fase 1). Tabelas family_traditions e
// pilot_features (migração 032). Em piloto: só aparece a quem tem o convite
// (pilot_features 'tradicao') ou é da equipa. Convicção religiosa é categoria
// especial: guarda-se só ao nível da família, com o consentimento, e desligar apaga.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";
import type { LiturgicalCalendar } from "@/lib/tradicao/liturgical";

/** Versão do texto do consentimento mostrado no ecrã (muda se o texto mudar). */
export const TRADITION_CONSENT_VERSION = "tradicao-1.0-2026-11-22";

export interface FamilyTradition {
  tradition: "catolica";
  calendar: LiturgicalCalendar;
  proprio_pt: boolean;
  consented_at: string;
}

type Result = { available: boolean; invited: boolean; tradition: FamilyTradition | null };

async function load(familyId: string): Promise<Result> {
  const [t, p] = await Promise.all([
    supabase.from("family_traditions").select("tradition, calendar, proprio_pt, consented_at").eq("family_id", familyId).maybeSingle(),
    supabase.from("pilot_features").select("feature").eq("family_id", familyId).eq("feature", "tradicao").maybeSingle(),
  ]);
  if (t.error) return { available: false, invited: false, tradition: null };
  const row = t.data;
  return {
    available: true,
    invited: !p.error && !!p.data,
    tradition: row
      ? { tradition: "catolica", calendar: row.calendar === "tradicional" ? "tradicional" : "atual", proprio_pt: !!row.proprio_pt, consented_at: row.consented_at }
      : null,
  };
}

/** Para usar fora de componentes (geração do plano e PDF). */
export async function fetchFamilyTradition(familyId: string): Promise<FamilyTradition | null> {
  return (await load(familyId)).tradition;
}

export function useFamilyTradition() {
  const { family } = useAuth();
  const { isAdmin } = useIsTeamAdmin();
  const qc = useQueryClient();
  const key = ["family-tradition", family?.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!family,
    staleTime: 5 * 60 * 1000,
    queryFn: () => load(family!.id),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const save = useMutation({
    mutationFn: async (t: { calendar: LiturgicalCalendar; proprio_pt: boolean }) => {
      const { error } = await supabase.from("family_traditions").upsert(
        {
          family_id: family!.id, tradition: "catolica", calendar: t.calendar, proprio_pt: t.proprio_pt,
          consent_version: TRADITION_CONSENT_VERSION, consented_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
        { onConflict: "family_id" },
      );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Desligar apaga a escolha e o registo do consentimento
  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("family_traditions").delete().eq("family_id", family!.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    tradition: data?.tradition ?? null,
    available: !!data?.available,
    /** Pode ver a opção: convidada para o piloto, da equipa, ou já a tem ligada */
    canSee: !!data?.available && (!!data?.invited || isAdmin || !!data?.tradition),
    /** Convidada para o piloto (sem contar a equipa) */
    invited: !!data?.invited,
    isLoading,
    save,
    remove,
  };
}
