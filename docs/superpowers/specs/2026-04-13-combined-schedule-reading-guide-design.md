# Design: Combined Family Schedule + Guia de Leitura

**Date:** 2026-04-13  
**Status:** Approved  
**Source:** Client backlog (Família Malta)

---

## Overview

Two independent improvements to the NexSeed weekly PDF output:

1. **Combined family schedule** — replace three separate per-child schedule tables with a single unified table, colour-coded by child.
2. **Guia de Leitura** — new third PDF document with generated episode text, comprehension question, and discussion prompt for each reading episode.

---

## Feature 1 — Combined Family Schedule

### Goal

Reduce daily consultation friction by showing all three children's schedules in one view instead of flipping between three pages.

### Data Model

No database changes. All required data already flows into `SchedulePDF.tsx` via `children[]` and `planItems[]`.

### Colour Assignment

Fixed constants defined in `SchedulePDF.tsx`:

```ts
const CHILD_COLORS = ['#3B82F6', '#22C55E', '#F97316'] // blue, green, orange
```

Assigned by index order of `children[]` sorted by `created_at` ascending (oldest child = blue, middle = green, youngest = orange).

### Table Structure

- One table for the entire family (replaces three separate tables).
- Rows = canonical time slots (same 11 slots currently used).
- Columns = Hora | Segunda | Terça | Quarta | Quinta | Sexta.

### Cell Rendering Logic

For each `(timeSlot, day)` cell:

- **All children share the same activity title** → single merged cell, neutral style (current behaviour).
- **Activities differ** → up to 3 stacked mini-blocks inside the cell, each with:
  - Coloured left border (child colour).
  - Child initial as label (B / N / I).
  - Activity title text.

### Header

Below the week title, a colour legend:

```
● Bryan   ● Noa   ● Iris
```

Dots use the respective child colour.

### Gap Fix

The reading slot for Bryan currently renders as `15:00–15:30`, leaving a 15-minute gap after Relaxamento (14:30–14:45). The slot is corrected to `14:45–15:15` in the schedule generator (`planGenerator.ts` and `geminiPlanner.ts`).

### Files Changed

| File | Change |
|------|--------|
| `src/components/pdf/SchedulePDF.tsx` | Rewrite table rendering from per-child iteration to unified table with merged/stacked cells |
| `src/lib/planGenerator.ts` | Fix reading slot time from `15:00` to `14:45` |
| `src/lib/geminiPlanner.ts` | Fix reading slot time from `15:00` to `14:45` |

---

## Feature 2 — Guia de Leitura (Third PDF Document)

### Goal

Eliminate the friction of a parent having to source or invent reading episode content. Each week's reading mini-series arrives as a ready-to-use illustrated narrative guide.

### Gemini Prompt Extension

In `geminiPlanner.ts`, the existing reading episode instruction is replaced with:

> For each of the 4 reading episodes, generate three fields stored as a JSON string in the `description` field:
> - `episode_text`: 2–3 paragraphs in Portuguese, age-appropriate, forming a continuous narrative across Ep.1–4.
> - `comprehension_question`: one question about what happened in this episode.
> - `discussion_prompt`: one open-ended question for parent and child to explore together (labelled "Para conversar").

**Storage:** The JSON string is stored in the existing `weekly_plan_items.description` column. No schema migration required.

Example value:
```json
{
  "episode_text": "Era uma vez Pikachu que...",
  "comprehension_question": "O que aconteceu quando Pikachu encontrou o rival?",
  "discussion_prompt": "Se fosses o Pikachu, o que farias diferente?"
}
```

### ActivityGuidePDF.tsx

Reading activity entries (`Leitura · Ep.X`) are filtered out entirely from the activity guide. Detection: items where `discipline === 'Leitura'` and `title` matches `Ep.\d`.

### ReadingGuidePDF.tsx (New Component)

Location: `src/components/pdf/ReadingGuidePDF.tsx`

**Structure:**
- **Header:** "Guia de Leitura · Família [name] · Semana de [range]"
- **One section per episode (Ep.1–4):**
  - Episode title (e.g. "Ep.1 — Pokémon: O Começo")
  - Story text (`episode_text`) — body style
  - Comprehension question — italic box, labelled "Compreensão"
  - Discussion prompt — labelled "Para conversar"
- **Footer:** "Gerado automaticamente pelo NexSeed · [date]"
- Visual language matches existing PDFs (same fonts, colour palette, footer style).

### Email Attachment

`supabase/functions/send-weekly-plan/index.ts` updated to attach the reading guide as a third PDF alongside the existing schedule and activity guide PDFs.

### Files Changed

| File | Change |
|------|--------|
| `src/lib/geminiPlanner.ts` | Replace episode description instruction with structured JSON generation |
| `src/components/pdf/ActivityGuidePDF.tsx` | Filter out `Leitura · Ep.X` entries |
| `src/components/pdf/ReadingGuidePDF.tsx` | New component |
| `src/pages/WeeklyPlanner.tsx` | Import and generate `ReadingGuidePDF`, pass blob to email function |
| `supabase/functions/send-weekly-plan/index.ts` | Accept and attach third PDF |

---

## Out of Scope

- Per-family colour customisation (fixed defaults only).
- Option to receive schedules in separate format (always combined).
- Reading content for non-episode activities (e.g. "Português · Leitura — A história de Ciências") — those remain as titles for now.
- Any schema migrations.

---

## Success Criteria

1. The weekly PDF email contains three attachments: schedule, activity guide, reading guide.
2. The schedule PDF shows one unified table; shared activities appear as a single row; child-specific activities show colour-coded stacked blocks.
3. The reading guide PDF contains 4 episodes, each with story text, comprehension question, and discussion prompt.
4. Bryan's schedule no longer has a 14:45–15:00 gap.
5. The activity guide no longer contains reading episode entries.
