# NexSeed — Diagnóstico Geral e Decisões de Produto
**Data:** 12 de junho de 2026
**Papel deste documento:** análise conceptual e técnica que fundamenta o plano de implementação (FASES 1–4). Ler primeiro. Os ficheiros `FASE-*.md` são autónomos e executáveis por um agente de IA sem reler este documento na íntegra.

---

## 1. O que é a NexSeed (estado atual verificado)

Plataforma web para famílias portuguesas em regime de **ensino doméstico (homeschooling)**. O coração do produto é o **Planeador Semanal com IA** (Gemini 2.5 Flash): cruza o currículo nacional DGE (na BD: 589 conteúdos em `curriculum_contents`, 33 disciplinas em `curriculum_disciplines`), a metodologia pedagógica da família/criança (14 metodologias em `methodologies`) e os interesses semanais das crianças, gerando um plano de 5 dias com atividades concretas, que é enviado por email em PDFs (horário + guia de atividades + guia de leitura).

**Loop de valor completo:**
`Perfil da criança → Metodologia → Interesses da semana → Plano gerado (IA) → PDFs por email → Execução → Registo de atividades (Diário) → Portfólio/Marcos → Relatórios trimestrais (validação legal junto da escola-âncora)`

**Stack:** React + Vite + TS + Tailwind + shadcn/ui (frontend), Supabase (Postgres + Auth + Storage + Edge Functions), Gemini 2.5 Flash, @react-pdf/renderer (PDFs no cliente), Resend (email), Vercel → nexseed.pt.

**Estado dos dados (verificado em 2026-06-12):** 1 família (Malta), 3 crianças, 3 utilizadores, 5 planos semanais, 0 atividades registadas. Migrações 012 e 013 **já aplicadas em produção** (colunas `weekly_plans.weekly_content` e `children.methodology_id` confirmadas no schema live).

---

## 2. Avaliação conceptual (posição de planeador)

### O que está certo
- O **loop core é o produto certo** para o público-alvo: pais sem formação pedagógica que precisam de estrutura sem carga mental. O output em PDF imprimível é uma decisão acertada (a semana corre offline, em papel, na mesa da cozinha).
- A modelação das **metodologias** (catálogo + princípios + atividades-modelo + matriz de compatibilidade + `ai_generation_style` injetado no prompt) é o ativo diferenciador mais defensável da app. Nenhum concorrente generalista tem isto para o contexto português.
- O eixo **registo → portfólio → relatório trimestral** responde à necessidade legal real do ensino doméstico em Portugal (prestação de provas à escola de matrícula).

### O que está conceptualmente confuso (corrigir antes do mercado)
1. **Demasiadas portas de entrada.** A sidebar tem ~20 entradas em 5 grupos. Para um pai novo, "Planeador Semanal", "Motor Criativo", "Roteiro Anual", "Áreas de Aprendizagem", "Projetos", "Diário", "Portfólio" e "Relatórios" parecem 8 produtos diferentes. O modelo mental tem de ser reduzido a **4 verbos: Planear · Fazer · Registar · Provar**.
2. **Motor Criativo vs Planeador Semanal** — ambos chamam o Gemini, com prompts distintos, a partir do cliente. Para o utilizador a fronteira é invisível. Decisão proposta: o Motor Criativo passa a ser uma funcionalidade *dentro* do fluxo (gerar ideia avulsa / regenerar uma atividade do plano), não uma página de primeiro nível.
3. **Diário vs Portfólio vs Marcos vs Relatórios** — são quatro vistas do mesmo dado (evidência de aprendizagem). Manter as quatro páginas é aceitável, mas a narrativa do onboarding/manual tem de as apresentar como um único pipeline: *registas no Diário → aparece no Portfólio → soma nos Relatórios*.
4. **Páginas mock acessíveis por URL.** Fórum (`/forum`, dados mock hardcoded), Comunidade e Formação para Pais estão `disabled` na sidebar mas as rotas continuam ativas em `src/App.tsx`. Antes do mercado: remover as rotas ou colocar atrás de feature flag. Não lançar com conteúdo falso alcançável.
5. **Sem onboarding nem manual.** Após o registo, o utilizador cai num dashboard vazio. Esta é a maior fuga de valor: o "time to first plan" tem de ser < 10 minutos. (FASE 2 inteira dedicada a isto.)
6. **Sem modelo de negócio implementado.** Não existe subscrição, trial, nem gating. (FASE 4.)

---

## 3. Avaliação técnica — bloqueadores críticos

Por ordem de gravidade. Detalhe de execução na FASE 1.

| # | Problema | Gravidade | Evidência |
|---|---|---|---|
| B1 | **Chaves Gemini expostas no bundle do cliente** (`VITE_GEMINI_API_KEY` e `_2` em `.env.local`, usadas por `src/lib/geminiPlanner.ts`, importado por `WeeklyPlanner.tsx` e `CreativeEngine.tsx`). Qualquer visitante de nexseed.pt extrai as chaves e consome a quota. As chaves atuais já estiveram em bundles publicados → **revogar e rodar**, não basta esconder. | CRÍTICA | `.env.local`, `src/lib/geminiPlanner.ts` |
| B2 | **Motor de IA duplicado e divergente.** A edge function `generate-weekly-plan` (server-side, currículo hardcoded, desatualizada) coexiste com `src/lib/geminiPlanner.ts` (cliente, atual, lê currículo da BD). O prompt — "o coração do produto" — vive em dois sítios. | CRÍTICA | `supabase/functions/generate-weekly-plan/index.ts` vs `src/lib/geminiPlanner.ts` |
| B3 | **Edge functions sem autenticação**: `generate-weekly-plan` e `invite-family-member` têm `verify_jwt=false`. A segunda usa service role → qualquer pessoa na internet pode invocá-la. | CRÍTICA | `list_edge_functions` (verificado) |
| B4 | **Fotos de crianças em bucket público listável** (`activity-photos` é público e tem policy SELECT ampla → permite listar todos os ficheiros). Para um produto cujo dado mais sensível são fotos de menores, isto é inaceitável em RGPD e em reputação. | CRÍTICA | Supabase advisor `public_bucket_allows_listing` |
| B5 | Advisors de segurança Supabase: funções `SECURITY DEFINER` (`my_family_id`, `accept_family_invite`, `remove_family_member`) executáveis por `anon`; `search_path` mutável em 4 funções; proteção de passwords comprometidas (HaveIBeenPwned) desligada. | ALTA | `get_advisors(security)` (verificado) |
| B6 | **Currículo duplicado em ≥4 sítios**: BD (`curriculum_contents` + `curriculum_disciplines` + `nexseed_curriculum`), `src/data/curriculos/*.json`, `src/lib/curriculo_2ano_portugal.json`, `curriculo_2ano_portugal.json` e pasta `curriculos/` na raiz. Há ainda um bloco morto `_UNUSED` de ~200 linhas em `geminiPlanner.ts`. Fonte única de verdade: a BD. | MÉDIA | listagem do repo |
| B7 | Dados fracamente tipados: `children.school_year` é texto livre; `time_slot`/`start_time` como texto; sem constraint UNIQUE em `weekly_plans (family_id, week_start)` aparente. | MÉDIA | schema live |
| B8 | Histórico de migrações local (13 ficheiros SQL) provavelmente dessincronizado da CLI/produção — 012/013 foram aplicadas manualmente. | BAIXA | memória do projeto + schema |

---

## 4. Decisões que pertencem aos fundadores (responder antes da FASE 4)

O plano avança com as **predefinições propostas** se não houver resposta; estão escolhidas para minimizar risco.

| Decisão | Predefinição proposta | Alternativa |
|---|---|---|
| D1. Scope de anos no lançamento | Pré-escolar → 4º ano (o que existe na BD) | Adicionar 5º/6º antes do lançamento (atrasa ~semanas). Nota: o schema de `curriculum_contents` já *permite* '5' e '6' (CHECK constraint), mas **não existe nenhuma linha de conteúdo** para esses anos (verificado 2026-06-12: pré=64, 1º=114, 2º=153, 3º=123, 4º=135). Adicionar 5º/6º é trabalho de conteúdo (seed), não de código. |
| D2. Comunidade / Fórum | Cortar do MVP de mercado; reintroduzir pós-lançamento se houver massa crítica | Lançar fórum simples (custo de moderação) |
| D3. Modelo de preço | Subscrição mensal por família (preço único, todas as crianças incluídas), trial de 14 dias sem cartão | Tiers por nº de crianças |
| D4. Mobile | Web responsiva + PWA instalável (FASE 3) | App nativa (não recomendado agora) |
| D5. Marca do plano gerado | O plano é "proposta editável", nunca "prescrição" — linguagem da UI e do manual deve refletir isto | — |

---

## 5. Mapa das fases

| Fase | Tema | Resultado | Depende de |
|---|---|---|---|
| **FASE 1** | Segurança e fundações | Nenhum segredo no cliente; motor de IA único no servidor; storage privado; advisors limpos; currículo com fonte única | — |
| **FASE 2** | Onboarding + Manual | Novo utilizador chega ao 1º plano gerado em <10 min; manual permanente em `/ajuda` | FASE 1 (o onboarding gera plano → precisa do motor server-side) |
| **FASE 3** | Consolidação de produto | Navegação 4 grupos; mocks removidos; Motor Criativo integrado; mobile/PWA; robustez do parsing IA | FASE 1 |
| **FASE 4** | Go-to-market | Stripe + trial, analytics, landing, RGPD final, beta fechada | FASES 1–3 |

Ordem de execução: **1 → 2 → 3 → 4**. As FASES 2 e 3 podem intercalar-se, mas a 1 é bloqueadora de tudo.

---

## 6. Instruções gerais para o agente executor (economia de tokens)

- **Nunca ler** `src/components/ui/**` (shadcn vanilla), `node_modules`, `dist`, `bun.lock*`, `package-lock.json`, `curriculos/`, `Curriculo_Nexseed/`, `gestao_de_conteudos/`.
- Cada ficheiro FASE-*.md lista exatamente os ficheiros a ler por passo. Ler apenas esses, e preferir leituras parciais (offset/limit) nos ficheiros >400 linhas (`WeeklyPlanner.tsx` 624 ln, `geminiPlanner.ts` 522 ln, `planGenerator.ts` 518 ln, `Forum.tsx` 566 ln).
- Schema da BD: usar o MCP do Supabase (`list_tables`) em vez de ler os SQL de `supabase/migrations/` — o histórico local não é fiável (ver B8).
- Validar cada passo com `npm run build` e `npm run test` (vitest). Não criar testes novos exceto onde o passo o pedir.
- Trabalhar no branch `new-ui` salvo indicação contrária; commits pequenos por passo, mensagens em português.
- Idioma de toda a UI e conteúdo: **português europeu** (não brasileiro).
