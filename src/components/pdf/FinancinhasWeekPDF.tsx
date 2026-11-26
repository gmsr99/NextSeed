// I-21: a sessão Financinhas da semana, para o adulto (guia, quiz, atividades,
// desafio) e o lembrete do ritual. Sai com os outros PDF do plano quando há
// uma aula por dar. A criança não recebe nada sem passar pelo adulto.
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatWeekRange } from "@/lib/planGenerator";
import { mdLines } from "@/lib/financinhas/weekSession";

export interface FinWeekPDFEntry {
  childName: string;
  weekdayLabel: string;
  title: string;
  adultGuide?: string | null;
  quiz?: string | null;
  activities?: string | null;
  challenge?: string | null;
}

const S = StyleSheet.create({
  page:     { fontFamily: "Helvetica", fontSize: 10, padding: 36, color: "#374151" },
  header:   { marginBottom: 16, borderBottomWidth: 2, borderColor: "#2D4A2D", paddingBottom: 8 },
  title:    { fontSize: 18, fontWeight: "bold", color: "#2D4A2D", marginBottom: 2 },
  sub:      { fontSize: 9, color: "#6B7280" },
  ritual:   { padding: "8 12", backgroundColor: "#FEF3C7", borderRadius: 4, marginBottom: 14 },
  ritualT:  { fontSize: 9, color: "#92400E", lineHeight: 1.5 },
  section:  { marginBottom: 12 },
  label:    { fontSize: 11, fontWeight: "bold", color: "#1F2937", marginBottom: 4 },
  h:        { fontSize: 10, fontWeight: "bold", color: "#1F2937", marginTop: 4, marginBottom: 2 },
  p:        { fontSize: 9.5, lineHeight: 1.5, marginBottom: 3 },
  li:       { fontSize: 9.5, lineHeight: 1.5, marginBottom: 2, paddingLeft: 10 },
  footer:   { position: "absolute", bottom: 20, left: 36, right: 36, fontSize: 7, color: "#9CA3AF" },
});

// A Helvetica do PDF não tem emojis: os mealheiros passam a palavra.
const EMOJI: Record<string, string> = { "🐷": "Gastar", "🎯": "Poupar", "❤️": "Dar", "🚀": "Investir" };
function plain(s: string): string {
  let out = s;
  for (const [e, w] of Object.entries(EMOJI)) out = out.split(e).join(w);
  return out.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").replace(/\s{2,}/g, " ").trim();
}

function Md({ text }: { text?: string | null }) {
  return (
    <>
      {mdLines(text).map((l, i) =>
        l.kind === "h" ? <Text key={i} style={S.h}>{plain(l.text)}</Text>
        : l.kind === "li" ? <Text key={i} style={S.li}>• {plain(l.text)}</Text>
        : <Text key={i} style={S.p}>{plain(l.text)}</Text>,
      )}
    </>
  );
}

function Section({ label, text }: { label: string; text?: string | null }) {
  if (!text?.trim()) return null;
  return (
    <View style={S.section}>
      <Text style={S.label}>{label}</Text>
      <Md text={text} />
    </View>
  );
}

export default function FinancinhasWeekPDF({ entries, weekStart }: { entries: FinWeekPDFEntry[]; weekStart: Date }) {
  return (
    <Document title="Financinhas da semana">
      {entries.map((e, i) => (
        <Page key={i} size="A4" style={S.page}>
          <View style={S.header}>
            <Text style={S.title}>Financinhas · {plain(e.title)}</Text>
            <Text style={S.sub}>{e.childName} · {formatWeekRange(weekStart)} · no dia da semanada ({e.weekdayLabel})</Text>
          </View>
          <View style={S.ritual}>
            <Text style={S.ritualT}>
              Primeiro, o ritual de 5 minutos: entregar a semanada em moedas pequenas e repartir pelos quatro mealheiros,
              com o chão do Gastar sempre lá. A semanada nunca é prémio nem castigo. A apresentação gera-se com o prompt que
              está na app (Plano Semanal ou Financinhas) e vê-se com um adulto.
            </Text>
          </View>
          <Section label="Guia do adulto" text={e.adultGuide} />
          <Section label="Quiz" text={e.quiz} />
          <Section label="Atividades" text={e.activities} />
          <Section label="Desafio da semana" text={e.challenge} />
          <Text style={S.footer} fixed>NexSeed · Financinhas · para o adulto</Text>
        </Page>
      ))}
    </Document>
  );
}
