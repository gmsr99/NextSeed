// src/components/calendar/EventForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CalendarEvent, CalendarEventInsert, Child } from '@/lib/types';

interface Props {
  initialDate: string;
  children: Child[];
  event?: CalendarEvent;
  onSave: (data: Omit<CalendarEventInsert, 'family_id'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

const EVENT_TYPES: { value: CalendarEvent['type']; label: string }[] = [
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
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Consulta médica..."
          autoFocus
        />
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
              {EVENT_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
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
              {children.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
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
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
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
