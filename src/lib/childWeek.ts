// A semana vista pela criança (D-027 e D-028, decisão do Elton a 26 nov).
// A criança é a autora do seu percurso: vê-se na semana (os interesses dela
// no título), sabe para onde vai (a pergunta ou o objetivo da semana) e
// celebra o que aprendeu e construiu. Sem pontos, prémios nem streaks.
// Usado pelo PDF do mapa da criança (R-13) e pela vista no ecrã (R-14).
// Inclui as perguntas orientadoras para o adulto (P-31).
import { stripOptional } from "@/lib/essentialPlan";

/** Fase da criança, para escolher a linguagem da página */
export type ChildStage = "pre" | "early" | "older";

export function childStage(schoolYear: string): ChildStage {
  const y = (schoolYear ?? "").toLowerCase().trim();
  if (y.startsWith("pré")) return "pre";
  const n = parseInt(y, 10);
  if (n === 1 || n === 2) return "early";
  return "older";
}

/**
 * Título da semana com os interesses da criança: "Semana de futebol e
 * dinossauros". No máximo dois interesses, para caber e não virar lista.
 * Sem interesses, devolve null e fica o título de sempre.
 */
export function weekHeadline(interests: string[] | null | undefined): string | null {
  const list = (interests ?? [])
    .map((i) => String(i ?? "").trim())
    .filter((i) => i.length > 0 && i.length <= 30)
    .slice(0, 2);
  if (list.length === 0) return null;
  return `Semana de ${list.join(" e ")}`;
}

/** O fio condutor da semana: "A grande pergunta" quando é pergunta, senão "O tema da semana" */
export function themeLine(theme: string | null | undefined): string | null {
  const t = String(theme ?? "").trim();
  if (!t) return null;
  return t.endsWith("?") ? `A grande pergunta: ${t}` : `O tema da semana: ${t}`;
}

/** Linha do topo: para onde vai esta semana (a criança escreve) */
export function openingPrompt(stage: ChildStage): string | null {
  if (stage === "early") return "O que quero descobrir esta semana:";
  if (stage === "older") return "O meu objetivo da semana:";
  return null;
}

/** Fecho da semana: o que aprendi e o que construí (mentalidade de projeto) */
export function closingPrompts(stage: ChildStage): string[] {
  if (stage === "pre") return ["Desenha o que aprendeste", "Desenha o que construíste"];
  if (stage === "early") return ["Esta semana aprendi…", "E construí…"];
  return ["Esta semana aprendi…", "E construí…", "Levo para a próxima semana:"];
}

/** Título curto de uma atividade, na língua da criança (até 6 palavras; no pré-escolar, 3) */
export function childItemText(title: string, stage: ChildStage): string {
  const words = stage === "pre" ? 3 : 6;
  const t = stripOptional(title).replace(/^Leitura:\s*/i, "").replace(/^Rever\s*·\s*/i, "").trim();
  const list = t.split(/\s+/).filter(Boolean);
  return list.length > words ? `${list.slice(0, words).join(" ")}…` : t;
}

/**
 * P-31: perguntas que ajudam o adulto a escolher os interesses da semana
 * com o seu discernimento, em vez de só "o que te apetece?". Rodam por
 * semana (3 de cada vez). Não se guardam nem vão para a IA: servem o adulto.
 */
export const GUIDING_QUESTIONS = [
  "O que pediu para ver ou fazer mais de 5 vezes esta semana?",
  "Onde ficou mais tempo sem dar pelo tempo passar?",
  "O que construiu ou inventou sem ninguém lhe pedir?",
  "Onde desistiu depressa, e o que achas que faltou?",
  "Que pergunta fez que ficou sem resposta?",
  "Do que falou com mais entusiasmo à mesa ou no carro?",
  "Que coisa da casa ou da rua lhe chamou a atenção?",
];

export function guidingQuestions(weekStart: Date, count = 3): string[] {
  // Número da semana a partir de uma segunda-feira fixa: muda todas as semanas
  const ref = Date.UTC(2026, 0, 5);
  const day = Date.UTC(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
  const week = Math.floor((day - ref) / (7 * 86400000));
  const n = GUIDING_QUESTIONS.length;
  const start = (((week * count) % n) + n) % n;
  return Array.from({ length: Math.min(count, n) }, (_, k) => GUIDING_QUESTIONS[(start + k) % n]);
}
