// Financinhas · importação do histórico (aulas feitas antes da app)
//
// O histórico real tem dados de crianças: NUNCA entra no repositório. Entra
// pela própria app: o adulto cola o JSON (formato FIN_ARQ_Historico_Aulas.json
// ou outro ficheiro de histórico de aulas), escolhe a que criança corresponde cada
// identificador e vê a lista antes de gravar. A importação nunca sobrescreve:
// salta as aulas que já existem (mesma criança + título + data).

import { SKILL_CODES } from "./catalog.ts";
import { normalizeMode } from "./engine.ts";

export interface ImportedLesson {
  source_key: string; // identificador da criança no ficheiro (ex.: "C1")
  title: string;
  given_on: string | null;
  track_session: number | null;
  theme_numbers: number[];
  skill_codes: string[];
  discovery_mode: string | null;
  protagonist: string | null;
  universe: string | null;
  notebook_prompt: string | null;
  quiz_md: string | null;
  activities_md: string | null;
  challenge_md: string | null;
  adult_guide_md: string | null;
  tracking_md: string | null;
  content_md: string | null;
  notes: string | null;
}

export interface ImportedLevel {
  source_key: string;
  skill_code: string;
  level: number;
  observed_on: string | null;
  note: string | null;
}

export interface ImportBundle {
  lessons: ImportedLesson[];
  levels: ImportedLevel[];
  /** Identificadores de criança encontrados (para o adulto associar). */
  keys: string[];
  warnings: string[];
}

type Obj = Record<string, unknown>;
const s = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : null);
const pick = (o: Obj, ...keys: string[]) => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== "") return o[k];
  return undefined;
};

function toDate(v: unknown): string | null {
  const t = s(v);
  if (!t) return null;
  const m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  const t = s(v);
  return t ? t.split(/[,;+·/]|\s+e\s+/).map((x) => x.trim()).filter(Boolean) : [];
}

export function toSkills(v: unknown): string[] {
  const out: string[] = [];
  for (const item of toList(v)) {
    for (const m of item.toUpperCase().matchAll(/\b(CP|AD[1-3]|DC[1-4]|CS[1-4]|VL[1-5]|RH[1-4]|GP[1-5])\b/g)) {
      if (SKILL_CODES.includes(m[1]) && !out.includes(m[1])) out.push(m[1]);
    }
  }
  return out;
}

export function toThemes(v: unknown): number[] {
  const nums = toList(v).flatMap((x) => [...x.matchAll(/(\d{1,2})/g)].map((m) => Number(m[1])));
  return [...new Set(nums.filter((n) => n >= 1 && n <= 23))];
}

export function toSession(v: unknown): number | null {
  const t = s(v);
  if (!t) return null;
  const m = t.match(/(\d{1,2})/);
  const n = m ? Number(m[1]) : NaN;
  return n >= 1 && n <= 12 ? n : null;
}

function lessonFrom(o: Obj, fallbackKey: string): ImportedLesson | null {
  const title = s(pick(o, "titulo", "title", "nome"));
  if (!title) return null;
  return {
    source_key: s(pick(o, "crianca", "criança", "child", "child_key")) ?? fallbackKey,
    title,
    given_on: toDate(pick(o, "data_dada", "given_on", "data")),
    track_session: toSession(pick(o, "sessao_trilho", "track_session", "sessao")),
    theme_numbers: toThemes(pick(o, "temas", "tema", "theme_numbers")),
    skill_codes: [...new Set([...toSkills(pick(o, "skills_alvo", "skill_codes", "skills")), ...toSkills(pick(o, "reforco", "reinforce"))])],
    discovery_mode: normalizeMode(s(pick(o, "modo_descoberta", "discovery_mode", "modo"))),
    protagonist: s(pick(o, "protagonista", "protagonist")),
    universe: s(pick(o, "universo", "interesse", "universe")),
    notebook_prompt: s(pick(o, "prompt_apresentacao", "notebook_prompt", "prompt")),
    quiz_md: s(pick(o, "quiz_md", "quiz")),
    activities_md: s(pick(o, "atividades_md", "activities_md", "atividades")),
    challenge_md: s(pick(o, "desafio_md", "challenge_md", "desafio")),
    adult_guide_md: s(pick(o, "guia_adulto_md", "adult_guide_md", "guia_adulto")),
    tracking_md: s(pick(o, "tracking_md", "tracking")),
    content_md: s(pick(o, "conteudo_md", "content_md", "conteudo")),
    notes: s(pick(o, "notas", "notes")),
  };
}

function levelsFrom(raw: unknown, key: string, defaultDate: string | null, warnings: string[]): ImportedLevel[] {
  const out: ImportedLevel[] = [];
  const push = (code: unknown, lvl: unknown, date: unknown, note: unknown) => {
    const c = toSkills(code)[0];
    const n = Number(typeof lvl === "string" ? lvl.match(/[1-4]/)?.[0] : lvl);
    if (!c || !(n >= 1 && n <= 4)) {
      if (code !== undefined) warnings.push(`Nível ignorado (${key}): ${String(code)} = ${String(lvl)}`);
      return;
    }
    out.push({ source_key: key, skill_code: c, level: n, observed_on: toDate(date) ?? defaultDate, note: s(note) });
  };
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const o = (item ?? {}) as Obj;
      push(pick(o, "skill", "codigo", "skill_code", "code"), pick(o, "nivel", "level"), pick(o, "data", "observed_on"), pick(o, "nota", "note"));
    }
  } else if (raw && typeof raw === "object") {
    const o = raw as Obj;
    const date = pick(o, "data", "data_fotografia", "observed_on") ?? defaultDate;
    const inner = (o.niveis ?? o.levels ?? o) as Obj;
    for (const [code, v] of Object.entries(inner)) {
      if (["data", "data_fotografia", "observed_on", "fonte", "notas"].includes(code)) continue;
      if (v && typeof v === "object") {
        const vo = v as Obj;
        push(code, pick(vo, "nivel", "level"), pick(vo, "data", "observed_on") ?? date, pick(vo, "nota", "note"));
      } else {
        push(code, v, date, null);
      }
    }
  }
  return out;
}

/** Lê o JSON colado pelo adulto. Lança erro com mensagem legível se não der. */
export function parseImport(text: string): ImportBundle {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("O texto colado não é JSON válido.");
  }
  const warnings: string[] = [];
  const root = (Array.isArray(raw) ? { aulas: raw } : raw) as Obj;
  const list = (pick(root, "aulas", "lessons", "historico") ?? []) as unknown[];
  if (!Array.isArray(list)) throw new Error("Não encontrei a lista de aulas (campo \"aulas\").");

  const lessons: ImportedLesson[] = [];
  list.forEach((item, i) => {
    const l = lessonFrom((item ?? {}) as Obj, "?");
    if (l) lessons.push(l);
    else warnings.push(`Aula ${i + 1} sem título: ignorada.`);
  });

  const levels: ImportedLevel[] = [];
  const niveis = pick(root, "niveis", "levels");
  if (niveis && typeof niveis === "object" && !Array.isArray(niveis)) {
    for (const [key, v] of Object.entries(niveis as Obj)) levels.push(...levelsFrom(v, key, toDate(pick(root, "data_fotografia")), warnings));
  }

  const keys = [...new Set([...lessons.map((l) => l.source_key), ...levels.map((l) => l.source_key)])];
  return { lessons, levels, keys, warnings };
}

export const dedupKey = (childId: string, title: string, date: string | null) =>
  `${childId}|${title.trim().toLowerCase()}|${date ?? ""}`;

/** Aulas a inserir para cada criança, sem as que já existem. */
export function planImport(
  bundle: ImportBundle,
  mapping: Record<string, string | null>, // source_key → child_id (null = não importar)
  existing: { child_id: string; title: string | null; given_on: string | null }[],
): { lessons: (ImportedLesson & { child_id: string })[]; levels: (ImportedLevel & { child_id: string })[]; skipped: number } {
  const seen = new Set(existing.map((e) => dedupKey(e.child_id, e.title ?? "", e.given_on)));
  let skipped = 0;
  const lessons: (ImportedLesson & { child_id: string })[] = [];
  for (const l of bundle.lessons) {
    const child = mapping[l.source_key];
    if (!child) continue;
    const k = dedupKey(child, l.title, l.given_on);
    if (seen.has(k)) { skipped++; continue; }
    seen.add(k);
    lessons.push({ ...l, child_id: child });
  }
  const levels = bundle.levels
    .filter((l) => mapping[l.source_key])
    .map((l) => ({ ...l, child_id: mapping[l.source_key]! }));
  return { lessons, levels, skipped };
}
