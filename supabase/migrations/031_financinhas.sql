-- 031 — Financinhas (literacia financeira e mentalidade empreendedora, 5–12 anos)
--
-- Substitui a antiga página estática de Literacia Financeira. O catálogo
-- (26 competências, 23 temas, 12 sessões do trilho, 8 modos de descoberta)
-- vive no código (src/lib/financinhas/catalog.ts), porque é igual para todas
-- as famílias e não tem dados pessoais. Aqui ficam só os dados de cada criança.
--
-- ⚠️ São dados de menores (observações do adulto sobre o comportamento da
-- criança com dinheiro). Por isso:
--   · tudo filtra por family_id e a RLS valida com my_family_id();
--   · tudo cai em cascata com a criança ou com a família (apagar conta = apagar
--     estes dados);
--   · não há nenhuma tabela para a criança ver: a app é do adulto (D1).
--
-- Regra de ouro: os níveis NÃO se guardam; derivam-se de fin_skill_events.
-- Uma observação ('observacao') nunca faz descer um nível (a regra está em
-- src/lib/financinhas/levels.ts e testada). Dar uma aula não gera eventos.
--
-- Publicar: aplicar este ficheiro no SQL editor do Supabase de produção.
-- Enquanto não estiver aplicado, a página /financinhas mostra um aviso e não
-- grava nada.

-- ─── Perfil da criança no Financinhas ────────────────────────────────────────
create table if not exists fin_profiles (
  child_id        uuid primary key references children(id) on delete cascade,
  family_id       uuid not null references families(id) on delete cascade,
  stage           text not null default 'trilho' check (stage in ('trilho', 'ciclo')),
  allowance_cents integer check (allowance_cents is null or allowance_cents between 0 and 20000),
  -- dia do ritual da semanada: 1 = segunda … 7 = domingo
  ritual_weekday  smallint not null default 6 check (ritual_weekday between 1 and 7),
  -- 'generico' por defeito; 'original' (personagens de marca) só em uso
  -- familiar privado e só a equipa o pode ligar na interface
  character_mode  text not null default 'generico' check (character_mode in ('generico', 'original')),
  started_on      date not null default current_date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Aulas (geradas pela app ou importadas do histórico) ─────────────────────
create table if not exists fin_lessons (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references families(id) on delete cascade,
  child_id        uuid not null references children(id) on delete cascade,
  status          text not null default 'por_dar' check (status in ('por_dar', 'dada')),
  given_on        date,
  tier            text check (tier in ('5-6', '7-8', '9-12')),
  track_session   smallint check (track_session between 1 and 12),
  theme_numbers   smallint[] not null default '{}',
  skill_codes     text[] not null default '{}',
  discovery_mode  text check (discovery_mode is null or discovery_mode ~ '^MD[1-8]$'),
  protagonist     text,
  module_week     smallint not null default 1 check (module_week between 1 and 3),
  universe        text,
  -- o que o adulto escreveu para esta aula (vai para o Gemini, sem nomes)
  real_situation  text,
  title           text,
  notebook_prompt text check (notebook_prompt is null or char_length(notebook_prompt) <= 5000),
  quiz_md         text,
  activities_md   text,
  challenge_md    text,
  adult_guide_md  text,
  tracking_md     text,
  content_md      text,
  notes           text,
  source          text not null default 'app' check (source in ('app', 'importada')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (status = 'por_dar' or given_on is not null or source = 'importada')
);

create index if not exists fin_lessons_child_idx on fin_lessons (child_id, given_on desc);
create index if not exists fin_lessons_family_idx on fin_lessons (family_id);

-- ─── Sinais "o que observar" (confirmar sobe o nível) ────────────────────────
create table if not exists fin_signals (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references families(id) on delete cascade,
  child_id     uuid not null references children(id) on delete cascade,
  lesson_id    uuid references fin_lessons(id) on delete cascade,
  origin       text not null default 'aula' check (origin in ('aula', 'ritual')),
  skill_code   text not null check (skill_code ~ '^(CP|AD[1-3]|DC[1-4]|CS[1-4]|VL[1-5]|RH[1-4]|GP[1-5])$'),
  target_level smallint not null check (target_level between 1 and 4),
  description  text not null,
  status       text not null default 'pendente' check (status in ('pendente', 'confirmado', 'descartado')),
  resolved_on  date,
  created_at   timestamptz not null default now()
);

create index if not exists fin_signals_child_idx on fin_signals (child_id, status);

-- ─── Histórico de níveis (o nível atual deriva daqui) ────────────────────────
create table if not exists fin_skill_events (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  child_id    uuid not null references children(id) on delete cascade,
  skill_code  text not null check (skill_code ~ '^(CP|AD[1-3]|DC[1-4]|CS[1-4]|VL[1-5]|RH[1-4]|GP[1-5])$'),
  level       smallint not null check (level between 1 and 4),
  origin      text not null check (origin in ('observacao', 'ajuste', 'fotografia')),
  note        text,
  observed_on date not null default current_date,
  signal_id   uuid references fin_signals(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists fin_skill_events_child_idx on fin_skill_events (child_id, observed_on);

-- ─── Ritual da semanada (registo de 30 segundos) ────────────────────────────
create table if not exists fin_rituals (
  id             uuid primary key default gen_random_uuid(),
  family_id      uuid not null references families(id) on delete cascade,
  child_id       uuid not null references children(id) on delete cascade,
  week_start     date not null,
  done           boolean not null default true,
  amount_cents   integer check (amount_cents is null or amount_cents between 0 and 20000),
  -- a linha mais importante do caderninho: "escolhi ___ em vez de ___"
  choice_text    text,
  floor_used     boolean not null default false,
  floor_restored boolean not null default false,
  question       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (child_id, week_start)
);

-- ─── Fotografia leve de entrada e de saída do trilho (6 perguntas) ───────────
create table if not exists fin_snapshots (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references families(id) on delete cascade,
  child_id   uuid not null references children(id) on delete cascade,
  kind       text not null check (kind in ('entrada', 'saida')),
  -- { "q1": "às vezes", …, "q6": "à vontade" }
  answers    jsonb not null default '{}'::jsonb,
  taken_on   date not null default current_date,
  created_at timestamptz not null default now(),
  unique (child_id, kind)
);

-- ─── RLS: só a própria família ───────────────────────────────────────────────
alter table fin_profiles     enable row level security;
alter table fin_lessons      enable row level security;
alter table fin_signals      enable row level security;
alter table fin_skill_events enable row level security;
alter table fin_rituals      enable row level security;
alter table fin_snapshots    enable row level security;

-- A criança tem de ser da mesma família (impede ligar dados a crianças alheias)
create policy "fin_profiles_own" on fin_profiles
  using (family_id = my_family_id())
  with check (family_id = my_family_id() and child_id in (select id from children where family_id = my_family_id()));

create policy "fin_lessons_own" on fin_lessons
  using (family_id = my_family_id())
  with check (family_id = my_family_id() and child_id in (select id from children where family_id = my_family_id()));

create policy "fin_signals_own" on fin_signals
  using (family_id = my_family_id())
  with check (family_id = my_family_id() and child_id in (select id from children where family_id = my_family_id()));

create policy "fin_skill_events_own" on fin_skill_events
  using (family_id = my_family_id())
  with check (family_id = my_family_id() and child_id in (select id from children where family_id = my_family_id()));

create policy "fin_rituals_own" on fin_rituals
  using (family_id = my_family_id())
  with check (family_id = my_family_id() and child_id in (select id from children where family_id = my_family_id()));

create policy "fin_snapshots_own" on fin_snapshots
  using (family_id = my_family_id())
  with check (family_id = my_family_id() and child_id in (select id from children where family_id = my_family_id()));
