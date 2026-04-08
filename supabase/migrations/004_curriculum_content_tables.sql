-- Migration 004: Tabelas de Gestão de Conteúdos e Progresso Curricular
-- Criadas a partir dos ficheiros gestao_de_conteudos/[1-4]ano.json

-- Tabela 1: Conteúdos estáticos das GC (seed único, dados do MEC)
CREATE TABLE curriculum_contents (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_year text        NOT NULL CHECK (school_year IN ('1','2','3','4')),
  discipline  text        NOT NULL,
  period      text        NOT NULL CHECK (period IN ('1','2','3','all')),
  domain      text        NOT NULL,
  content     text        NOT NULL,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Tabela 2: Progresso por criança em cada conteúdo
CREATE TABLE child_content_progress (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      uuid        NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  content_id    uuid        NOT NULL REFERENCES curriculum_contents(id),
  status        text        NOT NULL DEFAULT 'not_started'
                            CHECK (status IN ('not_started','to_introduce','in_progress','consolidated','mastered')),
  success_level integer     CHECK (success_level BETWEEN 1 AND 3),
  taught_on     date,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, content_id)
);

CREATE INDEX idx_curriculum_contents_year_disc_period
  ON curriculum_contents (school_year, discipline, period);
CREATE INDEX idx_child_progress_child_status
  ON child_content_progress (child_id, status);
CREATE INDEX idx_child_progress_child_content
  ON child_content_progress (child_id, content_id);

ALTER TABLE curriculum_contents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_content_progress  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "curriculum_contents_read_all" ON curriculum_contents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "child_content_progress_family" ON child_content_progress
  FOR ALL TO authenticated
  USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE fm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE fm.user_id = auth.uid()
    )
  );
