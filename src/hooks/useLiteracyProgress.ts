// src/hooks/useLiteracyProgress.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LiteracyProgress, LiteracyStatus } from '@/lib/types';

export function useLiteracyProgress(childId: string | null, area: 'financial' | 'digital') {
  const qc = useQueryClient();
  const cacheKey = ['literacy_progress', childId, area];

  const { data: progressRecords = [], isLoading } = useQuery({
    queryKey: cacheKey,
    enabled: !!childId,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('literacy_progress')
        .select('*')
        .eq('child_id', childId!)
        .eq('area', area);
      if (error) throw error;
      return data as LiteracyProgress[];
    },
  });

  function getStatus(moduleId: string): LiteracyStatus {
    return progressRecords.find(r => r.module_id === moduleId)?.status ?? 'not_started';
  }

  function countByStatus(moduleIds: string[], status: LiteracyStatus): number {
    return moduleIds.filter(id => getStatus(id) === status).length;
  }

  function completionPct(moduleIds: string[]): number {
    if (moduleIds.length === 0) return 0;
    return Math.round((countByStatus(moduleIds, 'completed') / moduleIds.length) * 100);
  }

  const setStatus = useMutation({
    mutationFn: async ({ moduleId, status }: { moduleId: string; status: LiteracyStatus }) => {
      if (!childId) return;
      const { error } = await supabase
        .from('literacy_progress')
        .upsert(
          { child_id: childId, area, module_id: moduleId, status, updated_at: new Date().toISOString() },
          { onConflict: 'child_id,area,module_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: cacheKey }),
  });

  return { progressRecords, isLoading, getStatus, countByStatus, completionPct, setStatus };
}
