-- 040 — Versões do plano semanal (V-31, erro visto pelo Elton a 26 nov:
-- "duplicate key value violates unique constraint
-- weekly_plans_family_id_week_start_key")
--
-- A migração 003 trocou a regra "um plano por família e semana" por "uma
-- versão por família, semana e número de versão", mas na produção a regra
-- antiga ficou (com o nome da restrição ou como índice). Por isso regenerar e
-- guardar um plano já guardado falhava. A app contorna isto desde 26 nov
-- (substitui a última versão); esta migração repõe as versões.
-- Não apaga dados: só tira a restrição antiga e garante a nova.
-- Idempotente. Aplicar dentro de begin; … commit; a partir do main.

alter table weekly_plans drop constraint if exists weekly_plans_family_id_week_start_key;
drop index if exists weekly_plans_family_id_week_start_key;

do $$ begin
  alter table weekly_plans
    add constraint weekly_plans_family_week_version_key unique (family_id, week_start, version);
exception when duplicate_object or duplicate_table then null; end $$;
