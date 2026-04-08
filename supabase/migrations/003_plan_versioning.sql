-- ============================================================
-- 003_plan_versioning.sql
-- Versionamento de planos semanais.
--
-- Objetivo: permitir que múltiplas gerações para a mesma semana
-- coexistam como versões distintas, evitando perda de trabalho.
--
-- weekly_plans (family_id, week_start, version) — chave única
-- A versão mais alta = versão mais recente.
-- ============================================================

-- ─── 1. Coluna version ───────────────────────────────────────────────────────
ALTER TABLE weekly_plans
  ADD COLUMN IF NOT EXISTS version SMALLINT NOT NULL DEFAULT 1;

-- ─── 2. Remover constraint antigo (uma linha por semana) ─────────────────────
-- Vários nomes possíveis dependendo de como foi criada a tabela.
ALTER TABLE weekly_plans
  DROP CONSTRAINT IF EXISTS weekly_plans_family_id_week_start_key;

ALTER TABLE weekly_plans
  DROP CONSTRAINT IF EXISTS weekly_plans_family_week_key;

-- ─── 3. Novo constraint: uma linha por (família, semana, versão) ─────────────
ALTER TABLE weekly_plans
  ADD CONSTRAINT weekly_plans_family_week_version_key
  UNIQUE (family_id, week_start, version);

-- ─── 4. Índice para carregar a versão mais recente de forma eficiente ─────────
CREATE INDEX IF NOT EXISTS idx_weekly_plans_latest
  ON weekly_plans (family_id, week_start, version DESC);

-- ─── 5. Comentários ───────────────────────────────────────────────────────────
COMMENT ON COLUMN weekly_plans.version IS
  'Versão do plano para esta semana. '
  'Cada nova geração com IA cria uma versão mais alta. '
  'A versão mais alta é a activa. Versões antigas ficam disponíveis para restauro.';
