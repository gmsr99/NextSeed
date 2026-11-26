-- Antes de aplicar a 035 (T-12): só leitura, não altera nada.
-- 1. Famílias que a limpeza do ponto 3 vai apagar (convidados com família própria vazia)
select f.id, f.email, f.name, f.created_at,
       (select string_agg(m.family_id::text, ', ') from public.family_members m
         where m.user_id = f.user_id and m.family_id <> f.id) as membro_de
from public.families f
where f.onboarding_completed_at is null
  and not exists (select 1 from public.children c where c.family_id = f.id)
  and exists (select 1 from public.family_members m where m.user_id = f.user_id and m.family_id <> f.id)
order by f.created_at;

-- 2. Tabelas que apontam para families sem "on delete cascade": se alguma tiver
--    linhas destas famílias, o delete falha (e, dentro de accept_family_invite,
--    o convite deixa de poder ser aceite). Tem de dar zero linhas com contagem > 0.
select c.conrelid::regclass as tabela, c.conname, c.confdeltype
from pg_constraint c
where c.contype = 'f' and c.confrelid = 'public.families'::regclass and c.confdeltype not in ('c', 'n');
