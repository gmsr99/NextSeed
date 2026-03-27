-- ============================================================================
-- NexSeed — Migration 001
-- Tabelas: extracurricular_activities e nexseed_curriculum
-- Coluna adicional: weekly_plans.reading_theme
-- ============================================================================

-- ─── 1. Atividades Extracurriculares ──────────────────────────────────────────

create table if not exists extracurricular_activities (
  id                    uuid primary key default gen_random_uuid(),
  family_id             uuid references families(id) on delete cascade not null,
  child_id              uuid references children(id) on delete set null,
  name                  text not null,
  type                  text,                          -- Desporto, Música, Natação, etc.
  location              text,
  day_of_week           int check (day_of_week between 1 and 7),  -- 1=Seg … 7=Dom
  start_time            text,                          -- "16:00"
  end_time              text,                          -- "17:30"
  travel_time_minutes   int not null default 0,
  notes                 text,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz
);

-- RLS
alter table extracurricular_activities enable row level security;

create policy "Família vê as suas atividades extracurriculares"
  on extracurricular_activities for select
  using (family_id = my_family_id());

create policy "Família gere as suas atividades extracurriculares"
  on extracurricular_activities for all
  using (family_id = my_family_id());

-- Índices
create index if not exists idx_extracurricular_family  on extracurricular_activities(family_id);
create index if not exists idx_extracurricular_child   on extracurricular_activities(child_id);
create index if not exists idx_extracurricular_day     on extracurricular_activities(day_of_week);


-- ─── 2. Currículo NexSeed ─────────────────────────────────────────────────────
-- Estrutura paralela ao curriculum_disciplines (currículo nacional),
-- mas para os objetivos pedagógicos próprios do NexSeed.
-- Permite triangulação: currículo NexSeed + currículo nacional + interesses da criança.

create table if not exists nexseed_curriculum (
  id              uuid primary key default gen_random_uuid(),
  school_year     text not null,         -- "Pré-escolar 3 anos", "1º ano", etc.
  discipline_key  text not null,         -- language, math, world, expression, ...
  discipline_name text not null,
  area            text,                  -- ex: "Competências Socioemocionais"
  objective       text not null,         -- descrição do objetivo
  description     text,                  -- como é trabalhado na prática NexSeed
  activities      jsonb,                 -- exemplos de atividades
  skills          text[],                -- competências desenvolvidas
  difficulty      text check (difficulty in ('introdução', 'consolidação', 'extensão')),
  source          text default 'nexseed',-- "nexseed" | "dge" | "reggio" | "mem"
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- RLS: o currículo NexSeed é global (leitura pública, escrita admin)
alter table nexseed_curriculum enable row level security;

create policy "Leitura pública do currículo NexSeed"
  on nexseed_curriculum for select
  using (true);

-- Índices
create index if not exists idx_nexseed_curriculum_year  on nexseed_curriculum(school_year);
create index if not exists idx_nexseed_curriculum_disc  on nexseed_curriculum(discipline_key);
create index if not exists idx_nexseed_curriculum_area  on nexseed_curriculum(area);


-- ─── 3. Adicionar coluna reading_theme à tabela weekly_plans ─────────────────
-- Armazena o tema semanal de Leitura e Portefólio separado das notas gerais.
-- (Enquanto não existe esta coluna, o tema é serializado em JSON no campo notes)

alter table weekly_plans
  add column if not exists reading_theme text;


-- ─── 4. Seed inicial do currículo NexSeed ─────────────────────────────────────
-- Objetivos-âncora por ano/disciplina (podem ser expandidos via interface)

insert into nexseed_curriculum (school_year, discipline_key, discipline_name, area, objective, description, difficulty)
values
  -- Pré-escolar (geral)
  ('Pré-escolar 3 anos', 'language',    'Linguagem',       'Comunicação',           'Escutar histórias curtas e recontar com palavras próprias', 'Narrativa oral com apoio de imagens ou dedoches', 'introdução'),
  ('Pré-escolar 3 anos', 'math',        'Matemática',      'Pensamento Lógico',     'Contar objetos até 5 com correspondência uno-a-um',          'Contagem com objetos concretos (pedras, botões)', 'introdução'),
  ('Pré-escolar 3 anos', 'expression',  'Expressão',       'Criatividade',          'Explorar materiais plásticos de forma sensorial',            'Pintura com dedos, barro, água e areia',          'introdução'),
  ('Pré-escolar 3 anos', 'world',       'Descoberta',      'Ciência Natural',       'Observar e nomear elementos da natureza próxima',            'Exploração ao ar livre com lupa e caderno',       'introdução'),

  ('Pré-escolar 4 anos', 'language',    'Linguagem',       'Comunicação',           'Identificar sons iniciais e rimar palavras simples',          'Jogos fonológicos, lengalengas, rimas',           'introdução'),
  ('Pré-escolar 4 anos', 'math',        'Matemática',      'Pensamento Lógico',     'Contar e comparar conjuntos até 10',                         'Classificar por cor, tamanho, forma',             'introdução'),
  ('Pré-escolar 4 anos', 'expression',  'Expressão',       'Criatividade',          'Criar composições visuais com intenção narrativa',           'Colagem, pintura temática, teatro de sombras',    'consolidação'),
  ('Pré-escolar 4 anos', 'world',       'Descoberta',      'Ciência Natural',       'Distinguir seres vivos de objetos inanimados',               'Observação de insetos, plantas, experiências simples', 'introdução'),

  ('Pré-escolar 5/6 anos', 'language',  'Linguagem',       'Comunicação',           'Reconhecer algumas letras e escrever o próprio nome',        'Letra do nome, alfabeto, sons de vogais',         'introdução'),
  ('Pré-escolar 5/6 anos', 'math',      'Matemática',      'Pensamento Lógico',     'Reconhecer números até 20 e fazer somas simples',            'Jogo com dados, reta numérica visual',            'consolidação'),
  ('Pré-escolar 5/6 anos', 'expression','Expressão',       'Criatividade',          'Dramatizar histórias com personagens e diálogo',             'Teatro em casa, fantoches, histórias encenadas',  'consolidação'),
  ('Pré-escolar 5/6 anos', 'world',     'Descoberta',      'Ciência Natural',       'Descrever o ciclo das estações e hábitos de animais',        'Calendário de observação mensal',                 'introdução'),

  -- 1º ano
  ('1º ano', 'language',    'Português',        'Língua Materna',         'Ler com fluência palavras e frases simples',               'Leitura guiada com o Super Miúdos ou textos temáticos', 'consolidação'),
  ('1º ano', 'math',        'Matemática',       'Raciocínio Numérico',    'Adicionar e subtrair até 20 com estratégias variadas',     'Problemas contextualizados no interesse da semana',     'consolidação'),
  ('1º ano', 'world',       'Estudo do Meio',   'Ciências Naturais',      'Identificar partes do corpo e os cinco sentidos',          'Experiências sensoriais, mapa do corpo',               'introdução'),
  ('1º ano', 'english',     'Inglês',            'Língua Estrangeira',    'Nomear cores, números e animais em inglês',                'Canções, flashcards, jogos de vocabulário',            'introdução'),
  ('1º ano', 'expression',  'Expressão Artística','Criatividade',         'Usar técnicas básicas de desenho e pintura',               'Técnica de linhas, aguarela, colagem natural',         'introdução'),
  ('1º ano', 'project',     'Projeto',           'Investigação',          'Formular uma pergunta e pesquisar a resposta',             'Projeto de investigação com registo ilustrado',        'introdução'),
  ('1º ano', 'reading',     'Leitura e Portefólio','Literacia',           'Compreender e reconstruir uma história em 4 episódios',    'Mini-série semanal sobre tema de interesse',           'consolidação'),

  -- 2º ano
  ('2º ano', 'language',    'Português',        'Língua Materna',         'Escrever textos com início, meio e fim',                   'Escrita criativa temática, revisão a pares',           'consolidação'),
  ('2º ano', 'math',        'Matemática',       'Raciocínio Numérico',    'Dominar as tabuadas do 2 ao 5',                           'Jogos de tabuada contextualizados',                    'consolidação'),
  ('2º ano', 'world',       'Estudo do Meio',   'Ciências Naturais',      'Classificar animais e plantas por características',        'Fichas de observação, saída ao jardim',                'consolidação'),
  ('2º ano', 'english',     'Inglês',           'Língua Estrangeira',     'Produzir frases com "I like", "I have", "I can"',          'Diálogos guiados, vídeos simples',                     'consolidação'),
  ('2º ano', 'project',     'Projeto',          'Investigação',           'Construir um produto final e apresentá-lo',                'Maqueta, cartaz, apresentação oral à família',         'consolidação'),
  ('2º ano', 'reading',     'Leitura e Portefólio','Literacia',           'Interpretar e responder a perguntas sobre textos',         'Portefólio com reflexão e ilustração',                 'consolidação')

on conflict do nothing;

-- ============================================================================
-- FIM DA MIGRATION 001
-- ============================================================================
