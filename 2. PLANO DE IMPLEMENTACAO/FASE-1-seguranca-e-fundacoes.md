# FASE 1 — Segurança e Fundações Técnicas
**Objetivo:** eliminar os bloqueadores de mercado: segredos fora do cliente, motor de IA único no servidor, storage privado, advisors de segurança limpos, currículo com fonte única de verdade.
**Critério de conclusão da fase:** `grep -r "VITE_GEMINI" src/` devolve vazio; `get_advisors(security)` sem WARN relevantes; bucket de fotos privado; app a gerar planos via edge function com sessão autenticada.

> **Agente executor — contexto mínimo:** lê apenas os ficheiros indicados em cada passo. O schema da BD obtém-se via MCP Supabase (`list_tables`), não pelos ficheiros de `supabase/migrations/`. Secrets de edge functions gerem-se no dashboard/CLI Supabase (`supabase secrets set`), nunca em código.

---

## Passo 1.1 — Rodar e revogar as chaves Gemini ⚠️ (ação humana + código)

As chaves em `.env.local` (`VITE_GEMINI_API_KEY`, `VITE_GEMINI_API_KEY_2`) já foram publicadas em bundles de produção (nexseed.pt via Vercel). Considerá-las comprometidas.

1. **[HUMANO]** Criar chave Gemini nova no Google AI Studio; revogar as duas antigas.
2. **[HUMANO]** Definir a nova chave como secret da edge function: `supabase secrets set GEMINI_API_KEY=...` (a função `generate-weekly-plan` já lê `Deno.env.get("GEMINI_API_KEY")`).
3. **[HUMANO]** Remover `VITE_GEMINI_API_KEY*` das environment variables da Vercel.
4. Remover as duas linhas `VITE_GEMINI_*` de `.env.local` e garantir que `.env.local` está no `.gitignore`.

*Este passo só fica completo quando o Passo 1.2 estiver feito (a app deixa de precisar da chave no cliente).*

## Passo 1.2 — Mover o motor de geração para a edge function (núcleo da fase)

**Problema:** `src/lib/geminiPlanner.ts` (522 ln) constrói o prompt e chama a API Gemini diretamente do browser. A edge function `supabase/functions/generate-weekly-plan/index.ts` existe mas está desatualizada (currículo hardcoded, prompt antigo, `verify_jwt=false`).

**Ficheiros a ler:** `src/lib/geminiPlanner.ts` (inteiro — é o prompt de referência), `src/pages/WeeklyPlanner.tsx` (apenas as zonas que chamam `generateWithGemini` — procurar com grep primeiro), `src/lib/planGenerator.ts` (apenas os tipos/constantes exportados que o geminiPlanner usa).

**Plano:**
1. Reescrever `supabase/functions/generate-weekly-plan/index.ts`:
   - Portar **na íntegra** a lógica de construção de prompt atual de `geminiPlanner.ts` (incluindo Regras 12 e 13, metodologia por criança via `ai_generation_style`, `weekly_content`, interesses). O prompt do cliente é a versão canónica; o da edge function antiga descarta-se.
   - Substituir o currículo hardcoded por leitura da BD (`curriculum_contents`, `methodology_activities`, `methodologies`) usando o client Supabase com o JWT do utilizador (assim a RLS aplica-se naturalmente).
   - Input do endpoint: `{ children: [{ id, interests, weeklyContent, methodologyId }], weekStart, fridayActivity, notes, readingTheme }`. Output: o mesmo shape `GeneratedPlanItem[]` que o cliente já consome — **não alterar os tipos do cliente** para minimizar o diff.
   - Validar o body com checks simples; devolver erros estruturados `{ error: string }` com status corretos.
2. Deploy com `verify_jwt=true` (resolve metade do B3).
3. Em `src/lib/geminiPlanner.ts`: substituir o corpo de `generateWithGemini` por `supabase.functions.invoke("generate-weekly-plan", { body })`, mantendo a assinatura pública para não tocar em `WeeklyPlanner.tsx`. Apagar o bloco morto `_UNUSED` (~200 linhas) e toda a referência a `import.meta.env.VITE_GEMINI*`.
4. O **Motor Criativo** (`src/pages/CreativeEngine.tsx`) também chama o Gemini do cliente. Adicionar à mesma edge function um campo `mode: "weekly-plan" | "creative-idea"` (ou criar função `generate-idea` separada se o prompt for muito distinto — preferir a primeira opção).
5. Testes: atualizar `src/lib/__tests__/planGenerator.test.ts` se partir; smoke test manual com a família Malta (gerar um plano real).

**Aceitação:** plano gera com sessão autenticada; pedido sem JWT → 401; `grep -r "generativelanguage\|VITE_GEMINI" src/` vazio.

## Passo 1.3 — Trancar `invite-family-member`

**Ficheiro a ler:** `supabase/functions/invite-family-member/index.ts`.

1. Redeploy com `verify_jwt=true`.
2. No handler: extrair o user do JWT (`supabase.auth.getUser(token)`), verificar que o user é **owner** da família (`families.user_id = user.id`) antes de usar o service role para criar o convite/enviar email. Rejeitar caso contrário (403).
3. Rate limit simples: máx. 10 convites/dia por família (contar em `family_invites`).

## Passo 1.4 — Storage privado para fotos (RGPD)

**Contexto:** bucket `activity-photos` é público e listável; contém fotos de menores. Buckets usados pelo upload em `src/pages/Activities.tsx` e leitura em Portfolio/PDF.

1. Criar migração (via MCP `apply_migration`): tornar o bucket privado; remover a policy "Activity photos are publicly viewable"; criar policies de SELECT/INSERT/DELETE restritas a `authenticated` com prefixo do path = `family_id` do utilizador (convém que o path dos uploads seja `{family_id}/...` — verificar com grep `storage.from` em `src/` e ajustar o path de upload se necessário).
2. No cliente, substituir `getPublicUrl` por `createSignedUrl` (TTL 1h) em todos os pontos de leitura: grep `getPublicUrl` em `src/` e corrigir um a um (esperado: Activities, Portfolio, PDFs, missões com `photo_url`).
3. Migrar ficheiros existentes para o novo esquema de paths se houver (verificar com `list` — em testes internos pode haver poucos/nenhuns).

**Aceitação:** URL antiga pública devolve 400/403; fotos continuam visíveis na app autenticada e nos PDFs.

## Passo 1.5 — Limpar advisors de segurança

Aplicar uma migração única (MCP `apply_migration`) com:
1. `ALTER FUNCTION ... SET search_path = ''` (qualificar referências internamente) para: `handle_updated_at`, `accept_family_invite`, `remove_family_member`, `my_family_id`.
2. `REVOKE EXECUTE ... FROM anon` em `accept_family_invite`, `remove_family_member`, `my_family_id` (manter para `authenticated` — a RLS depende de `my_family_id`).
3. **[HUMANO]** Ativar *leaked password protection* no dashboard Supabase (Auth → Passwords).
4. Correr `get_advisors(security)` e confirmar que os WARN listados no diagnóstico desapareceram.

## Passo 1.6 — Fonte única do currículo

1. Apagar do repo: `curriculo_2ano_portugal.json` (raiz), `src/lib/curriculo_2ano_portugal.json`, pasta `curriculos/` (raiz). **Antes de apagar**, grep pelos nomes para confirmar que nada os importa; `src/data/curriculos/*.json` só pode ser apagado se `src/lib/curriculumLoader.ts` deixar de os usar — verificar primeiro quem chama `curriculumLoader.ts` e migrar esses consumos para os hooks que leem da BD (`useCurriculum`, `useChildCurriculum`).
2. Se o `curriculumLoader.ts` for usado pelo prompt do planeador, esse consumo já terá morrido no Passo 1.2 (a edge function lê da BD). Confirmar e apagar o loader + JSONs.
3. Documentar num comentário no topo de `src/hooks/useCurriculum.ts`: "Fonte única do currículo: tabelas curriculum_contents / curriculum_disciplines / nexseed_curriculum".

**Aceitação:** `npm run build` e testes verdes; `/learning-areas`, `/roteiro-anual` e geração de plano continuam funcionais.

## Passo 1.7 — Integridade de dados (rápido)

Migração única:
1. `ALTER TABLE weekly_plans ADD CONSTRAINT weekly_plans_family_week_unique UNIQUE (family_id, week_start);` (verificar duplicados antes; em 5 registos é trivial).
2. CHECK em `children.school_year` limitado aos valores usados pela app (grep dos valores em `src/lib/constants.ts` / formulário de `src/pages/Children.tsx` antes de fixar a lista).
3. Repor sincronia de migrações: `supabase migration list` e marcar como aplicadas as que já estão em produção (012, 013) — ou adotar daqui em diante o fluxo exclusivo via MCP `apply_migration` e arquivar a pasta local com um README a indicar isso.

---

## Ordem e dependências
1.2 é o passo central; 1.1 conclui-se imediatamente a seguir a 1.2. Os restantes (1.3–1.7) são independentes entre si e podem ser executados por qualquer ordem depois de 1.2.
