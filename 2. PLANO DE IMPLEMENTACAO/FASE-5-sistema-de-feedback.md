# FASE 5 — Sistema de Feedback In-App e Analytics

**Objetivo:** implementar o sistema de escuta da fase piloto especificado pelo cliente em `docs/NexSeed_Spec_Programador_Feedback.pdf` (v1.0, jun 2026): 4 instrumentos de feedback (A: pulso de boas-vindas · B1–B5: micro-questionários contextuais · C: pulso mensal · D: botão permanente «Conta-nos»), uma camada de analytics de eventos (Secção 5 da spec, "crítico desde o dia 1 do beta") e um dashboard de equipa com exportação CSV.

**Depende de:** motor de IA server-side (FASE 1), auth (`AuthContext`), onboarding (FASE 2). Intercala com FASE 4 (analytics da Secção 4.3 → reutilizar o mesmo vocabulário de eventos).

**Decisões (confirmadas com o cliente):**
- Analytics em **tabela Supabase própria** (`analytics_events`) — sem PostHog por agora; nomes de eventos alinhados com FASE-4.3 para migração futura.
- Alertas à equipa (fricção do Instrumento A + submissões do D) por **email via Resend** (edge function `notify-team`, clone de `send-welcome-email`).

---

## Regras gerais (Secção 0 da spec — aplicam-se a tudo)

1. **Tudo saltável.** «Agora não» sempre visível. Nunca bloquear a app → toda a chamada de feedback/analytics em try/catch, fire-and-forget.
2. **Máx. 1 micro-questionário por sessão** (A/B/C combinados; D é ilimitado, iniciado pelo utilizador). Se coincidirem, mostrar só o de maior prioridade: na abertura da app **A > B2 > C**; pós-evento a ordem da spec é B1 > B2 > B3 > B4 > B5.
3. **Guardar respostas parciais** por pergunta (upsert em `feedback_answers`).
4. **Contexto em cada resposta:** `user_id`, `timestamp`, `ecra_origem`, `evento_gatilho`, `versao_app`.
5. **Tom:** humano e claro. Copy PT-PT **verbatim** da spec.
6. **RGPD:** nota em todos os campos de texto livre — *«Evita incluir dados pessoais dos teus filhos nas respostas.»* Sem `child_id` em qualquer tabela de feedback.
7. **Dashboard:** lista filtrável por instrumento/data/utilizador + exportação CSV.

---

## ESTADO DA EXECUÇÃO (2026-07-14)

- ✅ **5.0** — Este documento.
- ✅ **5.1** — Migração `017_feedback_and_analytics.sql` aplicada (6 tabelas, RPC `bump_trigger_counter`, `is_team_admin()`, bucket privado, seed config). `__APP_VERSION__` injetado; `package.json` → 2.0.0; tipos atualizados.
- ✅ **5.2** — `src/lib/analytics.ts` + todos os 13 eventos instrumentados; `/privacidade` atualizada.
- ✅ **5.3** — Instrumento D (`FeedbackButton` + `FeedbackDialog`) + edge function `notify-team` (deployed, v1).
- ✅ **5.4** — `engine.ts` (23 testes unitários) + `SurveyDialog` + `FeedbackProvider` completo (A, B1, B2; **e também B3/B4 já ligados** no `notifyEvent`).
- ✅ **5.5** — Instrumento C ativado (`MONTHLY_ENABLED = true`); Q7 com gating por `pricing_question_active`.
- ✅ **5.6** — Migração `018_admin_metrics.sql` (RPCs `admin_weekly_metrics`, `admin_funnel`); página `/admin/feedback` (Respostas + CSV, Alertas, Métricas + toggle pricing).

### Follow-ups [HUMANO] antes do beta
1. **Inserir admins da equipa:** `insert into team_admins (user_id) values ('<uuid>');` (obter o uuid em auth.users). Sem isto, `/admin/feedback` redireciona para `/`.
2. **Definir o email da equipa:** `supabase secrets set TEAM_EMAIL=<email>` (senão os alertas vão para `FROM_EMAIL`).
3. **Pergunta de preço (C7):** deixar desligada; ligar o toggle em `/admin/feedback` → Métricas a partir de agosto.
4. **Verificação E2E com utilizador real** (ver secção Verificação): a BD do piloto está vazia, por isso o fluxo de surveys na UI e as inserções sob RLS têm de ser testados com uma conta real.

---

## Passo 5.1 — Fundação de dados e versão da app (P1)

**Ficheiros:** `supabase/migrations/017_feedback_and_analytics.sql`, `src/lib/types.ts`, `vite.config.ts`, `vitest.config.ts`, `src/vite-env.d.ts`, `package.json`.

**Modelo de dados (migração 017):**

- **`analytics_events`** — `id, user_id (default auth.uid()), family_id, event text, props jsonb, screen, session_id uuid, app_version, created_at`. Índices `(event, created_at)` e `(family_id, created_at)`. RLS: INSERT `user_id = auth.uid()`; SELECT só `is_team_admin()`; sem UPDATE/DELETE.
- **`feedback_submissions`** — 1 linha por exibição: `instrument`, `status ('shown'|'partial'|'completed'|'dismissed')`, `evento_gatilho`, `ecra_origem`, `app_version`, `session_id`, `completed_at`.
- **`feedback_answers`** — 1 linha por pergunta: `submission_id`, `user_id` (denormalizado p/ RLS), `question_key`, `value jsonb`, `UNIQUE(submission_id, question_key)`.
- **`feedback_trigger_state`** — `PK (user_id, key)`, `counter, shown_count, last_shown_at, scheduled_for, consumed, meta`. RPC atómica **`bump_trigger_counter(p_key)`** devolve o novo contador.
- **`feedback_config`** — `key PK, value jsonb`. Seed `('pricing_question_active','false')`.
- **`team_admins`** + função **`is_team_admin()`** SECURITY DEFINER (search_path fixo, convenção da migração 014). Política extra em `families`: SELECT para admin.
- **Bucket `feedback-screenshots`** — privado, 5MB, `image/png|jpeg|webp`, path `{user_id}/{submission_id}/{file}`.

**Versão da app:** `__APP_VERSION__` via `define` no `vite.config.ts` (a partir de `package.json`), declarado em `src/vite-env.d.ts`, replicado no `vitest.config.ts`. Bump `package.json` → `2.0.0`.

**[HUMANO]** Inserir linhas em `team_admins` (SQL editor) e `supabase secrets set TEAM_EMAIL=...`.

**Verificação:** aplicar migração; testar RLS com 2 contas; `get_advisors` sem novos avisos.

---

## Passo 5.2 — Módulo de analytics + instrumentação (P1)

**Ficheiros:** `src/lib/analytics.ts` (novo), pontos de instrumentação abaixo, `src/pages/PrivacyPolicy.tsx`.

**`analytics.ts`:** `track(event, props?)` fire-and-forget; `getSessionId()` via `sessionStorage`; `session_start` 1×/sessão (guard StrictMode); `initAnalytics(ctx)` no `<AnalyticsBoot/>`.

**Pontos de instrumentação:**

| Evento | Local | Props |
|---|---|---|
| `session_start` | `analytics.ts` init | — |
| `signup` | `AuthContext.signUp` sucesso | — |
| `onboarding_completed` | `Onboarding.tsx` ao completar | days_since_signup |
| `plan_generated` | `WeeklyPlanner.handleGeneratePlan` (IA ~L285 + fallback ~L292) | days_since_registration, source |
| `plan_edited` | `WeeklyPlanner.persistPlan` branch update ~L324 | items_changed |
| `plan_viewed` | `WeeklyPlanner.loadExisting` (guard por plan_id) | day_of_week, plan_id |
| `plan_emailed` | `WeeklyPlanner` pós `send-weekly-plan` ~L486 | — |
| `activity_logged` | `useActivities.createActivity` | type |
| `portfolio_generated` | `Portfolio.handleExportPDF` ~L327 | period |
| `report_generated` | `Reports` export ~L207 | period |
| `ai_idea_generated` | `CreativeEngine` geração ~L96 | — |
| `ai_idea_added_to_plan` | `CreativeEngine.handleGuardar` ~L226 | — |
| `feedback_submitted` | SurveyDialog/FeedbackDialog | instrument |

Atualizar `/privacidade`: medição interna first-party (Supabase EU), sem cookies novos (só sessionStorage) → CookieBanner inalterado.

**Verificação:** navegar na app → `select event, count(*) from analytics_events group by 1`; refresh não duplica `session_start`; tab nova = novo `session_id`.

---

## Passo 5.3 — Instrumento D + notify-team (P1)

**Ficheiros:** `src/contexts/FeedbackContext.tsx` (skeleton), `src/components/feedback/FeedbackButton.tsx`, `src/components/feedback/FeedbackDialog.tsx`, `supabase/functions/notify-team/index.ts`.

- **FeedbackButton:** fixo `bottom-4 right-4 z-40` (CookieBanner z-50 desaparece após aceitar). Desktop: pill «Conta-nos»; mobile: círculo 48px.
- **FeedbackDialog** (3 passos): tipo (Sugestão / Algo não funciona / Tenho uma dúvida) → texto + nota RGPD + screenshot opcional (5MB, degrada se upload falhar) → confirmação *«Recebido. É com isto que construímos o NexSeed — obrigado.»*
- **notify-team:** payload só `{ submissionId }`; service role lê submission + valida `user_id`; A → «⚠️ Alerta de fricção»; D → «💬 Novo feedback». Signed URL 7d do screenshot. Secret `TEAM_EMAIL`.

**Verificação:** submeter cada tipo com/sem screenshot → linha + objeto no bucket + email no Resend; cortar rede a meio → app não afetada.

---

## Passo 5.4 — Motor de surveys + A, B1, B2 (P2 — maior)

**Ficheiros:** `src/lib/feedback/instruments.ts`, `src/lib/feedback/engine.ts` (+ testes), `src/contexts/AuthContext.tsx` (extensão), `src/components/feedback/SurveyDialog.tsx`, `src/contexts/FeedbackContext.tsx` (motor completo), `src/pages/WeeklyPlanner.tsx`.

- **instruments.ts:** definições tipadas dos 7 instrumentos, copy verbatim; ativação por fase.
- **engine.ts (puro, testável):** `shouldShowB1` (1,3,8,13…), `shouldShowB3` (sempre), `shouldShowB4` (3,13,23…), `isWelcomePulseDue` (≥168h), `isMonthlyPulseDue` (≥30d), `isB2Due`, `pickAppOpenSurvey` (A>B2>C), `nextQuestion`.
- **AuthContext:** expor `registeredAt` (`families.created_at` / `family_members.joined_at`) e `isOwner`.
- **SurveyDialog:** 1 componente que renderiza qualquer instrumento; parciais por pergunta; alerta A_Q2 → notify-team no save da resposta.
- **FeedbackProvider:** avaliação na abertura (A, B2), pós-evento B1, cap de sessão, dismissals, agendamento B2 (`now()+7d`).

**Verificação:** testes unitários `engine.test.ts`; E2E com SQL (`update families set created_at = now() - interval '8 days'`); A+B2 due → só A; A_Q2 «Tentei mas não consegui» → email.

---

## Passo 5.5 — Instrumento C (P3)

**Ficheiros:** `src/lib/feedback/instruments.ts` (C já definido), `src/contexts/FeedbackContext.tsx`.

Ativar C em `pickAppOpenSurvey`. Q7 (pricing) gated por `feedback_config.pricing_question_active` + flag `C_Q7` consumida 1×/utilizador. **[HUMANO]** ligar o toggle em agosto.

**Verificação:** flag false → C com 6 perguntas; flag true → Q7 aparece 1× e nunca mais.

---

## Passo 5.6 — B3, B4 + dashboard de equipa (P4)

**Ficheiros:** `supabase/migrations/018_admin_metrics.sql`, `src/pages/AdminFeedback.tsx`, `src/hooks/useIsTeamAdmin.ts`, `src/App.tsx` (rota), pontos B3/B4.

- Ativar B3 (`portfolio_report`) e B4 (`ai_idea`). B5 dormente (comunidade não existe).
- RPCs `admin_weekly_metrics`, `admin_funnel` (guardadas por `is_team_admin()`).
- `/admin/feedback` (lazy, sem link na sidebar): tabs Respostas (+CSV client-side), Alertas, Métricas (+toggle pricing).

**Verificação:** admin vê dashboard, não-admin redirect; CSV com escaping correto; RPC não-admin → forbidden.

---

## Queries SQL interim para a equipa (Supabase Studio — desde o dia 1)

```sql
-- Famílias ativas nos últimos 7 dias
select count(distinct family_id) as familias_ativas_7d
from analytics_events
where created_at > now() - interval '7 days';

-- Planos gerados vs. consultados a meio da semana (últimos 7 dias)
select
  count(*) filter (where event = 'plan_generated') as gerados,
  count(*) filter (where event = 'plan_viewed'
    and props->>'day_of_week' in ('2','3','4')) as consultados_meio_semana
from analytics_events
where created_at > now() - interval '7 days';

-- Taxa de edição de planos (famílias que editaram / que geraram)
select
  count(distinct family_id) filter (where event = 'plan_edited')::float
  / nullif(count(distinct family_id) filter (where event = 'plan_generated'), 0)
    as taxa_edicao
from analytics_events;

-- Funil registo → 1.º plano
select
  (select count(*) from families) as registos,
  count(distinct family_id) as com_primeiro_plano
from analytics_events
where event = 'plan_generated';
```

---

## Ordem

5.1 e 5.2 abrem a fase (fundação + medição, P1). 5.3 (Instrumento D, P1) em paralelo. 5.4 é o maior bloco (P2). 5.5 e 5.6 fecham (P3, P4). B5 fica dormente até a comunidade existir.
