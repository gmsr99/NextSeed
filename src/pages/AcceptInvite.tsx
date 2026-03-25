import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Leaf, CheckCircle2 } from "lucide-react";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const { reloadFamily } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [invalidInvite, setInvalidInvite] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // onAuthStateChange detecta automaticamente o token no hash da URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        setSession(s);
        setInitializing(false);
      }
    });

    // Verificar se já existe sessão
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
      }
      // Dar tempo ao onAuthStateChange para processar o hash
      setTimeout(() => setInitializing(false), 1500);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Após inicialização, se não há sessão, o link é inválido/expirado
  useEffect(() => {
    if (!initializing && !session) {
      setInvalidInvite(true);
    }
  }, [initializing, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    if (password.length < 8) {
      setError("A password deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As passwords não coincidem.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Define a password
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;

      // 2. Associa à família via RPC (usa o family_id dos metadados do convite)
      const familyId = session.user.user_metadata?.family_id as string | undefined;
      if (!familyId) throw new Error("Metadados do convite inválidos. Contacta o administrador.");

      const { error: rpcErr } = await supabase.rpc("accept_family_invite", {
        p_family_id: familyId,
      });
      if (rpcErr) throw rpcErr;

      // 3. Recarrega a família no contexto de autenticação
      await reloadFamily();

      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocorreu um erro. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // A carregar
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Link inválido ou expirado
  if (invalidInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-heading font-bold">Link inválido ou expirado</h1>
          <p className="text-muted-foreground text-sm">
            Este link de convite já não é válido. Pede ao administrador da família que envie um novo convite.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  // Sucesso
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-xl font-heading font-bold">Bem-vindo(a) à família!</h1>
          <p className="text-muted-foreground text-sm">A redirecionar…</p>
        </div>
      </div>
    );
  }

  // Formulário de criação de password
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold">NexSeed</h1>
          <p className="text-muted-foreground text-sm">
            Foste convidado(a) para a família. Cria a tua password para entrar.
          </p>
          <p className="text-xs text-muted-foreground font-medium">{session.user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Nova password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="confirm">
              Confirmar password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(null); }}
              placeholder="Repete a password"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !password || !confirm}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> A criar conta…
              </span>
            ) : (
              "Criar conta e entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
