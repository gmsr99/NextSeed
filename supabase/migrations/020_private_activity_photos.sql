-- 020 — Bucket de fotos de atividades passa a PRIVADO (FASE 1.4, parte final)
-- As fotos de menores nunca devem ser alcançáveis por URL pública.
-- O cliente passa a guardar o PATH do ficheiro (não a URL) e a ler via
-- createSignedUrls (TTL 1h). Ver src/lib/photoStorage.ts.

update storage.buckets set public = false where id = 'activity-photos';

-- Remove as policies legadas da migração 002, demasiado amplas (qualquer
-- utilizador autenticado podia escrever/apagar em qualquer path do bucket).
-- Ficam as policies da migração 015, restritas ao prefixo my_family_id().
drop policy if exists "Family members can delete their activity photos" on storage.objects;
drop policy if exists "Family members can upload activity photos" on storage.objects;
