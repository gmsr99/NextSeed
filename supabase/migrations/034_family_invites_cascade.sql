-- 034 — Apagar a conta também quando a família enviou convites (25 nov)
--
-- family_invites.invited_by apontava para auth.users sem regra de eliminação
-- (NO ACTION). Quem tinha enviado um convite não conseguia apagar a conta: o
-- Postgres recusava apagar o utilizador e a edge function delete-family-account
-- respondia "ok" na mesma, sem apagar nada. Aconteceu com a conta antiga de
-- um membro da equipa a 22 nov.
--
-- Com cascata, os convites enviados apagam-se com a conta. É o certo para o
-- RGPD (direito ao apagamento): os convites guardam o email de quem foi
-- convidado. Os convites de uma família já caíam em cascata com a família.

alter table family_invites drop constraint if exists family_invites_invited_by_fkey;

alter table family_invites
  add constraint family_invites_invited_by_fkey
  foreign key (invited_by) references auth.users(id) on delete cascade;
