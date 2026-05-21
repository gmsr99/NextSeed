-- Migration 013: Metodologia por criança
-- Adiciona campo methodology_id à tabela children para permitir
-- que cada criança tenha uma metodologia pedagógica preferencial.

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS methodology_id uuid REFERENCES methodologies(id);
