-- 037 — Revisões que voltam ao fim de 3 vezes (DASH fase 3, P-26; item 9 da
-- lista de 26 nov, pedido do Elton: "Analisa quais faltam e avança")
--
-- Conta quantas revisões seguidas um tema já teve a "precisar de mais".
-- 0: ainda não voltou, ou consolidou. Ao chegar a 3, o tema deixa de ser
-- proposto sozinho no plano e aparece "com atenção" no Rumo do ano, com a
-- sugestão de outra abordagem. A família pode voltar a propô-lo (repõe 0).
-- Sem esta coluna, a app funciona como antes (revisões sem limite de vezes).
-- Só uma coluna nova, sem apagar nada. A RLS da tabela não muda.
-- Idempotente. Aplicar dentro de begin; … commit; a partir do main.

alter table child_content_progress
  add column if not exists review_count smallint not null default 0;

do $$ begin
  alter table child_content_progress
    add constraint child_content_progress_review_count_check check (review_count between 0 and 20);
exception when duplicate_object then null; end $$;
