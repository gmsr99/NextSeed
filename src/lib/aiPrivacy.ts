// Minimização dos dados das crianças enviados ao Gemini (backlog P-03, doc 04 §2).
//
// Por defeito o pedido ao modelo leva um pseudónimo ("Criança A", "Criança B")
// em vez do nome. O modelo não precisa do nome para gerar boas atividades: a
// personalização vem do ano escolar, dos interesses e do currículo.
//
// Para voltar a enviar nomes, muda SEND_CHILD_NAMES_TO_AI para `true`. Mesmo
// assim só se envia o primeiro nome, nunca o apelido.

import type { Child } from "./types";

export const SEND_CHILD_NAMES_TO_AI = false;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** Nome que o modelo vê para a criança na posição `index` do pedido. */
export function aiLabel(name: string, index: number): string {
  if (SEND_CHILD_NAMES_TO_AI) return firstName(name);
  return `Criança ${LETTERS[index] ?? String(index + 1)}`;
}

/** Cópias das crianças com o nome substituído pelo rótulo do pedido. */
export function withAiLabels<T extends Pick<Child, "name">>(children: T[]): T[] {
  return children.map((c, i) => ({ ...c, name: aiLabel(c.name, i) }));
}

/** Instrução para o modelo não escrever os pseudónimos nos textos. */
export const AI_NAME_RULE = SEND_CHILD_NAMES_TO_AI
  ? ""
  : "\n> As crianças estão identificadas por pseudónimos (Criança A, Criança B…). Nos títulos, descrições e materiais NUNCA escrevas o pseudónimo: refere-te a ela como \"a criança\".\n";

/**
 * Repõe o primeiro nome real onde o modelo tenha, ainda assim, escrito um
 * pseudónimo. Aceita "Criança A" e "criança A".
 */
export function restoreNames(text: string, realNames: string[]): string {
  if (SEND_CHILD_NAMES_TO_AI || !text) return text;
  return text.replace(/\b([Cc])riança ([A-Z])\b/g, (match, _c, letter: string) => {
    const idx = LETTERS.indexOf(letter);
    const name = realNames[idx];
    return name ? firstName(name) : match;
  });
}
