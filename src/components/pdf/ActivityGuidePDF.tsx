import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS, DAY_LABELS, collectMaterials, formatWeekRange } from "@/lib/planGenerator";
import type { Child } from "@/lib/types";
import { splitPortfolio, weekPortfolioList } from "@/lib/portfolioHints";
import { GC_DISCIPLINE_LABELS } from "@/lib/gcConstants";
import { DAY_QUESTIONS, QUESTION_TIP, SHORT_DAY, DAILY_LOG, WEEK_CLOSE, reviewLines } from "@/lib/weekGuide";
import type { ChildWeekFocus } from "@/hooks/useAnnualPlan";

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
  portfolioHint: { fontSize: 8, color: "#065F46", fontWeight: "bold", marginBottom: 4 },
  portfolioBox: { backgroundColor: "#ECFDF5", borderRadius: 4, padding: 8, marginBottom: 10 },
  portfolioTitle: { fontSize: 10, fontWeight: "bold", color: "#065F46", marginBottom: 4 },
  portfolioChild: { fontSize: 9, fontWeight: "bold", color: "#065F46", marginTop: 3, marginBottom: 2 },
  portfolioLine: { fontSize: 8, color: "#064E3B", lineHeight: 1.5 },
  materialsRow: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  materialTag: { backgroundColor: "#F3F4F6", borderRadius: 2, padding: "1 4", fontSize: 7, color: "#4B5563" },
  divider: { borderBottomWidth: 1, borderColor: "#E5E7EB", marginVertical: 8 },
  box: { marginBottom: 10, padding: "8 10", backgroundColor: "#F7F5EF", borderRadius: 4 },
  boxTitle: { fontSize: 11, fontWeight: "bold", color: "#2D4A2D", marginBottom: 4 },
  boxChild: { fontSize: 9, fontWeight: "bold", color: "#374151", marginTop: 3, marginBottom: 2 },
  boxLine: { fontSize: 8, color: "#374151", lineHeight: 1.5 },
  bold: { fontWeight: "bold" },
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
  /** P-22: conteúdos da semana no Rumo do ano, por criança (opcional) */
  weekFocus?: Record<string, ChildWeekFocus>;
  /** P-16: fio condutor da semana */
  weekTheme?: string;
}

export default function ActivityGuidePDF({ children, planItems, weekStart, familyName, weekFocus = {}, weekTheme }: Props) {
  const withFocus = children.filter((c) => weekFocus[c.id]);
  const allMaterials = collectMaterials(planItems);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>NexSeed — Guia de Atividades</Text>
          <Text style={S.headerSub}>{familyName} · Semana de {formatWeekRange(weekStart)}</Text>
        </View>

        {weekTheme ? (
          <View style={S.box} wrap={false}>
            <Text style={S.boxTitle}>Fio condutor da semana: {weekTheme}</Text>
            <Text style={S.boxLine}>É o tema que liga as disciplinas e as crianças ao longo da semana.</Text>
          </View>
        ) : null}

        {/* P-22: a semana em resumo (conteúdos do Rumo do ano) */}
        {withFocus.length > 0 && (
          <View style={S.box} wrap={false}>
            <Text style={S.boxTitle}>
              A semana em resumo · semana {weekFocus[withFocus[0].id].week.number} de {weekFocus[withFocus[0].id].totalWeeks}
            </Text>
            {withFocus.map((child) => (
              <View key={child.id}>
                {children.length > 1 && <Text style={S.boxChild}>{child.name}</Text>}
                {Object.entries(weekFocus[child.id].focus).map(([d, list]) => (
                  <Text key={d} style={S.boxLine}>
                    {GC_DISCIPLINE_LABELS[d] ?? d}{list[0]?.fromManual ? ` (${list[0].domain})` : ""}: {list.map((c) => c.content).join(" · ")}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* P-22: preparar ao domingo */}
        {allMaterials.length > 0 && (
          <View style={S.box} wrap={false}>
            <Text style={S.boxTitle}>Domingo: preparar a caixa da semana (15 minutos)</Text>
            <View style={S.materialsGrid}>
              {allMaterials.map((m, i) => (
                <Text key={i} style={S.matItem}>{m}</Text>
              ))}
            </View>
            <Text style={[S.boxLine, { marginTop: 4 }]}>Não é preciso imprimir nada.</Text>
          </View>
        )}

        {/* R-10: o que guardar para o portefólio esta semana */}
        {children.some((c) => weekPortfolioList(planItems, c.id).length > 0) && (
          <View style={S.portfolioBox} wrap={false}>
            <Text style={S.portfolioTitle}>Para o portefólio esta semana</Text>
            {children.map((child) => {
              const list = weekPortfolioList(planItems, child.id);
              if (list.length === 0) return null;
              return (
                <View key={child.id}>
                  {children.length > 1 && <Text style={S.portfolioChild}>{child.name}</Text>}
                  {list.map((x, i) => (
                    <Text key={i} style={S.portfolioLine}>
                      {DAY_LABELS[x.day_of_week - 1]}, {x.title}: {x.hint}
                    </Text>
                  ))}
                </View>
              );
            })}
            <Text style={[S.portfolioLine, { marginTop: 4 }]}>Chegam estas. O resto da semana não precisa de ficar registado.</Text>
          </View>
        )}

        {[1, 2, 3, 4, 5].map((day) => {
          // Filtra blocos fixos — o Guia mostra apenas atividades com conteúdo pedagógico
          // Exclui blocos fixos e episódios de leitura (têm documento próprio: ReadingGuidePDF)
          const dayItems = planItems.filter(
            (i) => i.day_of_week === day && !i.is_fixed && i.discipline !== "reading",
          );
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
                          <Text style={S.activityDesc}>{splitPortfolio(item.description).text}</Text>
                          {splitPortfolio(item.description).hint ? (
                            <Text style={S.portfolioHint}>Para o portefólio: {splitPortfolio(item.description).hint}</Text>
                          ) : null}
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

        {/* P-22: partes fixas do guia */}
        <View style={S.box} wrap={false}>
          <Text style={S.boxTitle}>Guião rápido: o que perguntar</Text>
          {DAY_QUESTIONS.map((q) => (
            <Text key={q.day} style={S.boxLine}>
              <Text style={S.bold}>{q.day} ({q.focus}):</Text> {q.questions}
            </Text>
          ))}
          <Text style={[S.boxLine, { marginTop: 3 }]}>{QUESTION_TIP}</Text>
        </View>

        <View style={S.box} wrap={false}>
          <Text style={S.boxTitle}>Se o dia correr mal: versão curta</Text>
          <Text style={S.boxLine}>{SHORT_DAY.intro}</Text>
          {SHORT_DAY.steps.map((step, i) => (
            <Text key={i} style={S.boxLine}>{i + 1}. {step}</Text>
          ))}
          <Text style={S.boxLine}>{SHORT_DAY.outro}</Text>
        </View>

        <View style={S.box} wrap={false}>
          <Text style={S.boxTitle}>Registo de 2 minutos por dia</Text>
          <Text style={S.boxLine}>{DAILY_LOG.intro}</Text>
          {DAILY_LOG.lines.map((l, i) => (
            <Text key={i} style={S.boxLine}>· {l}</Text>
          ))}
          <Text style={S.boxLine}>{DAILY_LOG.outro}</Text>
        </View>

        <View style={S.box} wrap={false}>
          <Text style={S.boxTitle}>Balanço da semana (10 minutos, para ti)</Text>
          <Text style={S.boxLine}>Assinala o que ficou feito. O que não ficou, a NexSeed volta a propor.</Text>
          {withFocus.map((child) => (
            <View key={child.id}>
              {children.length > 1 && <Text style={S.boxChild}>{child.name}</Text>}
              {reviewLines(weekFocus[child.id].focus, GC_DISCIPLINE_LABELS).map((l, i) => (
                <Text key={i} style={S.boxLine}>[  ] {l}</Text>
              ))}
            </View>
          ))}
          <Text style={[S.boxLine, { marginTop: 3 }]}>{WEEK_CLOSE}</Text>
        </View>

        <View style={S.footer}>
          <Text>Gerado automaticamente pelo NexSeed · {new Date().toLocaleDateString("pt-PT")}</Text>
        </View>
      </Page>
    </Document>
  );
}
