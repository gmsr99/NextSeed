// I-20 (FIN_11 B3): kit de arranque do Financinhas para imprimir.
// Etiquetas dos 4 frascos e da linha do chão, Mapa de Moedas (5–6), Página da
// Semana (7–8), folha do sonho e ficha da fotografia inicial (para o adulto).
// Regras (FIN_CUR_04): a moeda do chão é igual às outras, o especial é a linha;
// aos 5–6 o 🚀 chama-se "Inventar"; o caderninho é da criança e fica em papel.
// Sem nomes: a criança escreve o seu. A Helvetica não tem emojis, por isso cada
// mealheiro tem uma cor e uma palavra.
import { Document, Page, Text, View, StyleSheet, Svg, Circle, Line, Rect } from "@react-pdf/renderer";
import { SNAPSHOT_QUESTIONS } from "@/lib/financinhas/catalog";

const JARS = [
  { key: "gastar", label: "Gastar", color: "#E76F51", hint: "o agora, sem descer do chão" },
  { key: "poupar", label: "Poupar", color: "#2A9D8F", hint: "o sonho" },
  { key: "dar", label: "Dar", color: "#E5989B", hint: "oferecer e ajudar" },
  { key: "investir", label: "Investir", color: "#6D597A", hint: "os meios para criar valor" },
] as const;

const INK = "#374151";
// 25 mm: cabe uma moeda de 50 cêntimos (24,25 mm) dentro do círculo (1 pt = 0,3528 mm)
const COIN = 70;
const S = StyleSheet.create({
  page:   { fontFamily: "Helvetica", fontSize: 10, padding: 32, color: INK },
  title:  { fontSize: 18, fontWeight: "bold", color: "#2D4A2D", marginBottom: 2 },
  sub:    { fontSize: 9, color: "#6B7280", marginBottom: 14 },
  note:   { fontSize: 8, color: "#6B7280", marginTop: 10, lineHeight: 1.4 },
  label:  { fontSize: 11, fontWeight: "bold" },
  field:  { fontSize: 11, marginBottom: 8 },
  box:    { borderWidth: 1.5, borderColor: "#9CA3AF", borderRadius: 8, padding: 10 },
  cell:   { borderRightWidth: 1, borderColor: "#9CA3AF", padding: 6, fontSize: 10 },
  row:    { flexDirection: "row", borderBottomWidth: 1, borderColor: "#9CA3AF" },
  footer: { position: "absolute", bottom: 18, left: 32, right: 32, fontSize: 7, color: "#9CA3AF" },
});

function Coins({ n, color, size = 22 }: { n: number; color: string; size?: number }) {
  const w = n * (size + 6);
  return (
    <Svg width={w} height={size + 4}>
      {Array.from({ length: n }).map((_, i) => (
        <Circle key={i} cx={i * (size + 6) + size / 2 + 2} cy={size / 2 + 2} r={size / 2} stroke={color} strokeWidth={1.5} fill="none" />
      ))}
    </Svg>
  );
}

function Footer({ text }: { text: string }) {
  return <Text style={S.footer} fixed>NexSeed · Financinhas · {text}</Text>;
}

/** Página 1: etiquetas para recortar e colar nos frascos (duas de cada: 5–6 e 7–12). */
function LabelsPage() {
  const label = (title: string, color: string, hint: string, k: string) => (
    <View key={k} style={{ width: "48%", height: 120, marginBottom: 14, borderWidth: 1, borderStyle: "dashed", borderColor: "#9CA3AF", borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "center" }}>
      <Svg width={46} height={46}><Circle cx={23} cy={23} r={20} fill={color} /></Svg>
      <Text style={{ fontSize: 22, fontWeight: "bold", color, marginTop: 6 }}>{title}</Text>
      <Text style={{ fontSize: 8, color: "#6B7280", marginTop: 2 }}>{hint}</Text>
    </View>
  );
  return (
    <Page size="A4" style={S.page}>
      <Text style={S.title}>Etiquetas dos quatro mealheiros</Text>
      <Text style={S.sub}>Recortar pela linha tracejada e colar em frascos transparentes. Uma cor por mealheiro.</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {JARS.map((j) => label(j.label, j.color, j.hint, j.key))}
        {JARS.map((j) => j.key === "investir"
          ? label("Inventar", j.color, "versão 5–6 anos: criar coisas", j.key + "-56")
          : label(j.label, j.color, "versão 5–6 anos", j.key + "-56"))}
      </View>
      <View style={{ marginTop: 4, borderWidth: 1, borderStyle: "dashed", borderColor: "#9CA3AF", borderRadius: 6, padding: 8, flexDirection: "row", alignItems: "center" }}>
        <Svg width={120} height={10}><Rect x={0} y={2} width={120} height={6} fill={JARS[0].color} /></Svg>
        <Text style={{ fontSize: 10, marginLeft: 8 }}>o chão: colar no frasco Gastar, à altura de uma moeda</Text>
      </View>
      <Text style={S.note}>
        A moeda do chão é uma moeda normal, igual às outras. O especial é a linha, não a moeda: o treino está em ver dinheiro
        que se pode gastar e escolher não o gastar. O chão pode ser usado num imprevisto; repõe-se antes de tudo na semanada seguinte.
      </Text>
      <Footer text="kit de arranque" />
    </Page>
  );
}

/** Página 2: Mapa de Moedas, 5–6 anos (uma folha por mês, zero escrita). */
function CoinMapPage() {
  const jar = (j: (typeof JARS)[number], name: string, floor = false) => (
    <View style={{ width: "48%", marginBottom: 8 }}>
      <Text style={[S.label, { color: j.color, marginBottom: 4 }]}>{name}</Text>
      <Coins n={3} color={j.color} size={COIN} />
      <Coins n={3} color={j.color} size={COIN} />
      {floor && (
        <>
          <Svg width={230} height={8}><Line x1={0} y1={4} x2={228} y2={4} stroke={j.color} strokeWidth={4} /></Svg>
          <Coins n={1} color={j.color} size={COIN} />
          <Text style={{ fontSize: 8, color: "#6B7280" }}>o mealheiro nunca fica vazio</Text>
        </>
      )}
    </View>
  );
  return (
    <Page size="A4" style={S.page}>
      <Text style={S.title}>O meu dinheiro</Text>
      <Text style={S.sub}>Mapa de Moedas · 5–6 anos · uma folha por mês</Text>
      <Text style={S.field}>Nome: ______________________________</Text>
      <View style={[S.box, { height: 120, marginBottom: 12 }]}>
        <Text style={S.label}>O meu sonho (desenha aqui)</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {jar(JARS[0], "Gastar", true)}
        {jar(JARS[1], "Poupar")}
        {jar(JARS[2], "Dar")}
        {jar(JARS[3], "Inventar")}
      </View>
      <Text style={S.note}>
        Cada círculo é do tamanho de uma moeda. Quando a moeda entra, cola-se um autocolante ou pinta-se; quando sai, risca-se.
        No Gastar, as moedas gastam-se de cima para baixo e a de baixo da linha fica. Se o sonho mudar, desenha-se outro: mudar não é falhar.
      </Text>
      <Footer text="Mapa de Moedas" />
    </Page>
  );
}

/** Página 3: Página da Semana, 7–8 anos. */
function WeekPage() {
  const cols = ["", "pus", "já tinha", "fico"];
  return (
    <Page size="A4" style={S.page}>
      <Text style={S.title}>A minha semana</Text>
      <Text style={S.sub}>Página da Semana · 7–8 anos · imprimir 12 (o trilho inteiro)</Text>
      <Text style={S.field}>Semana n.º ____        data: ____ / ____        Recebi: ________ €</Text>
      <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: "#9CA3AF", marginBottom: 14 }}>
        <View style={S.row}>
          {cols.map((c, i) => <Text key={i} style={[S.cell, { width: i === 0 ? "34%" : "22%", fontWeight: "bold" }]}>{c}</Text>)}
        </View>
        {JARS.map((j) => (
          <View key={j.key} style={S.row}>
            <Text style={[S.cell, { width: "34%", color: j.color, fontWeight: "bold" }]}>{j.label}</Text>
            {[1, 2, 3].map((i) => <Text key={i} style={[S.cell, { width: "22%", height: 26 }]}> </Text>)}
          </View>
        ))}
      </View>
      <Text style={S.label}>O que gastei</Text>
      {[1, 2, 3].map((i) => <Text key={i} style={[S.field, { marginTop: 6 }]}>______________________________________   ________ €</Text>)}
      <View style={[S.box, { marginVertical: 12, borderColor: "#2D4A2D", borderWidth: 2 }]}>
        <Text style={S.field}>Esta semana escolhi ______________________________</Text>
        <Text style={[S.field, { marginBottom: 0 }]}>em vez de ______________________________________</Text>
      </View>
      <Text style={S.field}>O meu sonho: ____________________   custa: ______ €   falta: ______ €</Text>
      <Svg width={300} height={28}>
        {Array.from({ length: 10 }).map((_, i) => <Rect key={i} x={i * 29 + 1} y={2} width={24} height={24} stroke={JARS[1].color} strokeWidth={1.5} fill="none" />)}
      </Svg>
      <View style={{ marginTop: 12 }}>
        <Text style={S.field}>[  ]  o chão do Gastar está lá</Text>
        <Text style={S.field}>[  ]  usei o chão, por isso reponho já nesta semanada</Text>
        <Text style={S.field}>[  ]  contei as moedas e as contas batem certo</Text>
      </View>
      <Text style={S.note}>
        A linha "escolhi ___ em vez de ___" é a mais importante da página: é a primeira que o adulto lê. Se uma semana ficar em
        branco, vira-se a página; não se recuperam semanas.
      </Text>
      <Footer text="Página da Semana" />
    </Page>
  );
}

/** Página 4: folha do sonho (quadradinhos para encher e noites para esperar). */
function DreamPage() {
  return (
    <Page size="A4" style={S.page}>
      <Text style={S.title}>O meu sonho</Text>
      <Text style={S.sub}>Para pôr ao pé do frasco Poupar</Text>
      <View style={[S.box, { height: 260, marginBottom: 16 }]}>
        <Text style={S.label}>Desenha o teu sonho</Text>
      </View>
      <Text style={S.field}>O meu sonho é: _____________________________________</Text>
      <Text style={S.field}>Custa: ________ €</Text>
      <Text style={[S.label, { marginTop: 6, marginBottom: 4 }]}>Pinta um quadradinho cada vez que o frasco enche um bocadinho</Text>
      <Svg width={530} height={52}>
        {Array.from({ length: 10 }).map((_, i) => <Rect key={i} x={i * 52 + 1} y={2} width={46} height={46} rx={4} stroke={JARS[1].color} strokeWidth={2} fill="none" />)}
      </Svg>
      <Text style={[S.label, { marginTop: 14, marginBottom: 4 }]}>Noites até lá (risca uma por noite)</Text>
      <Svg width={530} height={60}>
        {Array.from({ length: 14 }).map((_, i) => <Circle key={i} cx={(i % 14) * 37 + 18} cy={20} r={14} stroke="#6B7280" strokeWidth={1.5} fill="none" />)}
      </Svg>
      <Text style={S.note}>Esperar também é uma escolha. Se o sonho mudar, desenha-se outro numa folha nova.</Text>
      <Footer text="folha do sonho" />
    </Page>
  );
}

/** Página 5: fotografia inicial (para o adulto; na S1 e outra vez na S12). */
function SnapshotPage() {
  return (
    <Page size="A4" style={S.page}>
      <Text style={S.title}>Fotografia inicial</Text>
      <Text style={S.sub}>Para o adulto · na sessão 1 e outra vez na sessão 12 · não é um teste, é um ponto de partida</Text>
      <Text style={S.field}>Data: ____ / ____ / ______        Criança (iniciais): ______</Text>
      {SNAPSHOT_QUESTIONS.map((q, i) => (
        <View key={q.id} style={{ marginBottom: 12 }}>
          <Text style={[S.label, { fontSize: 10.5 }]}>{i + 1}. {q.text}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
            {q.options.map((o) => <Text key={o} style={{ fontSize: 10, marginRight: 18 }}>[  ] {o}</Text>)}
          </View>
        </View>
      ))}
      <Text style={S.label}>Notas</Text>
      {[1, 2, 3, 4].map((i) => <Text key={i} style={[S.field, { marginTop: 6 }]}>____________________________________________________________________</Text>)}
      <Text style={S.note}>
        Depois, passa as respostas para a app, ao começar o Financinhas com esta criança: é daí que o trilho parte. A pergunta 6 é a que
        mais importa: se falar de dinheiro traz ansiedade ou culpa, o ritmo é mais lento e com mais histórias.
      </Text>
      <Footer text="fotografia inicial" />
    </Page>
  );
}

export default function FinancinhasKitPDF() {
  return (
    <Document title="Financinhas · kit de arranque">
      <LabelsPage />
      <CoinMapPage />
      <WeekPage />
      <DreamPage />
      <SnapshotPage />
    </Document>
  );
}
