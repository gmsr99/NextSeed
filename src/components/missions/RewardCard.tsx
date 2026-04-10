// src/components/missions/RewardCard.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MissionReward } from '@/lib/types';

interface Props {
  reward: MissionReward;
  balance: number;
  onRequest: () => void;
  requesting?: boolean;
}

export function RewardCard({ reward, balance, onRequest, requesting }: Props) {
  const canAfford = balance >= reward.points_cost;
  const missing = reward.points_cost - balance;

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 transition-opacity ${!canAfford ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-3xl">{reward.emoji ?? '🎁'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{reward.title}</p>
          {reward.description && (
            <p className="text-sm text-muted-foreground truncate">{reward.description}</p>
          )}
        </div>
        <Badge variant={canAfford ? 'default' : 'secondary'}>
          {reward.points_cost} pts
        </Badge>
      </div>

      {canAfford ? (
        <Button size="sm" onClick={onRequest} disabled={requesting}>
          {requesting ? 'A pedir...' : 'Quero esta! 🎁'}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          Faltam {missing} pontos
        </p>
      )}
    </div>
  );
}
