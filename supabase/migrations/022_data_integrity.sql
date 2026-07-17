-- 022 — Integridade de dados (FASE 1.7)
-- NOTA: weekly_plans tem versionamento (coluna version, migração 003), por isso
-- a unicidade é por (family_id, week_start, version) — NUNCA só (family_id, week_start).

alter table weekly_plans
  add constraint weekly_plans_family_week_version_unique
  unique (family_id, week_start, version);

-- Valores de ano escolar limitados aos usados pela app:
-- SCHOOL_YEARS em src/lib/planGenerator.ts + "Pré-escolar" simples do
-- formulário de edição em src/pages/Children.tsx.
alter table children
  add constraint children_school_year_check
  check (school_year in (
    'Pré-escolar',
    'Pré-escolar 3 anos',
    'Pré-escolar 4 anos',
    'Pré-escolar 5/6 anos',
    '1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano'
  ));
