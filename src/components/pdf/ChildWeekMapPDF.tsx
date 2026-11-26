// Mapa semanal da criança (R-11, pedido do Elton a 24 nov, especificação
// aprovada a 26 nov). Uma página por criança, para ela se orientar sozinha:
// os dias, as atividades com um desenho da disciplina e uma caixa para marcar,
// e linhas livres para as tarefas da casa. Sem pontos: só caixas, e espaço
// para autocolantes, se a família quiser. No pré-escolar, menos palavras e
// desenhos maiores.
import { Document, Page, Text, View, StyleSheet, Svg, Rect, Circle, Path, Line, Polygon } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS, DAY_LABELS, formatWeekRange, getWeekDates } from "@/lib/planGenerator";
import { isOptional, stripOptional } from "@/lib/essentialPlan";
import type { Child } from "@/lib/types";

const GREEN = "#2D4A2D";
const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", padding: 24, color: "#1F2937" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: GREEN },
  sub: { fontSize: 9, color: "#6B7280" },
  grid: { flexDirection: "row", gap: 6 },
  col: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 6, padding: 5 },
  dayTitle: { fontSize: 11, fontWeight: "bold", color: "#FFFFFF", backgroundColor: GREEN, borderRadius: 4, padding: "3 5", marginBottom: 5, textAlign: "center" },
  item: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 5, padding: 3, borderRadius: 4 },
  itemText: { flex: 1, fontSize: 8.5, lineHeight: 1.3 },
  itemTextSmall: { flex: 1, fontSize: 7.5, lineHeight: 1.3, color: "#6B7280" },
  extra: { fontSize: 7, color: "#6B7280", marginTop: 2, marginBottom: 2 },
  tasks: { marginTop: 10, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 6, padding: 6 },
  tasksTitle: { fontSize: 11, fontWeight: "bold", color: GREEN, marginBottom: 4 },
  taskRow: { flexDirection: "row", alignItems: "center", height: 20, borderBottomWidth: 1, borderColor: "#F3F4F6" },
  taskLabel: { width: 150, fontSize: 8, color: "#9CA3AF" },
  taskCell: { flex: 1, alignItems: "center" },
  taskHead: { flex: 1, fontSize: 8, textAlign: "center", color: "#6B7280" },
  foot: { marginTop: 6, fontSize: 7, color: "#9CA3AF" },
});

/** Caixa para a criança marcar */
function Box({ size = 11 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Rect x="0.75" y="0.75" width="10.5" height="10.5" rx="2" stroke="#374151" strokeWidth={1.2} fill="#FFFFFF" />
    </Svg>
  );
}

/** Desenho simples de cada disciplina (sem imagens de fora, sem personagens) */
function Icon({ discipline, size }: { discipline: string; size: number }) {
  const c = DISCIPLINE_COLORS[discipline] ?? "#9CA3AF";
  const common = { width: size, height: size, viewBox: "0 0 24 24" };
  switch (discipline) {
    case "language": // lápis
      return (
        <Svg {...common}>
          <Polygon points="4,20 6,14 16,4 20,8 10,18" fill={c} />
          <Polygon points="4,20 6,14 10,18" fill="#F3F4F6" />
        </Svg>
      );
    case "math": // mais e menos
      return (
        <Svg {...common}>
          <Rect x="3" y="3" width="18" height="18" rx="4" fill={c} />
          <Line x1="8" y1="9" x2="8" y2="15" stroke="#FFFFFF" strokeWidth={2} />
          <Line x1="5" y1="12" x2="11" y2="12" stroke="#FFFFFF" strokeWidth={2} />
          <Line x1="14" y1="12" x2="19" y2="12" stroke="#FFFFFF" strokeWidth={2} />
        </Svg>
      );
    case "world": // folha
      return (
        <Svg {...common}>
          <Path d="M4 20 C4 9 11 4 20 4 C20 13 15 20 4 20 Z" fill={c} />
          <Line x1="5" y1="19" x2="15" y2="9" stroke="#FFFFFF" strokeWidth={1.5} />
        </Svg>
      );
    case "expression": // paleta
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="9" fill={c} />
          <Circle cx="8" cy="9" r="1.8" fill="#FFFFFF" />
          <Circle cx="13" cy="7" r="1.8" fill="#FFFFFF" />
          <Circle cx="16" cy="11" r="1.8" fill="#FFFFFF" />
        </Svg>
      );
    case "english": // balão de fala
      return (
        <Svg {...common}>
          <Path d="M4 5 H20 V15 H11 L7 19 V15 H4 Z" fill={c} />
        </Svg>
      );
    case "project": // estrela
      return (
        <Svg {...common}>
          <Polygon points="12,3 14.6,9 21,9.3 16,13.4 17.8,20 12,16.3 6.2,20 8,13.4 3,9.3 9.4,9" fill={c} />
        </Svg>
      );
    case "reading": // livro aberto
      return (
        <Svg {...common}>
          <Path d="M3 6 C6 5 9 5 12 7 V19 C9 17 6 17 3 18 Z" fill={c} />
          <Path d="M21 6 C18 5 15 5 12 7 V19 C15 17 18 17 21 18 Z" fill={c} opacity={0.7} />
        </Svg>
      );
    case "world_visit": // árvore
      return (
        <Svg {...common}>
          <Polygon points="12,3 20,15 4,15" fill={c} />
          <Rect x="10.5" y="15" width="3" height="5" fill="#92400E" />
        </Svg>
      );
    default:
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="8" fill={c} />
        </Svg>
      );
  }
}

/** Título curto: até 6 palavras (no pré-escolar, 3) */
function shortTitle(title: string, words: number): string {
  const t = stripOptional(title).replace(/^Leitura:\s*/i, "").trim();
  const list = t.split(/\s+/);
  return list.length > words ? `${list.slice(0, words).join(" ")}…` : t;
}

interface Props {
  children: Child[];
  planItems: GeneratedPlanItem[];
  weekStart: Date;
}

export default function ChildWeekMapPDF({ children, planItems, weekStart }: Props) {
  const dates = getWeekDates(weekStart);
  return (
    <Document title="O meu mapa da semana">
      {children.map((child) => {
        const pre = child.school_year.toLowerCase().startsWith("pré");
        const items = planItems.filter((i) => i.child_id === child.id && !i.is_fixed);
        const days = [1, 2, 3, 4, 5].filter((d) => items.some((i) => i.day_of_week === d));
        const iconSize = pre ? 22 : 14;
        const words = pre ? 3 : 6;
        return (
          <Page key={child.id} size="A4" orientation="landscape" style={S.page}>
            <View style={S.header}>
              <Text style={S.title}>A semana de {child.name}</Text>
              <Text style={S.sub}>{formatWeekRange(weekStart)} · marca a caixa quando acabares</Text>
            </View>

            <View style={S.grid}>
              {days.map((d) => {
                const dayItems = items
                  .filter((i) => i.day_of_week === d)
                  .sort((a, b) => a.time_slot.localeCompare(b.time_slot) || a.sort_order - b.sort_order);
                const core = dayItems.filter((i) => !isOptional(i));
                const extra = dayItems.filter((i) => isOptional(i));
                return (
                  <View key={d} style={S.col}>
                    <Text style={S.dayTitle}>{DAY_LABELS[d - 1]} {dates[d - 1].getDate()}</Text>
                    {core.map((i, k) => (
                      <View key={k} style={[S.item, { backgroundColor: (DISCIPLINE_COLORS[i.discipline] ?? "#E5E7EB") + "22" }]} wrap={false}>
                        <Icon discipline={i.discipline} size={iconSize} />
                        <Text style={S.itemText}>
                          {pre ? shortTitle(i.title, words) : `${DISCIPLINE_LABELS[i.discipline] ?? ""}: ${shortTitle(i.title, words)}`}
                        </Text>
                        <Box size={pre ? 14 : 11} />
                      </View>
                    ))}
                    {extra.length > 0 && <Text style={S.extra}>Se houver tempo</Text>}
                    {extra.map((i, k) => (
                      <View key={`x${k}`} style={S.item} wrap={false}>
                        <Icon discipline={i.discipline} size={pre ? 16 : 11} />
                        <Text style={S.itemTextSmall}>{shortTitle(i.title, words)}</Text>
                        <Box size={10} />
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>

            <View style={S.tasks} wrap={false}>
              <Text style={S.tasksTitle}>As minhas tarefas</Text>
              <View style={S.taskRow}>
                <Text style={S.taskLabel}> </Text>
                {days.map((d) => <Text key={d} style={S.taskHead}>{DAY_LABELS[d - 1].slice(0, 3)}</Text>)}
              </View>
              {[0, 1, 2, 3].map((r) => (
                <View key={r} style={S.taskRow}>
                  <Text style={S.taskLabel}>________________________</Text>
                  {days.map((d) => <View key={d} style={S.taskCell}><Box /></View>)}
                </View>
              ))}
              <View style={S.taskRow}>
                <Text style={S.taskLabel}>Autocolantes (se quiserem)</Text>
                {days.map((d) => (
                  <View key={d} style={S.taskCell}>
                    <Svg width={16} height={16} viewBox="0 0 16 16">
                      <Circle cx="8" cy="8" r="7" stroke="#D1D5DB" strokeWidth={1} strokeDasharray="2,2" fill="#FFFFFF" />
                    </Svg>
                  </View>
                ))}
              </View>
            </View>
            <Text style={S.foot}>As linhas das tarefas são para escrever à mão: fazer a cama, regar as plantas, pôr a mesa…</Text>
          </Page>
        );
      })}
    </Document>
  );
}
