import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Mail, X, Loader2, UserPlus, Crown } from "lucide-react";

type Member = { id: string; user_id: string; email: string; joined_at: string };
type Invite = { id: string; email: string; created_at: string };

const SettingsPage = () => {
  const { family, user, updateFamilyName, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === family?.user_id;

  const [familyName, setFamilyName] = useState(family?.name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Membros ativos
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // Convites pendentes
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);

  const loadMembers = async () => {
    if (!family) { setMembersLoading(false); return; }
    const { data } = await supabase
      .from("family_members")
      .select("id, user_id, email, joined_at")
      .eq("family_id", family.id)
      .order("joined_at");
    setMembers((data as Member[]) ?? []);
    setMembersLoading(false);
  };

  const loadPendingInvites = async () => {
    if (!family) return;
    const { data } = await supabase
      .from("family_invites")
      .select("id, email, created_at")
      .eq("family_id", family.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPendingInvites((data as Invite[]) ?? []);
  };

  useEffect(() => {
    loadMembers();
    loadPendingInvites();
  }, [family]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(false);
    const { data: inviteResult, error } = await supabase.functions.invoke("invite-family-member", {
      body: { email: inviteEmail.trim().toLowerCase() },
    });
    if (error || inviteResult?.error) {
      setInviteError(inviteResult?.error ?? error?.message ?? "Erro ao enviar convite.");
    } else {
      setInviteSuccess(true);
      setInviteEmail("");
      await loadPendingInvites();
    }
    setInviteLoading(false);
  };

  const handleRevokeInvite = async (id: string) => {
    await supabase.from("family_invites").delete().eq("id", id);
    setPendingInvites((prev) => prev.filter((i) => i.id !== id));
  };

  const handleRemoveMember = async (userId: string) => {
    const { error } = await supabase.rpc("remove_family_member", { p_user_id: userId });
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    setNameLoading(true);
    setNameError(null);
    setNameSuccess(false);
    const { error } = await updateFamilyName(familyName.trim());
    setNameLoading(false);
    if (error) setNameError(error);
    else setNameSuccess(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError(error);
      setDeleteLoading(false);
    } else {
      navigate("/login");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Definições</h1>
          <p className="text-muted-foreground mt-1">Configurar preferências da conta.</p>
        </div>

        {/* Perfil da família */}
        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Perfil da família</h2>
          <form onSubmit={handleUpdateName} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="familyName">
                Nome da família
              </label>
              <input
                id="familyName"
                type="text"
                value={familyName}
                onChange={(e) => { setFamilyName(e.target.value); setNameSuccess(false); }}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
            {nameSuccess && <p className="text-sm text-green-600">Nome atualizado.</p>}
            <button
              type="submit"
              disabled={nameLoading || !familyName.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {nameLoading ? "A guardar…" : "Guardar"}
            </button>
          </form>
        </section>

        {/* Membros da família */}
        <section className="rounded-2xl border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Membros da família</h2>
          </div>

          {/* Lista de membros ativos */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Membros ativos</p>

            {/* Owner (sempre primeiro) */}
            <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span className="font-medium">{family?.email}</span>
              <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                <Crown className="h-3 w-3" /> Responsável
              </span>
            </div>

            {/* Membros convidados */}
            {membersLoading ? (
              <div className="flex items-center gap-2 py-1">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">A carregar…</span>
              </div>
            ) : members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span className="font-medium">{m.email}</span>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors"
                    title="Remover membro"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Convidar novo membro (só owner) */}
          {isOwner && (
            <div className="space-y-3 pt-1 border-t">
              <p className="text-sm text-muted-foreground pt-1">
                Convida outro adulto para aceder à plataforma com a sua própria conta.
              </p>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteSuccess(false); setInviteError(null); }}
                  placeholder="email@exemplo.com"
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={inviteLoading || !inviteEmail.trim()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
                >
                  {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Convidar
                </button>
              </form>
              {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
              {inviteSuccess && <p className="text-sm text-green-600">Convite enviado com sucesso!</p>}

              {/* Convites pendentes */}
              {pendingInvites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Convites pendentes</p>
                  {pendingInvites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{inv.email}</span>
                      <button
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors"
                        title="Revogar convite"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Conta */}
        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Conta</h2>
          <div className="space-y-3">
            <button
              onClick={signOut}
              className="w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors text-left"
            >
              Sair da conta
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors text-left"
              >
                Apagar conta
              </button>
            ) : (
              <div className="rounded-lg border border-destructive/40 p-4 space-y-3">
                <p className="text-sm text-destructive font-medium">
                  Tens a certeza? Esta ação é irreversível e apaga todos os dados da família.
                </p>
                {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                  >
                    {deleteLoading ? "A apagar…" : "Confirmar"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
