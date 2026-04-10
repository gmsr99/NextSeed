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
    try {
      await createEvent.mutateAsync(data);
      setShowForm(false);
      toast({ title: 'Evento criado!' });
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? 'Erro ao criar evento', variant: 'destructive' });
    }
  }

  async function handleUpdate(data: Omit<CalendarEventInsert, 'family_id'>) {
    if (!editEvent) return;
    try {
      await updateEvent.mutateAsync({ id: editEvent.id, ...data });
      setEditEvent(null);
      toast({ title: 'Evento actualizado!' });
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? 'Erro ao actualizar evento', variant: 'destructive' });
    }
  }

  async function handleDelete() {
    if (!editEvent) return;
    try {
      await deleteEvent.mutateAsync(editEvent.id);
      setEditEvent(null);
      toast({ title: 'Evento eliminado' });
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? 'Erro ao eliminar evento', variant: 'destructive' });
    }
  }

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-background shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold capitalize">{dateLabel}</h3>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Event list */}
      <div className="space-y-2">
        {events.length === 0 && !showForm && !editEvent && (
          <p className="text-sm text-muted-foreground">Sem eventos neste dia.</p>
        )}
        {events.map(ev => (
          <div
            key={ev.id}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer ${ev.color}`}
            onClick={() => {
              if (ev.kind === 'manual' && ev.rawEvent) {
                setEditEvent(ev.rawEvent);
                setShowForm(false);
              } else if (ev.navigateTo) {
                navigate(ev.navigateTo);
              }
            }}
          >
            <span className="font-medium shrink-0">{ev.time ?? '—'}</span>
            <span className="flex-1 truncate">{ev.title}</span>
            {ev.childName && <span className="text-xs opacity-70 shrink-0">{ev.childName}</span>}
          </div>
        ))}
      </div>

      {/* Edit existing manual event */}
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

      {/* Create new event */}
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
