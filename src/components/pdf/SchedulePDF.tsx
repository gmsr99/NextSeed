import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import {
  DISCIPLINE_COLORS,
  DAY_LABELS,
  getWeekDates,
  formatWeekRange,
  getFixedScheduleBlocks,
  PRIMARY_DAYS,
  FRIDAY_VARIABLE,
} from "@/lib/planGenerator";
import type { Child, ExtracurricularItem } from "@/lib/types";

// ─── Estilos ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:           { fontFamily: "Helvetica", fontSize: 9, padding: 24, backgroundColor: "#FFFFFF" },
  header:         { marginBottom: 8 },
  headerTitle:    { fontSize: 18, fontWeight: "bold", color: "#2D4A2D", marginBottom: 2 },
  headerSub:      { fontSize: 9, color: "#6B7280" },

  // Tabela do horário
  table:          { display: "flex", flexDirection: "column" },
  headerRow:      { flexDirection: "row", backgroundColor: "#2D4A2D", marginBottom: 1 },
  headerTimeCell: { width: 58, padding: "4 5", color: "#FFFFFF", fontWeight: "bold", fontSize: 7 },
  headerCell:     { flex: 1, padding: "4 5", color: "#FFFFFF", fontWeight: "bold", fontSize: 7 },

  timeCell:       { width: 58, padding: "3 5", fontSize: 7, color: "#9CA3AF", justifyContent: "center" },
  timeCellMedium: { width: 58, padding: "3 5", fontSize: 7, color: "#92400E", justifyContent: "center" },

  // Bloco de disciplina
  pill:           { borderRadius: 2, padding: "2 4" },
  pillLabel:      { fontSize: 7, fontWeight: "bold", color: "#1F2937" },
  pillLabelBig:   { fontSize: 9, fontWeight: "bold", color: "#1F2937" },

  // Bloco fixo (ritual, transição, etc.) — estilo neutro
  fixedPill:      { borderRadius: 2, padding: "2 4" },
  fixedLabel:     { fontSize: 6, color: "#6B7280", fontStyle: "italic" },

  // ─── Legenda de cores das crianças ──────────────────────────────────────────
  childLegend:     { flexDirection: "row", gap: 14, marginBottom: 6, marginTop: 2 },
  childLegendItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  childLegendDot:  { width: 7, height: 7, borderRadius: 3 },
  childLegendText: { fontSize: 8, color: "#374151" },

  // Bloco de criança em célula multi-criança
  childInitial:    { fontSize: 6, fontWeight: "bold", width: 8 },
  childActivity:   { fontSize: 6, color: "#1F2937", flex: 1 },

  // ─── Secção de transições ────────────────────────────────────────────────────
  transSection:      { marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderColor: "#E5E7EB" },
  transSectionTitle: { fontSize: 10, fontWeight: "bold", color: "#2D4A2D", marginBottom: 8 },
  transGrid:         { flexDirection: "row", gap: 8 },
  transCol:          { flex: 1, padding: "8 10", backgroundColor: "#F9FAFB", borderRadius: 4, borderLeftWidth: 3 },
  transColTitle:     { fontSize: 8, fontWeight: "bold", color: "#374151", marginBottom: 4 },
  transItem:         { fontSize: 7, color: "#4B5563", marginBottom: 2, lineHeight: 1.4 },
  transCategory:     { fontSize: 7, fontWeight: "bold", color: "#6B7280", marginTop: 4, marginBottom: 2 },

  // ─── Secção de extracurriculares ────────────────────────────────────────────
  extraSection:  { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: "#E5E7EB" },
  extraTitle:    { fontSize: 9, fontWeight: "bold", color: "#2D4A2D", marginBottom: 5 },
  extraGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  extraCard:     { width: "31%", padding: "5 7", backgroundColor: "#F9FAFB", borderRadius: 3, borderLeftWidth: 2 },
  extraCardDay:  { fontSize: 6, fontWeight: "bold", color: "#6B7280", marginBottom: 1 },
  extraCardName: { fontSize: 7, fontWeight: "bold", color: "#111827", marginBottom: 1 },
  extraCardMeta: { fontSize: 6, color: "#6B7280" },

  footer: { marginTop: 14, borderTopWidth: 1, borderColor: "#E5E7EB", paddingTop: 6, color: "#9CA3AF", fontSize: 7 },
});

// ─── Conteúdo das transições ──────────────────────────────────────────────────

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

// ─── Slots canónicos ──────────────────────────────────────────────────────────

const CANONICAL_PRIMARY_WEEK = [
  "09:30-09:45",  // Ritual de Chegada
  "09:45-10:10",  // Variável 1
  "10:10-10:17",  // Transição · 7 min
  "10:17-10:42",  // Variável 2
  "10:42-11:05",  // Pausa Exterior
  "11:05-11:50",  // Variável 3
  "11:50-12:30",  // Vida Prática / Preparação Almoço
  "12:30-14:00",  // Almoço + Tempo Livre
  "14:00-14:30",  // Variável 4
  "14:30-14:45",  // Relaxamento
  "14:45-15:15",  // Leitura e Portefólio
];

const CANONICAL_PRIMARY_FRIDAY = [
  "09:30-09:45",  // Saída / Visita de Estudo
  "09:45-11:50",  // Ver Mundo / Aprendizagem em contexto real (bloco grande)
  "11:50-12:30",  // Vida Prática no Exterior
  "12:30-14:00",  // Almoço fora / Piquenique
  "14:00-14:30",  // Registo da Visita
  "14:30-14:45",  // Relaxamento
  "14:45-15:15",  // Encerramento Reflexivo
];

// BIG_SLOTS: blocos com duração >2h — span máximo, destaque verde.
const BIG_SLOTS = new Set(["09:45-11:50", "09:30-12:00"]);

// MEDIUM_SLOTS: blocos com duração >1h — altura média, destaque amarelo.
const MEDIUM_SLOTS = new Set(["12:30-14:00", "12:00-14:00"]);

// VARIABLE_SLOTS: blocos com conteúdo diferente por criança — altura aumentada para acomodar 3 crianças
const VARIABLE_SLOTS = new Set([
  "09:45-10:10",
  "10:17-10:42",
  "11:05-11:50",
  "14:00-14:30",
  "14:45-15:15",
]);

// Cores das crianças — atribuídas por ordem de created_at (a mais velha = azul)
const CHILD_COLORS = ["#3B82F6", "#22C55E", "#F97316"] as const;

// ─── Utilitários de tempo e altura ───────────────────────────────────────────

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Altura fixa por slot — garante alinhamento perfeito entre colunas
function slotHeight(slot: string): number {
  if (MEDIUM_SLOTS.has(slot)) return 48;
  if (VARIABLE_SLOTS.has(slot)) return 50;
  return 22;
}

// Altura total de um item que abrange vários slots canónicos
function itemSpanHeight(itemSlot: string, tableSlots: string[]): number {
  const [iStart, iEnd] = itemSlot.split("-").map(timeToMin);
  return tableSlots
    .filter((s) => {
      const [sStart, sEnd] = s.split("-").map(timeToMin);
      return sStart >= iStart && sEnd <= iEnd;
    })
    .reduce((sum, s) => sum + slotHeight(s), 0);
}

// ─── Normalização de slots antigos ───────────────────────────────────────────

function canonicalizeSlot(day: number, discipline: string, currentSlot: string): string {
  if (day >= 1 && day <= 4) {
    const found = PRIMARY_DAYS[day - 1].find((s) => s.discipline === discipline);
    return found ? found.slot : currentSlot;
  }
  if (day === 5) {
    const found = FRIDAY_VARIABLE.find((s) => s.discipline === discipline);
    return found ? found.slot : currentSlot;
  }
  return currentSlot;
}

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

  const fixedBlocks = getFixedScheduleBlocks(children);
  const allItems = [...planItems, ...fixedBlocks];

  const hasPrimaryChild = children.some(
    (c) => !c.school_year.toLowerCase().startsWith("pré"),
  );

  // Ordenar crianças por created_at ascendente (mais velha = cor 0)
  const sortedChildren = [...children].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  // Construir lookup de itens por criança, com slots canonicalizados
  const childItemsByChild: Record<string, GeneratedPlanItem[]> = {};
  for (const child of sortedChildren) {
    const isPreSchool = child.school_year.toLowerCase().startsWith("pré");
    const usePrimaryCanonical = !isPreSchool || hasPrimaryChild;
    childItemsByChild[child.id] = allItems
      .filter((i) => i.child_id === child.id)
      .map((item) =>
        !item.is_fixed && usePrimaryCanonical
          ? { ...item, time_slot: canonicalizeSlot(item.day_of_week, item.discipline, item.time_slot) }
          : item,
      );
  }

  const allSlots = CANONICAL_PRIMARY_WEEK;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>

        {/* Cabeçalho */}
        <View style={S.header}>
          <Text style={S.headerTitle}>NexSeed — Horário Semanal</Text>
          <Text style={S.headerSub}>{familyName} · Semana de {formatWeekRange(weekStart)}</Text>
        </View>

        {/* ─── Horário unificado — todas as crianças ─── */}
        <View style={S.table}>

          {/* Legenda de cores */}
          <View style={S.childLegend}>
            {sortedChildren.map((child, idx) => (
              <View key={child.id} style={S.childLegendItem}>
                <View style={[S.childLegendDot, { backgroundColor: CHILD_COLORS[idx % CHILD_COLORS.length] }]} />
                <Text style={S.childLegendText}>{child.name}</Text>
              </View>
            ))}
          </View>

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

          {/* Corpo da tabela — layout em colunas */}
          <View style={{ flexDirection: "row" }}>

            {/* Coluna de horas */}
            <View style={{ width: 58 }}>
              {allSlots.map((slot) => {
                const h   = slotHeight(slot);
                const med = MEDIUM_SLOTS.has(slot);
                return (
                  <View
                    key={slot}
                    style={{
                      height: h, padding: "3 5", justifyContent: "center",
                      borderBottomWidth: 1,
                      borderColor: med ? "#FEF9C3" : "#F3F4F6",
                      backgroundColor: med ? "#FEFCE8" : undefined,
                    }}
                  >
                    <Text style={med ? S.timeCellMedium : S.timeCell}>{slot}</Text>
                  </View>
                );
              })}
            </View>

            {/* Uma coluna por dia */}
            {[1, 2, 3, 4, 5].map((day) => {
              const cells: React.ReactNode[] = [];
              const skipped = new Set<string>();

              for (const slot of allSlots) {
                if (skipped.has(slot)) continue;

                const h      = slotHeight(slot);
                const med    = MEDIUM_SLOTS.has(slot);
                const sStart = timeToMin(slot.split("-")[0]);

                // Recolher o item de cada criança para este (slot, day)
                const cellActivities = sortedChildren.map((child, cidx) => ({
                  child,
                  cidx,
                  item: childItemsByChild[child.id]?.find(
                    (i) => i.day_of_week === day && timeToMin(i.time_slot.split("-")[0]) === sStart,
                  ) ?? null,
                }));

                const validActivities = cellActivities.filter((ca) => ca.item !== null);

                if (validActivities.length === 0) {
                  cells.push(
                    <View
                      key={slot}
                      style={{
                        height: h,
                        borderBottomWidth: 1,
                        borderColor: med ? "#FEF9C3" : "#F3F4F6",
                        backgroundColor: med ? "#FEFCE8" : undefined,
                      }}
                    />,
                  );
                  continue;
                }

                // Calcular span a partir do primeiro item válido
                const firstItem  = validActivities[0].item!;
                const totalH     = itemSpanHeight(firstItem.time_slot, allSlots);
                const isSpanning = totalH > h;

                if (isSpanning) {
                  const [iStart, iEnd] = firstItem.time_slot.split("-").map(timeToMin);
                  allSlots.forEach((s) => {
                    const [ss, se] = s.split("-").map(timeToMin);
                    if (ss > iStart && se <= iEnd) skipped.add(s);
                  });
                }

                const cellH        = isSpanning ? totalH : h;
                const isItemBig    = BIG_SLOTS.has(firstItem.time_slot);
                const isItemMedium = !isItemBig && MEDIUM_SLOTS.has(firstItem.time_slot);

                // Decidir: célula unificada ou blocos por criança
                const titles  = new Set(validActivities.map((ca) => ca.item!.title));
                const allSame = titles.size <= 1;

                if (allSame) {
                  // Célula unificada — mesmo estilo anterior
                  const item  = firstItem;
                  const color = DISCIPLINE_COLORS[item.discipline] ?? "#E5E7EB";
                  const cellContent = item.is_fixed ? (
                    <View style={[S.fixedPill, { backgroundColor: color + "60" }]}>
                      <Text style={[S.fixedLabel, isItemMedium ? { fontSize: 7 } : {}]}>
                        {item.title}
                      </Text>
                    </View>
                  ) : (
                    <View style={[S.pill, { backgroundColor: color + (isItemBig || isSpanning ? "88" : "55") }]}>
                      <Text style={isItemBig || isSpanning ? S.pillLabelBig : S.pillLabel}>
                        {item.title}
                      </Text>
                    </View>
                  );

                  cells.push(
                    <View
                      key={slot}
                      style={{
                        height: cellH, padding: "3 4", justifyContent: "center",
                        borderBottomWidth: 1,
                        borderColor: isItemMedium ? "#FEF9C3" : "#F3F4F6",
                        backgroundColor: isItemMedium ? "#FEFCE8" : undefined,
                      }}
                    >
                      {cellContent}
                    </View>,
                  );
                } else {
                  // Blocos empilhados por criança
                  cells.push(
                    <View
                      key={slot}
                      style={{
                        height: cellH, padding: "2 3", justifyContent: "flex-start",
                        borderBottomWidth: 1, borderColor: "#F3F4F6",
                      }}
                    >
                      {cellActivities.map(({ child, cidx, item: cItem }) => {
                        if (!cItem) return null;
                        const childColor = CHILD_COLORS[cidx % CHILD_COLORS.length];
                        const discColor  = DISCIPLINE_COLORS[cItem.discipline] ?? "#E5E7EB";
                        return (
                          <View
                            key={child.id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              borderLeftWidth: 2,
                              borderLeftColor: childColor,
                              backgroundColor: discColor + "33",
                              paddingLeft: 2,
                              marginBottom: 1,
                              borderRadius: 1,
                            }}
                          >
                            <Text style={[S.childInitial, { color: childColor }]}>
                              {child.name.charAt(0)}
                            </Text>
                            <Text style={S.childActivity} numberOfLines={2}>
                              {cItem.title}
                            </Text>
                          </View>
                        );
                      })}
                    </View>,
                  );
                }
              }

              return <View key={day} style={{ flex: 1 }}>{cells}</View>;
            })}
          </View>
        </View>

        {/* ─── Secção de Transições Pedagógicas ─── */}
        <View style={S.transSection} wrap={false}>
          <Text style={S.transSectionTitle}>Transições Pedagógicas Conscientes · 7 minutos</Text>
          <View style={S.transGrid}>

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
                const color      = EXTRACURRICULAR_COLORS[act.type ?? "Outro"] ?? "#9CA3AF";
                const dayLabel   = act.day_of_week ? DAY_LABELS_FULL[act.day_of_week - 1] : "—";
                const timeLabel  = act.start_time ? `${act.start_time}${act.end_time ? `–${act.end_time}` : ""}` : "";
                const childLabel = act.child_id ? (children.find((c) => c.id === act.child_id)?.name ?? "") : "Todos";
                const travelLabel = act.travel_time_minutes > 0 ? ` · ${act.travel_time_minutes}min deslocação` : "";
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
