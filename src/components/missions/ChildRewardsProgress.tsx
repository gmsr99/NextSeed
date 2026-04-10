// src/components/missions/ChildRewardsProgress.tsx
import { useMissionRewards } from '@/hooks/useMissionRewards';
import { RewardCard } from './RewardCard';
import { useToast } from '@/hooks/use-toast';
import type { Child } from '@/lib/types';

interface Props { child: Child }

export function ChildRewardsProgress({ child }: Props) {
  const { rewards, getBalance, requestRedemption } = useMissionRewards();
  const { toast } = useToast();
  const balance = getBalance(child.id);
  const activeRewards = rewards.filter(r => r.is_active);

  // Recompensa mais próxima que ainda não pode alcançar
  const nearest = activeRewards
    .filter(r => balance < r.points_cost)
    .sort((a, b) => (a.points_cost - balance) - (b.points_cost - balance))[0];

  const progressPct = nearest
    ? Math.min(100, Math.round((balance / nearest.points_cost) * 100))
    : 100;

  async function handleRequest(rewardId: string) {
    const reward = activeRewards.find(r => r.id === rewardId);
    if (!reward) return;
    try {
      await requestRedemption.mutateAsync({ childId: child.id, reward });
      toast({ title: `Pedido enviado para "${reward.title}"! Os pais vão aprovar. 🎉` });
    } catch (e: unknown) {
      toast({ title: (e as Error).message, variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-4">
      {/* Saldo */}
      <div className="rounded-xl bg-primary/10 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Pontos disponíveis</p>
          <p className="text-3xl font-bold text-primary">{balance}</p>
        </div>
        {nearest && (
          <div className="text-right text-sm">
            <p className="text-muted-foreground">Próxima recompensa</p>
            <p className="font-medium">{nearest.emoji} {nearest.title}</p>
            <div className="w-32 bg-muted rounded-full h-2 mt-1">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progressPct}%</p>
          </div>
        )}
      </div>

      {activeRewards.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Os pais ainda não criaram recompensas.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeRewards.map(r => (
          <RewardCard
            key={r.id}
            reward={r}
            balance={balance}
            onRequest={() => handleRequest(r.id)}
            requesting={requestRedemption.isPending}
          />
        ))}
      </div>
    </div>
  );
}
