-- 027 — Calendário da família (P-24)
--
-- Quando começa e acaba o ano da família e em que datas pára. O Rumo do ano
-- reparte o currículo e os manuais por estas semanas. Sem linha nesta tabela,
-- a app usa o calendário escolar oficial. Uma linha por família; só datas,
-- nenhum dado de crianças.

create table if not exists family_calendars (
  family_id     uuid primary key references families(id) on delete cascade,
  year_start    date not null,
  year_end      date not null,
  -- [{ "from": "2026-12-21", "to": "2027-01-01" }, …]
  breaks        jsonb not null default '[]'::jsonb,
  -- última semana de cada período sem conteúdos novos
  review_weeks  boolean not null default true,
  updated_at    timestamptz not null default now(),
  check (year_end > year_start)
);

alter table family_calendars enable row level security;

create policy "family_calendars_own" on family_calendars
  using (family_id = my_family_id())
  with check (family_id = my_family_id());
