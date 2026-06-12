# FASE 2 — Onboarding e Manual de Instruções
**Objetivo:** um pai que se regista hoje chega ao primeiro plano semanal gerado em menos de 10 minutos, sem ajuda externa; e tem um "Manual de Instruções" permanente em `/ajuda`.
**Depende de:** FASE 1 Passo 1.2 (geração server-side) — o onboarding culmina na geração do primeiro plano.

---
## ESTADO DA EXECUÇÃO (atualizado 2026-06-12) — branch `new-ui`

- ✅ **2.1** — Migração 016 (`families.onboarding_completed_at`, `onboarding_step`) + backfill das famílias existentes. Tipo `families` atualizado; `updateOnboarding()` no `AuthContext`.
- ✅ **2.2** — Wizard `/onboarding` (5 passos: boas-vindas com modelo 4-verbos → família → crianças → metodologia → gerar 1º plano). Progresso persistido em `onboarding_step` (retoma após refresh). `ProtectedRoute` redireciona famílias sem onboarding (exceto `/onboarding` e `/ajuda`). **Simplificação deliberada:** o passo final leva ao `/weekly-planner` (em vez de gerar o plano inline) — mais robusto e não bloqueia no secret do Gemini. Geração inline pode ser refinamento futuro.
- ✅ **2.3** — Manual completo em `/ajuda` (+ `/ajuda/:slug`): 10 secções PT-PT (`src/content/manual`), pesquisa, deep-links, entrada na sidebar, botão `?` contextual no header global (`HelpLink` + `AppLayout`). Secção `relatorios` marcada `draft: true` (validação legal pelos fundadores).
- ✅ **2.4** — Componente reutilizável `EmptyState` (`src/components/EmptyState.tsx`) com CTA + link para o Manual. Aplicado ao Portfólio (entradas + marcos). Disponível para reutilizar nas restantes páginas (Projects/WorldMissions/Reports/Calendar têm texto contextual aceitável).
- ✅ **2.5** — Edge function `send-welcome-email` (Resend, `verify_jwt=true`, v1; destinatário vem do JWT). Invocada best-effort no `AuthContext.signUp` após criar a família (nunca bloqueia o registo; só corre se houver sessão imediata, que é o caso — confirmações de email desligadas).

> **Agente executor — contexto mínimo:** ler `src/App.tsx`, `src/contexts/AuthContext.tsx`, `src/components/AppSidebar.tsx` e, por passo, apenas os ficheiros indicados. Reutilizar componentes shadcn existentes (`Dialog`, `Card`, `Progress`, `Accordion`) — não criar primitivos novos. Estilo visual: seguir `src/index.css` e padrões das páginas existentes.

---

## Passo 2.1 — Estado de onboarding na BD

Migração (MCP `apply_migration`):
```sql
ALTER TABLE families ADD COLUMN onboarding_completed_at timestamptz;
ALTER TABLE families ADD COLUMN onboarding_step smallint NOT NULL DEFAULT 0;
```
Expor no `AuthContext` (o objeto `family` já é carregado aí — apenas garantir que as colunas novas vêm no select).

## Passo 2.2 — Wizard de onboarding (`/onboarding`)

**Ficheiros a ler antes:** `src/pages/Children.tsx` (formulário de criança — reutilizar a lógica/validação), `src/pages/Metodologias.tsx` e `src/components/methodology/*` (seleção de metodologia), `src/components/planner/PlannerForm.tsx` (campos de interesses).

Nova página `src/pages/Onboarding.tsx` + rota protegida em `App.tsx`. Redirecionamento: no `ProtectedRoute` (App.tsx:121), se `family.onboarding_completed_at` é null → `<Navigate to="/onboarding" />` (exceto a própria rota e `/settings`).

**Passos do wizard (stepper com progresso, guardar `onboarding_step` a cada avanço para retomar):**
1. **Boas-vindas** — 3 ecrãs curtos com a proposta de valor e o modelo mental *Planear → Fazer → Registar → Provar* (1 frase + ilustração/ícone cada). Botão "Saltar".
2. **A vossa família** — confirmar nome da família (já vem do registo).
3. **Primeira criança** — nome, data de nascimento, ano escolar, interesses atuais (usar o `InterestPicker` existente). Botão "Adicionar outra criança" no fim.
4. **Metodologia** — versão compacta da seleção: mostrar as 14 em cards pequenos com tooltip do `short_description`, pré-selecionar "sem preferência" (= não definir `methodology_id`); link "saber mais" abre o manual na secção metodologias. Não bloquear o avanço.
5. **Primeiro plano** — formulário mínimo (interesses já preenchidos do passo 3; semana = próxima segunda-feira) → botão "Gerar o nosso primeiro plano" → chama o motor (edge function) → mostra o `PlanPreview` existente → CTA "Enviar por email" (fluxo `send-weekly-plan` existente).
6. **Fim** — marcar `onboarding_completed_at = now()`, redirecionar para `/` com toast.

**Aceitação:** conta nova criada de raiz percorre o wizard e termina com 1 criança, 1 plano gerado e email recebido; refresh a meio retoma no passo certo; utilizadores existentes (Malta) não são empurrados para o wizard (backfill: `UPDATE families SET onboarding_completed_at = now() WHERE created_at < <data do deploy>`).

## Passo 2.3 — Manual de Instruções (`/ajuda`)

**Conceito:** conteúdo estático em ficheiros TS/MD dentro do repo (sem BD — o conteúdo muda com o código), navegável por secções, pesquisável (filtro client-side por título/keywords), sempre acessível.

1. Criar `src/content/manual/` com um módulo por secção, exportando `{ slug, title, keywords, body }` (body em markdown; renderizar com o plugin de tipografia do Tailwind já instalado — `@tailwindcss/typography`).
2. **Secções mínimas (escrever o conteúdo — em PT-PT, tom caloroso e direto, dirigido a pais sem formação pedagógica):**
   - `comecar` — Primeiros passos (espelha o wizard)
   - `planeador` — Como funciona o Planeador Semanal e o que a IA faz com os vossos dados (transparência: currículo DGE + metodologia + interesses; o plano é uma proposta editável)
   - `conteudos-da-semana` — Como indicar o que querem ensinar
   - `metodologias` — As 14 metodologias em linguagem simples (puxar `short_description`/princípios da BD ou duplicar estático — preferir estático para coerência do manual)
   - `diario-portfolio` — Registar atividades, fotos, marcos; como isto vira o portfólio
   - `relatorios` — Relatórios trimestrais e o enquadramento legal do ensino doméstico em Portugal (matrícula, escola-âncora, avaliações) — **conteúdo a validar pelos fundadores**
   - `roteiro-anual` — Acompanhar o currículo ao longo dos 3 períodos
   - `missoes-recompensas` — Missões do Mundo, pontos e prémios
   - `familia` — Convidar o outro progenitor, gerir conta, privacidade e RGPD
   - `faq` — Perguntas frequentes
3. Página `src/pages/Manual.tsx`: layout de duas colunas (índice à esquerda, conteúdo à direita; accordion em mobile), pesquisa no topo, deep-link `/ajuda/:slug`.
4. **Acesso permanente:** entrada "Ajuda / Manual" no grupo Sistema da `AppSidebar.tsx` (ícone `LifeBuoy`); botão `?` no header de cada página core que abre o manual na secção certa (criar componente `HelpLink({ slug })` e inseri-lo nos headers de WeeklyPlanner, Activities, Portfolio, Reports, RoteiroAnual, WorldMissions).

**Aceitação:** `/ajuda` navegável e pesquisável; cada página core tem `?` contextual; wizard liga ao manual.

## Passo 2.4 — Empty states orientados a ação

Auditar as páginas core (grep por listas vazias / `length === 0`): cada estado vazio deve dizer **o que fazer a seguir** com um CTA (ex.: Diário vazio → "Regista a primeira atividade da semana — vê como no Manual" com link). Páginas: Index, Activities, Portfolio, Reports, Projects, WorldMissions, CalendarPage. Manter curto: 1 frase + 1 botão.

## Passo 2.5 — Email de boas-vindas

Na edge function de registo não existe hook; usar o caminho simples: após `signUp` bem-sucedido no `AuthContext`, invocar uma edge function nova `send-welcome-email` (Resend, template HTML simples em PT-PT: o que é a NexSeed, link para o wizard, link para o manual). `verify_jwt=true`.

---

## Ordem
2.1 → 2.2 → 2.3 (2.3 pode começar em paralelo com 2.2) → 2.4 → 2.5.
O conteúdo escrito do manual (2.3.2) e da secção legal deve ser revisto pelos fundadores antes do lançamento, mas não bloqueia o desenvolvimento.
