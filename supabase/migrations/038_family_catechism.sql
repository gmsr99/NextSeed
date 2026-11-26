-- 038 — Catecismo em família (I-08, fase 2; três fases aprovadas pelo Elton a
-- 22 nov; pedido de implementação a 26 nov: "Começa agora a implementar o ramo
-- católico")
--
-- Uma pergunta por semana, para a família toda, aprendida de cor por etapas.
-- Guarda-se só, ao nível da família e dentro da Tradição da família:
--   catechism_name       o nome do livro que a família escreveu (ex.: "Catecismo de S. Pio X");
--   catechism_questions  a lista colada pela família: número e título de cada pergunta
--                        ([{"n": 12, "t": "Quem é Deus?"}]). As respostas ficam no livro;
--   catechism_pos        a pergunta em que vão (índice na lista, começa em 0).
-- Convicção religiosa é categoria especial (Art. 9.º RGPD): o consentimento é o da
-- Tradição da família e desligar apaga a linha inteira, com o catecismo. Nada
-- disto vai para a IA. Só colunas novas, sem apagar nada; a RLS não muda.
-- Idempotente. Aplicar dentro de begin; … commit; a partir do main.

alter table family_traditions
  add column if not exists catechism_name text,
  add column if not exists catechism_questions jsonb not null default '[]'::jsonb,
  add column if not exists catechism_pos smallint not null default 0;

do $$ begin
  alter table family_traditions
    add constraint family_traditions_catechism_name_len check (catechism_name is null or char_length(catechism_name) <= 120);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table family_traditions
    add constraint family_traditions_catechism_size check (jsonb_typeof(catechism_questions) = 'array' and jsonb_array_length(catechism_questions) <= 600);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table family_traditions
    add constraint family_traditions_catechism_pos check (catechism_pos >= 0);
exception when duplicate_object then null; end $$;
