# Loop Diário — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a NexSeed indispensável no dia-a-dia: Dashboard com plano do dia, Calendário familiar operacional, sistema de Recompensas para Missões, e Literacia Financeira/Digital com progresso real por criança.

**Architecture:** Três migrações novas (calendar_events, mission_rewards/redemptions, literacy_progress) com hooks React Query dedicados. Cada feature é independente. Ordem: migrações → recompensas → dashboard → calendário → literacia.

**Tech Stack:** React 18, TypeScript, Supabase (PostgreSQL + RLS), TanStack React Query v5, Tailwind CSS, shadcn/ui, Framer Motion, Vitest.

**CRÍTICO — não tocar:** `src/lib/geminiPlanner.ts`, `src/lib/planGenerator.ts`, edge functions existentes, migrações 001–008.

---

## Ficheiros criados/modificados

| Acção | Ficheiro |
|-------|---------|
| Criar | `supabase/migrations/009_calendar_events.sql` |
| Criar | `supabase/migrations/010_mission_rewards.sql` |
| Criar | `supabase/migrations/011_literacy_progress.sql` |
| Modificar | `src/lib/types.ts` — adicionar tipos novos |
| Criar | `src/hooks/useMissionRewards.ts` |
| Criar | `src/lib/__tests__/missionRewards.test.ts` |
| Criar | `src/components/missions/RewardCard.tsx` |
| Criar | `src/components/missions/RewardsManager.tsx` |
| Criar | `src/components/missions/ChildRewardsProgress.tsx` |
| Criar | `src/components/missions/RedemptionRequests.tsx` |
| Modificar | `src/pages/WorldMissions.tsx` — adicionar tab Recompensas |
| Criar | `src/hooks/useTodayDashboard.ts` |
| Modificar | `src/pages/Index.tsx` — novo layout diário |
| Eliminar | `src/hooks/useDashboard.ts` |
| Criar | `src/hooks/useCalendarEvents.ts` |
| Criar | `src/hooks/useCalendarData.ts` |
| Criar | `src/components/calendar/MonthView.tsx` |
| Criar | `src/components/calendar/DayPanel.tsx` |
| Criar | `src/components/calendar/EventForm.tsx` |
| Modificar | `src/pages/CalendarPage.tsx` — adicionar mês view + eventos manuais |
| Criar | `src/hooks/useLiteracyProgress.ts` |
| Criar | `src/lib/literacyContent.ts` |
| Modificar | `src/pages/FinancialLiteracy.tsx` |
| Modificar | `src/pages/DigitalLiteracy.tsx` |
| Modificar | `src/pages/Reports.tsx` — secção Literacia |
| Modificar | `src/components/AppSidebar.tsx` — remover `disabled` em Literacia |

---

## Task 1: Migrações da Base de Dados

**Files:**
- Create: `supabase/migrations/009_calendar_events.sql`
- Create: `supabase/migrations/010_mission_rewards.sql`
- Create: `supabase/migrations/011_literacy_progress.sql`

- [ ] **Step 1.1: Criar migration 009**

```sql
-- supabase/migrations/009_calendar_events.sql
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid references children(id) on delete set null,
  title text not null,
  date date not null,
  start_time time,
  end_time time,
  notes text,
  type text not null default 'evento',
  created_at timestamptz not null default now()
);

alter table calendar_events enable row level security;

create policy "family_calendar_events" on calendar_events
  using (family_id = my_family_id())
  with check (family_id = my_family_id());

create index on calendar_events (family_id, date);
```

- [ ] **Step 1.2: Criar migration 010**

```sql
-- supabase/migrations/010_mission_rewards.sql
create table if not exists mission_rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  description text,
  points_cost integer not null check (points_cost > 0),
  emoji text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table mission_rewards enable row level security;

create policy "family_mission_rewards" on mission_rewards
  using (family_id = my_family_id())
  with check (family_id = my_family_id());

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  reward_id uuid not null references mission_rewards(id) on delete cascade,
  points_spent integer not null check (points_spent > 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes text
);

alter table reward_redemptions enable row level security;

create policy "family_reward_redemptions" on reward_redemptions
  using (
    child_id in (select id from children where family_id = my_family_id())
  )
  with check (
    child_id in (select id from children where family_id = my_family_id())
  );

create index on reward_redemptions (child_id, status);
```

- [ ] **Step 1.3: Criar migration 011**

```sql
-- supabase/migrations/011_literacy_progress.sql
create table if not exists literacy_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  area text not null check (area in ('financial', 'digital')),
  module_id text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  unique (child_id, area, module_id)
);

alter table literacy_progress enable row level security;

create policy "family_literacy_progress" on literacy_progress
  using (
    child_id in (select id from children where family_id = my_family_id())
  )
  with check (
    child_id in (select id from children where family_id = my_family_id())
  );

create index on literacy_progress (child_id, area);
```

- [ ] **Step 1.4: Aplicar as três migrações via Supabase MCP**

Usar a ferramenta `mcp__965fa5e8-1b98-47d6-950b-a68e45458028__apply_migration` para cada uma, pela ordem 009 → 010 → 011. O `project_id` é `lqznbdfgyeikeepxgeoo`.

- [ ] **Step 1.5: Verificar tabelas criadas**

Usar `mcp__965fa5e8-1b98-47d6-950b-a68e45458028__list_tables` e confirmar que `calendar_events`, `mission_rewards`, `reward_redemptions`, `literacy_progress` aparecem.

- [ ] **Step 1.6: Commit**

```bash
git add supabase/migrations/009_calendar_events.sql \
        supabase/migrations/010_mission_rewards.sql \
        supabase/migrations/011_literacy_progress.sql
git commit -m "feat: add calendar_events, mission_rewards, literacy_progress migrations"
```

---

## Task 2: Tipos TypeScript para Tabelas Novas

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 2.1: Adicionar interfaces no fim de `src/lib/types.ts`**

Ler o ficheiro primeiro. Depois adicionar no fim (antes do último `export`  se houver, senão mesmo no fim):

```typescript
// ─── Calendar Events ───────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  family_id: string;
  child_id: string | null;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  end_time: string | null;
  notes: string | null;
  type: 'consulta' | 'saida' | 'visita' | 'evento';
  created_at: string;
}

export type CalendarEventInsert = Omit<CalendarEvent, 'id' | 'created_at'>;
export type CalendarEventUpdate = Partial<CalendarEventInsert> & { id: string };

// ─── Mission Rewards ───────────────────────────────────────────────
export interface MissionReward {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  points_cost: number;
  emoji: string | null;
  is_active: boolean;
  created_at: string;
}

export type MissionRewardInsert = Omit<MissionReward, 'id' | 'created_at'>;

export interface RewardRedemption {
  id: string;
  child_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  resolved_at: string | null;
  notes: string | null;
}

// ─── Literacy Progress ─────────────────────────────────────────────
export interface LiteracyProgress {
  id: string;
  child_id: string;
  area: 'financial' | 'digital';
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  updated_at: string;
}

export type LiteracyStatus = 'not_started' | 'in_progress' | 'completed';
```

- [ ] **Step 2.2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add TypeScript types for calendar_events, mission_rewards, literacy_progress"
```

---

## Task 3: Hook `useMissionRewards`

**Files:**
- Create: `src/hooks/useMissionRewards.ts`
- Create: `src/lib/__tests__/missionRewards.test.ts`

- [ ] **Step 3.1: Escrever teste para a função pura de saldo**

```typescript
// src/lib/__tests__/missionRewards.test.ts
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
```

- [ ] **Step 3.2: Correr teste — deve falhar**

```bash
cd "/Users/gmsr44/Desktop/Outros Projetos/NexSeed/V2/.claude/worktrees/reverent-newton"
npx vitest run src/lib/__tests__/missionRewards.test.ts
```
Esperado: FAIL — `Cannot find module '../missionRewardsUtils'`

- [ ] **Step 3.3: Criar `src/lib/missionRewardsUtils.ts`**

```typescript
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
```

- [ ] **Step 3.4: Correr teste — deve passar**

```bash
npx vitest run src/lib/__tests__/missionRewards.test.ts
```
Esperado: PASS ✓ 2 tests

- [ ] **Step 3.5: Criar `src/hooks/useMissionRewards.ts`**

```typescript
// src/hooks/useMissionRewards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { computePointsBalance } from '@/lib/missionRewardsUtils';
import type { MissionReward, MissionRewardInsert, RewardRedemption } from '@/lib/types';

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
      const { error } = await supabase
        .from('reward_redemptions')
        .insert({ child_id: childId, reward_id: reward.id, points_spent: reward.points_cost, status: 'pending' });
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
```

- [ ] **Step 3.6: Commit**

```bash
git add src/lib/missionRewardsUtils.ts \
        src/lib/__tests__/missionRewards.test.ts \
        src/hooks/useMissionRewards.ts
git commit -m "feat: add useMissionRewards hook and computePointsBalance utility"
```

---

## Task 4: Componentes de Recompensas

**Files:**
- Create: `src/components/missions/RewardCard.tsx`
- Create: `src/components/missions/RewardsManager.tsx`
- Create: `src/components/missions/ChildRewardsProgress.tsx`
- Create: `src/components/missions/RedemptionRequests.tsx`

- [ ] **Step 4.1: Criar `RewardCard.tsx`**

```tsx
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
```

- [ ] **Step 4.2: Criar `RewardsManager.tsx`**

```tsx
// src/components/missions/RewardsManager.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus } from 'lucide-react';
import { useMissionRewards } from '@/hooks/useMissionRewards';
import { useToast } from '@/hooks/use-toast';
import type { MissionReward } from '@/lib/types';

export function RewardsManager() {
  const { rewards, createReward, updateReward, deleteReward } = useMissionRewards();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', emoji: '', points_cost: '', description: '' });

  async function handleCreate() {
    const cost = parseInt(form.points_cost);
    if (!form.title.trim() || isNaN(cost) || cost <= 0) {
      toast({ title: 'Preenche o título e os pontos', variant: 'destructive' });
      return;
    }
    await createReward.mutateAsync({
      title: form.title.trim(),
      emoji: form.emoji.trim() || null,
      points_cost: cost,
      description: form.description.trim() || null,
      is_active: true,
    });
    setForm({ title: '', emoji: '', points_cost: '', description: '' });
    setShowForm(false);
    toast({ title: 'Recompensa criada!' });
  }

  async function handleToggle(r: MissionReward) {
    await updateReward.mutateAsync({ id: r.id, is_active: !r.is_active });
  }

  async function handleDelete(id: string) {
    await deleteReward.mutateAsync(id);
    toast({ title: 'Recompensa eliminada' });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Recompensas disponíveis</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4 mr-1" /> Nova recompensa
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input placeholder="Chupa-chupa" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Emoji</Label>
              <Input placeholder="🍭" value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Pontos necessários *</Label>
              <Input type="number" min={1} placeholder="50" value={form.points_cost} onChange={e => setForm(p => ({ ...p, points_cost: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input placeholder="Opcional" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleCreate} disabled={createReward.isPending}>
              {createReward.isPending ? 'A criar...' : 'Criar'}
            </Button>
          </div>
        </div>
      )}

      {rewards.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Ainda não tens recompensas. Cria uma para motivar as tuas crianças!
        </p>
      )}

      <div className="space-y-2">
        {rewards.map(r => (
          <div key={r.id} className="flex items-center gap-3 border rounded-lg p-3">
            <span className="text-xl">{r.emoji ?? '🎁'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.points_cost} pontos</p>
            </div>
            <Switch checked={r.is_active} onCheckedChange={() => handleToggle(r)} />
            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4.3: Criar `ChildRewardsProgress.tsx`**

```tsx
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
```

- [ ] **Step 4.4: Criar `RedemptionRequests.tsx`**

```tsx
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
```

- [ ] **Step 4.5: Commit**

```bash
git add src/components/missions/
git commit -m "feat: add rewards UI components (RewardCard, RewardsManager, ChildRewardsProgress, RedemptionRequests)"
```

---

## Task 5: Tab de Recompensas em WorldMissions

**Files:**
- Modify: `src/pages/WorldMissions.tsx`

- [ ] **Step 5.1: Ler o ficheiro actual**

Ler `src/pages/WorldMissions.tsx` completo para perceber a estrutura de tabs existente.

- [ ] **Step 5.2: Adicionar imports no topo do ficheiro**

Após os imports existentes, adicionar:

```tsx
import { RewardsManager } from '@/components/missions/RewardsManager';
import { ChildRewardsProgress } from '@/components/missions/ChildRewardsProgress';
import { RedemptionRequests } from '@/components/missions/RedemptionRequests';
```

- [ ] **Step 5.3: Adicionar tab "Recompensas" ao TabsList**

Localizar o `<TabsList>` existente e adicionar um novo `<TabsTrigger>` no fim:

```tsx
<TabsTrigger value="recompensas">🎁 Recompensas</TabsTrigger>
```

- [ ] **Step 5.4: Adicionar conteúdo da tab Recompensas**

Após o último `</TabsContent>` existente, antes do `</Tabs>`, adicionar:

```tsx
<TabsContent value="recompensas" className="space-y-6">
  {/* Gestão de recompensas (vista pais) */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <RewardsManager />
      <RedemptionRequests />
    </div>
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Progresso por criança</h3>
      {children.map(child => (
        <div key={child.id} className="border rounded-xl p-4 space-y-2">
          <p className="font-medium">{child.name}</p>
          <ChildRewardsProgress child={child} />
        </div>
      ))}
    </div>
  </div>
</TabsContent>
```

Nota: `children` já está disponível via `useChildren()` no componente existente.

- [ ] **Step 5.5: Testar manualmente**

Abrir `/world-missions`, confirmar que a tab "🎁 Recompensas" aparece e que:
- `RewardsManager` renderiza sem erros
- `RedemptionRequests` mostra "Não há pedidos pendentes"
- `ChildRewardsProgress` mostra saldo de pontos por criança

- [ ] **Step 5.6: Commit**

```bash
git add src/pages/WorldMissions.tsx
git commit -m "feat: add Rewards tab to World Missions with full redemption flow"
```

---

## Task 6: Hook `useTodayDashboard`

**Files:**
- Create: `src/hooks/useTodayDashboard.ts`
- Delete: `src/hooks/useDashboard.ts` (após confirmar que não é importado noutros sítios além de Index.tsx)

- [ ] **Step 6.1: Verificar que `useDashboard` só é usado em Index.tsx**

```bash
grep -r "useDashboard" /Users/gmsr44/Desktop/Outros\ Projetos/NexSeed/V2/.claude/worktrees/reverent-newton/src
```
Esperado: apenas `src/pages/Index.tsx` e `src/hooks/useDashboard.ts`.

- [ ] **Step 6.2: Criar `src/hooks/useTodayDashboard.ts`**

```typescript
// src/hooks/useTodayDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek, format, getISODay } from 'date-fns';

export function useTodayDashboard() {
  const { family } = useAuth();
  const today = new Date();
  const todayDow = getISODay(today); // 1=Mon ... 7=Sun
  const isWeekend = todayDow >= 6;
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // ── Plano ativo desta semana ────────────────────────────────────
  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['today_plan', family?.id, format(weekStart, 'yyyy-MM-dd')],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: plan } = await supabase
        .from('weekly_plans')
        .select('id, week_start, status, sent_at')
        .gte('week_start', format(weekStart, 'yyyy-MM-dd'))
        .lte('week_start', format(weekEnd, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan) return { plan: null, todayItems: [], allItems: [] };

      const { data: items } = await supabase
        .from('weekly_plan_items')
        .select('id, child_id, day_of_week, time_slot, discipline, title, is_friday_world')
        .eq('plan_id', plan.id)
        .order('time_slot', { ascending: true });

      const allItems = items ?? [];
      const todayItems = allItems.filter(i => i.day_of_week === todayDow);
      return { plan, todayItems, allItems };
    },
  });

  // ── Atividades registadas esta semana ───────────────────────────
  const { data: weekActivities = [] } = useQuery({
    queryKey: ['week_activities', family?.id, format(weekStart, 'yyyy-MM-dd')],
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('activities')
        .select('id, discipline, title, child_id, activity_date')
        .gte('activity_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('activity_date', format(weekEnd, 'yyyy-MM-dd'));
      return data ?? [];
    },
  });

  // ── Crianças ────────────────────────────────────────────────────
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['children', family?.id],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('children')
        .select('id, name, school_year')
        .order('name');
      return data ?? [];
    },
  });

  // ── Próximos extracurriculares (hoje e restante semana) ─────────
  const { data: upcomingExtras = [] } = useQuery({
    queryKey: ['upcoming_extras', family?.id, todayDow],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('extracurricular_activities')
        .select('id, name, type, day_of_week, start_time, child_id')
        .eq('is_active', true)
        .gte('day_of_week', todayDow)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);
      return data ?? [];
    },
  });

  // ── Pontos por criança (para missões) ───────────────────────────
  const { data: missionPoints = [] } = useQuery({
    queryKey: ['mission_points_summary', family?.id],
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('mission_completions')
        .select('child_id, points_earned');
      return data ?? [];
    },
  });

  const { data: approvedRedemptions = [] } = useQuery({
    queryKey: ['approved_redemptions', family?.id],
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('reward_redemptions')
        .select('child_id, points_spent')
        .eq('status', 'approved');
      return data ?? [];
    },
  });

  function getPointsBalance(childId: string) {
    const earned = missionPoints
      .filter(r => r.child_id === childId)
      .reduce((s, r) => s + r.points_earned, 0);
    const spent = approvedRedemptions
      .filter(r => r.child_id === childId)
      .reduce((s, r) => s + r.points_spent, 0);
    return earned - spent;
  }

  const totalPlanned = planData?.allItems.filter(i => i.day_of_week === todayDow).length ?? 0;
  const totalRegistered = weekActivities.length;

  return {
    isLoading: planLoading || childrenLoading,
    hasPlan: !!planData?.plan,
    planStatus: planData?.plan?.status ?? null,
    todayItems: planData?.todayItems ?? [],
    totalPlanned,
    totalRegistered,
    totalPlannedWeek: planData?.allItems.length ?? 0,
    children,
    upcomingExtras,
    getPointsBalance,
    isWeekend,
    weekStart,
    familyName: family?.name ?? '',
  };
}
```

- [ ] **Step 6.3: Commit**

```bash
git add src/hooks/useTodayDashboard.ts
git commit -m "feat: add useTodayDashboard hook"
```

---

## Task 7: Novo Dashboard (Index.tsx)

**Files:**
- Modify: `src/pages/Index.tsx`
- Delete: `src/hooks/useDashboard.ts`

- [ ] **Step 7.1: Ler Index.tsx actual**

Ler `src/pages/Index.tsx` completo.

- [ ] **Step 7.2: Substituir Index.tsx pelo novo layout**

```tsx
// src/pages/Index.tsx
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { CalendarCheck, Plus, ArrowRight, Trophy, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/AppLayout';
import { useTodayDashboard } from '@/hooks/useTodayDashboard';
import { useMissionRewards } from '@/hooks/useMissionRewards';

const DISCIPLINE_COLORS: Record<string, string> = {
  'Português': 'bg-blue-100 text-blue-800',
  'Matemática': 'bg-purple-100 text-purple-800',
  'Estudo do Meio': 'bg-green-100 text-green-800',
  'Inglês': 'bg-yellow-100 text-yellow-800',
  'Ed. Artística': 'bg-pink-100 text-pink-800',
  'Ed. Física': 'bg-orange-100 text-orange-800',
  'Cidadania': 'bg-teal-100 text-teal-800',
};
function disciplineColor(d: string) {
  return DISCIPLINE_COLORS[d] ?? 'bg-gray-100 text-gray-800';
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

export default function Index() {
  const navigate = useNavigate();
  const {
    isLoading, hasPlan, todayItems, totalRegistered, totalPlannedWeek,
    children, upcomingExtras, getPointsBalance, isWeekend, weekStart, familyName,
  } = useTodayDashboard();
  const { rewards } = useMissionRewards();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">A carregar...</div>
      </AppLayout>
    );
  }

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: pt });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-2xl font-bold">{greeting()}, família {familyName}! 🌱</h1>
          <p className="text-muted-foreground capitalize">{todayLabel}</p>
        </motion.div>

        {/* Bloco 1 — Hoje */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" /> Hoje
            </h2>
            {hasPlan && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/weekly-planner')}>
                Ver plano completo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {!hasPlan ? (
            <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-3">
              <p className="text-muted-foreground">Não há plano para esta semana.</p>
              <Button onClick={() => navigate('/weekly-planner')}>
                <Plus className="w-4 h-4 mr-2" /> Gerar plano semanal
              </Button>
            </div>
          ) : isWeekend ? (
            <div className="border rounded-xl p-4 bg-muted/30 text-center text-muted-foreground">
              É fim de semana! Aproveita o descanso. 🌿
            </div>
          ) : todayItems.length === 0 ? (
            <div className="border rounded-xl p-4 text-center text-muted-foreground">
              Sem atividades planeadas para hoje.
            </div>
          ) : (
            <div className="space-y-2">
              {todayItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 border rounded-xl p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-16 text-xs text-muted-foreground text-center font-mono shrink-0">
                    {item.time_slot}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.discipline && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${disciplineColor(item.discipline)}`}>
                        {item.discipline}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => navigate('/activities')}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Registar
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Bloco 2 — Missões ativas */}
        {children.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Missões
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/world-missions')}>
                Ver missões <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {children.map(child => {
                const balance = getPointsBalance(child.id);
                const nearest = rewards
                  .filter(r => r.is_active && balance < r.points_cost)
                  .sort((a, b) => (a.points_cost - balance) - (b.points_cost - balance))[0];
                const pct = nearest ? Math.min(100, Math.round((balance / nearest.points_cost) * 100)) : 100;
                return (
                  <div key={child.id} className="border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{child.name}</p>
                      <Badge variant="secondary">{balance} pts</Badge>
                    </div>
                    {nearest ? (
                      <>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {nearest.emoji} {nearest.title} — faltam {nearest.points_cost - balance} pts
                        </p>
                      </>
                    ) : rewards.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        <button className="underline" onClick={() => navigate('/world-missions')}>Cria uma recompensa</button> para motivar!
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 font-medium">🎉 Pode resgatar recompensas!</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bloco 3 — Esta semana */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Esta semana
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{totalRegistered}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {hasPlan ? `de ${totalPlannedWeek} atividades` : 'atividades registadas'}
              </p>
            </div>
            {upcomingExtras.length > 0 && (
              <div className="border rounded-xl p-4 col-span-1 sm:col-span-2 space-y-1">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Próximos extracurriculares
                </p>
                {upcomingExtras.slice(0, 3).map(e => (
                  <p key={e.id} className="text-xs text-muted-foreground">{e.name} — {e.start_time?.slice(0, 5)}</p>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Ações rápidas */}
        <section className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/activities')}>
            <Plus className="w-4 h-4 mr-1" /> Registar atividade
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/calendar')}>
            Ver agenda
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/portfolio')}>
            Ver portfólio
          </Button>
        </section>

      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 7.3: Eliminar `useDashboard.ts`**

```bash
rm "/Users/gmsr44/Desktop/Outros Projetos/NexSeed/V2/.claude/worktrees/reverent-newton/src/hooks/useDashboard.ts"
```

- [ ] **Step 7.4: Verificar que a app compila sem erros**

```bash
cd "/Users/gmsr44/Desktop/Outros Projetos/NexSeed/V2/.claude/worktrees/reverent-newton"
npx tsc --noEmit
```
Esperado: sem erros TypeScript.

- [ ] **Step 7.5: Commit**

```bash
git add src/pages/Index.tsx
git rm src/hooks/useDashboard.ts
git commit -m "feat: redesign Dashboard as daily command center"
```

---

## Task 8: Hook `useCalendarEvents`

**Files:**
- Create: `src/hooks/useCalendarEvents.ts`
- Create: `src/hooks/useCalendarData.ts`

- [ ] **Step 8.1: Criar `src/hooks/useCalendarEvents.ts`**

```typescript
// src/hooks/useCalendarEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import type { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from '@/lib/types';

export function useCalendarEvents(monthStart: Date, monthEnd: Date) {
  const { family } = useAuth();
  const qc = useQueryClient();
  const cacheKey = ['calendar_events', family?.id, format(monthStart, 'yyyy-MM')];

  const { data: events = [], isLoading } = useQuery({
    queryKey: cacheKey,
    enabled: !!family?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: cacheKey });

  const createEvent = useMutation({
    mutationFn: async (input: Omit<CalendarEventInsert, 'family_id'>) => {
      const { error } = await supabase
        .from('calendar_events')
        .insert({ ...input, family_id: family!.id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...patch }: CalendarEventUpdate) => {
      const { error } = await supabase
        .from('calendar_events')
        .update(patch)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { events, isLoading, createEvent, updateEvent, deleteEvent };
}
```

- [ ] **Step 8.2: Criar `src/hooks/useCalendarData.ts`**

```typescript
// src/hooks/useCalendarData.ts
// Agrega plan items, extracurriculares e eventos manuais numa estrutura por data.
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays, startOfWeek, getISODay } from 'date-fns';
import type { CalendarEvent } from '@/lib/types';

export type AggregatedEvent = {
  id: string;
  kind: 'plan' | 'extra' | 'manual';
  title: string;
  time: string | null;
  color: string;          // Tailwind bg class
  date: string;           // YYYY-MM-DD
  childName?: string;
  navigateTo?: string;    // route to navigate on click
  rawEvent?: CalendarEvent; // only for kind='manual'
};

/** Returns ISO date string for a day-of-week (1=Mon..7=Sun) within the week of `weekStart` */
function isoDateForDow(weekStart: Date, dow: number): string {
  // weekStart is Monday; dow 1=Mon, 2=Tue, ...
  return format(addDays(weekStart, dow - 1), 'yyyy-MM-dd');
}

export function useCalendarData(
  monthStart: Date,
  monthEnd: Date,
  calendarEvents: CalendarEvent[],
  children: { id: string; name: string }[]
) {
  const { family } = useAuth();

  const childName = (id: string) => children.find(c => c.id === id)?.name;

  // ── Plan items for the month ────────────────────────────────────
  const { data: planItems = [] } = useQuery({
    queryKey: ['calendar_plan_items', family?.id, format(monthStart, 'yyyy-MM')],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      // Get all plans whose week_start falls within the month window
      const { data: plans } = await supabase
        .from('weekly_plans')
        .select('id, week_start')
        .gte('week_start', format(monthStart, 'yyyy-MM-dd'))
        .lte('week_start', format(monthEnd, 'yyyy-MM-dd'));

      if (!plans || plans.length === 0) return [];

      const planIds = plans.map(p => p.id);
      const weekStarts = Object.fromEntries(plans.map(p => [p.id, new Date(p.week_start + 'T00:00:00')]));

      const { data: items } = await supabase
        .from('weekly_plan_items')
        .select('id, plan_id, child_id, day_of_week, time_slot, discipline, title')
        .in('plan_id', planIds);

      return (items ?? []).map(item => ({
        ...item,
        date: isoDateForDow(weekStarts[item.plan_id], item.day_of_week),
      }));
    },
  });

  // ── Active extracurriculars (recurring by day_of_week) ──────────
  const { data: extras = [] } = useQuery({
    queryKey: ['calendar_extras', family?.id],
    enabled: !!family?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('extracurricular_activities')
        .select('id, name, type, day_of_week, start_time, child_id')
        .eq('is_active', true);
      return data ?? [];
    },
  });

  // ── Build aggregated map: date → AggregatedEvent[] ──────────────
  const eventsByDate: Record<string, AggregatedEvent[]> = {};

  function push(date: string, ev: AggregatedEvent) {
    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date].push(ev);
  }

  // Plan items
  for (const item of planItems) {
    push(item.date, {
      id: item.id,
      kind: 'plan',
      title: item.title,
      time: item.time_slot ?? null,
      color: 'bg-blue-100 text-blue-800',
      date: item.date,
      childName: item.child_id ? childName(item.child_id) : undefined,
      navigateTo: '/weekly-planner',
    });
  }

  // Extracurriculars — expand for every week in the month
  let cursor = startOfWeek(monthStart, { weekStartsOn: 1 });
  while (cursor <= monthEnd) {
    for (const extra of extras) {
      if (extra.day_of_week >= 1 && extra.day_of_week <= 5) {
        const date = isoDateForDow(cursor, extra.day_of_week);
        if (date >= format(monthStart, 'yyyy-MM-dd') && date <= format(monthEnd, 'yyyy-MM-dd')) {
          push(date, {
            id: `${extra.id}-${date}`,
            kind: 'extra',
            title: extra.name,
            time: extra.start_time?.slice(0, 5) ?? null,
            color: 'bg-orange-100 text-orange-800',
            date,
            childName: extra.child_id ? childName(extra.child_id) : undefined,
            navigateTo: '/extracurricular',
          });
        }
      }
    }
    cursor = addDays(cursor, 7);
  }

  // Manual calendar events
  for (const ev of calendarEvents) {
    push(ev.date, {
      id: ev.id,
      kind: 'manual',
      title: ev.title,
      time: ev.start_time?.slice(0, 5) ?? null,
      color: 'bg-green-100 text-green-800',
      date: ev.date,
      childName: ev.child_id ? childName(ev.child_id) : undefined,
      rawEvent: ev,
    });
  }

  return { eventsByDate };
}
```

- [ ] **Step 8.3: Commit**

```bash
git add src/hooks/useCalendarEvents.ts src/hooks/useCalendarData.ts
git commit -m "feat: add useCalendarEvents and useCalendarData hooks"
```

---

## Task 9: Componentes do Calendário

**Files:**
- Create: `src/components/calendar/MonthView.tsx`
- Create: `src/components/calendar/DayPanel.tsx`
- Create: `src/components/calendar/EventForm.tsx`

- [ ] **Step 9.1: Criar `src/components/calendar/MonthView.tsx`**

```tsx
// src/components/calendar/MonthView.tsx
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { AggregatedEvent } from '@/hooks/useCalendarData';

interface Props {
  month: Date;
  eventsByDate: Record<string, AggregatedEvent[]>;
  onDayClick: (date: string) => void;
  selectedDate: string | null;
}

const DOW_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function MonthView({ month, eventsByDate, onDayClick, selectedDate }: Props) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let cursor = gridStart;
  while (cursor <= monthEnd || weeks.length < 6) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
    if (cursor > monthEnd && weeks.length >= 4) break;
  }

  return (
    <div className="w-full">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
      </div>
      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const events = eventsByDate[dateStr] ?? [];
            const inMonth = isSameMonth(day, month);
            const selected = selectedDate === dateStr;
            const todayFlag = isToday(day);
            return (
              <button
                key={dateStr}
                onClick={() => onDayClick(dateStr)}
                className={`
                  relative min-h-[64px] p-1 border-t text-left transition-colors
                  ${inMonth ? 'hover:bg-muted/50' : 'opacity-30'}
                  ${selected ? 'bg-primary/10' : ''}
                `}
              >
                <span className={`
                  inline-flex items-center justify-center w-7 h-7 text-sm rounded-full
                  ${todayFlag ? 'bg-primary text-primary-foreground font-bold' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                {/* Event dots (max 3) */}
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {events.slice(0, 3).map(ev => (
                    <span
                      key={ev.id}
                      className={`inline-block w-2 h-2 rounded-full ${
                        ev.kind === 'plan' ? 'bg-blue-400' :
                        ev.kind === 'extra' ? 'bg-orange-400' : 'bg-green-400'
                      }`}
                    />
                  ))}
                  {events.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{events.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 9.2: Criar `src/components/calendar/EventForm.tsx`**

```tsx
// src/components/calendar/EventForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CalendarEvent, CalendarEventInsert } from '@/lib/types';
import type { Child } from '@/lib/types';

interface Props {
  initialDate: string;
  children: Child[];
  event?: CalendarEvent;
  onSave: (data: Omit<CalendarEventInsert, 'family_id'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

const EVENT_TYPES = [
  { value: 'evento', label: 'Evento' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'saida', label: 'Saída' },
  { value: 'visita', label: 'Visita' },
];

export function EventForm({ initialDate, children, event, onSave, onDelete, onCancel, saving }: Props) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(event?.date ?? initialDate);
  const [startTime, setStartTime] = useState(event?.start_time?.slice(0, 5) ?? '');
  const [endTime, setEndTime] = useState(event?.end_time?.slice(0, 5) ?? '');
  const [type, setType] = useState<CalendarEvent['type']>(event?.type ?? 'evento');
  const [childId, setChildId] = useState(event?.child_id ?? '');
  const [notes, setNotes] = useState(event?.notes ?? '');

  async function handleSubmit() {
    if (!title.trim()) return;
    await onSave({
      title: title.trim(),
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      type,
      child_id: childId || null,
      notes: notes.trim() || null,
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Título *</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Consulta médica..." autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Data</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={v => setType(v as CalendarEvent['type'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Hora início</Label>
          <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Hora fim</Label>
          <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>
      {children.length > 0 && (
        <div className="space-y-1">
          <Label>Criança (opcional)</Label>
          <Select value={childId} onValueChange={setChildId}>
            <SelectTrigger><SelectValue placeholder="Toda a família" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toda a família</SelectItem>
              {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1">
        <Label>Notas</Label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional..." />
      </div>
      <div className="flex gap-2 justify-between pt-1">
        <div>
          {onDelete && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
              Eliminar
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!title.trim() || saving}>
            {saving ? 'A guardar...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9.3: Criar `src/components/calendar/DayPanel.tsx`**

```tsx
// src/components/calendar/DayPanel.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventForm } from './EventForm';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useToast } from '@/hooks/use-toast';
import type { AggregatedEvent } from '@/hooks/useCalendarData';
import type { CalendarEvent, CalendarEventInsert, Child } from '@/lib/types';

interface Props {
  date: string;
  events: AggregatedEvent[];
  children: Child[];
  monthStart: Date;
  monthEnd: Date;
  onClose: () => void;
}

export function DayPanel({ date, events, children, monthStart, monthEnd, onClose }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createEvent, updateEvent, deleteEvent } = useCalendarEvents(monthStart, monthEnd);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);

  const dateLabel = format(parseISO(date), "EEEE, d 'de' MMMM", { locale: pt });

  async function handleCreate(data: Omit<CalendarEventInsert, 'family_id'>) {
    await createEvent.mutateAsync(data);
    setShowForm(false);
    toast({ title: 'Evento criado!' });
  }

  async function handleUpdate(data: Omit<CalendarEventInsert, 'family_id'>) {
    if (!editEvent) return;
    await updateEvent.mutateAsync({ id: editEvent.id, ...data });
    setEditEvent(null);
    toast({ title: 'Evento actualizado!' });
  }

  async function handleDelete() {
    if (!editEvent) return;
    await deleteEvent.mutateAsync(editEvent.id);
    setEditEvent(null);
    toast({ title: 'Evento eliminado' });
  }

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-background shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold capitalize">{dateLabel}</h3>
        <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>

      {/* Event list */}
      <div className="space-y-2">
        {events.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">Sem eventos neste dia.</p>
        )}
        {events.map(ev => (
          <div
            key={ev.id}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${ev.color} cursor-pointer`}
            onClick={() => {
              if (ev.kind === 'manual' && ev.rawEvent) {
                setEditEvent(ev.rawEvent);
                setShowForm(false);
              } else if (ev.navigateTo) {
                navigate(ev.navigateTo);
              }
            }}
          >
            <span className="font-medium">{ev.time ?? '—'}</span>
            <span className="flex-1 truncate">{ev.title}</span>
            {ev.childName && <span className="text-xs opacity-70">{ev.childName}</span>}
          </div>
        ))}
      </div>

      {/* Form: create or edit */}
      {editEvent && (
        <EventForm
          initialDate={date}
          children={children}
          event={editEvent}
          onSave={handleUpdate}
          onDelete={handleDelete}
          onCancel={() => setEditEvent(null)}
          saving={updateEvent.isPending || deleteEvent.isPending}
        />
      )}

      {showForm && !editEvent && (
        <EventForm
          initialDate={date}
          children={children}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
          saving={createEvent.isPending}
        />
      )}

      {!showForm && !editEvent && (
        <Button size="sm" variant="outline" className="w-full" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar evento
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 9.4: Commit**

```bash
git add src/components/calendar/
git commit -m "feat: add calendar components (MonthView, DayPanel, EventForm)"
```

---

## Task 10: Actualizar CalendarPage.tsx

**Files:**
- Modify: `src/pages/CalendarPage.tsx`

- [ ] **Step 10.1: Ler o ficheiro actual completo**

Ler `src/pages/CalendarPage.tsx` completo.

- [ ] **Step 10.2: Substituir a tab "Minha Família" pelo novo calendário**

A página tem 4 tabs. As tabs "Eventos", "Mapa", "Por Região" ficam como estão (são mock, Abordagem 2). Só a tab "Minha Família" é actualizada.

Adicionar imports no topo:

```tsx
import { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, addMonths, subMonths, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { MonthView } from '@/components/calendar/MonthView';
import { DayPanel } from '@/components/calendar/DayPanel';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useChildren } from '@/hooks/useChildren';
```

Adicionar estado no topo do componente (antes do return):

```tsx
const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

const { events: manualEvents } = useCalendarEvents(monthStart, monthEnd);
const { children } = useChildren();
const { eventsByDate } = useCalendarData(monthStart, monthEnd, manualEvents, children);

const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];
```

Substituir o conteúdo do `<TabsContent value="familia">` (ou equivalente) por:

```tsx
<TabsContent value="familia" className="space-y-4">
  {/* Month navigation */}
  <div className="flex items-center justify-between">
    <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
      <ChevronLeft className="w-4 h-4" />
    </Button>
    <h2 className="font-semibold capitalize text-lg">
      {format(currentMonth, 'MMMM yyyy', { locale: pt })}
    </h2>
    <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>

  {/* Legend */}
  <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/> Plano semanal</span>
    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"/> Extracurricular</span>
    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/> Evento da família</span>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2">
      <MonthView
        month={currentMonth}
        eventsByDate={eventsByDate}
        onDayClick={setSelectedDate}
        selectedDate={selectedDate}
      />
    </div>
    <div>
      {selectedDate ? (
        <DayPanel
          date={selectedDate}
          events={selectedEvents}
          children={children}
          monthStart={monthStart}
          monthEnd={monthEnd}
          onClose={() => setSelectedDate(null)}
        />
      ) : (
        <div className="border-2 border-dashed rounded-xl p-6 text-center text-muted-foreground text-sm h-full flex items-center justify-center">
          Clica num dia para ver os eventos e adicionar novos.
        </div>
      )}
    </div>
  </div>
</TabsContent>
```

- [ ] **Step 10.3: Verificar TypeScript**

```bash
npx tsc --noEmit
```
Esperado: sem erros.

- [ ] **Step 10.4: Commit**

```bash
git add src/pages/CalendarPage.tsx
git commit -m "feat: implement operational family calendar with month view and manual events"
```

---

## Task 11: Hook `useLiteracyProgress` e Conteúdos

**Files:**
- Create: `src/lib/literacyContent.ts`
- Create: `src/hooks/useLiteracyProgress.ts`

- [ ] **Step 11.1: Criar `src/lib/literacyContent.ts`**

```typescript
// src/lib/literacyContent.ts

export interface LiteracyModule {
  id: string;       // slug usado na BD
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  icon?: string;
}

export interface LiteracyCategory {
  id: string;
  title: string;
  modules: LiteracyModule[];
}

// ─── Financial Literacy ────────────────────────────────────────────

export const FINANCIAL_MISSIONS: LiteracyModule[] = [
  { id: 'poupar-com-proposito', title: 'Poupar com Propósito', description: 'Aprender a definir objetivos de poupança', icon: '🎯' },
  { id: 'orcamento-familiar', title: 'Orçamento Familiar', description: 'Perceber como a família gere o dinheiro', icon: '📊' },
  { id: 'necessidade-vs-desejo', title: 'Necessidade vs. Desejo', description: 'Distinguir o que precisamos do que queremos', icon: '🤔' },
  { id: 'empreender-com-valor', title: 'Empreender com Valor', description: 'Criar algo e oferecer valor aos outros', icon: '🚀' },
];

export const FINANCIAL_STORIES: LiteracyModule[] = [
  { id: 'historia-do-dinheiro', title: 'A História do Dinheiro', duration: '10 min' },
  { id: 'mercado-e-trocas', title: 'Mercado e Trocas', duration: '8 min' },
  { id: 'decisoes-financeiras', title: 'Decisões Financeiras', duration: '12 min' },
  { id: 'poupar-vs-investir', title: 'Poupar vs. Investir', duration: '15 min' },
];

export const FINANCIAL_CHALLENGES: LiteracyModule[] = [
  { id: 'desafio-mealheiro', title: 'O Mealheiro Inteligente', level: 'Iniciante', duration: '1 semana' },
  { id: 'desafio-mercado', title: 'Mini Mercado em Casa', level: 'Intermédio', duration: '2 semanas' },
  { id: 'desafio-negocio', title: 'O Meu Primeiro Negócio', level: 'Avançado', duration: '1 mês' },
];

export const ALL_FINANCIAL_MODULES: string[] = [
  ...FINANCIAL_MISSIONS.map(m => m.id),
  ...FINANCIAL_STORIES.map(m => m.id),
  ...FINANCIAL_CHALLENGES.map(m => m.id),
];

// ─── Digital Literacy ──────────────────────────────────────────────

export const DIGITAL_CATEGORIES: LiteracyCategory[] = [
  {
    id: 'criacao-conteudo',
    title: 'Criação de Conteúdo',
    modules: [
      { id: 'blog-pessoal', title: 'Blog Pessoal', level: 'Iniciante' },
      { id: 'podcast-episodio', title: 'Podcast', level: 'Iniciante' },
      { id: 'infografia', title: 'Infografia', level: 'Intermédio' },
      { id: 'newsletter', title: 'Newsletter', level: 'Intermédio' },
    ],
  },
  {
    id: 'storyboard',
    title: 'Storyboard',
    modules: [
      { id: 'storyboard-aventura', title: 'Aventura', level: 'Iniciante' },
      { id: 'storyboard-adaptar-conto', title: 'Adaptar um Conto', level: 'Intermédio' },
      { id: 'storyboard-documentario', title: 'Documentário', level: 'Avançado' },
    ],
  },
  {
    id: 'video',
    title: 'Vídeo',
    modules: [
      { id: 'stop-motion', title: 'Stop Motion', level: 'Iniciante' },
      { id: 'vlog', title: 'Vlog', level: 'Iniciante' },
      { id: 'efeitos-especiais', title: 'Efeitos Especiais', level: 'Avançado' },
    ],
  },
  {
    id: 'ia-basica',
    title: 'IA Básica',
    modules: [
      { id: 'o-que-e-ia', title: 'O que é a IA?', level: 'Iniciante' },
      { id: 'chat-com-ia', title: 'Conversar com IA', level: 'Iniciante' },
      { id: 'ia-e-criatividade', title: 'IA e Criatividade', level: 'Intermédio' },
      { id: 'etica-da-ia', title: 'Ética da IA', level: 'Avançado' },
    ],
  },
  {
    id: 'logica-programacao',
    title: 'Lógica e Programação',
    modules: [
      { id: 'sequencias', title: 'Sequências', level: 'Iniciante' },
      { id: 'blocos-de-codigo', title: 'Blocos de Código', level: 'Iniciante' },
      { id: 'algoritmos', title: 'Algoritmos', level: 'Intermédio' },
      { id: 'criar-jogo', title: 'Criar um Jogo', level: 'Avançado' },
    ],
  },
];

export const ALL_DIGITAL_MODULES: string[] = DIGITAL_CATEGORIES.flatMap(c => c.modules.map(m => m.id));
```

- [ ] **Step 11.2: Criar `src/hooks/useLiteracyProgress.ts`**

```typescript
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
```

- [ ] **Step 11.3: Commit**

```bash
git add src/lib/literacyContent.ts src/hooks/useLiteracyProgress.ts
git commit -m "feat: add literacyContent constants and useLiteracyProgress hook"
```

---

## Task 12: Actualizar FinancialLiteracy.tsx

**Files:**
- Modify: `src/pages/FinancialLiteracy.tsx`

- [ ] **Step 12.1: Ler o ficheiro actual**

Ler `src/pages/FinancialLiteracy.tsx` completo.

- [ ] **Step 12.2: Adicionar imports e seletor de criança**

No topo do ficheiro, adicionar após os imports existentes:

```tsx
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChildren } from '@/hooks/useChildren';
import { useLiteracyProgress } from '@/hooks/useLiteracyProgress';
import { FINANCIAL_MISSIONS, FINANCIAL_STORIES, FINANCIAL_CHALLENGES, ALL_FINANCIAL_MODULES } from '@/lib/literacyContent';
import { Check, PlayCircle } from 'lucide-react';
import type { LiteracyStatus } from '@/lib/types';
```

- [ ] **Step 12.3: Adicionar estado e hooks no componente**

Dentro do componente, antes do return, adicionar:

```tsx
const { children } = useChildren();
const [selectedChildId, setSelectedChildId] = useState<string>('');
const { getStatus, completionPct, setStatus } = useLiteracyProgress(selectedChildId || null, 'financial');

const totalPct = completionPct(ALL_FINANCIAL_MODULES);
```

- [ ] **Step 12.4: Adicionar seletor de criança no topo do layout**

Dentro do return, logo após o cabeçalho da página (título + descrição), antes das tabs, adicionar:

```tsx
{/* Seletor de criança */}
<div className="flex items-center gap-3">
  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Selecionar criança" />
    </SelectTrigger>
    <SelectContent>
      {children.map(c => (
        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
      ))}
    </SelectContent>
  </Select>
  {selectedChildId && (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="w-24 bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${totalPct}%` }} />
      </div>
      <span>{totalPct}% concluído</span>
    </div>
  )}
</div>
```

- [ ] **Step 12.5: Criar função helper para botões de status**

Antes do return, adicionar:

```tsx
function StatusButton({ moduleId }: { moduleId: string }) {
  const status: LiteracyStatus = getStatus(moduleId);
  const isPending = setStatus.isPending;

  if (status === 'completed') {
    return (
      <Button size="sm" variant="ghost" className="text-green-600 gap-1" disabled={!selectedChildId || isPending}
        onClick={() => setStatus.mutate({ moduleId, status: 'not_started' })}>
        <Check className="w-4 h-4" /> Concluído
      </Button>
    );
  }
  if (status === 'in_progress') {
    return (
      <Button size="sm" variant="outline" disabled={!selectedChildId || isPending}
        onClick={() => setStatus.mutate({ moduleId, status: 'completed' })}>
        Marcar concluído
      </Button>
    );
  }
  return (
    <Button size="sm" disabled={!selectedChildId || isPending}
      onClick={() => setStatus.mutate({ moduleId, status: 'in_progress' })}>
      <PlayCircle className="w-4 h-4 mr-1" /> Iniciar
    </Button>
  );
}
```

- [ ] **Step 12.6: Substituir os botões hardcoded**

Em cada card de missão, história e desafio, substituir o botão existente (que dispara apenas um toast) pelo `<StatusButton moduleId={<slug-correto>} />`.

Usar os slugs de `FINANCIAL_MISSIONS`, `FINANCIAL_STORIES`, `FINANCIAL_CHALLENGES`:
- As missões têm slugs: `poupar-com-proposito`, `orcamento-familiar`, `necessidade-vs-desejo`, `empreender-com-valor`
- As histórias têm slugs: `historia-do-dinheiro`, `mercado-e-trocas`, `decisoes-financeiras`, `poupar-vs-investir`
- Os desafios têm slugs: `desafio-mealheiro`, `desafio-mercado`, `desafio-negocio`

Substituir também as percentagens hardcoded nas barras de progresso por:

```tsx
// Em vez de progress={65} hardcoded:
const pct = getStatus(mission.id) === 'completed' ? 100
          : getStatus(mission.id) === 'in_progress' ? 50 : 0;
```

- [ ] **Step 12.7: Commit**

```bash
git add src/pages/FinancialLiteracy.tsx
git commit -m "feat: connect FinancialLiteracy to real per-child progress tracking"
```

---

## Task 13: Actualizar DigitalLiteracy.tsx

**Files:**
- Modify: `src/pages/DigitalLiteracy.tsx`

- [ ] **Step 13.1: Ler o ficheiro actual**

Ler `src/pages/DigitalLiteracy.tsx` completo.

- [ ] **Step 13.2: Adicionar imports**

```tsx
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChildren } from '@/hooks/useChildren';
import { useLiteracyProgress } from '@/hooks/useLiteracyProgress';
import { DIGITAL_CATEGORIES, ALL_DIGITAL_MODULES } from '@/lib/literacyContent';
import { Check, PlayCircle } from 'lucide-react';
import type { LiteracyStatus } from '@/lib/types';
```

- [ ] **Step 13.3: Adicionar estado e hooks**

```tsx
const { children } = useChildren();
const [selectedChildId, setSelectedChildId] = useState<string>('');
const { getStatus, completionPct, setStatus } = useLiteracyProgress(selectedChildId || null, 'digital');
const totalPct = completionPct(ALL_DIGITAL_MODULES);
```

- [ ] **Step 13.4: Adicionar seletor de criança**

Logo após o cabeçalho, antes das tabs:

```tsx
<div className="flex items-center gap-3">
  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Selecionar criança" />
    </SelectTrigger>
    <SelectContent>
      {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
    </SelectContent>
  </Select>
  {selectedChildId && (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="w-24 bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${totalPct}%` }} />
      </div>
      <span>{totalPct}% concluído</span>
    </div>
  )}
</div>
```

- [ ] **Step 13.5: Criar StatusButton e substituir botões**

```tsx
function StatusButton({ moduleId }: { moduleId: string }) {
  const status: LiteracyStatus = getStatus(moduleId);
  if (status === 'completed') {
    return (
      <Button size="sm" variant="ghost" className="text-green-600 gap-1" disabled={!selectedChildId}
        onClick={() => setStatus.mutate({ moduleId, status: 'not_started' })}>
        <Check className="w-4 h-4" /> Concluído
      </Button>
    );
  }
  if (status === 'in_progress') {
    return (
      <Button size="sm" variant="outline" disabled={!selectedChildId}
        onClick={() => setStatus.mutate({ moduleId, status: 'completed' })}>
        Marcar concluído
      </Button>
    );
  }
  return (
    <Button size="sm" disabled={!selectedChildId}
      onClick={() => setStatus.mutate({ moduleId, status: 'in_progress' })}>
      <PlayCircle className="w-4 h-4 mr-1" /> Iniciar
    </Button>
  );
}
```

Em cada activity card, substituir o botão "Iniciar" existente pelo `<StatusButton moduleId={<slug>} />` correspondente.

Os slugs por categoria estão definidos em `DIGITAL_CATEGORIES` em `literacyContent.ts`. Mapear cada card existente ao slug correcto pela ordem em que aparecem nas categorias.

- [ ] **Step 13.6: Commit**

```bash
git add src/pages/DigitalLiteracy.tsx
git commit -m "feat: connect DigitalLiteracy to real per-child progress tracking"
```

---

## Task 14: Secção Literacia nos Relatórios + Sidebar

**Files:**
- Modify: `src/pages/Reports.tsx`
- Modify: `src/components/AppSidebar.tsx`

- [ ] **Step 14.1: Ler Reports.tsx (primeiras 80 linhas)**

Ler `src/pages/Reports.tsx` para entender a estrutura de secções existente.

- [ ] **Step 14.2: Adicionar secção Literacia nos Relatórios**

Adicionar imports no topo:

```tsx
import { useLiteracyProgress } from '@/hooks/useLiteracyProgress';
import { ALL_FINANCIAL_MODULES, ALL_DIGITAL_MODULES } from '@/lib/literacyContent';
import { useChildren } from '@/hooks/useChildren';
```

No componente, se `children` e `selectedChildId` já existem (verificar ao ler o ficheiro), reutilizar. Caso contrário adicionar:

```tsx
const { children } = useChildren();
```

Antes do último `</div>` do return (ou na posição mais natural no fim das secções), adicionar:

```tsx
{/* Literacia */}
<section className="space-y-4">
  <h2 className="text-lg font-semibold">Literacia</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {children.map(child => (
      <LiteracyChildCard key={child.id} child={child} />
    ))}
  </div>
</section>
```

Definir `LiteracyChildCard` dentro do mesmo ficheiro (acima do componente principal):

```tsx
function LiteracyChildCard({ child }: { child: { id: string; name: string } }) {
  const financial = useLiteracyProgress(child.id, 'financial');
  const digital = useLiteracyProgress(child.id, 'digital');
  const finPct = financial.completionPct(ALL_FINANCIAL_MODULES);
  const digPct = digital.completionPct(ALL_DIGITAL_MODULES);

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <p className="font-medium">{child.name}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Literacia Financeira</span>
          <span className="font-medium">{finPct}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${finPct}%` }} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Literacia Digital</span>
          <span className="font-medium">{digPct}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-indigo-400 h-2 rounded-full transition-all" style={{ width: `${digPct}%` }} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 14.3: Remover `disabled: true` das páginas de Literacia na Sidebar**

Em `src/components/AppSidebar.tsx`, localizar:

```tsx
{ title: "Literacia Financeira", url: "/financial-literacy", disabled: true },
{ title: "Literacia Digital", url: "/digital-literacy", disabled: true },
```

Substituir por:

```tsx
{ title: "Literacia Financeira", url: "/financial-literacy", icon: Coins },
{ title: "Literacia Digital", url: "/digital-literacy", icon: Monitor },
```

Adicionar os imports dos ícones (se não existirem):

```tsx
import { Coins, Monitor } from 'lucide-react';
```

- [ ] **Step 14.4: Verificar TypeScript**

```bash
npx tsc --noEmit
```
Esperado: sem erros.

- [ ] **Step 14.5: Commit final**

```bash
git add src/pages/Reports.tsx src/components/AppSidebar.tsx
git commit -m "feat: add Literacy section to Reports and enable Literacy pages in sidebar"
```

---

## Task 15: Verificação Final

- [ ] **Step 15.1: Correr todos os testes**

```bash
cd "/Users/gmsr44/Desktop/Outros Projetos/NexSeed/V2/.claude/worktrees/reverent-newton"
npx vitest run
```
Esperado: todos os testes passam (incluindo os novos de `missionRewards.test.ts`).

- [ ] **Step 15.2: Build de produção**

```bash
npm run build
```
Esperado: build sem erros. Avisos de TypeScript não são erros de build.

- [ ] **Step 15.3: Verificar páginas chave no browser de dev**

```bash
npm run dev
```

Verificar manualmente:
- `/` — Dashboard mostra saudação + actividades de hoje (ou CTA se não há plano)
- `/world-missions` — Tab Recompensas visível, RewardsManager funciona (criar recompensa)
- `/calendar` — MonthView aparece, clicar num dia abre DayPanel, criar evento manual funciona
- `/financial-literacy` — Seletor de criança presente, botões Iniciar/Concluir funcionam
- `/digital-literacy` — Idem
- `/reports` — Secção Literacia aparece com barras de progresso

- [ ] **Step 15.4: Commit de merge na branch principal**

```bash
git log --oneline -15
```

Verificar que todos os commits estão na branch `claude/reverent-newton`. Invocar o skill `superpowers:finishing-a-development-branch` para decidir como integrar o trabalho.
