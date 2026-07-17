-- Migration 023: Unificar metodologias no modelo familiar
--
-- A migração 006 criou family_methodologies (multi-seleção, priority 1-3) — o
-- modelo que o motor criativo consome. A 013 adicionou children.methodology_id
-- (uma só metodologia por criança), que o onboarding e o WeeklyPlanner passaram
-- a usar. Os dois modelos nunca comunicaram: quem escolhia metodologia no
-- onboarding ficava com family_methodologies vazio e o motor criativo gerava
-- projetos genéricos.
--
-- A metodologia é da família, não da criança. Esta migração reconcilia os dados
-- no modelo familiar e remove a coluna duplicada.


-- ─── 1. Backfill: children.methodology_id → family_methodologies ──────────────
-- Irmãos com metodologias diferentes produzem várias metodologias para a mesma
-- família. row_number() distribui-as por prioridades distintas (a mais antiga
-- fica principal); o CHECK limita a 3, por isso o resto é descartado.

INSERT INTO family_methodologies (family_id, methodology_id, priority)
SELECT family_id, methodology_id, priority
FROM (
  SELECT
    c.family_id,
    c.methodology_id,
    ROW_NUMBER() OVER (
      PARTITION BY c.family_id
      ORDER BY MIN(c.created_at), c.methodology_id
    ) AS priority
  FROM children c
  WHERE c.methodology_id IS NOT NULL
  GROUP BY c.family_id, c.methodology_id
) ranked
WHERE priority <= 3
ON CONFLICT (family_id, methodology_id) DO NOTHING;


-- ─── 2. Remover a coluna duplicada ───────────────────────────────────────────

ALTER TABLE children DROP COLUMN IF EXISTS methodology_id;
