// src/components/calendar/MonthView.tsx
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
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
  while (cursor <= monthEnd || weeks.length < 4) {
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
                className={[
                  'relative min-h-[64px] p-1 border-t text-left transition-colors',
                  inMonth ? 'hover:bg-muted/50' : 'opacity-30',
                  selected ? 'bg-primary/10' : '',
                ].join(' ')}
              >
                <span className={[
                  'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full',
                  todayFlag ? 'bg-primary text-primary-foreground font-bold' : '',
                ].join(' ')}>
                  {format(day, 'd')}
                </span>
                {/* Event dots (max 3) */}
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {events.slice(0, 3).map(ev => (
                    <span
                      key={ev.id}
                      className={[
                        'inline-block w-2 h-2 rounded-full',
                        ev.kind === 'plan' ? 'bg-blue-400' :
                        ev.kind === 'extra' ? 'bg-orange-400' : 'bg-green-400',
                      ].join(' ')}
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
