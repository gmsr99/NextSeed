// Financinhas no relatório trimestral (I-22, FIN_11 C2).
// Três competências fortes e três a trabalhar, em linguagem para a escola.
// Só entram competências já observadas pelo adulto (o nível nunca sobe por
// se ter dado uma aula). Nada disto vai para a IA.
import { currentLevels, lastEventBySkill, type SkillEvent } from "./levels";
import { LEVEL_LABELS, skillByCode, DOMAINS } from "./catalog";

export interface ReportSkill {
  code: string;
  name: string;
  /** Área (ex.: "Decisão e pensamento crítico") */
  area: string;
  level: number;
  levelLabel: string;
  /** O que o adulto observa quando a competência está presente */
  observable: string;
}

export interface FinancinhasReport {
  strong: ReportSkill[];
  toWork: ReportSkill[];
  /** Competências observadas até ao fim do período */
  observed: number;
}

const toSkill = (code: string, level: number): ReportSkill | null => {
  const s = skillByCode(code);
  if (!s) return null;
  return {
    code,
    name: s.name,
    area: DOMAINS.find((d) => d.code === s.domain)?.name ?? "",
    level,
    levelLabel: LEVEL_LABELS[level] ?? "",
    observable: s.observable,
  };
};

/**
 * Fortes: os níveis mais altos (a partir de "em desenvolvimento"), os mais
 * recentes primeiro em caso de empate. A trabalhar: os níveis mais baixos que
 * sobram. Com menos de duas competências observadas, não há secção.
 */
export function financinhasReport(events: SkillEvent[], until: string, n = 3): FinancinhasReport | null {
  const inPeriod = events.filter((e) => e.observed_on <= until);
  const levels = currentLevels(inPeriod);
  const last = lastEventBySkill(inPeriod);
  const codes = Object.keys(levels).filter((c) => skillByCode(c));
  if (codes.length < 2) return null;
  const recent = (c: string) => last[c]?.observed_on ?? "";
  const byStrength = [...codes].sort((a, b) => levels[b] - levels[a] || recent(b).localeCompare(recent(a)) || a.localeCompare(b));
  const strongCodes = byStrength.filter((c) => levels[c] >= 2).slice(0, n);
  const rest = codes.filter((c) => !strongCodes.includes(c));
  const toWorkCodes = [...rest].sort((a, b) => levels[a] - levels[b] || a.localeCompare(b)).slice(0, n);
  const map = (list: string[]) => list.map((c) => toSkill(c, levels[c])).filter((s): s is ReportSkill => !!s);
  return { strong: map(strongCodes), toWork: map(toWorkCodes), observed: codes.length };
}
