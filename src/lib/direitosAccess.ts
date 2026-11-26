// I-13: quem vê "Direitos e deveres". Enquanto os textos de
// src/content/direitos.ts não estiverem revistos por um jurista, só a equipa.
// Depois da revisão, mudar para true (e registar a data no backlog).
export const DIREITOS_REVISTO = false;

export function canSeeDireitos(isTeamAdmin: boolean): boolean {
  return DIREITOS_REVISTO || isTeamAdmin;
}
