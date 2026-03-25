import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS, DAY_LABELS, getWeekDates, formatWeekRange } from "@/lib/planGenerator";
import type { Child } from "@/lib/types";

Font.register({
  family: "Helvetica",
  fonts: [],
});

const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, padding: 30, backgroundColor: "#FAFAF8" },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2D4A2D", marginBottom: 2 },
  headerSub: { fontSize: 10, color: "#6B7280" },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#2D4A2D", marginTop: 14, marginBottom: 6 },
  table: { display: "flex", flexDirection: "column" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#E5E7EB" },
  headerRow: { flexDirection: "row", backgroundColor: "#2D4A2D", borderRadius: 4, marginBottom: 2 },
  headerCell: { flex: 1, padding: 5, color: "#FFFFFF", fontWeight: "bold", fontSize: 8 },
  timeCell: { width: 60, padding: 5, color: "#6B7280", fontSize: 8 },
  headerTimeCell: { width: 60, padding: 5, color: "#FFFFFF", fontWeight: "bold", fontSize: 8 },
  cell: { flex: 1, padding: 4, minHeight: 30 },
  pill: { borderRadius: 3, padding: "2 4", marginBottom: 2 },
  pillText: { fontSize: 7, fontWeight: "bold", color: "#1F2937" },
  pillDesc: { fontSize: 6, color: "#374151", marginTop: 1 },
  footer: { marginTop: 20, borderTopWidth: 1, borderColor: "#E5E7EB", paddingTop: 8, color: "#9CA3AF", fontSize: 8 },
});

interface Props {
  children: Child[];
  planItems: GeneratedPlanItem[];
  weekStart: Date;
  familyName: string;
}

export default function SchedulePDF({ children, planItems, weekStart, familyName }: Props) {
  const weekDates = getWeekDates(weekStart);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>NexSeed — Horário Semanal</Text>
          <Text style={S.headerSub}>{familyName} · Semana de {formatWeekRange(weekStart)}</Text>
        </View>

        {children.map((child) => {
          const childItems = planItems.filter((i) => i.child_id === child.id);
          const allSlots = [...new Set(childItems.map((i) => i.time_slot))].sort();

          return (
            <View key={child.id} wrap={false}>
              <Text style={S.sectionTitle}>{child.name}</Text>
              <View style={S.table}>
                {/* Table header */}
                <View style={S.headerRow}>
                  <Text style={S.headerTimeCell}>Hora</Text>
                  {weekDates.map((d, idx) => (
                    <Text key={idx} style={S.headerCell}>
                      {DAY_LABELS[idx]}{"\n"}
                      {d.getDate()}/{d.getMonth() + 1}
                    </Text>
                  ))}
                </View>

                {/* Rows */}
                {allSlots.map((slot) => (
                  <View key={slot} style={S.tableRow}>
                    <Text style={S.timeCell}>{slot}</Text>
                    {[1, 2, 3, 4, 5].map((day) => {
                      const item = childItems.find(
                        (i) => i.day_of_week === day && i.time_slot === slot,
                      );
                      const color = item ? (DISCIPLINE_COLORS[item.discipline] ?? "#E5E7EB") : "transparent";
                      return (
                        <View key={day} style={S.cell}>
                          {item && (
                            <View style={[S.pill, { backgroundColor: color + "55" }]}>
                              <Text style={S.pillText}>{DISCIPLINE_LABELS[item.discipline] ?? item.discipline}</Text>
                              <Text style={S.pillDesc} numberOfLines={2}>{item.title}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={S.footer}>
          <Text>Gerado automaticamente pelo NexSeed · {new Date().toLocaleDateString("pt-PT")}</Text>
        </View>
      </Page>
    </Document>
  );
}
