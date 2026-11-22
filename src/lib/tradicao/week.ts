// O que a semana mostra quando a família tem a Tradição da família ligada.
import { liturgicalWeek, type LiturgicalCalendar } from "./liturgical";
import { weekCelebrations } from "./celebrations";

export interface WeekLiturgy {
  /** Ex.: "2.ª semana do Advento" */
  label: string;
  antiphon: string | null;
  /** Só celebrações com ficha revista */
  celebrations: { day: string; name: string; texto: string; desafio: string }[];
}

export function weekLiturgy(monday: Date, t: { calendar: LiturgicalCalendar; proprio_pt: boolean } | null): WeekLiturgy | null {
  if (!t) return null;
  const lit = liturgicalWeek(monday, t.calendar);
  return {
    label: lit.label,
    antiphon: lit.antiphon,
    celebrations: weekCelebrations(monday, t.calendar, t.proprio_pt).map((c) => ({
      day: c.date.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric" }),
      name: c.name,
      texto: c.ficha!.texto,
      desafio: c.ficha!.desafio,
    })),
  };
}
