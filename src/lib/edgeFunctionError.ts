// Quando uma edge function responde com erro (4xx/5xx), o supabase-js devolve
// apenas "Edge Function returned a non-2xx status code". A mensagem útil vem
// no corpo da resposta ({ error: "..." }), em error.context. Esta função lê-a.
export async function edgeFunctionErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  const context = (error as { context?: unknown } | null)?.context;
  if (context instanceof Response) {
    try {
      const body = await context.clone().json();
      if (body && typeof body.error === "string" && body.error.trim()) {
        return body.error;
      }
    } catch {
      // corpo sem JSON: usa o texto por omissão
    }
  }
  return fallback;
}
