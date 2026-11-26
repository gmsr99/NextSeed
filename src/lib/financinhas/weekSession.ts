// Financinhas no plano semanal (I-21, FIN_11 B2): no dia da semanada, a sessão
// da semana e o ritual de 5 minutos. A app não gera aulas aqui: mostra a aula
// que está "por dar" (gerada na página Financinhas) com o prompt para copiar, ou
// convida a prepará-la. Nada chega à criança sem passar pelo adulto.

export const FIN_WEEKDAYS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"] as const;

export interface WeekSessionProfile {
  child_id: string;
  ritual_weekday: number; // 1 = segunda … 7 = domingo
}

export interface WeekSessionLesson {
  id: string;
  child_id: string;
  status: string;
  title: string | null;
  notebook_prompt: string | null;
  created_at: string;
  track_session?: number | null;
}

export interface WeekSession {
  childId: string;
  weekday: number;
  weekdayLabel: string;
  /** No plano (segunda a sexta) ou ao fim de semana, fora dos dias de estudo. */
  inPlanDays: boolean;
  /** A aula por dar mais antiga (a próxima a dar), se houver. */
  lesson: WeekSessionLesson | null;
}

/** Uma entrada por criança com perfil no Financinhas, pela ordem das crianças. */
export function weekSessions(
  childIds: string[],
  profiles: WeekSessionProfile[],
  lessons: WeekSessionLesson[],
): WeekSession[] {
  const out: WeekSession[] = [];
  for (const id of childIds) {
    const p = profiles.find((x) => x.child_id === id);
    if (!p) continue;
    const wd = Math.min(7, Math.max(1, p.ritual_weekday || 6));
    const pending = lessons
      .filter((l) => l.child_id === id && l.status === "por_dar")
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    out.push({
      childId: id,
      weekday: wd,
      weekdayLabel: FIN_WEEKDAYS[wd - 1],
      inPlanDays: wd <= 5,
      lesson: pending[0] ?? null,
    });
  }
  return out;
}

/** Markdown simples → linhas para o PDF (títulos, listas e texto, sem negrito). */
export interface MdLine { kind: "h" | "li" | "p"; text: string }

export function mdLines(md: string | null | undefined): MdLine[] {
  if (!md) return [];
  const out: MdLine[] = [];
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const clean = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1").replace(/`/g, "").trim();
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) { out.push({ kind: "h", text: clean(h[1]) }); continue; }
    const li = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (li) { out.push({ kind: "li", text: clean(li[1]) }); continue; }
    out.push({ kind: "p", text: clean(line) });
  }
  return out;
}
