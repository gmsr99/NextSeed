-- 025 — activities.plan_item_id deixa de bloquear a eliminação de crianças
--
-- A FK activities_plan_item_id_fkey não tinha cláusula ON DELETE (= NO ACTION).
-- Ao apagar uma criança, os weekly_plan_items dela são removidos por cascade;
-- uma atividade com child_id NULL ligada a esses itens não é removida e faz
-- a eliminação rebentar com 23503 (confirmado em teste transacional).
--
-- SET NULL (e não CASCADE): a atividade é o registo de algo que aconteceu e
-- pertence ao portefólio — apagar o item de plano deve desligar a ligação,
-- nunca apagar a memória. As atividades da própria criança continuam a ser
-- removidas pelo cascade de activities.child_id.

alter table activities
  drop constraint if exists activities_plan_item_id_fkey;

alter table activities
  add constraint activities_plan_item_id_fkey
  foreign key (plan_item_id) references weekly_plan_items(id) on delete set null;
