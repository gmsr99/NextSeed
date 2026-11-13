-- 026 — Índices de manuais por criança (I-01, Rumo do ano a partir do manual)
--
-- A família escreve o índice do manual que usa (títulos das unidades e página
-- onde começam). A app só calendariza: reparte as unidades pelas semanas do ano
-- letivo. Não guarda nem reproduz conteúdo dos manuais (doc 10, INS-05).
--
-- Um manual por criança e disciplina. Os dados são da família (RLS por
-- family_id) e caem em cascata com a criança ou com a família.

create table if not exists child_manuals (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  child_id    uuid not null references children(id) on delete cascade,
  discipline  text not null
    check (discipline in ('portugues', 'matematica', 'estudo_do_meio', 'ingles', 'artes_visuais')),
  title       text not null,
  -- [{ "title": "Unidade 1 — Números até 100", "page": 12 }, …] ("page" é opcional)
  entries     jsonb not null default '[]'::jsonb,
  -- A partir de quando o manual se reparte pelas semanas (quem começa a meio do
  -- ano não quer o índice espalhado desde setembro)
  start_date  date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (child_id, discipline)
);

alter table child_manuals enable row level security;

create policy "family_child_manuals" on child_manuals
  using (family_id = my_family_id())
  with check (family_id = my_family_id());

create index if not exists child_manuals_family_idx on child_manuals (family_id);
