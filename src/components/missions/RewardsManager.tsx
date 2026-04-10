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
