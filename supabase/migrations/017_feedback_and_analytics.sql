-- FASE 5 — Sistema de Feedback In-App e Analytics.
-- Aplicada em produção via MCP (apply_migration). Registada aqui para o repo
-- refletir o estado da BD. Operações idempotentes (IF NOT EXISTS / OR REPLACE /
-- DROP+CREATE POLICY), seguras de reaplicar.
--
-- Tabelas: analytics_events, feedback_submissions, feedback_answers,
-- feedback_trigger_state, feedback_config, team_admins. Função is_team_admin()
-- + RPC bump_trigger_counter(). Bucket privado feedback-screenshots.
-- Convenções: search_path fixo nas funções SECURITY DEFINER (ver 014),
-- políticas de storage por pasta do utilizador (ver 015).
--
-- NOTA: is_team_admin() é SECURITY DEFINER e executável por authenticated — é
-- necessário porque as políticas RLS a invocam. Só revela o estado de admin do
-- próprio utilizador (não explorável). Mesma postura de my_family_id() (014).

-- ─── 1. team_admins + is_team_admin() ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.team_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_admins_select_own" ON public.team_admins;
CREATE POLICY "team_admins_select_own"
  ON public.team_admins FOR SELECT
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_team_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.team_admins WHERE user_id = auth.uid());
$function$;

REVOKE EXECUTE ON FUNCTION public.is_team_admin() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_team_admin() TO authenticated;

-- ─── 2. analytics_events ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id   uuid REFERENCES public.families(id) ON DELETE SET NULL,
  event       text NOT NULL,
  props       jsonb NOT NULL DEFAULT '{}',
  screen      text,
  session_id  uuid,
  app_version text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created
  ON public.analytics_events (event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_family_created
  ON public.analytics_events (family_id, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_events_insert_own" ON public.analytics_events;
CREATE POLICY "analytics_events_insert_own"
  ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "analytics_events_select_admin" ON public.analytics_events;
CREATE POLICY "analytics_events_select_admin"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.is_team_admin());

-- ─── 3. feedback_submissions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback_submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id      uuid REFERENCES public.families(id) ON DELETE SET NULL,
  instrument     text NOT NULL CHECK (instrument IN ('A','B1','B2','B3','B4','B5','C','D')),
  status         text NOT NULL DEFAULT 'shown'
                 CHECK (status IN ('shown','partial','completed','dismissed')),
  evento_gatilho text,
  ecra_origem    text,
  app_version    text,
  session_id     uuid,
  created_at     timestamptz NOT NULL DEFAULT now(),
  completed_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_instrument
  ON public.feedback_submissions (instrument, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_user
  ON public.feedback_submissions (user_id, created_at DESC);

ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_submissions_insert_own" ON public.feedback_submissions;
CREATE POLICY "feedback_submissions_insert_own"
  ON public.feedback_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_submissions_update_own" ON public.feedback_submissions;
CREATE POLICY "feedback_submissions_update_own"
  ON public.feedback_submissions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_submissions_select_own_or_admin" ON public.feedback_submissions;
CREATE POLICY "feedback_submissions_select_own_or_admin"
  ON public.feedback_submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_team_admin());

-- ─── 4. feedback_answers ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback_answers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.feedback_submissions(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_key  text NOT NULL,
  value         jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, question_key)
);
CREATE INDEX IF NOT EXISTS idx_feedback_answers_submission
  ON public.feedback_answers (submission_id);

ALTER TABLE public.feedback_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_answers_insert_own" ON public.feedback_answers;
CREATE POLICY "feedback_answers_insert_own"
  ON public.feedback_answers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_answers_update_own" ON public.feedback_answers;
CREATE POLICY "feedback_answers_update_own"
  ON public.feedback_answers FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_answers_select_own_or_admin" ON public.feedback_answers;
CREATE POLICY "feedback_answers_select_own_or_admin"
  ON public.feedback_answers FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_team_admin());

-- ─── 5. feedback_trigger_state + bump_trigger_counter ─────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback_trigger_state (
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  key           text NOT NULL,
  counter       int NOT NULL DEFAULT 0,
  shown_count   int NOT NULL DEFAULT 0,
  last_shown_at timestamptz,
  scheduled_for timestamptz,
  consumed      boolean NOT NULL DEFAULT false,
  meta          jsonb NOT NULL DEFAULT '{}',
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
ALTER TABLE public.feedback_trigger_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_trigger_state_select_own" ON public.feedback_trigger_state;
CREATE POLICY "feedback_trigger_state_select_own"
  ON public.feedback_trigger_state FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_trigger_state_insert_own" ON public.feedback_trigger_state;
CREATE POLICY "feedback_trigger_state_insert_own"
  ON public.feedback_trigger_state FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_trigger_state_update_own" ON public.feedback_trigger_state;
CREATE POLICY "feedback_trigger_state_update_own"
  ON public.feedback_trigger_state FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Incremento atómico do contador de um gatilho; devolve o novo valor.
CREATE OR REPLACE FUNCTION public.bump_trigger_counter(p_key text)
  RETURNS int
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path = ''
AS $function$
  INSERT INTO public.feedback_trigger_state (user_id, key, counter)
  VALUES (auth.uid(), p_key, 1)
  ON CONFLICT (user_id, key) DO UPDATE
    SET counter = public.feedback_trigger_state.counter + 1,
        updated_at = now()
  RETURNING counter;
$function$;

REVOKE EXECUTE ON FUNCTION public.bump_trigger_counter(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.bump_trigger_counter(text) TO authenticated;

-- ─── 6. feedback_config ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback_config (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_config_select_all" ON public.feedback_config;
CREATE POLICY "feedback_config_select_all"
  ON public.feedback_config FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "feedback_config_update_admin" ON public.feedback_config;
CREATE POLICY "feedback_config_update_admin"
  ON public.feedback_config FOR UPDATE TO authenticated
  USING (public.is_team_admin())
  WITH CHECK (public.is_team_admin());

INSERT INTO public.feedback_config (key, value) VALUES
  ('pricing_question_active', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ─── 7. families: leitura para admin (resolver nomes/emails no dashboard) ──────
DROP POLICY IF EXISTS "families_select_admin" ON public.families;
CREATE POLICY "families_select_admin"
  ON public.families FOR SELECT TO authenticated
  USING (public.is_team_admin());

-- ─── 8. Bucket privado feedback-screenshots ───────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-screenshots',
  'feedback-screenshots',
  false,
  5242880,
  ARRAY['image/png','image/jpeg','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "feedback_screenshots_insert_own" ON storage.objects;
CREATE POLICY "feedback_screenshots_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'feedback-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "feedback_screenshots_select_own_or_admin" ON storage.objects;
CREATE POLICY "feedback_screenshots_select_own_or_admin"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'feedback-screenshots'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_team_admin())
  );
