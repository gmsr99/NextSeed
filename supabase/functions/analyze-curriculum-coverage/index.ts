import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL = "gemini-2.5-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PortfolioItem {
  id: string;
  type: "activity" | "project";
  title: string;
  description: string | null;
  discipline: string | null;   // só atividades
  child_id: string | null;
  school_year: string;         // resolvido pelo cliente com base no child
}

interface CurriculumObjective {
  id: string;
  school_year: string;
  discipline_key: string;
  discipline_name: string;
  objective: string;
}

interface GeminiMatch {
  item_id: string;
  item_type: "activity" | "project";
  matches: { curriculum_id: string; confidence: number }[];
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

async function matchWithGemini(
  items: PortfolioItem[],
  objectives: CurriculumObjective[]
): Promise<GeminiMatch[]> {
  const prompt = `És um assistente pedagógico do projeto NexSeed — ensino doméstico em Portugal.

Vais receber uma lista de ATIVIDADES/PROJETOS registados por uma família e uma lista de OBJETIVOS do Currículo NexSeed.
Para cada atividade/projeto, identifica quais objetivos foram trabalhados, com um valor de confiança de 0.0 a 1.0.

Regras:
- Só inclui matches com confiança >= 0.4
- Cada atividade/projeto pode ter 0 a 5 matches
- Baseia-te no título, descrição e disciplina para inferir o match
- Considera o ano escolar: só faz match com objetivos do mesmo ano

ATIVIDADES/PROJETOS:
${JSON.stringify(items.map((i) => ({
  id: i.id,
  type: i.type,
  title: i.title,
  description: i.description,
  discipline: i.discipline,
  school_year: i.school_year,
})), null, 2)}

OBJETIVOS DO CURRÍCULO NEXSEED:
${JSON.stringify(objectives.map((o) => ({
  id: o.id,
  school_year: o.school_year,
  discipline_key: o.discipline_key,
  objective: o.objective,
})), null, 2)}

Responde APENAS com JSON válido, sem markdown, neste formato exato:
[
  {
    "item_id": "<id da atividade/projeto>",
    "item_type": "activity" | "project",
    "matches": [
      { "curriculum_id": "<id do objetivo>", "confidence": 0.85 }
    ]
  }
]`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);

  const json = await res.json();
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  return JSON.parse(raw) as GeminiMatch[];
}

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { items, family_id } = await req.json() as {
      items: PortfolioItem[];
      family_id: string;
    };

    if (!items?.length || !family_id) {
      return new Response(JSON.stringify({ error: "items e family_id são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Buscar objetivos NexSeed para os anos escolares presentes
    const schoolYears = [...new Set(items.map((i) => i.school_year).filter(Boolean))];

    const { data: objectives, error: objErr } = await supabase
      .from("nexseed_curriculum")
      .select("id, school_year, discipline_key, discipline_name, objective")
      .in("school_year", schoolYears)
      .eq("is_active", true);

    if (objErr) throw objErr;
    if (!objectives?.length) {
      return new Response(JSON.stringify({ matched: 0, links: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Apagar cobertura anterior dos itens enviados (re-análise limpa)
    const activityIds = items.filter((i) => i.type === "activity").map((i) => i.id);
    const projectIds  = items.filter((i) => i.type === "project").map((i) => i.id);

    if (activityIds.length) {
      await supabase.from("curriculum_coverage")
        .delete()
        .eq("family_id", family_id)
        .in("activity_id", activityIds);
    }
    if (projectIds.length) {
      await supabase.from("curriculum_coverage")
        .delete()
        .eq("family_id", family_id)
        .in("project_id", projectIds);
    }

    // 3. Gemini faz o match
    const matches = await matchWithGemini(items, objectives as CurriculumObjective[]);

    // 4. Guardar na BD
    const rows = matches.flatMap((m) =>
      m.matches.map((match) => ({
        family_id,
        activity_id: m.item_type === "activity" ? m.item_id : null,
        project_id:  m.item_type === "project"  ? m.item_id : null,
        curriculum_id: match.curriculum_id,
        confidence: match.confidence,
        source: "ai" as const,
      }))
    );

    if (rows.length) {
      const { error: insErr } = await supabase.from("curriculum_coverage").insert(rows);
      if (insErr) throw insErr;
    }

    return new Response(JSON.stringify({ matched: rows.length, links: rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
