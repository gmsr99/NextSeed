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
  header:         { marginBottom: 12 },
  headerTitle:    { fontSize: 18, fontWeight: "bold", color: "#2D4A2D", marginBottom: 2 },
  headerSub:      { fontSize: 9, color: "#6B7280" },

  sectionTitle:   { fontSize: 11, fontWeight: "bold", color: "#2D4A2D", marginTop: 10, marginBottom: 4 },

  // Tabela do horário
  table:          { display: "flex", flexDirection: "column" },
  headerRow:      { flexDirection: "row", backgroundColor: "#2D4A2D", marginBottom: 1 },
  headerTimeCell: { width: 58, padding: "4 5", color: "#FFFFFF", fontWeight: "bold", fontSize: 7 },
  headerCell:     { flex: 1, padding: "4 5", color: "#FFFFFF", fontWeight: "bold", fontSize: 7 },

  tableRow:         { flexDirection: "row", borderBottomWidth: 1, borderColor: "#F3F4F6" },
  tableRowBig:      { flexDirection: "row", borderBottomWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F0FDF4" },
  tableRowMedium:   { flexDirection: "row", borderBottomWidth: 1, borderColor: "#FEF9C3", backgroundColor: "#FEFCE8" },
  timeCell:         { width: 58, padding: "3 5", fontSize: 7, color: "#9CA3AF", justifyContent: "center" },
  timeCellBig:      { width: 58, padding: "3 5", fontSize: 7, color: "#6B7280", fontWeight: "bold", justifyContent: "center" },
  timeCellMedium:   { width: 58, padding: "3 5", fontSize: 7, color: "#92400E", justifyContent: "center" },
  cell:             { flex: 1, padding: "3 4", minHeight: 20, justifyContent: "center" },
  cellBig:          { flex: 1, padding: "4 5", minHeight: 60, justifyContent: "center" },
  cellMedium:       { flex: 1, padding: "3 5", minHeight: 36, justifyContent: "center" },

  // Bloco de disciplina (apenas nome, sem título de atividade)
  pill:           { borderRadius: 2, padding: "2 4" },
  pillLabel:      { fontSize: 7, fontWeight: "bold", color: "#1F2937" },
  pillLabelBig:   { fontSize: 9, fontWeight: "bold", color: "#1F2937" },

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
// Ordem exata dos blocos no horário semanal (Seg–Qui) para o ensino primário
// e para o pré-escolar alinhado com irmão/irmã do primário.
// A sexta-feira tem um conjunto diferente porque "Ver Mundo" ocupa 09:45-11:50.

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
  "15:00-15:30",  // Leitura e Portefólio
];

const CANONICAL_PRIMARY_FRIDAY = [
  "09:30-09:45",  // Saída / Visita de Estudo
  "09:45-11:50",  // Ver Mundo / Aprendizagem em contexto real (bloco grande)
  "11:50-12:30",  // Vida Prática no Exterior
  "12:30-14:00",  // Almoço fora / Piquenique
  "14:00-14:30",  // Registo da Visita
  "14:30-14:45",  // Relaxamento
  "15:00-15:30",  // Encerramento Reflexivo
];

// BIG_SLOTS: blocos com duração >2h — altura máxima, destaque verde.
const BIG_SLOTS = new Set(["09:45-11:50", "09:30-12:00"]);

// MEDIUM_SLOTS: blocos com duração >1h — altura média, destaque amarelo.
const MEDIUM_SLOTS = new Set(["12:30-14:00", "12:00-14:00"]);

// ─── Lookup de células com suporte a spans ────────────────────────────────────
// Um bloco como "09:45-11:50" (Sexta) cobre vários slots canónicos da semana
// ("09:45-10:10", "10:10-10:17", …). Em vez de criar uma linha extra para o
// bloco grande, mostramos-o na primeira linha que intercepta e marcamos as
// restantes como continuação (célula colorida sem label).

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Altura fixa por slot — garante alinhamento perfeito entre colunas
function slotHeight(slot: string): number {
  if (MEDIUM_SLOTS.has(slot)) return 42;
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
// Itens guardados na BD com código mais antigo podem ter slots diferentes dos
// slots canónicos atuais (ex: "09:00-10:00" → "09:45-10:10").
// Resolve pela disciplina + dia da semana usando a tabela PRIMARY_DAYS.

function canonicalizeSlot(day: number, discipline: string, currentSlot: string): string {
  if (day >= 1 && day <= 4) {
    const found = PRIMARY_DAYS[day - 1].find((s) => s.discipline === discipline);
    return found ? found.slot : currentSlot;
  }
  if (day === 5) {
    // Para a sexta-feira, usamos FRIDAY_VARIABLE. Se houver duas entradas para
    // a mesma disciplina (world_visit), .find() devolve a primeira (o bloco grande).
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

  // Junta blocos gerados (variáveis) + blocos fixos do horário
  const fixedBlocks = getFixedScheduleBlocks(children);
  const allItems = [...planItems, ...fixedBlocks];

  // Detetar se existe pelo menos uma criança no ensino primário na família
  const hasPrimaryChild = children.some(
    (c) => !c.school_year.toLowerCase().startsWith("pré"),
  );

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
          const isPreSchool = child.school_year.toLowerCase().startsWith("pré");
          // Pré-escolar alinhado usa a mesma estrutura canónica do primário
          const usePrimaryCanonical = !isPreSchool || (isPreSchool && hasPrimaryChild);

          // Itens desta criança, com slots normalizados para canónico (apenas
          // para primário / pré-escolar alinhado)
          const childItemsRaw = allItems.filter((i) => i.child_id === child.id);
          const childItems = childItemsRaw.map((item) => {
            if (!item.is_fixed && usePrimaryCanonical) {
              return {
                ...item,
                time_slot: canonicalizeSlot(item.day_of_week, item.discipline, item.time_slot),
              };
            }
            return item;
          });

          // Slots a usar nas linhas da tabela
          // Primário / alinhado: conjuntos canónicos predefinidos (Seg–Qui e Sex)
          // Pré-escolar autónomo: descoberta dinâmica (não tem conflito)
          const weekSlots = usePrimaryCanonical
            ? CANONICAL_PRIMARY_WEEK
            : [...new Set(
                childItems
                  .filter((i) => i.day_of_week >= 1 && i.day_of_week <= 4)
                  .map((i) => i.time_slot),
              )].sort();

          const fridaySlots = usePrimaryCanonical
            ? CANONICAL_PRIMARY_FRIDAY
            : [...new Set(
                childItems
                  .filter((i) => i.day_of_week === 5)
                  .map((i) => i.time_slot),
              )].sort();

          // Linhas da tabela: usamos apenas weekSlots como base.
          // Os itens de sexta com slots mais longos (ex: "09:45-11:50") são
          // mostrados via findCellItem com lógica de span — sem criar linhas extra.
          const allSlots = usePrimaryCanonical
            ? weekSlots
            : [...new Set([...weekSlots, ...fridaySlots])].sort();

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

                {/* Corpo da tabela — layout em colunas para suportar spans reais */}
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

                      const h   = slotHeight(slot);
                      const med = MEDIUM_SLOTS.has(slot);
                      const sStart = timeToMin(slot.split("-")[0]);

                      // Item que começa exatamente neste slot (ou que começa aqui via span)
                      const item = childItems.find((i) => {
                        if (i.day_of_week !== day) return false;
                        return timeToMin(i.time_slot.split("-")[0]) === sStart;
                      });

                      if (item) {
                        const totalH       = itemSpanHeight(item.time_slot, allSlots);
                        const isSpanning   = totalH > h;
                        const isItemBig    = BIG_SLOTS.has(item.time_slot);
                        const isItemMedium = !isItemBig && MEDIUM_SLOTS.has(item.time_slot);
                        const color        = DISCIPLINE_COLORS[item.discipline] ?? "#E5E7EB";

                        // Marcar slots cobertos pelo span para saltar
                        if (isSpanning) {
                          const [iStart, iEnd] = item.time_slot.split("-").map(timeToMin);
                          allSlots.forEach((s) => {
                            const [ss, se] = s.split("-").map(timeToMin);
                            if (ss > iStart && se <= iEnd) skipped.add(s);
                          });
                        }

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
                              height: totalH, padding: "3 4", justifyContent: "center",
                              borderBottomWidth: 1,
                              borderColor: isItemMedium ? "#FEF9C3" : "#F3F4F6",
                              backgroundColor: isItemMedium ? "#FEFCE8" : undefined,
                            }}
                          >
                            {cellContent}
                          </View>
                        );
                      } else {
                        cells.push(
                          <View
                            key={slot}
                            style={{
                              height: h,
                              borderBottomWidth: 1,
                              borderColor: med ? "#FEF9C3" : "#F3F4F6",
                              backgroundColor: med ? "#FEFCE8" : undefined,
                            }}
                          />
                        );
                      }
                    }

                    return <View key={day} style={{ flex: 1 }}>{cells}</View>;
                  })}
                </View>
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
