-- FASE 2 / Passo 2.1 — Estado de onboarding por família.
-- Aplicada em produção em 2026-06-12 via MCP (apply_migration). Idempotente.

ALTER TABLE public.families ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
ALTER TABLE public.families ADD COLUMN IF NOT EXISTS onboarding_step smallint NOT NULL DEFAULT 0;

-- Backfill: famílias já existentes (testes internos) não devem ser empurradas
-- para o wizard. Marca como concluído tudo o que foi criado antes desta migração.
UPDATE public.families
SET onboarding_completed_at = now()
WHERE onboarding_completed_at IS NULL;
