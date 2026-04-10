// src/components/missions/RedemptionRequests.tsx
import { useMissionRewards } from '@/hooks/useMissionRewards';
import { useChildren } from '@/hooks/useChildren';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export function RedemptionRequests() {
  const { redemptions, rewards, resolveRedemption, getPendingRedemptions } = useMissionRewards();
  const { children } = useChildren();
  const { toast } = useToast();
  const pending = getPendingRedemptions();

  function childName(childId: string) {
    return children.find(c => c.id === childId)?.name ?? 'Criança';
  }
  function rewardTitle(rewardId: string) {
    const r = rewards.find(r => r.id === rewardId);
    return r ? `${r.emoji ?? '🎁'} ${r.title}` : 'Recompensa';
  }

  async function handle(id: string, status: 'approved' | 'rejected') {
    await resolveRedemption.mutateAsync({ id, status });
    toast({ title: status === 'approved' ? 'Aprovado! 🎉' : 'Rejeitado.' });
  }

  if (pending.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Não há pedidos pendentes.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Pedidos pendentes</h3>
      {pending.map(r => (
        <div key={r.id} className="border rounded-lg p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{childName(r.child_id)} quer {rewardTitle(r.reward_id)}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(r.requested_at), "d 'de' MMMM", { locale: pt })} · {r.points_spent} pts
            </p>
          </div>
          <Button size="icon" variant="ghost" className="text-green-600" onClick={() => handle(r.id, 'approved')} disabled={resolveRedemption.isPending}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handle(r.id, 'rejected')} disabled={resolveRedemption.isPending}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}

      {redemptions.filter(r => r.status !== 'pending').length > 0 && (
        <>
          <h3 className="font-semibold pt-2">Histórico</h3>
          {redemptions.filter(r => r.status !== 'pending').slice(0, 10).map(r => (
            <div key={r.id} className="border rounded-lg p-3 flex items-center gap-3 opacity-70">
              <div className="flex-1 min-w-0">
                <p className="text-sm">{childName(r.child_id)} — {rewardTitle(r.reward_id)}</p>
                <p className="text-xs text-muted-foreground">{r.points_spent} pts</p>
              </div>
              <Badge variant={r.status === 'approved' ? 'default' : 'secondary'}>
                {r.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
              </Badge>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
