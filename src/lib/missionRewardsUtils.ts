// src/lib/missionRewardsUtils.ts

interface EarnedRow { child_id: string; points_earned: number }
interface RedeemedRow { child_id: string; points_spent: number; status: 'pending' | 'approved' | 'rejected' }

export function computePointsBalance(
  childId: string,
  earned: EarnedRow[],
  redeemed: RedeemedRow[]
): number {
  const totalEarned = earned
    .filter(r => r.child_id === childId)
    .reduce((sum, r) => sum + r.points_earned, 0);
  const totalRedeemed = redeemed
    .filter(r => r.child_id === childId && r.status === 'approved')
    .reduce((sum, r) => sum + r.points_spent, 0);
  return totalEarned - totalRedeemed;
}
