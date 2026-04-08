-- ============================================================================
-- NexSeed — Migration 006
-- Tabelas de Metodologias Pedagógicas
--
-- Lógica de triangulação:
--   Currículo DGE (obrigatório)
--   ⟷ Metodologias NexSeed (escolhidas pela família)
--   ⟷ Interesses da criança
--
-- Tabelas:
--   1. methodologies              — as 14 metodologias (dados globais, leitura pública)
--   2. methodology_principles     — princípios fundamentais de cada metodologia
--   3. methodology_activities     — atividades por metodologia × disciplina × faixa etária
--   4. methodology_compatibility  — matriz de compatibilidade entre metodologias
--   5. family_methodologies       — seleção de metodologias por família
-- ============================================================================


-- ─── 1. Methodologies ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS methodologies (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT        UNIQUE NOT NULL,
  name                TEXT        NOT NULL,
  category            TEXT        NOT NULL
                                  CHECK (category IN (
                                    'pedagogias-classicas',
                                    'natureza-experiencia',
                                    'alta-autonomia',
                                    'aprendizagem-ativa',
                                    'contemporaneo'
                                  )),
  short_description   TEXT        NOT NULL,
  philosophy_summary  TEXT,
  intensity           TEXT        NOT NULL
                                  CHECK (intensity IN ('muito-baixa', 'baixa', 'media', 'alta')),
  materials_cost      TEXT        NOT NULL
                                  CHECK (materials_cost IN ('baixo', 'medio', 'alto')),
  age_min             SMALLINT    NOT NULL CHECK (age_min >= 0),
  age_max             SMALLINT    NOT NULL CHECK (age_max <= 18),
  ai_generation_style TEXT        NOT NULL,
  keywords            TEXT[]      NOT NULL DEFAULT '{}',
  sort_order          SMALLINT    NOT NULL DEFAULT 0,
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  methodologies IS 'Catálogo global das 14 metodologias pedagógicas NexSeed.';
COMMENT ON COLUMN methodologies.ai_generation_style IS 'Instrução direta enviada à IA ao gerar planos semanais para famílias que selecionaram esta metodologia.';
COMMENT ON COLUMN methodologies.keywords IS 'Termos-chave para enriquecer o contexto do prompt enviado à IA.';


-- ─── 2. Methodology Principles ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS methodology_principles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_id  UUID        NOT NULL REFERENCES methodologies(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  sort_order      SMALLINT    NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE methodology_principles IS 'Princípios fundamentais de cada metodologia — usados na UI de seleção e no contexto da IA.';


-- ─── 3. Methodology Activities ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS methodology_activities (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_id       UUID        NOT NULL REFERENCES methodologies(id) ON DELETE CASCADE,
  discipline_key       TEXT        NOT NULL
                                   CHECK (discipline_key IN (
                                     'language',     -- Português / Comunicação
                                     'math',         -- Matemática
                                     'science',      -- Ciências Naturais / Estudo do Meio
                                     'arts',         -- Expressão Artística / Plástica
                                     'music',        -- Música
                                     'movement',     -- Educação Física / Movimento
                                     'life_skills',  -- Vida Prática / Autonomia
                                     'project',      -- Projetos / Investigação
                                     'social_emotional' -- Competências Socioemocionais / Cidadania
                                   )),
  age_min              SMALLINT    NOT NULL CHECK (age_min >= 0),
  age_max              SMALLINT    NOT NULL CHECK (age_max <= 18),
  activity_title       TEXT        NOT NULL,
  activity_description TEXT        NOT NULL,
  materials            TEXT[]      NOT NULL DEFAULT '{}',
  duration_minutes     SMALLINT    CHECK (duration_minutes > 0),
  sort_order           SMALLINT    NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  methodology_activities IS 'Atividades modelo por metodologia, disciplina e faixa etária. Núcleo da triangulação enviada à IA.';
COMMENT ON COLUMN methodology_activities.discipline_key IS 'Disciplina curricular. Alinha com curriculum_disciplines.discipline_key.';
COMMENT ON COLUMN methodology_activities.age_min IS 'Idade mínima (inclusiva) em anos completos para esta atividade.';
COMMENT ON COLUMN methodology_activities.age_max IS 'Idade máxima (inclusiva) em anos completos para esta atividade.';


-- ─── 4. Methodology Compatibility ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS methodology_compatibility (
  methodology_a_id  UUID  NOT NULL REFERENCES methodologies(id) ON DELETE CASCADE,
  methodology_b_id  UUID  NOT NULL REFERENCES methodologies(id) ON DELETE CASCADE,
  compatibility     TEXT  NOT NULL
                          CHECK (compatibility IN ('excelente', 'muito-boa', 'boa', 'limitada')),
  notes             TEXT,
  PRIMARY KEY (methodology_a_id, methodology_b_id),
  CHECK (methodology_a_id < methodology_b_id) -- evita duplicados simétricos
);

COMMENT ON TABLE methodology_compatibility IS 'Matriz de compatibilidade entre pares de metodologias. Usada na UI para sugerir combinações e na IA para ponderar contexto misto.';


-- ─── 5. Family Methodologies ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS family_methodologies (
  family_id       UUID        NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  methodology_id  UUID        NOT NULL REFERENCES methodologies(id) ON DELETE CASCADE,
  priority        SMALLINT    NOT NULL DEFAULT 1
                              CHECK (priority BETWEEN 1 AND 3),
  selected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (family_id, methodology_id)
);

COMMENT ON TABLE  family_methodologies IS 'Metodologias selecionadas por cada família. Priority: 1=principal, 2=secundária, 3=complementar.';
COMMENT ON COLUMN family_methodologies.priority IS '1=principal (peso total no prompt IA), 2=secundária (peso parcial), 3=complementar (referência).';


-- ─── Índices ──────────────────────────────────────────────────────────────────

-- methodologies
CREATE INDEX IF NOT EXISTS idx_methodologies_category
  ON methodologies (category);
CREATE INDEX IF NOT EXISTS idx_methodologies_intensity
  ON methodologies (intensity);
CREATE INDEX IF NOT EXISTS idx_methodologies_age
  ON methodologies (age_min, age_max);
CREATE INDEX IF NOT EXISTS idx_methodologies_active
  ON methodologies (is_active) WHERE is_active = TRUE;

-- methodology_principles
CREATE INDEX IF NOT EXISTS idx_methodology_principles_methodology
  ON methodology_principles (methodology_id, sort_order);

-- methodology_activities — índice principal para triangulação
CREATE INDEX IF NOT EXISTS idx_methodology_activities_triangulation
  ON methodology_activities (methodology_id, discipline_key, age_min, age_max);
CREATE INDEX IF NOT EXISTS idx_methodology_activities_discipline
  ON methodology_activities (discipline_key);
CREATE INDEX IF NOT EXISTS idx_methodology_activities_age
  ON methodology_activities (age_min, age_max);

-- methodology_compatibility
CREATE INDEX IF NOT EXISTS idx_methodology_compatibility_a
  ON methodology_compatibility (methodology_a_id);
CREATE INDEX IF NOT EXISTS idx_methodology_compatibility_b
  ON methodology_compatibility (methodology_b_id);

-- family_methodologies
CREATE INDEX IF NOT EXISTS idx_family_methodologies_family
  ON family_methodologies (family_id, priority);
CREATE INDEX IF NOT EXISTS idx_family_methodologies_methodology
  ON family_methodologies (methodology_id);


-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE methodologies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE methodology_principles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE methodology_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE methodology_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_methodologies      ENABLE ROW LEVEL SECURITY;

-- Conteúdo global: leitura pública para utilizadores autenticados
CREATE POLICY "methodologies_read_all"
  ON methodologies FOR SELECT TO authenticated USING (is_active = TRUE);

CREATE POLICY "methodology_principles_read_all"
  ON methodology_principles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "methodology_activities_read_all"
  ON methodology_activities FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "methodology_compatibility_read_all"
  ON methodology_compatibility FOR SELECT TO authenticated USING (TRUE);

-- family_methodologies: família gere as suas próprias seleções
CREATE POLICY "family_methodologies_select"
  ON family_methodologies FOR SELECT
  USING (family_id = my_family_id());

CREATE POLICY "family_methodologies_insert"
  ON family_methodologies FOR INSERT
  WITH CHECK (family_id = my_family_id());

CREATE POLICY "family_methodologies_update"
  ON family_methodologies FOR UPDATE
  USING (family_id = my_family_id());

CREATE POLICY "family_methodologies_delete"
  ON family_methodologies FOR DELETE
  USING (family_id = my_family_id());


-- ============================================================================
-- FIM DA MIGRATION 006
-- ============================================================================
