import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import { DAY_LABELS, formatWeekRange } from "@/lib/planGenerator";
import type { Child } from "@/lib/types";

// ─── Estilos ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:          { fontFamily: "Helvetica", fontSize: 10, padding: 36, backgroundColor: "#FFFFFF" },
  header:        { marginBottom: 20, borderBottomWidth: 2, borderColor: "#2D4A2D", paddingBottom: 10 },
  headerTitle:   { fontSize: 20, fontWeight: "bold", color: "#2D4A2D", marginBottom: 3 },
  headerSub:     { fontSize: 10, color: "#6B7280" },

  episodeBlock:  { marginBottom: 24, padding: "14 16", backgroundColor: "#FAFAFA", borderRadius: 6, borderLeftWidth: 4, borderLeftColor: "#F77F00" },
  episodeTitle:  { fontSize: 13, fontWeight: "bold", color: "#1F2937", marginBottom: 4 },
  episodeMeta:   { fontSize: 8, color: "#9CA3AF", marginBottom: 10 },
  episodeText:   { fontSize: 10, color: "#374151", lineHeight: 1.6, marginBottom: 12 },

  questionBox:   { padding: "8 12", backgroundColor: "#FEF3C7", borderRadius: 4, marginBottom: 8 },
  questionLabel: { fontSize: 8, fontWeight: "bold", color: "#92400E", marginBottom: 3 },
  questionText:  { fontSize: 9, color: "#374151", fontStyle: "italic", lineHeight: 1.5 },

  discussBox:    { padding: "8 12", backgroundColor: "#EDE9FE", borderRadius: 4 },
  discussLabel:  { fontSize: 8, fontWeight: "bold", color: "#5B21B6", marginBottom: 3 },
  discussText:   { fontSize: 9, color: "#374151", fontStyle: "italic", lineHeight: 1.5 },

  footer:        { marginTop: 16, borderTopWidth: 1, borderColor: "#E5E7EB", paddingTop: 6, color: "#9CA3AF", fontSize: 7 },
});

// ─── Parsing do conteúdo do episódio ─────────────────────────────────────────

interface EpisodeContent {
  episode_text: string;
  comprehension_question: string;
  discussion_prompt: string;
}

function parseEpisodeContent(description: string): EpisodeContent {
  try {
    const parsed = JSON.parse(description);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.episode_text === "string"
    ) {
      return {
        episode_text:           parsed.episode_text ?? "",
        comprehension_question: parsed.comprehension_question ?? "",
        discussion_prompt:      parsed.discussion_prompt ?? "",
      };
    }
  } catch {
    /* fallback para texto simples */
  }
  // Fallback: a description é texto simples (geração por template ou Gemini antigo)
  return {
    episode_text:           description,
    comprehension_question: "",
    discussion_prompt:      "",
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  children: Child[];
  planItems: GeneratedPlanItem[];
  weekStart: Date;
  familyName: string;
}

export default function ReadingGuidePDF({ children, planItems, weekStart, familyName }: Props) {
  // Recolhe episódios de leitura ordenados por dia
  const readingItems = planItems
    .filter((i) => i.discipline === "reading" && !i.is_fixed)
    .sort((a, b) => a.day_of_week - b.day_of_week);

  if (readingItems.length === 0) return <Document />;

  const childName = (childId: string) =>
    children.find((c) => c.id === childId)?.name ?? "";

  const dayLabel = (day: number) => DAY_LABELS[day - 1] ?? "";

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Cabeçalho */}
        <View style={S.header}>
          <Text style={S.headerTitle}>NexSeed — Guia de Leitura</Text>
          <Text style={S.headerSub}>
            {familyName} · Semana de {formatWeekRange(weekStart)}
          </Text>
        </View>

        {/* Episódios */}
        {readingItems.map((item, idx) => {
          const content = parseEpisodeContent(item.description);
          const epNum   = idx + 1;
          return (
            <View key={idx} style={S.episodeBlock} wrap={false}>

              {/* Título e meta */}
              <Text style={S.episodeTitle}>Ep.{epNum} — {item.title}</Text>
              <Text style={S.episodeMeta}>
                {dayLabel(item.day_of_week)} · {childName(item.child_id)} · {item.time_slot}
              </Text>

              {/* Texto do episódio */}
              <Text style={S.episodeText}>{content.episode_text || item.description}</Text>

              {/* Pergunta de compreensão */}
              {content.comprehension_question ? (
                <View style={S.questionBox}>
                  <Text style={S.questionLabel}>Compreensão</Text>
                  <Text style={S.questionText}>{content.comprehension_question}</Text>
                </View>
              ) : null}

              {/* Prompt de discussão */}
              {content.discussion_prompt ? (
                <View style={S.discussBox}>
                  <Text style={S.discussLabel}>Para conversar</Text>
                  <Text style={S.discussText}>{content.discussion_prompt}</Text>
                </View>
              ) : null}

            </View>
          );
        })}

        {/* Rodapé */}
        <View style={S.footer}>
          <Text>Gerado automaticamente pelo NexSeed · {new Date().toLocaleDateString("pt-PT")}</Text>
        </View>

      </Page>
    </Document>
  );
}
