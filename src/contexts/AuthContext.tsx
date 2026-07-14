import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import type { Family } from "@/lib/types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  family: Family | null;
  /** Data de registo do adulto: `families.created_at` (dono) ou `family_members.joined_at` (convidado). */
  registeredAt: string | null;
  /** True se o utilizador é o dono da família (não um adulto convidado). */
  isOwner: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, familyName: string, consentedAt: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateFamilyName: (name: string) => Promise<{ error: string | null }>;
  updateOnboarding: (patch: { onboarding_step?: number; onboarding_completed_at?: string | null }) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
  reloadFamily: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [registeredAt, setRegisteredAt] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFamily = async (userId: string) => {
    // Verifica se é o dono da família
    const { data: owned } = await supabase
      .from("families")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (owned) {
      setFamily(owned as Family);
      setRegisteredAt((owned as Family).created_at ?? null);
      setIsOwner(true);
      return;
    }

    // Verifica se é membro convidado
    const { data: membership } = await supabase
      .from("family_members")
      .select("joined_at, families(*)")
      .eq("user_id", userId)
      .maybeSingle();

    setFamily((membership?.families as unknown as Family) ?? null);
    setRegisteredAt(membership?.joined_at ?? null);
    setIsOwner(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadFamily(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadFamily(session.user.id);
      } else {
        setFamily(null);
        setRegisteredAt(null);
        setIsOwner(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, familyName: string, consentedAt: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // family_name vai nos metadados: a família é criada no servidor por um
      // trigger (migração 019), não pelo cliente — funciona mesmo quando a
      // confirmação de email está ligada e signUp() não devolve sessão.
      options: { data: { consented_at: consentedAt, terms_version: "1.0", family_name: familyName } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      track("signup", {});

      // Email de boas-vindas — best-effort, nunca bloqueia o registo.
      if (data.session) {
        supabase.functions
          .invoke("send-welcome-email", { body: { familyName } })
          .catch(() => { /* silencioso: o email é secundário */ });
      }
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateFamilyName = async (name: string) => {
    if (!family) return { error: "Sem família ativa" };
    const { data, error } = await supabase
      .from("families")
      .update({ name })
      .eq("id", family.id)
      .select()
      .single();
    if (error) return { error: error.message };
    setFamily(data as Family);
    return { error: null };
  };

  const updateOnboarding = async (patch: { onboarding_step?: number; onboarding_completed_at?: string | null }) => {
    if (!family) return { error: "Sem família ativa" };
    const { data, error } = await supabase
      .from("families")
      .update(patch)
      .eq("id", family.id)
      .select()
      .single();
    if (error) return { error: error.message };
    setFamily(data as Family);
    return { error: null };
  };

  const reloadFamily = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) await loadFamily(u.id);
  };

  const deleteAccount = async () => {
    if (!family) return { error: "Sem família ativa" };
    const { error } = await supabase.from("families").delete().eq("id", family.id);
    if (error) return { error: error.message };
    await supabase.auth.signOut();
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ session, user, family, registeredAt, isOwner, loading, signIn, signUp, signOut, updateFamilyName, updateOnboarding, deleteAccount, reloadFamily }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
