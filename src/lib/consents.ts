// Registo de consentimentos (B-09): escrita de uma linha. Separado do hook para
// poder ser usado no AuthContext sem dependência circular.
import { supabase } from "@/lib/supabase";
import { LEGAL_VERSION } from "@/lib/legal";

export type ConsentPurpose = "termos" | "melhoria_produto";

/** Grava uma linha no registo. Devolve false se a tabela ainda não existir. */
export async function recordConsent(purpose: ConsentPurpose, granted: boolean, familyId: string | null): Promise<boolean> {
  const { error } = await supabase
    .from("user_consents")
    .insert({ purpose, granted, terms_version: LEGAL_VERSION, family_id: familyId });
  return !error;
}

/** A versão atual dos textos ainda é rascunho? Então não se pede aceitação. */
export function legalIsDraft(): boolean {
  return LEGAL_VERSION.includes("rascunho");
}
