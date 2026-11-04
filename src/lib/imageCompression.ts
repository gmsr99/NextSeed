// Compressão de fotos no cliente, antes do upload para o Storage.
//
// Porquê (docs de negócio 03 §5.4 / D-025): as fotos eram guardadas tal como
// saíam do telemóvel (até 10 MB cada) — a única linha de custo sem teto e
// irreversível. Reduzir para ~300 KB corta o armazenamento ~10× e protege o
// tier gratuito do Supabase.
//
// Bónus de privacidade: re-codificar a imagem num <canvas> descarta os
// metadados EXIF, incluindo a localização GPS que muitos telemóveis gravam
// nas fotos — relevante quando as fotos são de crianças.

export const MAX_DIMENSION_PX = 1600;
export const TARGET_BYTES = 350 * 1024;
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52];

/** Dimensões finais mantendo a proporção, com o lado maior ≤ maxDimension. */
export function fitWithin(
  width: number,
  height: number,
  maxDimension = MAX_DIMENSION_PX,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const scale = maxDimension / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Nome do ficheiro com extensão .jpg (o resultado é sempre JPEG). */
export function toJpegName(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base || "foto"}.jpg`;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Devolve uma versão comprimida da imagem (JPEG, ≤1600px, ~≤350 KB).
 * Best-effort: GIFs (podem ser animados) e qualquer imagem que o browser não
 * consiga descodificar (ex.: HEIC fora do Safari) seguem como estão — nunca
 * impede o registo de uma atividade.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.type.toLowerCase() === "image/gif") return file;
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = fitWithin(bitmap.width, bitmap.height);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // Fundo branco: PNGs com transparência ficariam pretos em JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    let best: Blob | null = null;
    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, quality);
      if (!blob) break;
      best = blob;
      if (blob.size <= TARGET_BYTES) break;
    }

    // Se por algum motivo a versão "comprimida" não for mais pequena, fica o original.
    if (!best || best.size >= file.size) return file;
    return new File([best], toJpegName(file.name), { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
