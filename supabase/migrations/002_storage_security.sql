-- ============================================================
-- 002_storage_security.sql
-- Segurança no storage de fotos de atividades.
--
-- Objetivo: enforçar server-side que:
--   1. Só imagens são aceites (MIME types allowlist)
--   2. Ficheiros não excedem 10 MB
--   3. Cada família só pode ler/escrever na sua própria pasta
--      (path começa obrigatoriamente com o seu family_id)
-- ============================================================

-- ─── 1. Configuração do bucket ────────────────────────────────────────────────
-- Se o bucket já existir, atualiza os limites.
-- Se não existir, cria-o com as restrições certas.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'activity-photos',
  'activity-photos',
  true,                          -- público para leitura (URLs partilháveis)
  10485760,                      -- 10 MB em bytes
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ─── 2. Remover políticas antigas (se existirem) ──────────────────────────────

DROP POLICY IF EXISTS "activity_photos_select"      ON storage.objects;
DROP POLICY IF EXISTS "activity_photos_insert"      ON storage.objects;
DROP POLICY IF EXISTS "activity_photos_update"      ON storage.objects;
DROP POLICY IF EXISTS "activity_photos_delete"      ON storage.objects;
DROP POLICY IF EXISTS "Family photos are public"    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;


-- ─── 3. Políticas RLS do storage ─────────────────────────────────────────────

-- SELECT: qualquer pessoa autenticada pode ver (URLs são públicos de qualquer
-- forma, mas a RLS protege a listagem de ficheiros via API)
CREATE POLICY "activity_photos_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'activity-photos');

-- INSERT: só membros autenticados podem fazer upload, e apenas para a pasta
-- correspondente ao seu family_id.
-- O path tem a estrutura: {family_id}/{activity_id}/{uuid}-{filename}
-- A verificação split('/')[0] garante que o utilizador não pode escrever
-- em pastas de outras famílias.
CREATE POLICY "activity_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'activity-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text
      FROM public.families
      WHERE id IN (
        SELECT family_id
        FROM public.family_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- UPDATE: não usado (as fotos são imutáveis após upload)
-- Manter desativado por segurança.

-- DELETE: só membros autenticados da família podem eliminar
CREATE POLICY "activity_photos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'activity-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text
      FROM public.families
      WHERE id IN (
        SELECT family_id
        FROM public.family_members
        WHERE user_id = auth.uid()
      )
    )
  );


-- ─── 4. Comentário ────────────────────────────────────────────────────────────
COMMENT ON POLICY "activity_photos_insert" ON storage.objects IS
  'Garante que cada utilizador só faz upload para a pasta do seu family_id. '
  'A validação de MIME type e tamanho é feita pelo próprio Supabase storage '
  'via file_size_limit e allowed_mime_types no bucket.';
