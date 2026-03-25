import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const SettingsPage = () => {
  const { family, updateFamilyName, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [familyName, setFamilyName] = useState(family?.name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
