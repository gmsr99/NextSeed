# NexSeed — Design: Loop Diário (Abordagem 1)
**Data:** 2026-04-10  
**Âmbito:** Dashboard, Calendário, Recompensas das Missões, Literacia Financeira & Digital  
**Objetivo:** Tornar a app indispensável no dia-a-dia, criando razões para abrir a app todos os dias (não só às sextas para gerar o plano), aumentando retenção numa lógica de subscrição mensal.

---

## Contexto

A app NexSeed está ~85% completa. O núcleo funciona: geração de plano semanal com Gemini, registo de atividades, projetos, relatórios, missões do mundo, portfólio, currículo DGE.

**Lacunas identificadas para esta iteração:**
- Dashboard genérico — não responde à pergunta "o que faço hoje?"
- Calendário vazio — placeholder sem qualquer dado
- Missões do Mundo sem sistema de recompensas — loop de gamificação quebrado
- Literacia Financeira & Digital com progresso hardcoded e botões sem efeito real

**O que NÃO se toca:**
- `src/lib/geminiPlanner.ts` e toda a lógica de geração com IA
- Migrações existentes (`001` a `008`)
- Edge Functions existentes

---

## 1. Dashboard — Painel de Controlo Diário

### Objetivo
Transformar o dashboard no "ecrã de abertura da manhã" — a primeira coisa que um pai vê deve responder a: *o que acontece hoje?*

### Layout (de cima para baixo)

**Bloco 1 — Hoje** *(proeminente, topo)*
- Saudação contextual com data: "Bom dia, família Malta! · Sexta, 10 de abril"
- Atividades de hoje extraídas do plano semanal ativo (`weekly_plan_items` filtrado pelo `day_of_week` atual)
- Se não houver plano ativo: card CTA "Gerar plano para esta semana →"
- Cada atividade mostra: hora, título, disciplina com cor, botão inline "Registar"
- O botão "Registar" abre o formulário de nova atividade pré-preenchido com título e disciplina

**Bloco 2 — Missões Ativas** *(secção secundária)*
- Uma linha por criança com missões em curso
- Pontos acumulados + barra de progresso para a próxima recompensa
- Se não houver recompensas definidas: nudge "Cria uma recompensa para motivar →"

**Bloco 3 — Esta Semana** *(resumo compacto)*
- Contador "X de Y atividades registadas" para a semana atual
- Próximos extracurriculares (máx. 3, ordenados por data/hora)
- Links rápidos: "Ver Planeador", "Ver Calendário"

**Bloco 4 — Ações Rápidas** *(persistente no fundo ou sidebar)*
- Registar atividade, Gerar plano, Ver portfólio

### Dados necessários (todos já existem na BD)
| Dado | Fonte |
|------|-------|
| Plano ativo + atividades do dia | `weekly_plans` + `weekly_plan_items` |
| Atividades registadas esta semana | `activities` (filtro por `date >= início_semana`) |
| Pontos por criança | `mission_completions` (aggregate) |
| Próximos extracurriculares | `extracurricular_activities` |
| Recompensas e saldo de pontos | `mission_rewards` + `reward_redemptions` (novas) |

### Hook a criar
`src/hooks/useTodayDashboard.ts` — agrega todas as queries acima num único hook com React Query, expondo: `todayItems`, `weekSummary`, `missionSummary`, `upcomingExtracurriculars`.

### Alterações a ficheiros existentes
- `src/pages/Index.tsx` — substituir layout atual pelo novo
- `src/hooks/useDashboard.ts` — **substituído** pelo novo `useTodayDashboard.ts`; o ficheiro antigo é eliminado para evitar confusão

**Sem migrações novas para o Dashboard.**

---

## 2. Calendário Familiar

### Objetivo
Vista unificada de tudo o que acontece na família — agrega dados já existentes e permite adicionar eventos manuais.

### Fontes de dados

| Tipo | Cor | Fonte | Editável na página? |
|------|-----|-------|---------------------|
| Plano semanal | Azul/índigo | `weekly_plan_items` via `weekly_plans` ativo | Não (redireciona para /weekly-planner) |
| Extracurriculares | Laranja | `extracurricular_activities` (já tem dias + horas) | Não (redireciona para /extracurricular) |
| Eventos da família | Verde | Nova tabela `calendar_events` | Sim |

### Migração: `calendar_events`

```sql
-- Migration 009_calendar_events.sql
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid references children(id) on delete set null,
  title text not null,
  date date not null,
  start_time time,
  end_time time,
  notes text,
  type text not null default 'evento', -- 'consulta' | 'saida' | 'visita' | 'evento'
  created_at timestamptz not null default now()
);

alter table calendar_events enable row level security;

create policy "family_calendar_events" on calendar_events
  using (family_id = my_family_id())
  with check (family_id = my_family_id());

create index on calendar_events (family_id, date);
```

### Vistas disponíveis
- **Mês** (padrão) — grelha mensal com pontos coloridos nos dias com eventos; clique num dia abre painel lateral
- **Semana** — grelha com colunas por dia e linhas por hora (8h–20h); mostra plano diário + extracurriculares com blocos de tempo
- **Painel lateral de dia** — lista todos os itens de um dia selecionado, com ações contextuais

### Interações
- Clicar num dia vazio → formulário rápido de novo evento (título, data, hora início/fim, tipo, criança opcional)
- Clicar num evento verde → editar/eliminar inline
- Clicar num evento azul → navega para /weekly-planner
- Clicar num evento laranja → navega para /extracurricular
- Botão "Adicionar evento" sempre visível no topo

### Fora de âmbito
- Sincronização com Google Calendar / iCal
- Eventos recorrentes complexos (os extracurriculares recorrentes são geridos na sua página)
- Notificações ou lembretes

### Novos ficheiros
- `src/hooks/useCalendarEvents.ts` — CRUD para `calendar_events`
- `src/hooks/useCalendarData.ts` — agrega todas as fontes (plan items + extracurriculares + eventos) para uma dada janela de datas
- `src/components/calendar/CalendarMonthView.tsx`
- `src/components/calendar/CalendarWeekView.tsx`
- `src/components/calendar/CalendarDayPanel.tsx`
- `src/components/calendar/EventForm.tsx`

---

## 3. Recompensas das Missões do Mundo

### Objetivo
Fechar o loop de gamificação: crianças acumulam pontos → podem resgatar recompensas definidas pelos pais → pais aprovam → pontos descontados.

### Fluxo completo

```
Pai cria recompensa (ex: "Chupa-chupa = 50 pts 🍭")
        ↓
Criança completa missões → acumula pontos
        ↓
Criança pede resgatar recompensa (com pai presente)
        ↓
Pai aprova → pontos descontados, recompensa marcada como entregue
     ou rejeita → pontos mantidos, mensagem opcional
```

### Migração: `mission_rewards` + `reward_redemptions`

```sql
-- Migration 010_mission_rewards.sql

create table if not exists mission_rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  description text,
  points_cost integer not null check (points_cost > 0),
  emoji text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table mission_rewards enable row level security;

create policy "family_mission_rewards" on mission_rewards
  using (family_id = my_family_id())
  with check (family_id = my_family_id());

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  reward_id uuid not null references mission_rewards(id) on delete cascade,
  points_spent integer not null check (points_spent > 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes text
);

alter table reward_redemptions enable row level security;

create policy "family_reward_redemptions" on reward_redemptions
  using (
    child_id in (
      select id from children where family_id = my_family_id()
    )
  )
  with check (
    child_id in (
      select id from children where family_id = my_family_id()
    )
  );
```

### Lógica de saldo de pontos
Calculado no frontend — sem coluna de saldo (evita inconsistências):

```
saldo(child) = SUM(mission_completions.points WHERE child_id = child)
             - SUM(reward_redemptions.points_spent WHERE child_id = child AND status = 'approved')
```

### UI na página `/world-missions`
Nova tab **"Recompensas"** adicionada às tabs existentes.

**Sub-secção: Gerir Recompensas** (vista pais)
- Lista de recompensas ativas com emoji, título, custo em pontos
- Botão "Nova recompensa" → formulário inline: título, emoji, custo, descrição
- Toggle ativar/desativar recompensa
- Eliminar recompensa (só se não tiver resgates pendentes)

**Sub-secção: Pedidos Pendentes** (vista pais)
- Lista de pedidos de resgate agrupados por criança
- Aprovar / Rejeitar com 1 clique
- Campo de nota opcional na rejeição

**Sub-secção: Progresso por Criança**
- Saldo de pontos disponíveis com animação
- Barra de progresso para a recompensa mais próxima
- Grid de todas as recompensas: desbloqueadas (pode resgatar) vs. bloqueadas (X pontos em falta)
- Botão "Quero esta! 🎁" nos itens desbloqueados → cria pedido pendente

### Novos ficheiros
- `src/hooks/useMissionRewards.ts` — CRUD rewards + redemptions + cálculo de saldo
- `src/components/missions/RewardsManager.tsx`
- `src/components/missions/RewardCard.tsx`
- `src/components/missions/RedemptionRequests.tsx`
- `src/components/missions/ChildRewardsProgress.tsx`

---

## 4. Literacia Financeira & Literacia Digital

### Objetivo
Transformar páginas com progresso falso e botões sem efeito em páginas com progresso real por criança, persistido na BD.

### Estado atual
- **FinancialLiteracy.tsx:** 4 missões, 4 histórias, 3 desafios — progresso hardcoded (65%, 30%, etc.)
- **DigitalLiteracy.tsx:** 5 categorias, ~18 atividades — botões "Iniciar" sem efeito real
- Nenhuma das páginas tem seletor de criança

### Migração: `literacy_progress`

```sql
-- Migration 011_literacy_progress.sql
create table if not exists literacy_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  area text not null check (area in ('financial', 'digital')),
  module_id text not null,   -- slug do módulo, ex: 'poupar-com-proposito'
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  unique (child_id, area, module_id)
);

alter table literacy_progress enable row level security;

create policy "family_literacy_progress" on literacy_progress
  using (
    child_id in (
      select id from children where family_id = my_family_id()
    )
  )
  with check (
    child_id in (
      select id from children where family_id = my_family_id()
    )
  );
```

### Alterações às páginas

**Ambas as páginas recebem:**
1. **Seletor de criança** no topo (mesmo padrão de /portfolio e /reports)
2. Botões **"Iniciar"** → upsert `status = 'in_progress'` na BD
3. Botões **"Concluir"** → upsert `status = 'completed'` na BD
4. Barras de progresso calculadas a partir da BD (completados / total por categoria)
5. Estado visual: `not_started` (cinzento) | `in_progress` (azul) | `completed` (verde com check)

**O conteúdo mantém-se** — está bem estruturado e em Português. Sem CMS por agora.

### Integração com Relatórios
A página `/reports` recebe uma nova secção "Literacia" mostrando percentagem de conclusão por área e por criança, ao lado do currículo DGE existente.

### Novos ficheiros
- `src/hooks/useLiteracyProgress.ts` — CRUD + queries de progresso

### Ficheiros alterados
- `src/pages/FinancialLiteracy.tsx` — adicionar seletor de criança + ligar botões à BD
- `src/pages/DigitalLiteracy.tsx` — idem
- `src/pages/Reports.tsx` — adicionar secção de Literacia

---

## Resumo de Migrações

| # | Ficheiro | Tabela(s) |
|---|----------|-----------|
| 009 | `009_calendar_events.sql` | `calendar_events` |
| 010 | `010_mission_rewards.sql` | `mission_rewards`, `reward_redemptions` |
| 011 | `011_literacy_progress.sql` | `literacy_progress` |

---

## Resumo de Ficheiros Novos

| Ficheiro | Propósito |
|----------|-----------|
| `src/hooks/useTodayDashboard.ts` | Agrega dados para o novo dashboard |
| `src/hooks/useCalendarEvents.ts` | CRUD eventos manuais |
| `src/hooks/useCalendarData.ts` | Agrega todas as fontes do calendário |
| `src/hooks/useMissionRewards.ts` | Recompensas + resgates + saldo |
| `src/hooks/useLiteracyProgress.ts` | Progresso de literacia por criança |
| `src/components/calendar/CalendarMonthView.tsx` | Vista mensal |
| `src/components/calendar/CalendarWeekView.tsx` | Vista semanal |
| `src/components/calendar/CalendarDayPanel.tsx` | Painel lateral de dia |
| `src/components/calendar/EventForm.tsx` | Formulário CRUD de eventos |
| `src/components/missions/RewardsManager.tsx` | Gestão de recompensas pelos pais |
| `src/components/missions/RewardCard.tsx` | Card de recompensa individual |
| `src/components/missions/RedemptionRequests.tsx` | Pedidos pendentes |
| `src/components/missions/ChildRewardsProgress.tsx` | Progresso por criança |

---

## Ficheiros Alterados

| Ficheiro | O que muda |
|----------|-----------|
| `src/pages/Index.tsx` | Novo layout de dashboard diário |
| `src/pages/CalendarPage.tsx` | Substituir placeholder pelo novo calendário |
| `src/pages/WorldMissions.tsx` | Adicionar tab "Recompensas" |
| `src/pages/FinancialLiteracy.tsx` | Seletor de criança + botões reais |
| `src/pages/DigitalLiteracy.tsx` | Seletor de criança + botões reais |
| `src/pages/Reports.tsx` | Nova secção de Literacia |

---

## Ordem de Implementação Recomendada

1. **Migrações** (009, 010, 011) — base de dados primeiro
2. **Recompensas das Missões** — maior impacto imediato, relativamente autónomo
3. **Dashboard** — depende de dados que já existem
4. **Calendário** — maior esforço de frontend, depende da migração 009
5. **Literacia** — mais simples, depende da migração 011

---

## Fora de Âmbito (Abordagem 1)

- Comunidade / Fórum (backend real) → Abordagem 2
- Formação para Pais (conteúdo dinâmico) → Abordagem 2
- Sincronização de calendário externo
- Modo criança / interface separada para crianças
- Notificações push ou email automático de eventos
