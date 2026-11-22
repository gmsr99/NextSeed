-- 030 — A nossa semana (P-18 e versão mínima do P-04, nota de testes de 22 nov)
--
-- Cada família diz como é a sua semana de estudo: para cada dia (segunda a
-- sexta) se é dia completo, dia curto (cerca de 1 hora, só de manhã) ou sem
-- estudo, e se inclui a saída "Ver Mundo" à sexta. O plano semanal, o horário
-- e o guia seguem isto. Sem linha nesta tabela, a app usa a semana de sempre
-- (segunda a sexta, dia completo, saída à sexta).
--
-- Só dados da família, nenhum dado de crianças. Tabela à parte (e não uma
-- coluna em family_calendars) para não obrigar a criar um calendário próprio.

create table if not exists family_week_routines (
  family_id   uuid primary key references families(id) on delete cascade,
  -- ["full","full","full","full","short"]: segunda a sexta
  days        jsonb not null default '["full","full","full","full","full"]'::jsonb,
  -- saída "Ver Mundo" à sexta
  outing      boolean not null default true,
  updated_at  timestamptz not null default now(),
  check (jsonb_typeof(days) = 'array' and jsonb_array_length(days) = 5)
);

alter table family_week_routines enable row level security;

create policy "family_week_routines_own" on family_week_routines
  using (family_id = my_family_id())
  with check (family_id = my_family_id());
