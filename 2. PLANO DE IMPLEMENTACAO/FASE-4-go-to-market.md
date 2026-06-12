# FASE 4 — Go-to-Market
**Objetivo:** transformar a app funcional num produto vendável: subscrição com trial, analytics, landing page, RGPD final e beta fechada.
**Depende de:** FASES 1–3 concluídas. Vários passos requerem ações humanas (contas Stripe/PostHog, conteúdo, jurídico) — estão marcadas **[HUMANO]**.

---

## Passo 4.1 — Subscrição (Stripe)

Predefinição de D3 (ver diagnóstico): **mensal por família, todas as crianças incluídas, trial 14 dias sem cartão**. Preço a definir pelos fundadores **[HUMANO]** (referência de mercado homeschooling: 9–19 €/mês).

1. **[HUMANO]** Conta Stripe, produto + preço mensal (e anual com desconto), portal de cliente ativado.
2. Migração: tabela `subscriptions (family_id pk/fk, stripe_customer_id, stripe_subscription_id, status, trial_ends_at, current_period_end, updated_at)` com RLS (SELECT à própria família; escrita apenas via service role).
3. Edge functions: `create-checkout-session` (verify_jwt=true; cria/recupera customer e sessão de checkout), `stripe-webhook` (verify_jwt=false **por necessidade** — validar assinatura do webhook com `STRIPE_WEBHOOK_SECRET`; sincroniza `subscriptions`).
4. Trial: ao completar onboarding, inserir `subscriptions` com `status='trialing'`, `trial_ends_at = now() + 14 dias` (sem Stripe até converter).
5. Gating no cliente: hook `useSubscription`; trial expirado → banner persistente + bloqueio **apenas da geração de novos planos** (nunca bloquear acesso aos dados já criados — portfólio e relatórios são deles; isto também é postura RGPD correta).
6. Página de gestão em `/settings`: estado, dias de trial restantes, botão para o portal Stripe.

## Passo 4.2 — Emails transacionais e de ritmo

A infra Resend já existe (`send-weekly-plan`, FROM geral@nexseed.pt).
1. **[HUMANO]** Verificar domínio nexseed.pt no Resend (SPF/DKIM) se ainda não está.
2. Emails a criar (templates simples, PT-PT): boas-vindas (FASE 2.5), fim de trial (D-3 e D-0), lembrete de sexta-feira "planear a próxima semana" (cron via `pg_cron` + edge function, **opt-out nas definições** — obrigatório).

## Passo 4.3 — Analytics e métricas de produto

1. **[HUMANO]** Conta PostHog (cloud EU, por RGPD) — alternativa mais leve: Plausible, mas sem eventos por utilizador.
2. Instrumentar eventos mínimos: `signup`, `onboarding_completed`, `plan_generated`, `plan_emailed`, `activity_logged`, `report_exported`, `subscription_started`. Identify por `family_id` (não usar emails como ID).
3. Métricas-objetivo da beta: time-to-first-plan < 10 min; ≥ 1 plano gerado/semana por família ativa; retenção semana-4 > 50%.
4. Atualizar a política de privacidade (`src/pages/PrivacyPolicy.tsx`) com o processador novo e atualizar o `CookieBanner` se aplicável.

## Passo 4.4 — Landing page pública

Hoje `/` é a app (protegida) e o login é a porta de entrada. Para vender é precisa uma landing pública.
1. Decisão recomendada: landing no mesmo domínio, rota pública `/` quando não autenticado (sessão ativa → dashboard). Alternativa: site estático separado em `www.` — só se os fundadores quiserem CMS de marketing **[HUMANO decide]**.
2. Conteúdo mínimo: proposta de valor (1 frase: *"O plano semanal de homeschooling da vossa família, pronto todas as sextas-feiras"*), como funciona (3 passos), metodologias, screenshot do PDF, preço, FAQ (reutilizar manual), CTA registo.
3. SEO básico: meta tags, OG image, sitemap. Idioma `pt-PT`.

## Passo 4.5 — RGPD final (checklist)

Já existe: consentimento no registo (`consentedAt`), páginas `/privacidade` e `/termos`, `deleteAccount` no AuthContext, cookie banner. Falta:
1. **Export de dados**: botão nas definições que gera um ZIP/JSON com os dados da família (edge function `export-family-data`, verify_jwt=true).
2. Verificar que `deleteAccount` apaga **tudo** em cascata (FKs com `ON DELETE CASCADE`? verificar no schema; incluir ficheiros do Storage — provável lacuna).
3. **[HUMANO]** Rever termos/privacidade com apoio jurídico: dados de menores tratados pelos pais (os pais são quem insere; a NexSeed é processador/responsável conjunto — precisa de redação correta), subcontratantes (Supabase, Google/Gemini, Resend, Stripe, PostHog, Vercel) e transferências para fora da UE.
4. Mencionar explicitamente no manual e na privacidade **o que é enviado ao Gemini** (interesses, ano escolar, primeiro nome da criança — avaliar enviar apenas iniciais/alcunha no prompt: mudança barata na edge function com ganho grande de privacidade).

## Passo 4.6 — Beta fechada

1. **[HUMANO]** Recrutar 5–10 famílias (além das pilotos Andrea e Mafalda) — grupos de homeschooling PT no Facebook/Telegram são o canal natural.
2. Mecânica: códigos de convite (tabela `beta_invites` simples) ou registo aberto com flag — preferir registo aberto + trial, é menos código.
3. Ritual semanal: rever métricas do 4.3 + 1 chamada com 2 famílias; alimentar um backlog único em `2. PLANO DE IMPLEMENTACAO/BACKLOG-BETA.md`.
4. Critério de saída da beta (= lançamento pago): 2 semanas consecutivas com ≥70% das famílias a gerar plano e zero bugs críticos.

---

## Ordem
4.3 primeiro (medir desde o início da beta) → 4.4 e 4.5 em paralelo → 4.1/4.2 → 4.6. A beta pode começar antes do Stripe estar pronto (trial manual), se houver pressa de feedback.
