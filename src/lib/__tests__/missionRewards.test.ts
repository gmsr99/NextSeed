import { describe, it, expect } from 'vitest';
import { computePointsBalance } from '../missionRewardsUtils';

describe('computePointsBalance', () => {
  it('returns total earned minus approved redeemed', () => {
    const earned = [
      { child_id: 'c1', points_earned: 50 },
      { child_id: 'c1', points_earned: 30 },
      { child_id: 'c2', points_earned: 100 },
    ];
    const redeemed = [
      { child_id: 'c1', points_spent: 20, status: 'approved' as const },
      { child_id: 'c1', points_spent: 10, status: 'pending' as const },
    ];
    expect(computePointsBalance('c1', earned, redeemed)).toBe(60); // 80 - 20
    expect(computePointsBalance('c2', earned, redeemed)).toBe(100);
  });

  it('returns 0 for child with no completions', () => {
    expect(computePointsBalance('c99', [], [])).toBe(0);
  });
});
