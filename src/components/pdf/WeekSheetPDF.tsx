// Folha da semana (R-07): versão compacta para imprimir. Só o essencial de cada
// dia (hora, título e como se faz), os materiais e o que guardar para o
// portefólio. O detalhe fica no Guia de Atividades, para ler no ecrã.
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import { DISCIPLINE_LABELS, DAY_LABELS, collectMaterials, formatWeekRange } from "@/lib/planGenerator";
import type { Child } from "@/lib/types";
import { splitPortfolio, weekPortfolioList } from "@/lib/portfolioHints";
import { splitMode } from "@/lib/familyWeek";
import { slotText } from "@/lib/essentialPlan";

const GREEN = "#2D4A2D";
const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 7.5, padding: 26, color: "#374151" },
  header: { marginBottom: 8, borderBottomWidth: 1.5, borderColor: GREEN, paddingBottom: 5 },
  title: { fontSize: 15, fontWeight: "bold", color: GREEN },
  sub: { fontSize: 8, color: "#6B7280", marginTop: 1 },
  day: { marginBottom: 6 },
  dayTitle: { fontSize: 9, fontWeight: "bold", color: "#FFFFFF", backgroundColor: GREEN, padding: "2 6", borderRadius: 2, marginBottom: 2 },
  cols: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  child: { fontSize: 8, fontWeight: "bold", color: "#1F2937", marginBottom: 1 },
  line: { lineHeight: 1.4 },
  time: { color: "#6B7280" },
  bold: { fontWeight: "bold", color: "#1F2937" },
  box: { marginTop: 4, padding: "5 7", backgroundColor: "#F7F5EF", borderRadius: 3 },
  boxTitle: { fontSize: 8.5, fontWeight: "bold", color: GREEN, marginBottom: 2 },
});

const MODE_SHORT = { juntos: "juntos", adulto: "com o adulto", sozinho: "sozinho(a)" } as const;

interface Props {
  /** P-27: mostrar horas (por omissão, a duração) */
  hours?: boolean;
  children: Child[];
  planItems: GeneratedPlanItem[];
  weekStart: Date;
  familyName: string;
}

export default function WeekSheetPDF({ children, planItems, weekStart, familyName, hours = false }: Props) {
  const items = planItems.filter((i) => !i.is_fixed);
  const materials = collectMaterials(planItems);
  const withHints = children.filter((c) => weekPortfolioList(planItems, c.id).length > 0);

  return (
    <Document title="Folha da semana">
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <Text style={S.title}>Folha da semana</Text>
          <Text style={S.sub}>{familyName} · {formatWeekRange(weekStart)} · versão para imprimir (o detalhe está no Guia de Atividades)</Text>
        </View>

        {[1, 2, 3, 4, 5].map((day) => (
          <View key={day} style={S.day} wrap={false}>
            <Text style={S.dayTitle}>{DAY_LABELS[day - 1]}</Text>
            <View style={S.cols}>
              {children.map((child) => {
                const list = items
                  .filter((i) => i.child_id === child.id && i.day_of_week === day)
                  .sort((a, b) => a.time_slot.localeCompare(b.time_slot));
                return (
                  <View key={child.id} style={S.col}>
                    {children.length > 1 && <Text style={S.child}>{child.name}</Text>}
                    {list.map((i, k) => {
                      const { mode } = splitMode(splitPortfolio(i.description).text);
                      const hint = splitPortfolio(i.description).hint;
                      return (
                        <Text key={k} style={S.line}>
                          <Text style={S.time}>{hours ? i.time_slot.split("-")[0] : slotText(i, child.school_year, false) ? `(${slotText(i, child.school_year, false)})` : ""} </Text>
                          <Text style={S.bold}>{DISCIPLINE_LABELS[i.discipline] ?? i.discipline}: </Text>
                          {i.title}
                          {mode ? ` (${MODE_SHORT[mode]})` : ""}
                          {hint ? " [portefólio]" : ""}
                        </Text>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {materials.length > 0 && (
          <View style={S.box} wrap={false}>
            <Text style={S.boxTitle}>Materiais da semana</Text>
            <Text style={S.line}>{materials.join(" · ")}</Text>
          </View>
        )}

        {withHints.length > 0 && (
          <View style={S.box} wrap={false}>
            <Text style={S.boxTitle}>Para o portefólio</Text>
            {withHints.map((child) => (
              <Text key={child.id} style={S.line}>
                {children.length > 1 && <Text style={S.bold}>{child.name}: </Text>}
                {weekPortfolioList(planItems, child.id).map((x) => `${DAY_LABELS[x.day_of_week - 1]}, ${x.title} (${x.hint})`).join(" · ")}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
