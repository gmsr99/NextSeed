import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Family } from "@/lib/types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  family: Family | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, familyName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateFamilyName: (name: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
  reloadFamily: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
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
      return;
    }

    // Verifica se é membro convidado
    const { data: membership } = await supabase
      .from("family_members")
      .select("families(*)")
      .eq("user_id", userId)
      .maybeSingle();

    setFamily((membership?.families as Family) ?? null);
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, familyName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: familyError } = await supabase
        .from("families")
        .insert({ user_id: data.user.id, name: familyName, email });
      if (familyError) return { error: familyError.message };
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
    <AuthContext.Provider value={{ session, user, family, loading, signIn, signUp, signOut, updateFamilyName, deleteAccount, reloadFamily }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
