// Agenda da comunidade (I-03a, 1B): lógica pura, sem React nem Supabase.
// Distância entre centros de concelho, blocos de distância, preferências da família,
// idades, repetição semanal e ordenação. Testes em __tests__/agenda.test.ts.
// Nada disto vai ao Gemini.

export type EventKind = "encontro" | "evento";

export const CATEGORIES = [
  { id: "natureza", label: "Natureza e ar livre" },
  { id: "ciencia", label: "Ciência e tecnologia" },
  { id: "arte_manuais", label: "Arte e trabalhos manuais" },
  { id: "musica_danca", label: "Música e dança" },
  { id: "teatro_espetaculos", label: "Teatro e espetáculos" },
  { id: "livros_historias", label: "Livros e histórias" },
  { id: "movimento", label: "Movimento e desporto" },
  { id: "historia_patrimonio", label: "História e património" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

/** Opções de "O que preferimos": os encontros de comunidade e as 8 categorias. */
export const PREFERENCE_OPTIONS: { id: string; label: string }[] = [
  { id: "encontros", label: "Encontros de comunidade" },
  ...CATEGORIES,
];

export type Pref = "primeiro" | "normal" | "esconder";
export type Preferences = Record<string, Pref>;

export const PREF_LABEL: Record<Pref, string> = {
  primeiro: "Mostrar primeiro",
  normal: "Normal",
  esconder: "Não mostrar",
};

export const REJECTION_REASONS = [
  { id: "nao_familias", label: "Não é para crianças ou famílias" },
  { id: "incompleto", label: "Informação incompleta" },
  { id: "duplicado", label: "Já está na agenda" },
  { id: "publicidade", label: "Publicidade sem evento" },
  { id: "outro", label: "Outro motivo" },
] as const;

export interface Municipality {
  code: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
}

/** Campos de community_events que a lógica usa. */
export interface CommunityEventLike {
  id: string;
  kind: EventKind;
  municipality_code: string;
  starts_at: string; // ISO
  ends_at: string; // ISO
  recurrence: "none" | "weekly";
  recurrence_until: string | null; // YYYY-MM-DD
  age_min: number | null;
  age_max: number | null;
  categories: string[];
  is_free: boolean;
  status?: string;
}

// ─── Distância ────────────────────────────────────────────────────────────────

/** Distância em km entre dois pontos (fórmula de haversine). */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type Ring = 0 | 1 | 2 | 3;

export const RING_LABEL: Record<Ring, string> = {
  0: "Perto",
  1: "A uma curta viagem",
  2: "Para um dia inteiro",
  3: "Mais longe",
};

/** Blocos de distância: ≤ 15 km, ≤ 40 km, ≤ 80 km, mais longe. Sem território, tudo no primeiro. */
export function ring(distanceKm: number | null): Ring {
  if (distanceKm === null) return 0;
  if (distanceKm <= 15) return 0;
  if (distanceKm <= 40) return 1;
  if (distanceKm <= 80) return 2;
  return 3;
}

/** O concelho cujo centro está mais perto de um ponto (usado com a localização, só no aparelho). */
export function nearestMunicipality(point: { lat: number; lng: number }, list: Municipality[]): Municipality | null {
  let best: Municipality | null = null;
  let bestD = Infinity;
  for (const m of list) {
    const d = km(point, m);
    if (d < bestD) {
      bestD = d;
      best = m;
    }
  }
  return best;
}

// ─── Preferências e idades ───────────────────────────────────────────────────

export function isHidden(ev: Pick<CommunityEventLike, "kind" | "categories">, prefs: Preferences): boolean {
  if (ev.kind === "encontro" && prefs.encontros === "esconder") return true;
  return ev.categories.some((c) => prefs[c] === "esconder");
}

export function prefScore(ev: Pick<CommunityEventLike, "kind" | "categories">, prefs: Preferences): 0 | 1 {
  if (ev.kind === "encontro" && prefs.encontros === "primeiro") return 1;
  return ev.categories.some((c) => prefs[c] === "primeiro") ? 1 : 0;
}

/** Idade em anos completos numa data. */
export function ageOn(birthDate: string, on: Date): number {
  const b = new Date(`${birthDate.slice(0, 10)}T12:00:00`);
  let age = on.getFullYear() - b.getFullYear();
  const m = on.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < b.getDate())) age--;
  return Math.max(0, age);
}

/** 1 se o evento serve a idade de pelo menos uma criança (ou é para todas as idades). Sem crianças, 1. */
export function ageFit(ev: Pick<CommunityEventLike, "age_min" | "age_max">, childAges: number[]): 0 | 1 {
  if (ev.age_min == null && ev.age_max == null) return 1;
  if (childAges.length === 0) return 1;
  const min = ev.age_min ?? 0;
  const max = ev.age_max ?? 18;
  return childAges.some((a) => a >= min && a <= max) ? 1 : 0;
}

// ─── Repetição e janela de datas ─────────────────────────────────────────────

export interface Occurrence<E extends CommunityEventLike = CommunityEventLike> {
  event: E;
  start: Date;
  end: Date;
}

const DAY = 86_400_000;

/** Fim do dia (local) de uma data YYYY-MM-DD. */
function endOfDayLocal(isoDate: string): Date {
  return new Date(`${isoDate}T23:59:59`);
}

/**
 * Ocorrências de um evento que ainda não acabaram e começam antes de `to`.
 * Eventos de vários dias (ex.: uma vila de Natal) dão uma ocorrência só.
 * Os semanais dão uma por semana até recurrence_until.
 */
export function occurrences<E extends CommunityEventLike>(ev: E, from: Date, to: Date): Occurrence<E>[] {
  const start = new Date(ev.starts_at);
  const end = new Date(ev.ends_at);
  const duration = Math.max(0, end.getTime() - start.getTime());
  if (ev.recurrence !== "weekly" || !ev.recurrence_until) {
    if (end < from || start > to) return [];
    return [{ event: ev, start, end }];
  }
  const until = endOfDayLocal(ev.recurrence_until);
  const out: Occurrence<E>[] = [];
  // Saltar semanas inteiras já passadas, sem iterar uma a uma.
  let k = Math.max(0, Math.floor((from.getTime() - duration - start.getTime()) / (7 * DAY)));
  for (; k < 60; k++) {
    const s = new Date(start.getTime());
    s.setDate(s.getDate() + 7 * k); // setDate respeita a mudança de hora
    if (s > to || s > until) break;
    const e = new Date(s.getTime() + duration);
    if (e >= from) out.push({ event: ev, start: s, end: e });
  }
  return out;
}

/** A próxima ocorrência (ou a que está a decorrer), para ordenar e para "Juntar à nossa agenda". */
export function nextOccurrence<E extends CommunityEventLike>(ev: E, now: Date, horizonDays = 180): Occurrence<E> | null {
  return occurrences(ev, now, new Date(now.getTime() + horizonDays * DAY))[0] ?? null;
}

// ─── Ordenação por blocos ────────────────────────────────────────────────────

export interface ListedEvent<E extends CommunityEventLike = CommunityEventLike> {
  event: E;
  occurrence: Occurrence<E>;
  distanceKm: number | null;
  ring: Ring;
  pref: 0 | 1;
  age: 0 | 1;
}

export interface BuildOptions {
  from: Date;
  to: Date;
  home: Municipality | null;
  municipalities: Map<string, Municipality>;
  prefs: Preferences;
  childAges: number[];
  showHidden: boolean;
  onlyFree?: boolean;
  kind?: EventKind | "todos";
  category?: string | "todas";
}

/**
 * Lista ordenada: bloco de distância ↑, "Mostrar primeiro" ↓, idades ↓, data ↑.
 * Sem hierarquia entre tipos: um encontro só vem primeiro se a família o preferir.
 * Os semanais aparecem uma vez, pela próxima ocorrência dentro da janela.
 */
export function buildList<E extends CommunityEventLike>(events: E[], o: BuildOptions): ListedEvent<E>[] {
  const out: ListedEvent<E>[] = [];
  for (const ev of events) {
    if (ev.status && ev.status !== "publicado") continue;
    if (!o.showHidden && isHidden(ev, o.prefs)) continue;
    if (o.onlyFree && !ev.is_free) continue;
    if (o.kind && o.kind !== "todos" && ev.kind !== o.kind) continue;
    if (o.category && o.category !== "todas" && !ev.categories.includes(o.category)) continue;
    const occ = occurrences(ev, o.from, o.to)[0];
    if (!occ) continue;
    const m = o.municipalities.get(ev.municipality_code);
    const d = o.home && m ? km(o.home, m) : null;
    out.push({ event: ev, occurrence: occ, distanceKm: d, ring: ring(d), pref: prefScore(ev, o.prefs), age: ageFit(ev, o.childAges) });
  }
  const sortKey = (x: ListedEvent<E>) => Math.max(x.occurrence.start.getTime(), o.from.getTime());
  out.sort((a, b) => a.ring - b.ring || b.pref - a.pref || b.age - a.age || sortKey(a) - sortKey(b));
  return out;
}

// ─── Interesses das crianças → preferências iniciais ─────────────────────────

const INTEREST_MAP: [RegExp, CategoryId][] = [
  [/anima|planta|jardim|oceano|inseto|geolog|meteor|natureza|astronom|cuidar de animais/i, "natureza"],
  [/experi|robó|robo|matem|biolog|físic|fisic|químic|quimic|ciênc|cienc|program|3d|astronom/i, "ciencia"],
  [/desenh|pintur|escult|fotograf|artesan|lego|constru|manua|arte/i, "arte_manuais"],
  [/músic|music|dança|danca/i, "musica_danca"],
  [/teatro|cinema|marioneta|circo/i, "teatro_espetaculos"],
  [/leitur|escrit|poesia|banda desenhada|storytelling|livro|histórias|historias/i, "livros_historias"],
  [/futebol|nata|ginást|ginast|ciclis|marcia|yoga|desport|movimento|caminh/i, "movimento"],
  [/históri|histori|arqueolog|tradiç|tradic|geograf|viage|patrim/i, "historia_patrimonio"],
];

/** Pré-preenche "O que preferimos" a partir dos interesses. Só produz "primeiro", nunca "esconder". */
export function prefsFromInterests(interests: string[]): Preferences {
  const prefs: Preferences = {};
  for (const raw of interests) {
    // "História" vai para história e património; "Histórias" (contos) para livros.
    for (const [re, cat] of INTEREST_MAP) {
      if (re.test(raw)) prefs[cat] = "primeiro";
    }
  }
  return prefs;
}

/** Valida e limpa preferências vindas da base de dados. */
export function cleanPrefs(raw: unknown): Preferences {
  const out: Preferences = {};
  if (!raw || typeof raw !== "object") return out;
  for (const opt of PREFERENCE_OPTIONS) {
    const v = (raw as Record<string, unknown>)[opt.id];
    if (v === "primeiro" || v === "esconder") out[opt.id] = v;
  }
  return out;
}
