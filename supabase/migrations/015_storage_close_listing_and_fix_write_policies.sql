-- FASE 1 / Passo 1.4 — Fechar a vulnerabilidade de LISTAGEM do bucket de fotos
-- e corrigir as policies de escrita.
-- Aplicada em produção em 2026-06-12 via MCP (apply_migration). Registada aqui
-- para o repo refletir o estado da BD. Operações idempotentes.
--
-- Antes: policy SELECT ampla (bucket_id = 'activity-photos') permitia a qualquer
-- cliente LISTAR todos os ficheiros de todas as famílias (fotos de menores).
-- Agora: SELECT restrito à pasta da própria família. O acesso por URL público
-- direto (getPublicUrl) continua a funcionar — não depende desta policy.
--
-- Também corrige INSERT/DELETE: passam a usar public.my_family_id(), que cobre
-- tanto o owner (families.user_id) como os membros (family_members). Antes só
-- membros em family_members podiam carregar — o owner podia ficar de fora.
--
-- NOTA DE SEGUIMENTO: para postura RGPD máxima (fotos de menores), considerar
-- tornar o bucket privado e servir signed URLs. Adiado por exigir refactor do
-- cliente (upload guarda path em vez de URL; resolver signed URLs na leitura,
-- incluindo nos PDFs). Risco atual baixo: paths com UUID não adivinháveis e sem
-- enumeração possível após esta migração.

DROP POLICY IF EXISTS "activity_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "Activity photos are publicly viewable" ON storage.objects;

DROP POLICY IF EXISTS "activity_photos_select_own" ON storage.objects;
CREATE POLICY "activity_photos_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'activity-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = public.my_family_id()::text
  );

DROP POLICY IF EXISTS "activity_photos_insert" ON storage.objects;
CREATE POLICY "activity_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'activity-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = public.my_family_id()::text
  );

DROP POLICY IF EXISTS "activity_photos_delete" ON storage.objects;
CREATE POLICY "activity_photos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'activity-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = public.my_family_id()::text
  );
