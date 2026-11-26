import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { pt } from "date-fns/locale";
import { useChildren } from "@/hooks/useChildren";
import { MonthView } from '@/components/calendar/MonthView';
import { DayPanel } from '@/components/calendar/DayPanel';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarData } from '@/hooks/useCalendarData';

// ─── Main component ───────────────────────────────────────────────────────────

const CalendarPage = () => {
  const { children } = useChildren();

  // ── Family calendar state ──────────────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  const { events: manualEvents } = useCalendarEvents(monthStart, monthEnd);
  const { eventsByDate } = useCalendarData(monthStart, monthEnd, manualEvents, children);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-xl gradient-forest flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-accent-foreground" />
              </div>
              <h1 className="text-3xl font-heading font-bold">Agenda</h1>
            </div>
            <p className="text-muted-foreground">O plano da semana, as atividades extracurriculares e os eventos da família, num só calendário.</p>
          </div>
        </div>

        <div className="space-y-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold capitalize text-lg">
                {format(currentMonth, 'MMMM yyyy', { locale: pt })}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
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
        </div>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
