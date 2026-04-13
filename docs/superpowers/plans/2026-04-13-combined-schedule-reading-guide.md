# Combined Family Schedule + Guia de Leitura — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three per-child schedule PDFs with a single colour-coded unified table, fix the 15-minute gap in the reading slot, and add a third PDF (Guia de Leitura) with generated episode text, comprehension questions, and discussion prompts.

**Architecture:** Two independent features share one plan. Feature 1 rewrites `SchedulePDF.tsx` rendering logic; feature 2 extends the Gemini prompt, creates `ReadingGuidePDF.tsx`, removes reading from `ActivityGuidePDF.tsx`, and adds the third email attachment.

**Tech Stack:** React + @react-pdf/renderer, Gemini AI (gemini-2.5-flash), Supabase Edge Functions (Deno), Resend email API, Vitest for tests.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/planGenerator.ts` | Modify | Fix reading + Friday slot from `15:00-15:30` → `14:45-15:15` |
| `src/lib/geminiPlanner.ts` | Modify | Same slot fix + extend reading prompt to generate JSON content |
| `src/components/pdf/SchedulePDF.tsx` | Rewrite table section | Unified colour-coded family table |
| `src/components/pdf/ActivityGuidePDF.tsx` | Modify | Filter out `discipline === 'reading'` items |
| `src/components/pdf/ReadingGuidePDF.tsx` | Create | New PDF: episode text + comprehension + discussion prompt |
| `src/pages/WeeklyPlanner.tsx` | Modify | Generate + download + email the reading guide PDF |
| `supabase/functions/send-weekly-plan/index.ts` | Modify | Accept + attach third PDF, update email HTML |
| `src/lib/__tests__/planGenerator.test.ts` | Modify | Add tests for new slot time |

---

## Task 1 — Fix reading + Friday slot times (planGenerator.ts)

**Files:**
- Modify: `src/lib/planGenerator.ts:85-125`

The reading slot in `PRIMARY_DAYS` (Mon–Thu) and the Encerramento slot in `FRIDAY_VARIABLE` are both `15:00-15:30`, leaving a 15-minute gap after Relaxamento (14:30–14:45). Fix both to `14:45-15:15`.

- [ ] **Step 1.1: Update PRIMARY_DAYS reading slots**

In `src/lib/planGenerator.ts`, in `PRIMARY_DAYS`, find the four reading entries (one per day) and change their slot:

```ts
// Seg — line 92
{ slot: "14:45-15:15", discipline: "reading", tIdx: 0, episode: 0 },
// Ter — line 100
{ slot: "14:45-15:15", discipline: "reading", tIdx: 0, episode: 1 },
// Qua — line 108
{ slot: "14:45-15:15", discipline: "reading", tIdx: 0, episode: 2 },
// Qui — line 116
{ slot: "14:45-15:15", discipline: "reading", tIdx: 0, episode: 3 },
```

- [ ] **Step 1.2: Update FRIDAY_VARIABLE encerramento slot**

Still in `planGenerator.ts`, find `FRIDAY_VARIABLE` (around line 121) and update the Encerramento entry:

```ts
export const FRIDAY_VARIABLE = [
  { slot: "09:45-11:50", discipline: "world_visit",  tIdx: 0, isFridayWorld: true  },
  { slot: "14:00-14:30", discipline: "expression",   tIdx: 0, isFridayWorld: false },
  { slot: "14:45-15:15", discipline: "world_visit",  tIdx: 1, isFridayWorld: false }, // was 15:00-15:30
];
```

- [ ] **Step 1.3: Commit**

```bash
cd "/Users/gmsr44/Desktop Outros Projetos/NexSeed/V2"
git add src/lib/planGenerator.ts
git commit -m "fix: move reading slot from 15:00 to 14:45 in planGenerator"
```

---

## Task 2 — Fix slot times in geminiPlanner.ts

**Files:**
- Modify: `src/lib/geminiPlanner.ts:161-262`

- [ ] **Step 2.1: Update PRIMARY_DAYS_SKELETON reading slots**

In `geminiPlanner.ts`, `PRIMARY_DAYS_SKELETON` has four reading entries (lines 168, 176, 184, 192). Change each:

```ts
// Seg
{ slot: "14:45-15:15", discipline: "reading", sort: 4, episode: 1 },
// Ter
{ slot: "14:45-15:15", discipline: "reading", sort: 4, episode: 2 },
// Qua
{ slot: "14:45-15:15", discipline: "reading", sort: 4, episode: 3 },
// Qui
{ slot: "14:45-15:15", discipline: "reading", sort: 4, episode: 4 },
```

- [ ] **Step 2.2: Update Friday Encerramento in skeleton builder**

In `buildSkeleton`, the Friday Encerramento entry (around line 259) uses `"15:00-15:30"`. Change it:

```ts
skeleton.push({
  child_id: child.id, child_name: child.name, school_year: child.school_year,
  day_of_week: 5, time_slot: "14:45-15:15", discipline: "world_visit",
  discipline_label: "Encerramento Reflexivo", is_friday_world: false, sort_order: 2,
});
```

- [ ] **Step 2.3: Commit**

```bash
git add src/lib/geminiPlanner.ts
git commit -m "fix: move reading/encerramento slot to 14:45 in geminiPlanner skeleton"
```

---

## Task 3 — Add tests for slot fix

**Files:**
- Modify: `src/lib/__tests__/planGenerator.test.ts`

- [ ] **Step 3.1: Write failing tests**

Add at the end of `planGenerator.test.ts`:

```ts
describe("slot de leitura sem gap", () => {
  const child = makeChild({ id: "p1", school_year: "2º ano" });

  it("itens de leitura usam slot 14:45-15:15", () => {
    const items = generateWeeklyPlan([child], { p1: ["pokémon"] }, "", "pokémon");
    const readingItems = items.filter((i) => i.discipline === "reading");
    expect(readingItems.length).toBeGreaterThan(0);
    readingItems.forEach((i) => {
      expect(i.time_slot).toBe("14:45-15:15");
    });
  });

  it("nenhum item de leitura usa o slot antigo 15:00-15:30", () => {
    const items = generateWeeklyPlan([child], { p1: ["dinossauros"] }, "");
    const oldSlot = items.filter(
      (i) => i.discipline === "reading" && i.time_slot === "15:00-15:30",
    );
    expect(oldSlot).toHaveLength(0);
  });

  it("encerramento reflexivo da sexta usa 14:45-15:15", () => {
    const items = generateWeeklyPlan([child], { p1: ["arte"] }, "Museu");
    const encerramento = items.find(
      (i) => i.day_of_week === 5 && i.discipline === "world_visit" && !i.is_friday_world,
    );
    expect(encerramento).toBeDefined();
    expect(encerramento!.time_slot).toBe("14:45-15:15");
  });
});
```

- [ ] **Step 3.2: Run tests — expect FAIL (old slot times)**

```bash
cd "/Users/gmsr44/Desktop/Outros Projetos/NexSeed/V2"
npx vitest run src/lib/__tests__/planGenerator.test.ts --reporter=verbose 2>&1 | tail -20
```

Expected: 3 new tests fail with "expected '15:00-15:30' to be '14:45-15:15'"

- [ ] **Step 3.3: Task 1 + 2 should already have fixed the implementation — rerun**

```bash
npx vitest run src/lib/__tests__/planGenerator.test.ts --reporter=verbose 2>&1 | tail -20
```

Expected: all tests pass (including 3 new ones)

- [ ] **Step 3.4: Run full test suite**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -30
```

Expected: all tests pass

- [ ] **Step 3.5: Commit**

```bash
git add src/lib/__tests__/planGenerator.test.ts
git commit -m "test: verify reading slot is 14:45-15:15 with no gap"
```

---

## Task 4 — Rewrite SchedulePDF.tsx with unified table

**Files:**
- Modify: `src/components/pdf/SchedulePDF.tsx`

This is the largest change. The per-child `children.map(...)` table is replaced by one unified table.

- [ ] **Step 4.1: Update CANONICAL slots and add new constants**

Replace the `CANONICAL_PRIMARY_WEEK` and `CANONICAL_PRIMARY_FRIDAY` constants and add `CHILD_COLORS` and `VARIABLE_SLOTS`:

```ts
// Replace existing CANONICAL_PRIMARY_WEEK (around line 93):
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
  "14:45-15:15",  // Leitura e Portefólio  ← was 15:00-15:30
];

// Replace existing CANONICAL_PRIMARY_FRIDAY (around line 107):
const CANONICAL_PRIMARY_FRIDAY = [
  "09:30-09:45",  // Saída / Visita de Estudo
  "09:45-11:50",  // Ver Mundo (bloco grande)
  "11:50-12:30",  // Vida Prática no Exterior
  "12:30-14:00",  // Almoço fora / Piquenique
  "14:00-14:30",  // Registo da Visita
  "14:30-14:45",  // Relaxamento
  "14:45-15:15",  // Encerramento Reflexivo  ← was 15:00-15:30
];

// Add after MEDIUM_SLOTS (around line 121):
// VARIABLE_SLOTS: blocos com conteúdo diferente por criança — altura maior para acomodar 3 crianças
const VARIABLE_SLOTS = new Set([
  "09:45-10:10",
  "10:17-10:42",
  "11:05-11:50",
  "14:00-14:30",
  "14:45-15:15",
]);

// Child colours — indexed by position in children[] sorted by created_at asc
const CHILD_COLORS = ["#3B82F6", "#22C55E", "#F97316"] as const;
```

- [ ] **Step 4.2: Replace slotHeight function**

Replace the existing `slotHeight` function (around line 135) with one that also handles variable slots:

```ts
function slotHeight(slot: string): number {
  if (MEDIUM_SLOTS.has(slot)) return 48;
  if (VARIABLE_SLOTS.has(slot)) return 50;
  return 22;
}
```

- [ ] **Step 4.3: Add new styles for unified table**

Add to the `S = StyleSheet.create({...})` object, after the existing `footer` style:

```ts
// ─── Legenda de cores das crianças ──────────────────────────────────────────
childLegend:     { flexDirection: "row", gap: 14, marginBottom: 6, marginTop: 2 },
childLegendItem: { flexDirection: "row", alignItems: "center", gap: 3 },
childLegendDot:  { width: 7, height: 7, borderRadius: 3 },
childLegendText: { fontSize: 8, color: "#374151" },

// Bloco de criança em célula multi-criança
childBlock:      { flexDirection: "row", alignItems: "center", marginBottom: 1, paddingLeft: 2 },
childInitial:    { fontSize: 6, fontWeight: "bold", width: 8 },
childActivity:   { fontSize: 6, color: "#1F2937", flex: 1 },
```

- [ ] **Step 4.4: Replace the per-child table section with unified table**

Find the `{/* Horário por criança */}` section (line 202) which starts `{children.map((child) => {` and ends at line 369 `})}`. Replace the entire section with:

```tsx
{/* ─── Horário unificado — todas as crianças ─── */}
{(() => {
  // Sort children oldest first (by created_at)
  const sortedChildren = [...children].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const hasPrimaryChild = children.some(
    (c) => !c.school_year.toLowerCase().startsWith("pré"),
  );

  // Build per-child item lookup with canonicalized slots
  const childItemsByChild: Record<string, typeof allItems> = {};
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

      {/* Corpo — layout em colunas */}
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

            // Collect each child's item for this (slot, day)
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

            // Compute span from first valid item
            const firstItem = validActivities[0].item!;
            const totalH   = itemSpanHeight(firstItem.time_slot, allSlots);
            const isSpanning = totalH > h;

            if (isSpanning) {
              const [iStart, iEnd] = firstItem.time_slot.split("-").map(timeToMin);
              allSlots.forEach((s) => {
                const [ss, se] = s.split("-").map(timeToMin);
                if (ss > iStart && se <= iEnd) skipped.add(s);
              });
            }

            const cellH = isSpanning ? totalH : h;
            const isItemBig    = BIG_SLOTS.has(firstItem.time_slot);
            const isItemMedium = !isItemBig && MEDIUM_SLOTS.has(firstItem.time_slot);

            // Decide merged vs stacked
            const titles = new Set(validActivities.map((ca) => ca.item!.title));
            const allSame = titles.size <= 1;

            if (allSame) {
              // Single merged cell — same style as before
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
              // Stacked per-child blocks
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
  );
})()}
```

- [ ] **Step 4.5: Type-check**

```bash
cd "/Users/gmsr44/Desktop/Outros Projetos/NexSeed/V2"
npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors (or only pre-existing unrelated errors)

- [ ] **Step 4.6: Commit**

```bash
git add src/components/pdf/SchedulePDF.tsx
git commit -m "feat: unified colour-coded family schedule table in SchedulePDF"
```

---

## Task 5 — Update Gemini prompt for structured reading content

**Files:**
- Modify: `src/lib/geminiPlanner.ts:394-408`

The current rule 4 generates a 2-sentence summary + question. Replace it with a structured JSON output.

- [ ] **Step 5.1: Replace rule 4 in buildPrompt**

Find rule 4 in the `## REGRAS DE TRIANGULAÇÃO` section (around line 397):

```
// OLD:
4. **Leitura Ep.X/4**: cria 4 episódios de uma história CONTÍNUA sobre o tema indicado. Descrição = resumo (2 frases) + 1 pergunta de compreensão.

// NEW:
4. **Leitura Ep.X/4**: cria 4 episódios de uma história CONTÍNUA sobre o tema indicado. Devolve a "description" como JSON string com este formato exacto: {"episode_text":"[2-3 parágrafos em português, adequados à idade, continuação da narrativa do episódio anterior]","comprehension_question":"[1 pergunta sobre o que aconteceu neste episódio]","discussion_prompt":"[1 pergunta aberta para pais e criança explorarem juntos]"}. Não quebres a string JSON — deve ser um objeto num único campo string.
```

- [ ] **Step 5.2: Commit**

```bash
git add src/lib/geminiPlanner.ts
git commit -m "feat: extend Gemini reading prompt to generate structured episode JSON"
```

---

## Task 6 — Filter reading entries from ActivityGuidePDF

**Files:**
- Modify: `src/components/pdf/ActivityGuidePDF.tsx:53-56`

- [ ] **Step 6.1: Add reading filter**

Find the `dayItems` filter on line 55:

```ts
// OLD:
const dayItems = planItems.filter((i) => i.day_of_week === day && !i.is_fixed);

// NEW:
const dayItems = planItems.filter(
  (i) => i.day_of_week === day && !i.is_fixed && i.discipline !== "reading",
);
```

- [ ] **Step 6.2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 6.3: Commit**

```bash
git add src/components/pdf/ActivityGuidePDF.tsx
git commit -m "feat: remove reading episodes from ActivityGuidePDF (moved to ReadingGuidePDF)"
```

---

## Task 7 — Create ReadingGuidePDF.tsx

**Files:**
- Create: `src/components/pdf/ReadingGuidePDF.tsx`

- [ ] **Step 7.1: Create the component**

Create `src/components/pdf/ReadingGuidePDF.tsx` with this content:

```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedPlanItem } from "@/lib/planGenerator";
import { DAY_LABELS, formatWeekRange } from "@/lib/planGenerator";
import type { Child } from "@/lib/types";

// ─── Estilos ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:           { fontFamily: "Helvetica", fontSize: 10, padding: 36, backgroundColor: "#FFFFFF" },
  header:         { marginBottom: 20, borderBottomWidth: 2, borderColor: "#2D4A2D", paddingBottom: 10 },
  headerTitle:    { fontSize: 20, fontWeight: "bold", color: "#2D4A2D", marginBottom: 3 },
  headerSub:      { fontSize: 10, color: "#6B7280" },

  episodeBlock:   { marginBottom: 24, padding: "14 16", backgroundColor: "#FAFAFA", borderRadius: 6, borderLeftWidth: 4, borderLeftColor: "#F77F00" },
  episodeTitle:   { fontSize: 13, fontWeight: "bold", color: "#1F2937", marginBottom: 10 },
  episodeText:    { fontSize: 10, color: "#374151", lineHeight: 1.6, marginBottom: 12 },

  questionBox:    { padding: "8 12", backgroundColor: "#FEF3C7", borderRadius: 4, marginBottom: 8 },
  questionLabel:  { fontSize: 8, fontWeight: "bold", color: "#92400E", marginBottom: 3 },
  questionText:   { fontSize: 9, color: "#374151", fontStyle: "italic", lineHeight: 1.5 },

  discussBox:     { padding: "8 12", backgroundColor: "#EDE9FE", borderRadius: 4 },
  discussLabel:   { fontSize: 8, fontWeight: "bold", color: "#5B21B6", marginBottom: 3 },
  discussText:    { fontSize: 9, color: "#374151", fontStyle: "italic", lineHeight: 1.5 },

  footer:         { marginTop: 16, borderTopWidth: 1, borderColor: "#E5E7EB", paddingTop: 6, color: "#9CA3AF", fontSize: 7 },
});

// ─── Parsing de conteúdo de episódio ─────────────────────────────────────────

interface EpisodeContent {
  episode_text: string;
  comprehension_question: string;
  discussion_prompt: string;
}

function parseEpisodeContent(description: string): EpisodeContent {
  try {
    const parsed = JSON.parse(description);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.episode_text === "string"
    ) {
      return {
        episode_text:            parsed.episode_text ?? "",
        comprehension_question:  parsed.comprehension_question ?? "",
        discussion_prompt:       parsed.discussion_prompt ?? "",
      };
    }
  } catch {
    /* fallback para texto simples */
  }
  return {
    episode_text: description,
    comprehension_question: "",
    discussion_prompt: "",
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  children: Child[];
  planItems: GeneratedPlanItem[];
  weekStart: Date;
  familyName: string;
}

export default function ReadingGuidePDF({ children, planItems, weekStart, familyName }: Props) {
  // Recolhe todos os episódios de leitura, ordenados por dia
  const readingItems = planItems
    .filter((i) => i.discipline === "reading" && !i.is_fixed)
    .sort((a, b) => a.day_of_week - b.day_of_week);

  if (readingItems.length === 0) return <Document />;

  // Nome da criança com leitura (tipicamente a do ensino primário)
  const childName = (itemChildId: string) =>
    children.find((c) => c.id === itemChildId)?.name ?? "";

  const dayLabel = (day: number) => DAY_LABELS[day - 1] ?? "";

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Cabeçalho */}
        <View style={S.header}>
          <Text style={S.headerTitle}>NexSeed — Guia de Leitura</Text>
          <Text style={S.headerSub}>
            {familyName} · Semana de {formatWeekRange(weekStart)}
          </Text>
        </View>

        {/* Episódios */}
        {readingItems.map((item, idx) => {
          const content = parseEpisodeContent(item.description);
          const epNum   = idx + 1;
          return (
            <View key={idx} style={S.episodeBlock} wrap={false}>
              <Text style={S.episodeTitle}>
                Ep.{epNum} — {item.title}
              </Text>
              <Text style={S.headerSub}>
                {dayLabel(item.day_of_week)} · {childName(item.child_id)} · {item.time_slot}
              </Text>

              {/* Texto do episódio */}
              <Text style={S.episodeText}>{content.episode_text || item.description}</Text>

              {/* Pergunta de compreensão */}
              {content.comprehension_question ? (
                <View style={S.questionBox}>
                  <Text style={S.questionLabel}>Compreensão</Text>
                  <Text style={S.questionText}>{content.comprehension_question}</Text>
                </View>
              ) : null}

              {/* Prompt de discussão */}
              {content.discussion_prompt ? (
                <View style={S.discussBox}>
                  <Text style={S.discussLabel}>Para conversar</Text>
                  <Text style={S.discussText}>{content.discussion_prompt}</Text>
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Rodapé */}
        <View style={S.footer}>
          <Text>Gerado automaticamente pelo NexSeed · {new Date().toLocaleDateString("pt-PT")}</Text>
        </View>

      </Page>
    </Document>
  );
}
```

- [ ] **Step 7.2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors in the new file

- [ ] **Step 7.3: Commit**

```bash
git add src/components/pdf/ReadingGuidePDF.tsx
git commit -m "feat: add ReadingGuidePDF component with episode text, comprehension, and discussion prompt"
```

---

## Task 8 — Wire up ReadingGuidePDF in WeeklyPlanner

**Files:**
- Modify: `src/pages/WeeklyPlanner.tsx:382-471`

Both `handleDownloadPDFs` and `handleSendEmail` need to optionally generate and include the reading guide.

- [ ] **Step 8.1: Update handleDownloadPDFs**

Find `handleDownloadPDFs` (line 382). After the existing guide download block (the `a2.click()` call), add:

```ts
// Leitura — só gera se existirem episódios
const readingItems = planItems.filter((i) => i.discipline === "reading");
if (readingItems.length > 0) {
  const { default: ReadingGuidePDFComp } = await import("@/components/pdf/ReadingGuidePDF");
  const readingGuideBlob = await pdf(
    <ReadingGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
  ).toBlob();
  const a3 = document.createElement("a");
  a3.href = URL.createObjectURL(readingGuideBlob);
  a3.download = `nexseed-leitura-${format(weekStart, "yyyy-MM-dd")}.pdf`;
  a3.click();
}
```

- [ ] **Step 8.2: Update handleSendEmail**

Find `handleSendEmail`. After `const guideB64 = await toBase64(guideBlob);` (around line 433), add:

```ts
// Guia de Leitura — opcional
let readingGuideB64: string | null = null;
const readingItems = planItems.filter((i) => i.discipline === "reading");
if (readingItems.length > 0) {
  const { default: ReadingGuidePDFComp } = await import("@/components/pdf/ReadingGuidePDF");
  const readingGuideBlob = await pdf(
    <ReadingGuidePDFComp children={children} planItems={planItems} weekStart={weekStart} familyName={familyName} />
  ).toBlob();
  readingGuideB64 = await toBase64(readingGuideBlob);
}
```

Then update the `supabase.functions.invoke` call body to include:

```ts
body: {
  to: family.email,
  familyId: family.id,
  familyName,
  weekLabel: formatWeekRange(weekStart),
  scheduleB64,
  guideB64,
  scheduleName: `nexseed-horario-${format(weekStart, "yyyy-MM-dd")}.pdf`,
  guideName: `nexseed-guia-${format(weekStart, "yyyy-MM-dd")}.pdf`,
  readingGuideB64,                                                           // ← new
  readingGuideName: `nexseed-leitura-${format(weekStart, "yyyy-MM-dd")}.pdf`, // ← new
},
```

- [ ] **Step 8.3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 8.4: Commit**

```bash
git add src/pages/WeeklyPlanner.tsx
git commit -m "feat: generate and send ReadingGuidePDF as third attachment"
```

---

## Task 9 — Update send-weekly-plan edge function

**Files:**
- Modify: `supabase/functions/send-weekly-plan/index.ts`

- [ ] **Step 9.1: Accept reading guide params and attach conditionally**

Replace the destructuring at line 20 and the `attachments` array:

```ts
// Replace the destructuring (line 20):
const {
  to, familyId, familyName, weekLabel,
  scheduleB64, guideB64, scheduleName, guideName,
  readingGuideB64, readingGuideName,
} = await req.json();

// Replace the email HTML bullet list:
html: `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
    <h1 style="color:#2D4A2D;">NexSeed 🌱</h1>
    <p>Olá, <strong>${familyName}</strong>!</p>
    <p>O plano da semana de <strong>${weekLabel}</strong> está pronto.</p>
    <p>Em anexo encontras:</p>
    <ul>
      <li><strong>Horário Semanal</strong> — blocos de tempo e atividades de cada dia</li>
      <li><strong>Guia de Atividades</strong> — descrição passo a passo e lista de materiais</li>
      ${readingGuideB64 ? "<li><strong>Guia de Leitura</strong> — episódios semanais com perguntas de compreensão e conversa</li>" : ""}
    </ul>
    <p style="color:#6B7280;font-size:14px;">Bom trabalho esta semana! 🌿</p>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
    <p style="color:#9CA3AF;font-size:12px;">NexSeed · Plataforma de Homeschooling</p>
  </div>
`,

// Replace the attachments array:
attachments: [
  { filename: scheduleName, content: scheduleB64 },
  { filename: guideName, content: guideB64 },
  ...(readingGuideB64 && readingGuideName
    ? [{ filename: readingGuideName, content: readingGuideB64 }]
    : []),
],
```

- [ ] **Step 9.2: Commit**

```bash
git add supabase/functions/send-weekly-plan/index.ts
git commit -m "feat: attach reading guide PDF conditionally in send-weekly-plan"
```

---

## Task 10 — Deploy edge function

- [ ] **Step 10.1: Deploy**

```bash
cd "/Users/gmsr44/Desktop/Outros Projetos/NexSeed/V2"
npx supabase functions deploy send-weekly-plan --project-ref "$(grep VITE_SUPABASE_URL .env | cut -d/ -f3 | cut -d. -f1)" 2>&1
```

If the project ref is not easily extractable, check `.env` for `VITE_SUPABASE_URL` and run:

```bash
npx supabase functions deploy send-weekly-plan
```

Expected: "Deployed Function send-weekly-plan"

- [ ] **Step 10.2: Run full test suite one last time**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -20
```

Expected: all tests pass

- [ ] **Step 10.3: Final commit (if any loose changes)**

```bash
git status
# If clean, nothing to do. Otherwise:
git add -p
git commit -m "chore: final cleanup after combined schedule + reading guide"
```

---

## Self-Review

- **Spec coverage:**
  - ✅ Combined schedule with colour-coded children (Task 4)
  - ✅ Shared activities merged into one row (Tasks 4 — allSame logic)
  - ✅ Fixed colours blue/green/orange in child order (Task 4 — CHILD_COLORS)
  - ✅ Gap fix 15:00 → 14:45 (Tasks 1, 2, 4)
  - ✅ Gemini generates structured episode JSON (Task 5)
  - ✅ Reading removed from ActivityGuidePDF (Task 6)
  - ✅ ReadingGuidePDF with text + comprehension + discussion (Task 7)
  - ✅ Third email attachment (Tasks 8, 9, 10)

- **Type consistency:** `parseEpisodeContent` used in Task 7 is defined in `ReadingGuidePDF.tsx`. `ReadingGuidePDF` imported in `WeeklyPlanner.tsx` as `ReadingGuidePDFComp` consistent with other PDF imports. `readingGuideB64` typed as `string | null` in WeeklyPlanner and spread conditionally in the function body.

- **Edge cases handled:**
  - No reading items → reading guide not generated or attached (check `readingItems.length > 0`)
  - Gemini returns plain-text description (old format) → `parseEpisodeContent` falls back to raw text
  - Only one child has activity at a slot → `allSame = true`, renders as single merged cell
