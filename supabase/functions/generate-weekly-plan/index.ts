import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Proxy autenticado para a API Gemini.
// O cliente (src/lib/geminiPlanner.ts e CreativeEngine.tsx) constrói o prompt e
// envia-o aqui; a chave Gemini vive APENAS como secret do servidor (GEMINI_API_KEY).
// verify_jwt=true garante que só utilizadores autenticados NexSeed podem invocar.

const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_PROMPT_CHARS = 80_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callGemini(apiKey: string, prompt: string) {
  return await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.85,
          maxOutputTokens: 65536,
        },
      }),
    },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  let prompt: unknown;
  try {
    ({ prompt } = await req.json());
  } catch {
    return json({ error: "Corpo inválido (JSON esperado)" }, 400);
  }

  if (typeof prompt !== "string" || prompt.trim().length < 20) {
    return json({ error: "Campo 'prompt' em falta ou demasiado curto" }, 400);
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return json({ error: "Prompt demasiado longo" }, 413);
  }

  const key1 = Deno.env.get("GEMINI_API_KEY");
  const key2 = Deno.env.get("GEMINI_API_KEY_2");
  if (!key1) return json({ error: "GEMINI_API_KEY não configurada no servidor" }, 500);

  try {
    let res = await callGemini(key1, prompt);
    if (res.status === 429 && key2) {
      res = await callGemini(key2, prompt);
    }
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      return json({ error: `Gemini ${res.status}`, detail }, 502);
    }
    const data = await res.json();
    const parts: { text?: string; thought?: boolean }[] =
      data?.candidates?.[0]?.content?.parts ?? [];
    const responsePart = parts.filter((p) => !p.thought).pop();
    const text = responsePart?.text ?? "[]";
    return json({ text }, 200);
  } catch (e) {
    return json({ error: `Falha ao contactar o Gemini: ${String((e as Error)?.message ?? e)}` }, 500);
  }
});
