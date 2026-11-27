// Agenda da comunidade: cores, etiquetas e ajudas de formatação partilhadas pelos ecrãs.
import { Ticket, Users, type LucideIcon } from "lucide-react";
import municipalitiesJson from "@/data/municipalities.pt.json";
import type { EventKind, Municipality } from "@/lib/agenda";

export const MUNICIPALITIES = (municipalitiesJson as Municipality[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, "pt"));
export const MUNICIPALITY_BY_CODE = new Map(MUNICIPALITIES.map((m) => [m.code, m]));

/** Cor, etiqueta e ícone de cada tipo. A cor nunca aparece sozinha. */
export const KIND_STYLE: Record<EventKind, { label: string; icon: LucideIcon; chip: string; border: string; dot: string }> = {
  encontro: {
    label: "Encontro",
    icon: Users,
    chip: "bg-rose-100 text-rose-800",
    border: "border-l-rose-400",
    dot: "bg-rose-400",
  },
  evento: {
    label: "Evento",
    icon: Ticket,
    chip: "bg-teal-100 text-teal-800",
    border: "border-l-teal-500",
    dot: "bg-teal-500",
  },
};

export const CONTACT_EMAIL = "geral@nexseed.pt";

export const TERRITORY_PURPOSE =
  "Usamos o concelho só para vos mostrar primeiro o que está mais perto. Não o mostramos a ninguém. Podem mudá-lo ou apagá-lo quando quiserem.";

/** "sáb., 5 dez · 10:00–12:00" ou, em vários dias, "27 nov → 3 jan". */
export function formatWhen(start: Date, end: Date, allDay: boolean): string {
  const sameDay = start.toDateString() === end.toDateString();
  const d = (x: Date, weekday = true) =>
    x.toLocaleDateString("pt-PT", { weekday: weekday ? "short" : undefined, day: "numeric", month: "short" });
  const t = (x: Date) => x.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  if (!sameDay) return `${d(start, false)} → ${d(end, false)}`;
  return allDay ? d(start) : `${d(start)} · ${t(start)}–${t(end)}`;
}

export function formatAges(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Todas as idades";
  if (min != null && max != null) return min === max ? `${min} anos` : `${min} a ${max} anos`;
  if (min != null) return `A partir dos ${min} anos`;
  return `Até aos ${max} anos`;
}

const TERRITORY_KEY = "nexseed.agenda.territorio";

/** Última escolha de território neste aparelho (não vai para o servidor). */
export function readLocalTerritory(): string | null {
  try {
    return window.localStorage.getItem(TERRITORY_KEY);
  } catch {
    return null;
  }
}

export function writeLocalTerritory(code: string | null) {
  try {
    if (code) window.localStorage.setItem(TERRITORY_KEY, code);
    else window.localStorage.removeItem(TERRITORY_KEY);
  } catch {
    /* sem armazenamento: ignora */
  }
}

/** YYYY-MM-DD na hora local. */
export function localIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** HH:MM na hora local. */
export function localTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}
