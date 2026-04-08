import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { PortfolioEntry } from "@/hooks/usePortfolio";
import type { Child } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/planGenerator";

// ─── Brand colours (match NexSeed brand) ──────────────────────────────────────
const ORANGE = "#C49A3C";
const BARK   = "#3E3029";
const EARTH  = "#5E4F40";
const MOSS   = "#6EA062";
const GREY   = "#888077";
const CREAM  = "#FBF5E8";
const WHITE  = "#FFFFFF";
const BORDER = "#E8DDD0";

const S = StyleSheet.create({
  page:           { fontFamily: "Helvetica", fontSize: 9, padding: 32, backgroundColor: WHITE },

  // ── Cover ─────────────────────────────────────────────────────────────────
  coverPage:      { fontFamily: "Helvetica", padding: 48, backgroundColor: WHITE, justifyContent: "center" },
  coverLabel:     { fontSize: 10, color: ORANGE, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 },
  coverTitle:     { fontSize: 32, fontWeight: "bold", color: BARK, marginBottom: 8 },
  coverSub:       { fontSize: 13, color: EARTH, marginBottom: 4 },
  coverDate:      { fontSize: 10, color: GREY, marginTop: 24 },
  coverRule:      { height: 3, backgroundColor: ORANGE, width: 60, marginVertical: 20 },

  // ── Header / Footer ────────────────────────────────────────────────────────
  pageHeader:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 16,
                    paddingBottom: 8, borderBottomWidth: 1, borderColor: ORANGE },
  pageHeaderLeft: { fontSize: 8, color: GREY },
  pageHeaderRight:{ fontSize: 8, color: GREY },

  pageFooter:     { position: "absolute", bottom: 20, left: 32, right: 32,
                    flexDirection: "row", justifyContent: "space-between",
                    borderTopWidth: 1, borderColor: BORDER, paddingTop: 6 },
  footerText:     { fontSize: 7, color: GREY },

  // ── Stats row ─────────────────────────────────────────────────────────────
  statsRow:       { flexDirection: "row", gap: 8, marginBottom: 20 },
  statBox:        { flex: 1, backgroundColor: CREAM, borderRadius: 4, padding: 10,
                    borderLeftWidth: 3, borderColor: ORANGE },
  statNumber:     { fontSize: 20, fontWeight: "bold", color: ORANGE },
  statLabel:      { fontSize: 8, color: EARTH, marginTop: 2 },

  // ── Month divider ──────────────────────────────────────────────────────────
  monthDivider:   { marginTop: 16, marginBottom: 8 },
  monthLabel:     { fontSize: 11, fontWeight: "bold", color: EARTH,
                    borderBottomWidth: 1, borderColor: BORDER, paddingBottom: 4 },

  // ── Entry card ─────────────────────────────────────────────────────────────
  card:           { marginBottom: 8, borderRadius: 4, overflow: "hidden" },
  cardHeader:     { flexDirection: "row", alignItems: "center", padding: "6 8",
                    backgroundColor: CREAM },
  cardDot:        { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  cardTitle:      { flex: 1, fontSize: 10, fontWeight: "bold", color: BARK },
  cardDate:       { fontSize: 8, color: GREY },
  cardBadge:      { fontSize: 7, color: ORANGE, fontWeight: "bold",
                    backgroundColor: WHITE, borderRadius: 2, padding: "1 4",
                    borderWidth: 1, borderColor: ORANGE, marginLeft: 6 },
  cardBody:       { padding: "5 8 8", backgroundColor: WHITE,
                    borderWidth: 1, borderTopWidth: 0, borderColor: BORDER },
  cardDesc:       { fontSize: 9, color: EARTH, lineHeight: 1.45, marginBottom: 6 },

  // ── Coverage tags ──────────────────────────────────────────────────────────
  coverageRow:    { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag:            { fontSize: 7, color: WHITE, backgroundColor: MOSS,
                    borderRadius: 2, padding: "2 5" },
  tagDisc:        { fontSize: 7, color: WHITE, backgroundColor: EARTH,
                    borderRadius: 2, padding: "2 5" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

function entryDate(e: PortfolioEntry): string {
  if (e.kind === "activity") return e.activity_date;
  return e.start_date ?? e.created_at ?? "";
}

function disciplineColor(disc: string | null | undefined): string {
  const COLORS: Record<string, string> = {
    language:   "#4B9CD3",
    math:       "#E8834D",
    world:      "#6EA062",
    expression: "#C49A3C",
    english:    "#9B72CF",
    project:    "#D4648A",
    reading:    "#5B9BD5",
  };
  return COLORS[disc ?? ""] ?? "#888077";
}

// ─── PDF Component ────────────────────────────────────────────────────────────

interface Props {
  entries: PortfolioEntry[];
  children: Child[];
  childId: string; // "all" | child uuid
  familyName: string;
}

export default function PortfolioPDF({ entries, children: kids, childId, familyName }: Props) {
  const child = kids.find((c) => c.id === childId);
  const childName = child ? child.name : "Todos";
  const schoolYear = child ? child.school_year : null;

  // Sort by date ascending
  const sorted = [...entries].sort((a, b) => {
    const da = entryDate(a);
    const db = entryDate(b);
    return da.localeCompare(db);
  });

  const actCount  = sorted.filter((e) => e.kind === "activity").length;
  const projCount = sorted.filter((e) => e.kind === "project").length;
  const covCount  = sorted.filter((e) => e.coverage.length > 0).length;

  // Group by month
  const byMonth: Map<string, PortfolioEntry[]> = new Map();
  for (const e of sorted) {
    const k = monthKey(entryDate(e));
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k)!.push(e);
  }

  const today = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document>
      {/* ── Cover ─────────────────────────────────────────────────────────── */}
      <Page size="A4" style={S.coverPage}>
        <Text style={S.coverLabel}>NexSeed · Portfólio</Text>
        <View style={S.coverRule} />
        <Text style={S.coverTitle}>{childName}</Text>
        {schoolYear && <Text style={S.coverSub}>{schoolYear}</Text>}
        <Text style={S.coverSub}>{familyName}</Text>
        <Text style={S.coverDate}>Exportado em {today}</Text>
      </Page>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.pageHeader}>
          <Text style={S.pageHeaderLeft}>NexSeed · Portfólio de {childName}</Text>
          <Text style={S.pageHeaderRight}>{familyName}</Text>
        </View>

        {/* Stats */}
        <View style={S.statsRow}>
          <View style={S.statBox}>
            <Text style={S.statNumber}>{actCount}</Text>
            <Text style={S.statLabel}>Atividades</Text>
          </View>
          <View style={S.statBox}>
            <Text style={S.statNumber}>{projCount}</Text>
            <Text style={S.statLabel}>Projetos</Text>
          </View>
          <View style={S.statBox}>
            <Text style={S.statNumber}>{covCount}</Text>
            <Text style={S.statLabel}>Com cobertura curricular</Text>
          </View>
        </View>

        {/* Entries by month */}
        {Array.from(byMonth.entries()).map(([month, monthEntries]) => (
          <View key={month}>
            <View style={S.monthDivider}>
              <Text style={S.monthLabel}>{month.charAt(0).toUpperCase() + month.slice(1)}</Text>
            </View>

            {monthEntries.map((entry) => {
              const disc = entry.kind === "activity" ? entry.discipline : "project";
              const color = disciplineColor(disc);
              const label = disc ? (DISCIPLINE_LABELS[disc] ?? disc) : entry.kind === "project" ? "Projeto" : "";
              const date = entryDate(entry);
              const description = entry.kind === "activity" ? entry.description : entry.description;

              return (
                <View key={entry.id} style={S.card} wrap={false}>
                  <View style={S.cardHeader}>
                    <View style={[S.cardDot, { backgroundColor: color }]} />
                    <Text style={S.cardTitle}>{entry.title}</Text>
                    {label && <Text style={S.cardBadge}>{label}</Text>}
                    <Text style={S.cardDate}>{formatDate(date)}</Text>
                  </View>
                  <View style={S.cardBody}>
                    {description && (
                      <Text style={S.cardDesc}>{description}</Text>
                    )}
                    {entry.coverage.length > 0 && (
                      <View style={S.coverageRow}>
                        {entry.coverage.slice(0, 6).map((c, i) => (
                          <View key={i} style={S.tag}>
                            <Text>{c.objective}</Text>
                          </View>
                        ))}
                        {entry.coverage.length > 6 && (
                          <View style={S.tagDisc}>
                            <Text>+{entry.coverage.length - 6} mais</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Footer */}
        <View style={S.pageFooter} fixed>
          <Text style={S.footerText}>© NexSeed</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
