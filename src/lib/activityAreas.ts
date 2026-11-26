// R-04: uma atividade pode contar para várias áreas (migração 039).
// discipline é a principal; extra_disciplines, as outras.

export function activityAreas(a: { discipline?: string | null; extra_disciplines?: string[] | null }): string[] {
  const out: string[] = [];
  if (a.discipline) out.push(a.discipline);
  for (const d of a.extra_disciplines ?? []) if (d && !out.includes(d)) out.push(d);
  return out;
}

/** Junta a descrição do plano com as observações da família. */
export function withObservations(description: string, observations: string): string {
  const d = description.trim();
  const o = observations.trim();
  if (!o) return d;
  return d ? `${d}\n\nObservações: ${o}` : `Observações: ${o}`;
}

/** Texto da descrição de um item do plano, sem o JSON dos episódios de leitura nem o "Para explicar". */
export function planDescriptionText(raw: string | null | undefined): string {
  if (!raw) return "";
  const t = raw.trim();
  if (t.startsWith("{")) {
    try {
      const j = JSON.parse(t) as { text?: unknown };
      return typeof j.text === "string" ? j.text.trim() : "";
    } catch {
      return "";
    }
  }
  return t;
}
