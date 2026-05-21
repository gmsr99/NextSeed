-- Migration 012: weekly_content column + child_milestones table

-- 1. Add weekly_content column to weekly_plans
-- Stores per-child per-discipline curriculum content specified by the parent
-- Format: { "childId": { "language": "Vogais AR, ER, IR", "math": "Adição até 20" } }
ALTER TABLE weekly_plans ADD COLUMN IF NOT EXISTS weekly_content jsonb;

-- 2. Create child_milestones table for developmental milestone tracking
CREATE TABLE IF NOT EXISTS child_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date date NOT NULL,
  title text NOT NULL,
  description text,
  photo_url text,
  category text NOT NULL DEFAULT 'geral',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies for child_milestones
ALTER TABLE child_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can manage their milestones"
  ON child_milestones
  FOR ALL
  USING (family_id = my_family_id())
  WITH CHECK (family_id = my_family_id());

-- Index for common query patterns
CREATE INDEX IF NOT EXISTS child_milestones_child_id_date_idx
  ON child_milestones (child_id, date DESC);
