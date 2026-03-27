// ─── Cores por tipo de atividade extracurricular ─────────────────────────────
// Usadas em: Extracurricular.tsx, WeeklyPlanner.tsx, SchedulePDF.tsx

export const EXTRACURRICULAR_COLORS: Record<string, string> = {
  "Desporto":                    "#90BE6D",
  "Música":                      "#E9C46A",
  "Teatro / Artes Performativas": "#F4A261",
  "Natação":                     "#4CC9F0",
  "Dança":                       "#F77F00",
  "Artes Visuais":               "#9B72CF",
  "Língua Estrangeira":          "#43AA8B",
  "Escuteiros / Grupos":         "#2EC4B6",
  "Tecnologia / Robótica":       "#6366F1",
  "Outro":                       "#9CA3AF",
};

// ─── Tipos de atividade extracurricular ──────────────────────────────────────

export const EXTRACURRICULAR_TYPES = [
  "Desporto",
  "Música",
  "Teatro / Artes Performativas",
  "Natação",
  "Dança",
  "Artes Visuais",
  "Língua Estrangeira",
  "Escuteiros / Grupos",
  "Tecnologia / Robótica",
  "Outro",
] as const;

// ─── Labels dos dias da semana ───────────────────────────────────────────────

export const DAY_LABELS_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
