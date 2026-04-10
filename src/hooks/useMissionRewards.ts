// src/hooks/useMissionRewards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { computePointsBalance } from '@/lib/missionRewardsUtils';
import type { MissionReward, MissionRewardInsert, RewardRedemption, RewardRedemptionInsert } from '@/lib/types';

export function useMissionRewards() {
  const { family } = useAuth();
  const qc = useQueryClient();

  // ── Recompensas definidas pela família ──────────────────────────
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['mission_rewards', family?.id],
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mission_rewards')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as MissionReward[];
    },
  });

  // ── Todos os resgates da família ────────────────────────────────
  const { data: redemptions = [], isLoading: redemptionsLoading } = useQuery({
    queryKey: ['reward_redemptions', family?.id],
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select('*')
        .order('requested_at', { ascending: false });
      if (error) throw error;
      return data as RewardRedemption[];
    },
  });

  // ── Pontos ganhos por todas as crianças ─────────────────────────
  const { data: completions = [] } = useQuery({
    queryKey: ['mission_completions_all', family?.id],
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mission_completions')
        .select('child_id, points_earned');
      if (error) throw error;
      return data as { child_id: string; points_earned: number }[];
    },
  });

  // ── Saldo por criança ───────────────────────────────────────────
  function getBalance(childId: string): number {
    return computePointsBalance(childId, completions, redemptions);
  }

  function getPendingRedemptions(childId?: string): RewardRedemption[] {
    return redemptions.filter(
      r => r.status === 'pending' && (childId ? r.child_id === childId : true)
    );
  }

  // ── Mutations ───────────────────────────────────────────────────
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['mission_rewards'] });
    qc.invalidateQueries({ queryKey: ['reward_redemptions'] });
  };

  const createReward = useMutation({
    mutationFn: async (input: Omit<MissionRewardInsert, 'family_id'>) => {
      const { error } = await supabase
        .from('mission_rewards')
        .insert({ ...input, family_id: family!.id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateReward = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<MissionReward> & { id: string }) => {
      const { error } = await supabase
        .from('mission_rewards')
        .update(patch)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteReward = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mission_rewards')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const requestRedemption = useMutation({
    mutationFn: async ({ childId, reward }: { childId: string; reward: MissionReward }) => {
      const balance = getBalance(childId);
      if (balance < reward.points_cost) throw new Error('Pontos insuficientes');
      const insert: RewardRedemptionInsert = {
        child_id: childId,
        reward_id: reward.id,
        points_spent: reward.points_cost,
        status: 'pending',
        notes: null,
      };
      const { error } = await supabase
        .from('reward_redemptions')
        .insert(insert);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const resolveRedemption = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: 'approved' | 'rejected'; notes?: string }) => {
      const { error } = await supabase
        .from('reward_redemptions')
        .update({ status, resolved_at: new Date().toISOString(), notes: notes ?? null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    rewards,
    redemptions,
    rewardsLoading,
    redemptionsLoading,
    getBalance,
    getPendingRedemptions,
    createReward,
    updateReward,
    deleteReward,
    requestRedemption,
    resolveRedemption,
  };
}
