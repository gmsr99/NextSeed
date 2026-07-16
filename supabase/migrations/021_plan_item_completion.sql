-- 021 — Conclusão de atividades do plano no dashboard "Hoje" (FASE 3.4)
-- Checkbox de conclusão por item do plano semanal. A RLS existente
-- (policy plan_items_family, FOR ALL) já cobre o UPDATE pela família.

alter table weekly_plan_items add column if not exists completed_at timestamptz;
