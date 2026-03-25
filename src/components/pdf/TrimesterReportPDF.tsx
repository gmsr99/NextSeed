import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import type { Activity, Child } from "@/lib/types";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS } from "@/lib/planGenerator";

const S = StyleSheet.create({
  // ── Cover ─────────────────────────────────────────────────────────
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: "#1C3520",
    padding: 56,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverBrand: { fontSize: 11, color: "#86EFAC", fontWeight: "bold", letterSpacing: 2, marginBottom: 52 },
  coverEyebrow: { fontSize: 11, color: "#86EFAC", marginBottom: 6 },
  coverTitle: { fontSize: 40, fontWeight: "bold", color: "#FFFFFF", lineHeight: 1.1, marginBottom: 6 },
  coverSubtitle: { fontSize: 14, color: "#BBF7D0", marginBottom: 40 },
  coverCard: { backgroundColor: "#FFFFFF", borderRadius: 8, padding: "18 24" },
  coverRow: { flexDirection: "row", marginBottom: 14 },
  coverField: { flex: 1 },
  coverFieldLabel: { fontSize: 7, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  coverFieldValue: { fontSize: 13, fontWeight: "bold", color: "#1F2937" },
  coverDivider: { borderBottomWidth: 1, borderColor: "#F3F4F6", marginBottom: 14 },
  coverLegal: { fontSize: 8, color: "#4ADE80", lineHeight: 1.7 },

  // ── Content pages ─────────────────────────────────────────────────
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    padding: "32 40 52 40",
    backgroundColor: "#FAFAF8",
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 18,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderColor: "#2D4A2D",
  },
  pageHeaderTitle: { fontSize: 12, fontWeight: "bold", color: "#2D4A2D" },
  pageHeaderSub: { fontSize: 8, color: "#6B7280", marginTop: 2 },
  pageHeaderBrand: { fontSize: 8, color: "#9CA3AF" },

  // Summary box
  summaryBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    padding: "10 12",
    marginBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  summaryChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: "5 10",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  summaryNumber: { fontSize: 18, fontWeight: "bold", color: "#2D4A2D" },
  summaryLabel: { fontSize: 6.5, color: "#6B7280", marginTop: 1 },

  // Discipline section
  disciplineBar: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#FFFFFF",
    padding: "5 10",
    borderRadius: 4,
    marginBottom: 6,
    marginTop: 16,
  },

  // Activity row
  activityRow: {
    flexDirection: "row",
    marginBottom: 5,
    padding: "7 8",
    borderRadius: 4,
    borderLeftWidth: 3,
  },
  activityDateCol: { width: 52, paddingRight: 6 },
  activityDate: { fontSize: 8, color: "#6B7280", fontWeight: "bold", lineHeight: 1.4 },
  activityBody: { flex: 1 },
  activityTitle: { fontSize: 9.5, fontWeight: "bold", color: "#1F2937", marginBottom: 2 },
  activityDesc: { fontSize: 8, color: "#374151", lineHeight: 1.5 },
  photosRow: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 5 },
  photo: { width: 54, height: 54, borderRadius: 3 },
  photoCount: { fontSize: 7, color: "#6B7280", marginTop: 4 },

  // Declaration
  declarationSection: { marginTop: 30, paddingTop: 14, borderTopWidth: 1, borderColor: "#E5E7EB" },
  declarationTitle: { fontSize: 10, fontWeight: "bold", color: "#2D4A2D", marginBottom: 8 },
  declarationText: { fontSize: 8.5, color: "#374151", lineHeight: 1.9, marginBottom: 28 },
  signaturesRow: { flexDirection: "row", gap: 24 },
  signatureBlock: { flex: 1 },
  signatureLine: { borderTopWidth: 1, borderColor: "#9CA3AF", marginBottom: 5, marginTop: 36 },
  signatureLabel: { fontSize: 7.5, color: "#6B7280" },

  // Footer (fixed, every page)
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: "#B0B8C4" },
});

interface Props {
  child: Child;
  familyName: string;
  activities: Activity[];
  trimesterLabel: string;
  startDate: string; // "yyyy-MM-dd"
  endDate: string;   // "yyyy-MM-dd"
}

function getAcademicYear(startDate: string) {
  const year = parseInt(startDate.substring(0, 4));
  const month = parseInt(startDate.substring(5, 7));
  const base = month >= 9 ? year : year - 1;
  return `${base}/${base + 1}`;
}

export default function TrimesterReportPDF({
  child,
  familyName,
  activities,
  trimesterLabel,
  startDate,
  endDate,
}: Props) {
  const startFmt = format(parseISO(startDate + "T00:00:00"), "d 'de' MMMM 'de' yyyy", { locale: pt });
  const endFmt   = format(parseISO(endDate   + "T00:00:00"), "d 'de' MMMM 'de' yyyy", { locale: pt });
  const periodLabel = `${startFmt} a ${endFmt}`;
  const academicYear = getAcademicYear(startDate);

  // Group activities by discipline (preserving DISCIPLINE_LABELS order)
  const disciplineOrder = Object.keys(DISCIPLINE_LABELS);
  const grouped: Record<string, Activity[]> = {};
  for (const act of activities) {
    const key = act.discipline ?? "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(act);
  }
  const sortedGroups = [
    ...disciplineOrder.filter((d) => grouped[d]),
    ...Object.keys(grouped).filter((d) => !disciplineOrder.includes(d)),
  ].map((d) => ({ discipline: d, items: grouped[d] }));

  // Summary counts
  const summaryCounts = sortedGroups.map(({ discipline, items }) => ({
    discipline,
    label: DISCIPLINE_LABELS[discipline] ?? discipline,
    count: items.length,
  }));

  return (
    <Document>
      {/* ── Cover page ── */}
      <Page size="A4" style={S.coverPage}>
        <View>
          <Text style={S.coverBrand}>NEXSEED</Text>
          <Text style={S.coverEyebrow}>RELATÓRIO DE</Text>
          <Text style={S.coverTitle}>ATIVIDADES</Text>
          <Text style={S.coverSubtitle}>Educação Doméstica — {trimesterLabel}</Text>

          <View style={S.coverCard}>
            <View style={S.coverRow}>
              <View style={S.coverField}>
                <Text style={S.coverFieldLabel}>Família</Text>
                <Text style={S.coverFieldValue}>{familyName}</Text>
              </View>
              <View style={S.coverField}>
                <Text style={S.coverFieldLabel}>Criança</Text>
                <Text style={S.coverFieldValue}>{child.name}</Text>
              </View>
            </View>
            <View style={S.coverDivider} />
            <View style={S.coverRow}>
              <View style={S.coverField}>
                <Text style={S.coverFieldLabel}>Ano de Escolaridade</Text>
                <Text style={S.coverFieldValue}>{child.school_year}</Text>
              </View>
              <View style={S.coverField}>
                <Text style={S.coverFieldLabel}>Ano Letivo</Text>
                <Text style={S.coverFieldValue}>{academicYear}</Text>
              </View>
            </View>
            <View style={S.coverDivider} />
            <View>
              <Text style={S.coverFieldLabel}>Período</Text>
              <Text style={S.coverFieldValue}>{periodLabel}</Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={S.coverLegal}>
            Relatório elaborado ao abrigo do Decreto-Lei n.º 55/2018, de 6 de julho,{"\n"}
            e do Despacho Normativo n.º 10-B/2018, relativo à educação doméstica.
          </Text>
        </View>
      </Page>

      {/* ── Content page ── */}
      <Page size="A4" style={S.page}>
        {/* Page header */}
        <View style={S.pageHeader}>
          <View>
            <Text style={S.pageHeaderTitle}>{child.name} — {trimesterLabel}</Text>
            <Text style={S.pageHeaderSub}>{periodLabel}</Text>
          </View>
          <Text style={S.pageHeaderBrand}>NexSeed</Text>
        </View>

        {/* Summary */}
        <View style={S.summaryBox}>
          <View style={S.summaryChip}>
            <Text style={S.summaryNumber}>{activities.length}</Text>
            <Text style={S.summaryLabel}>Total</Text>
          </View>
          {summaryCounts.map(({ discipline, label, count }) => (
            <View key={discipline} style={S.summaryChip}>
              <Text style={S.summaryNumber}>{count}</Text>
              <Text style={S.summaryLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Activities by discipline */}
        {sortedGroups.map(({ discipline, items }) => {
          const color = DISCIPLINE_COLORS[discipline] ?? "#6B7280";
          const label = DISCIPLINE_LABELS[discipline] ?? discipline;
          return (
            <View key={discipline}>
              <Text style={[S.disciplineBar, { backgroundColor: color }]}>{label}</Text>
              {items.map((act) => {
                const d = parseISO(act.activity_date + "T00:00:00");
                return (
                  <View
                    key={act.id}
                    style={[S.activityRow, { borderLeftColor: color, backgroundColor: color + "1A" }]}
                    wrap={false}
                  >
                    <View style={S.activityDateCol}>
                      <Text style={S.activityDate}>{format(d, "d MMM", { locale: pt })}</Text>
                    </View>
                    <View style={S.activityBody}>
                      <Text style={S.activityTitle}>{act.title}</Text>
                      {act.description ? (
                        <Text style={S.activityDesc}>{act.description}</Text>
                      ) : null}
                      {act.photos.length > 0 && (
                        <View style={S.photosRow}>
                          {act.photos.slice(0, 4).map((url, i) => (
                            <Image key={i} style={S.photo} src={url} />
                          ))}
                          {act.photos.length > 4 && (
                            <Text style={S.photoCount}>+{act.photos.length - 4} fotos</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        {activities.length === 0 && (
          <Text style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", marginTop: 48 }}>
            Nenhuma atividade registada neste período.
          </Text>
        )}

        {/* Declaration */}
        <View style={S.declarationSection} wrap={false}>
          <Text style={S.declarationTitle}>Declaração do Encarregado de Educação</Text>
          <Text style={S.declarationText}>
            Declaro que todas as atividades descritas neste relatório foram efetivamente realizadas no âmbito
            do regime de educação doméstica, no período compreendido entre {startFmt} e {endFmt}, em
            conformidade com as orientações curriculares do {child.school_year} do ensino básico e com os
            objetivos definidos nas Aprendizagens Essenciais homologadas pela Direção-Geral da Educação (DGE).
          </Text>
          <View style={S.signaturesRow}>
            <View style={S.signatureBlock}>
              <View style={S.signatureLine} />
              <Text style={S.signatureLabel}>Local e Data</Text>
            </View>
            <View style={S.signatureBlock}>
              <View style={S.signatureLine} />
              <Text style={S.signatureLabel}>Assinatura do Encarregado de Educação</Text>
            </View>
          </View>
        </View>

        {/* Footer — every page */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>
            NexSeed · {child.name} · {trimesterLabel} · Ano Letivo {academicYear}
          </Text>
          <Text
            style={S.footerText}
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
