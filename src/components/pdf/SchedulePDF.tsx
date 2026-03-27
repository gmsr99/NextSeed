import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import {
  DISCIPLINE_LABELS,
  DISCIPLINE_COLORS,
  DAY_LABELS,
  getWeekDates,
  formatWeekRange,
  getFixedScheduleBlocks,
} from "@/lib/planGenerator";
import type { Child, ExtracurricularItem } from "@/lib/types";

// ─── Estilos ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:           { fontFamily: "Helvetica", fontSize: 9, padding: 24, backgroundColor: "#FFFFFF" },
  header:         { marginBottom: 12 },
  headerTitle:    { fontSize: 18, fontWeight: "bold", color: "#2D4A2D", marginBottom: 2 },
  headerSub:      { fontSize: 9, color: "#6B7280" },

  sectionTitle:   { fontSize: 11, fontWeight: "bold", color: "#2D4A2D", marginTop: 10, marginBottom: 4 },

  // Tabela do horário
  table:          { display: "flex", flexDirection: "column" },
  headerRow:      { flexDirection: "row", backgroundColor: "#2D4A2D", marginBottom: 1 },
  headerTimeCell: { width: 58, padding: "4 5", color: "#FFFFFF", fontWeight: "bold", fontSize: 7 },
  headerCell:     { flex: 1, padding: "4 5", color: "#FFFFFF", fontWeight: "bold", fontSize: 7 },

  tableRow:       { flexDirection: "row", borderBottomWidth: 1, borderColor: "#F3F4F6" },
  timeCell:       { width: 58, padding: "3 5", fontSize: 7, color: "#9CA3AF", justifyContent: "center" },
  cell:           { flex: 1, padding: "3 4", minHeight: 20, justifyContent: "center" },

  // Bloco de disciplina (apenas nome, sem título de atividade)
  pill:           { borderRadius: 2, padding: "2 4" },
  pillLabel:      { fontSize: 7, fontWeight: "bold", color: "#1F2937" },

  // Bloco fixo (ritual, transição, etc.) — estilo neutro
  fixedPill:      { borderRadius: 2, padding: "2 4" },
  fixedLabel:     { fontSize: 6, color: "#6B7280", fontStyle: "italic" },

  // ─── Secção de transições ────────────────────────────────────────────────────
  transSection:   { marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: "#E5E7EB" },
  transSectionTitle: { fontSize: 10, fontWeight: "bold", color: "#2D4A2D", marginBottom: 8 },
  transGrid:      { flexDirection: "row", gap: 8 },
  transCol:       { flex: 1, padding: "8 10", backgroundColor: "#F9FAFB", borderRadius: 4, borderLeftWidth: 3 },
  transColTitle:  { fontSize: 8, fontWeight: "bold", color: "#374151", marginBottom: 4 },
  transItem:      { fontSize: 7, color: "#4B5563", marginBottom: 2, lineHeight: 1.4 },
  transCategory:  { fontSize: 7, fontWeight: "bold", color: "#6B7280", marginTop: 4, marginBottom: 2 },

  // ─── Secção de extracurriculares ────────────────────────────────────────────
  extraSection:   { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: "#E5E7EB" },
  extraTitle:     { fontSize: 9, fontWeight: "bold", color: "#2D4A2D", marginBottom: 5 },
  extraGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  extraCard:      { width: "31%", padding: "5 7", backgroundColor: "#F9FAFB", borderRadius: 3, borderLeftWidth: 2 },
  extraCardDay:   { fontSize: 6, fontWeight: "bold", color: "#6B7280", marginBottom: 1 },
  extraCardName:  { fontSize: 7, fontWeight: "bold", color: "#111827", marginBottom: 1 },
  extraCardMeta:  { fontSize: 6, color: "#6B7280" },

  footer:         { marginTop: 14, borderTopWidth: 1, borderColor: "#E5E7EB", paddingTop: 6, color: "#9CA3AF", fontSize: 7 },
});

// ─── Conteúdo das transições (dos documentos pedagógicos do Elton) ────────────

const TRANSITIONS_7Y = [
  { cat: "Movimento Cruzado",        items: ["Mão direita ao joelho esquerdo (alternado, lento)", "Jumping jacks × 25", "Saltar à corda 2 min", "Equilíbrio numa perna, 20 seg"] },
  { cat: "Desafio Mental Rápido",    items: ["Nomear 5 palavras que começam com R", "Contar de 2 em 2 até 30", "Inventar frase com 3 palavras dadas"] },
  { cat: "Respiração e Regulação",   items: ["Inspirar 4 tempos → suster 2 → expirar 6", "Respiração quadrada: 4-4-4-4", "Visualização breve de lugar calmo"] },
  { cat: "Micro-Missão",             items: ["Preparar materiais do próximo bloco", "Organizar o quadro / plano do dia", "Escolher cartão da caixa de transições"] },
];

const TRANSITIONS_4Y = [
  { cat: "Movimento Lúdico",         items: ["Andar como urso, caranguejo, gato", "Saltos de rã × 10", "Andar numa linha imaginária no chão"] },
  { cat: "Jogo Oral Rápido",         items: ["Nomear 3 animais que vivem no mar", "Encontrar algo azul na sala", "\"Se eu fosse um animal seria...\""] },
  { cat: "Respiração Guiada",        items: ["Cheirar flor → soprar vela devagar", "Respiração do balão (encher barriga)", "Mão na barriga a sentir o ar entrar"] },
  { cat: "Micro-Missão",             items: ["Regar a planta / alimentar o peixe", "Levar lápis para a mesa", "Escolher o cartão da próxima atividade"] },
];

import { EXTRACURRICULAR_COLORS, DAY_LABELS_FULL } from "@/lib/constants";

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  children: Child[];
  planItems: GeneratedPlanItem[];
  weekStart: Date;
  familyName: string;
  extracurriculars?: ExtracurricularItem[];
}

export default function SchedulePDF({ children, planItems, weekStart, familyName, extracurriculars = [] }: Props) {
  const weekDates = getWeekDates(weekStart);

  // Junta blocos gerados (variáveis) + blocos fixos do horário
  const fixedBlocks = getFixedScheduleBlocks(children);
  const allItems = [...planItems, ...fixedBlocks];

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>

        {/* Cabeçalho */}
        <View style={S.header}>
          <Text style={S.headerTitle}>NexSeed — Horário Semanal</Text>
          <Text style={S.headerSub}>{familyName} · Semana de {formatWeekRange(weekStart)}</Text>
        </View>

        {/* Horário por criança */}
        {children.map((child) => {
          const childItems = allItems.filter((i) => i.child_id === child.id);
          const allSlots = [...new Set(childItems.map((i) => i.time_slot))].sort();

          return (
            <View key={child.id} wrap={false}>
              <Text style={S.sectionTitle}>{child.name}</Text>
              <View style={S.table}>

                {/* Cabeçalho da tabela */}
                <View style={S.headerRow}>
                  <Text style={S.headerTimeCell}>Hora</Text>
                  {weekDates.map((d, idx) => (
                    <Text key={idx} style={S.headerCell}>
                      {DAY_LABELS[idx]}{"\n"}
                      {d.getDate()}/{d.getMonth() + 1}
                    </Text>
                  ))}
                </View>

                {/* Linhas do horário */}
                {allSlots.map((slot) => (
                  <View key={slot} style={S.tableRow}>
                    <Text style={S.timeCell}>{slot}</Text>
                    {[1, 2, 3, 4, 5].map((day) => {
                      const item = childItems.find(
                        (i) => i.day_of_week === day && i.time_slot === slot,
                      );
                      if (!item) return <View key={day} style={S.cell} />;

                      const color = DISCIPLINE_COLORS[item.discipline] ?? "#E5E7EB";
                      const label = DISCIPLINE_LABELS[item.discipline] ?? item.discipline;

                      if (item.is_fixed) {
                        // Bloco fixo: só o nome, estilo neutro/italico
                        return (
                          <View key={day} style={S.cell}>
                            <View style={[S.fixedPill, { backgroundColor: color + "40" }]}>
                              <Text style={S.fixedLabel}>{item.title}</Text>
                            </View>
                          </View>
                        );
                      }

                      // Bloco variável: só o nome da disciplina (sem título da atividade)
                      return (
                        <View key={day} style={S.cell}>
                          <View style={[S.pill, { backgroundColor: color + "55" }]}>
                            <Text style={S.pillLabel}>{label}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* ─── Secção de Transições Pedagógicas ─── */}
        <View style={S.transSection} wrap={false}>
          <Text style={S.transSectionTitle}>Transições Pedagógicas Conscientes · 7 minutos</Text>
          <View style={S.transGrid}>

            {/* Coluna 7 anos */}
            <View style={[S.transCol, { borderLeftColor: "#9B72CF" }]}>
              <Text style={S.transColTitle}>Para 7 anos (integração bilateral)</Text>
              {TRANSITIONS_7Y.map((group) => (
                <View key={group.cat}>
                  <Text style={S.transCategory}>{group.cat}</Text>
                  {group.items.map((item, i) => (
                    <Text key={i} style={S.transItem}>· {item}</Text>
                  ))}
                </View>
              ))}
            </View>

            {/* Coluna 4 anos */}
            <View style={[S.transCol, { borderLeftColor: "#F4A261" }]}>
              <Text style={S.transColTitle}>Para 4 anos (regulação e jogo)</Text>
              {TRANSITIONS_4Y.map((group) => (
                <View key={group.cat}>
                  <Text style={S.transCategory}>{group.cat}</Text>
                  {group.items.map((item, i) => (
                    <Text key={i} style={S.transItem}>· {item}</Text>
                  ))}
                </View>
              ))}
            </View>

            {/* Coluna: como escolher */}
            <View style={[S.transCol, { borderLeftColor: "#43AA8B" }]}>
              <Text style={S.transColTitle}>Como escolher a transição certa</Text>
              <Text style={S.transCategory}>Estado da criança → Transição</Text>
              <Text style={S.transItem}>· Agitada → Respiração guiada</Text>
              <Text style={S.transItem}>· Com sono → Movimento ativo</Text>
              <Text style={S.transItem}>· Frustrada → Jogo leve com humor</Text>
              <Text style={S.transItem}>· Dispersa → Micro-missão concreta</Text>
              <Text style={S.transCategory}>Princípio</Text>
              <Text style={S.transItem}>
                Após 25-30 min de foco, o córtex pré-frontal satura.
                7 minutos de pausa estruturada oxigenam o cérebro,
                ativam dopamina e melhoram o bloco seguinte.
              </Text>
            </View>

          </View>
        </View>

        {/* ─── Secção de Extracurriculares ─── */}
        {extracurriculars.length > 0 && (
          <View style={S.extraSection} wrap={false}>
            <Text style={S.extraTitle}>Atividades Extracurriculares da Semana</Text>
            <View style={S.extraGrid}>
              {extracurriculars.map((act) => {
                const color = EXTRACURRICULAR_COLORS[act.type ?? "Outro"] ?? "#9CA3AF";
                const dayLabel = act.day_of_week ? DAY_LABELS_FULL[act.day_of_week - 1] : "—";
                const timeLabel = act.start_time
                  ? `${act.start_time}${act.end_time ? `–${act.end_time}` : ""}`
                  : "";
                const childLabel = act.child_id
                  ? (children.find((c) => c.id === act.child_id)?.name ?? "")
                  : "Todos";
                const travelLabel = act.travel_time_minutes > 0
                  ? ` · ${act.travel_time_minutes}min deslocação`
                  : "";
                return (
                  <View key={act.id} style={[S.extraCard, { borderLeftColor: color }]}>
                    <Text style={S.extraCardDay}>{dayLabel}{timeLabel ? ` · ${timeLabel}` : ""}</Text>
                    <Text style={S.extraCardName}>{act.name}</Text>
                    <Text style={S.extraCardMeta}>
                      {childLabel}{act.location ? ` · ${act.location}` : ""}{travelLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Rodapé */}
        <View style={S.footer}>
          <Text>Gerado automaticamente pelo NexSeed · {new Date().toLocaleDateString("pt-PT")}</Text>
        </View>

      </Page>
    </Document>
  );
}
