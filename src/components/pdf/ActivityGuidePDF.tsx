import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS, DAY_LABELS, collectMaterials, formatWeekRange } from "@/lib/planGenerator";
import type { Child } from "@/lib/types";

const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, padding: 32, backgroundColor: "#FFFFFF" },
  header: { marginBottom: 18, borderBottomWidth: 2, borderColor: "#2D4A2D", paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2D4A2D", marginBottom: 2 },
  headerSub: { fontSize: 10, color: "#6B7280" },
  dayBlock: { marginBottom: 14 },
  dayTitle: {
    fontSize: 13, fontWeight: "bold", color: "#FFFFFF",
    backgroundColor: "#2D4A2D", padding: "5 8", borderRadius: 4, marginBottom: 6,
  },
  childName: { fontSize: 10, fontWeight: "bold", color: "#374151", marginBottom: 3, marginTop: 4 },
  activityBlock: { marginBottom: 6, padding: "6 8", borderRadius: 4, borderLeftWidth: 3 },
  activityTitle: { fontSize: 10, fontWeight: "bold", color: "#1F2937", marginBottom: 2 },
  activitySlot: { fontSize: 8, color: "#6B7280", marginBottom: 3 },
  activityDesc: { fontSize: 8, color: "#374151", lineHeight: 1.5, marginBottom: 4 },
  materialsRow: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  materialTag: { backgroundColor: "#F3F4F6", borderRadius: 2, padding: "1 4", fontSize: 7, color: "#4B5563" },
  divider: { borderBottomWidth: 1, borderColor: "#E5E7EB", marginVertical: 8 },
  materialsSection: { marginTop: 14, padding: "10 12", backgroundColor: "#F0FDF4", borderRadius: 6 },
  materialsSectionTitle: { fontSize: 12, fontWeight: "bold", color: "#2D4A2D", marginBottom: 6 },
  materialsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  matItem: {
    fontSize: 8, color: "#374151",
    backgroundColor: "#DCFCE7", borderRadius: 3, padding: "2 6",
  },
  footer: { marginTop: 16, borderTopWidth: 1, borderColor: "#E5E7EB", paddingTop: 6, color: "#9CA3AF", fontSize: 7 },
});

interface Props {
  children: Child[];
  planItems: GeneratedPlanItem[];
  weekStart: Date;
  familyName: string;
}

export default function ActivityGuidePDF({ children, planItems, weekStart, familyName }: Props) {
  const allMaterials = collectMaterials(planItems);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>NexSeed — Guia de Atividades</Text>
          <Text style={S.headerSub}>{familyName} · Semana de {formatWeekRange(weekStart)}</Text>
        </View>

        {[1, 2, 3, 4, 5].map((day) => {
          // Filtra blocos fixos — o Guia mostra apenas atividades com conteúdo pedagógico
          const dayItems = planItems.filter((i) => i.day_of_week === day && !i.is_fixed);
          if (dayItems.length === 0) return null;

          return (
            <View key={day} style={S.dayBlock}>
              <Text style={S.dayTitle}>{DAY_LABELS[day - 1]}</Text>

              {children.map((child) => {
                const items = dayItems.filter((i) => i.child_id === child.id);
                if (items.length === 0) return null;
                return (
                  <View key={child.id}>
                    <Text style={S.childName}>{child.name}</Text>
                    {items.map((item, idx) => {
                      const color = DISCIPLINE_COLORS[item.discipline] ?? "#E5E7EB";
                      return (
                        <View
                          key={idx}
                          style={[S.activityBlock, { borderLeftColor: color, backgroundColor: color + "22" }]}
                        >
                          <Text style={S.activityTitle}>
                            {DISCIPLINE_LABELS[item.discipline] ?? item.discipline} · {item.title}
                          </Text>
                          <Text style={S.activitySlot}>{item.time_slot}</Text>
                          <Text style={S.activityDesc}>{item.description}</Text>
                          {item.materials.length > 0 && (
                            <View style={S.materialsRow}>
                              {item.materials.map((m, mi) => (
                                <Text key={mi} style={S.materialTag}>{m}</Text>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Lista de materiais */}
        <View style={S.materialsSection} wrap={false}>
          <Text style={S.materialsSectionTitle}>Lista de Materiais da Semana</Text>
          <View style={S.materialsGrid}>
            {allMaterials.map((m, i) => (
              <Text key={i} style={S.matItem}>· {m}</Text>
            ))}
          </View>
        </View>

        <View style={S.footer}>
          <Text>Gerado automaticamente pelo NexSeed · {new Date().toLocaleDateString("pt-PT")}</Text>
        </View>
      </Page>
    </Document>
  );
}
