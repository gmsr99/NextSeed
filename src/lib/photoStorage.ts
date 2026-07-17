import { supabase } from "./supabase";

// O bucket `activity-photos` é PRIVADO (migração 020). Na BD guardamos o PATH
// do ficheiro ({family_id}/{activity_id}/{uuid}-{nome}); a leitura faz-se com
// signed URLs de curta duração geradas aqui.

const BUCKET = "activity-photos";
const SIGNED_URL_TTL_SECONDS = 3600; // 1h — cobre a sessão e a geração de PDFs

/** Converte um valor guardado (path novo, ou URL pública antiga) num path do bucket. */
export function toStoragePath(value: string): string {
  const marker = `/${BUCKET}/`;
  const idx = value.indexOf(marker);
  return idx === -1 ? value : value.slice(idx + marker.length);
}

/**
 * Apaga ficheiros do bucket. O cascade da BD remove as linhas mas nunca os
 * ficheiros, por isso quem apaga uma atividade/criança tem de chamar isto.
 */
export async function removePhotos(values: string[]): Promise<void> {
  if (!values.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(values.map(toStoragePath));
  if (error) throw error;
}

/**
 * Troca paths de fotos por signed URLs prontas a usar em <img>/PDF.
 * Best-effort: se a assinatura falhar, a foto é omitida (nunca rebenta a página).
 */
export async function signPhotoUrls(values: string[]): Promise<string[]> {
  if (!values.length) return [];
  const paths = values.map(toStoragePath);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return [];
  return data.filter((d) => d.signedUrl).map((d) => d.signedUrl);
}
