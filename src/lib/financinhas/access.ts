// Quem vê o Financinhas.
//
// Enquanto o Gemini estiver no gratuito (Q-03, D-013) e o documento 04 não
// cobrir as observações sobre as crianças (Q-19), o módulo fica só para a
// equipa (team_admins), ou seja, para a família do fundador. Para abrir a
// todas as famílias, mudar para true.
export const FINANCINHAS_FOR_ALL = false;

export function canSeeFinancinhas(isTeamAdmin: boolean): boolean {
  return FINANCINHAS_FOR_ALL || isTeamAdmin;
}
