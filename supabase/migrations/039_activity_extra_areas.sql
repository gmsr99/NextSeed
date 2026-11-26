-- 039 — Uma atividade pode contar para várias áreas (R-04; nota do Elton no
-- teste V-22, 26 nov: "deveria dar para adicionar mais do que uma área
-- curricular, porque há atividades que trabalham várias coisas ao mesmo tempo")
--
-- discipline continua a ser a área principal; extra_disciplines guarda as
-- outras (as mesmas chaves de discipline). Os relatórios e o portefólio contam
-- a atividade em todas. Sem esta coluna, a app guarda só a área principal.
-- Só uma coluna nova, sem apagar nada; a RLS da tabela não muda.
-- Idempotente. Aplicar dentro de begin; … commit; a partir do main.

alter table activities
  add column if not exists extra_disciplines text[] not null default '{}';

do $$ begin
  alter table activities
    add constraint activities_extra_disciplines_len check (cardinality(extra_disciplines) <= 8);
exception when duplicate_object then null; end $$;
