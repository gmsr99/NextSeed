# FASE 3 — Consolidação Conceptual e UX
**Objetivo:** reduzir o modelo mental da app a 4 verbos (Planear · Fazer · Registar · Provar), remover conteúdo mock, integrar o Motor Criativo no fluxo principal, e endurecer a robustez (parsing IA, erros, mobile).
**Depende de:** FASE 1 (motor server-side). Pode intercalar com a FASE 2.

> **Agente executor — contexto mínimo:** por passo, ler apenas os ficheiros indicados. Não redesenhar visualmente páginas que funcionam — esta fase é de **reorganização e robustez**, não de redesign estético.

---

## Passo 3.1 — Navegação: de 5 grupos/20 entradas para 4 grupos

**Ficheiros:** `src/components/AppSidebar.tsx`, `src/App.tsx`.

Nova estrutura proposta:

| Grupo | Entradas |
|---|---|
| **Planear** | Dashboard, Planeador Semanal, Roteiro Anual, Agenda |
| **Aprender** | Áreas de Aprendizagem, Projetos, Missões do Mundo, Literacia Financeira, Literacia Digital |
| **Registar & Provar** | Diário, Portfólio, Relatórios |
| **Sistema** | Crianças, Metodologias, Extracurriculares, Ajuda/Manual, Definições |

Mudanças concretas:
1. Remover da sidebar as entradas `disabled` (Formação para Pais, Comunidade, Fórum) — entradas desativadas permanentes só geram frustração.
2. **Remover as rotas** `/forum`, `/community`, `/parent-training` de `App.tsx` (e os imports). Manter os ficheiros de página no repo (poderão voltar pós-lançamento) mas inalcançáveis. `/forum` tem dados mock hardcoded — não pode ser alcançável em produção.
3. Crianças e Metodologias passam para Sistema: são configuração, não uso diário (depois do onboarding, visitam-se raramente).

## Passo 3.2 — Integrar o Motor Criativo no fluxo

**Ficheiros:** `src/pages/CreativeEngine.tsx`, `src/components/planner/PlanPreview.tsx`, `src/pages/WeeklyPlanner.tsx` (zonas relevantes via grep).

1. No `PlanPreview`, adicionar por atividade uma ação "↻ Regenerar esta atividade" que chama o motor (mode `creative-idea` da FASE 1.2) com o contexto da atividade (criança, disciplina, interesse) e substitui inline.
2. A página `/creative-engine` mantém-se como "Ideias Rápidas" dentro do grupo Aprender, mas o seu output deve continuar a poder converter-se em Atividade ou Projeto (fluxo já existente — verificar que sobreviveu à migração server-side).
3. Rever o naming na UI: "Motor Criativo" → "Ideias Rápidas" (mais claro para pais).

## Passo 3.3 — Robustez do motor de IA

**Ficheiros:** edge function `generate-weekly-plan` (pós FASE 1.2), `src/pages/WeeklyPlanner.tsx` (handling de erro).

1. Na edge function: validar o JSON devolvido pelo Gemini contra um schema (zod via esm.sh ou validação manual estrita); 1 retry automático com instrução corretiva se o parse falhar; timeout e mensagem de erro acionável.
2. Usar `response_mime_type: "application/json"` + `response_schema` na chamada Gemini (structured output) se ainda não usado — elimina a maior parte das falhas de parsing.
3. No cliente: estados de loading com mensagem honesta ("a gerar — pode demorar até 1 minuto"), erro com botão "tentar novamente" sem perder o formulário.
4. Guardar em `weekly_plans` um campo `generation_meta jsonb` (migração) com modelo, duração e nº de retries — diagnóstico barato para a beta.

## Passo 3.4 — Dashboard "Hoje"

**Ficheiros:** `src/pages/Index.tsx` (301 ln — está modificado no working tree do branch `new-ui`; ler o estado atual antes de mexer), `src/hooks/useTodayDashboard.ts`.

O dashboard deve responder em 5 segundos à pergunta de um pai às 8h da manhã: **"o que vamos fazer hoje?"**
1. Bloco principal: atividades de hoje do plano semanal ativo, por criança, com checkboxes de conclusão (se o "loop diário" de `docs/superpowers/plans/2026-04-10-loop-diario.md` já implementou parte disto, reutilizar — verificar primeiro com grep `useTodayDashboard`).
2. Bloco secundário: próximos eventos da Agenda + extracurriculares de hoje.
3. CTA contextual: sexta-feira → "Já planearam a próxima semana?"; domingo/segunda sem plano → idem.

## Passo 3.5 — Mobile e PWA

1. Auditoria responsiva das páginas core (o uso real é telemóvel na cozinha): WeeklyPlanner, Index, Activities (upload de foto da câmara), Portfolio. Corrigir overflow/touch targets. Usar o hook existente `use-mobile.tsx`.
2. PWA mínima: `manifest.json` (nome, ícones a partir de `src/assets/nexseed-icon.png`, `display: standalone`) + service worker básico (vite-plugin-pwa) para instalação no ecrã principal. Offline real fica fora de scope.

## Passo 3.6 — Limpeza técnica

1. Apagar `vitest.config.ts.timestamp-*.mjs` (artefacto), adicionar `*.timestamp-*.mjs` e `.DS_Store` ao `.gitignore`.
2. README.md ainda é o boilerplate da Lovable — reescrever: o que é a NexSeed, stack, como correr localmente, estrutura de pastas, link para `2. PLANO DE IMPLEMENTACAO/`.
3. Resolver o estado do branch: `new-ui` tem alterações não comitadas em `src/pages/Index.tsx` — comitar ou descartar conscientemente antes de começar a fase.
4. Decidir destino das pastas soltas da raiz (`Curriculo_Nexseed/`, `gestao_de_conteudos/`, `Ponto de situação/`): mover para `docs/arquivo/` se forem material de trabalho, para não poluir o repo de produção.

---

## Ordem
3.1 e 3.6 são rápidos e podem abrir a fase. 3.3 antes de 3.2 (a regeneração inline depende do motor robusto). 3.4 e 3.5 fecham a fase.
