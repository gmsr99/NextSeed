// PDF do ano (P-24): o Rumo do ano de uma criança, semana a semana, para
// imprimir. Segue o calendário e os manuais da família.
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { GC_DISCIPLINE_LABELS } from "@/lib/gcConstants";
import { formatWeekShort, type AnnualPlan, type Period } from "@/lib/annualPlan";

const GREEN = "#2D4A2D";
const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 8, padding: 30, paddingBottom: 40, color: "#374151" },
  header: { marginBottom: 12, borderBottomWidth: 2, borderColor: GREEN, paddingBottom: 6 },
  title: { fontSize: 18, fontWeight: "bold", color: GREEN, marginBottom: 2 },
  sub: { fontSize: 9, color: "#6B7280" },
  period: { fontSize: 11, fontWeight: "bold", color: "#FFFFFF", backgroundColor: GREEN, padding: "4 7", borderRadius: 3, marginTop: 8, marginBottom: 4 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#E5E7EB", paddingVertical: 4 },
  weekCol: { width: 74 },
  weekNum: { fontSize: 9, fontWeight: "bold", color: "#1F2937" },
  weekDates: { fontSize: 7, color: "#6B7280" },
  body: { flex: 1 },
  line: { lineHeight: 1.45 },
  bold: { fontWeight: "bold", color: "#1F2937" },
  review: { color: "#6B7280", fontStyle: "italic" },
  box: { width: 9, height: 9, borderWidth: 0.8, borderColor: "#9CA3AF", marginTop: 1, marginLeft: 6 },
  footer: { position: "absolute", bottom: 18, left: 30, right: 30, fontSize: 7, color: "#9CA3AF", textAlign: "center" },
});

const PERIOD_LABELS: Record<Period, string> = { "1": "1.º período", "2": "2.º período", "3": "3.º período" };

interface Props {
  plan: AnnualPlan;
  childName: string;
  schoolYear: string;
  familyName: string;
}

export default function AnnualPlanPDF({ plan, childName, schoolYear, familyName }: Props) {
  const first = plan.weeks[0]?.monday;
  const last = plan.weeks[plan.weeks.length - 1]?.monday;
  const years = first && last ? `${first.getFullYear()}/${String(last.getFullYear()).slice(2)}` : "";
  const yearRound = Object.entries(plan.yearRound);

  return (
    <Document title={`Rumo do ano ${years}`}>
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <Text style={S.title}>Rumo do ano {years}</Text>
          <Text style={S.sub}>
            {childName} · {schoolYear} · {familyName} · {plan.weeks.length} semanas
          </Text>
        </View>

        {(["1", "2", "3"] as Period[]).map((p) => {
          const weeks = plan.weeks.filter((w) => w.period === p);
          if (weeks.length === 0) return null;
          return (
            <View key={p}>
              <Text style={S.period} minPresenceAhead={40}>{PERIOD_LABELS[p]} · {weeks.length} semanas</Text>
              {weeks.map((w) => {
                const entries = Object.entries(w.byDiscipline);
                return (
                  <View key={w.number} style={S.row} wrap={false}>
                    <View style={S.weekCol}>
                      <Text style={S.weekNum}>Semana {w.number}</Text>
                      <Text style={S.weekDates}>{formatWeekShort(w.monday)}</Text>
                    </View>
                    <View style={S.body}>
                      {w.isReview ? (
                        <Text style={[S.line, S.review]}>Semana de balanço: rever e escolher o que entra no portefólio.</Text>
                      ) : entries.length === 0 ? (
                        <Text style={[S.line, S.review]}>Semana para consolidar.</Text>
                      ) : (
                        entries.map(([d, list]) => (
                          <Text key={d} style={S.line}>
                            <Text style={S.bold}>{GC_DISCIPLINE_LABELS[d] ?? d}: </Text>
                            {list.map((c) => c.content.replace(/\.$/, "")).join("; ")}
                          </Text>
                        ))
                      )}
                    </View>
                    <View style={S.box} />
                  </View>
                );
              })}
            </View>
          );
        })}

        {yearRound.length > 0 && (
          <View>
            <Text style={S.period} minPresenceAhead={40}>Ao longo do ano</Text>
            {yearRound.map(([d, list]) => (
              <Text key={d} style={[S.line, { marginBottom: 3 }]}>
                <Text style={S.bold}>{GC_DISCIPLINE_LABELS[d] ?? d}: </Text>
                {list.map((c) => c.content.replace(/\.$/, "")).join("; ")}
              </Text>
            ))}
          </View>
        )}

        <Text style={S.footer} fixed>
          NexSeed · O rumo é uma orientação, não uma dívida: o que não se fizer numa semana passa para a seguinte.
        </Text>
      </Page>
    </Document>
  );
}
