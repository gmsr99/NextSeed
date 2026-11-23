// Lembrete de domingo (DASH fase 5, migração 033). Sem linha em
// family_notification_prefs, está ligado. Se a tabela ainda não existir, o
// cartão não aparece.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function SundayReminderCard() {
  const { family } = useAuth();
  const qc = useQueryClient();
  const key = ["sunday-reminder", family?.id];

  const { data } = useQuery({
    queryKey: key,
    enabled: !!family,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_notification_prefs").select("sunday_reminder").eq("family_id", family!.id).maybeSingle();
      if (error) return null; // migração 033 por aplicar
      return { on: data ? data.sunday_reminder !== false : true };
    },
  });

  const save = useMutation({
    mutationFn: async (on: boolean) => {
      const { error } = await supabase.from("family_notification_prefs").upsert(
        { family_id: family!.id, sunday_reminder: on, updated_at: new Date().toISOString() },
        { onConflict: "family_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  if (!data) return null;
  return (
    <section className="rounded-2xl border bg-card p-6 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Lembrete de domingo</h2>
        </div>
        <Switch
          checked={data.on}
          disabled={save.isPending}
          onCheckedChange={(v) => save.mutate(v)}
          aria-label="Lembrete de domingo"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Ao domingo, às 20h, se a semana seguinte ainda não tiver plano, enviamos um email ao responsável da conta. Em semanas de pausa não enviamos.
      </p>
      {save.isError && <p className="text-sm text-destructive">Não foi possível guardar. Tenta outra vez.</p>}
    </section>
  );
}
