// Registo de 2 minutos por dia (R-10): três linhas no fim do dia, guardadas
// como uma entrada do Diário por criança. São a base do relatório do período.

export const DAY_LOG_TITLE = "Registo do dia";

export interface DayLog {
  done: string;
  pending: string;
  note: string;
}

/** Texto da entrada do Diário; null se não houver nada escrito. */
export function dayLogDescription(log: DayLog): string | null {
  const parts = [
    log.done.trim() && `O que fizemos: ${log.done.trim()}`,
    log.pending.trim() && `Ficou por fazer: ${log.pending.trim()}`,
    log.note.trim() && `Correu bem / mudaria: ${log.note.trim()}`,
  ].filter(Boolean);
  return parts.length ? parts.join("\n") : null;
}
