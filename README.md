# NexSeed 🌱

Plataforma de **ensino doméstico (homeschooling)** para famílias portuguesas. O coração do produto é o **Planeador Semanal com IA**: cruza o currículo nacional (DGE), a metodologia pedagógica da família e os interesses de cada criança para gerar, todas as semanas, um plano de 5 dias com atividades concretas — entregue em PDF por email.

O modelo mental da app são quatro verbos: **Planear · Fazer · Registar · Provar**.

## Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui + framer-motion
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **IA:** Gemini 2.5 Flash, via edge function autenticada (`generate-weekly-plan`) — a chave vive só no servidor
- **PDF:** @react-pdf/renderer · **Email:** Resend · **Dados:** TanStack React Query
- **Deploy:** Vercel → nexseed.pt (branch `main`)

## Correr localmente

Requisitos: Node.js + npm. Criar `.env.local` com:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

(As chaves Gemini **não** vivem no cliente — são secrets das edge functions no Supabase.)

```sh
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run test     # testes (vitest)
npm run lint     # eslint
```

## Estrutura

```
src/
  pages/         Páginas (uma por rota)
  components/    Componentes partilhados (ui/ = shadcn)
  hooks/         Hooks de dados (React Query sobre o Supabase)
  lib/           Núcleo: geminiPlanner, planGenerator, tipos, currículo
  content/       Conteúdo estático (ex: Manual de Instruções)
  contexts/      AuthContext (sessão + família)
supabase/
  functions/     Edge functions (Deno)
  migrations/    Migrações SQL (registo; aplicar via Supabase)
```

## Planeamento

O plano de evolução do produto para o mercado está em [`2. PLANO DE IMPLEMENTACAO/`](./2.%20PLANO%20DE%20IMPLEMENTACAO/): diagnóstico + 4 fases (segurança, onboarding/manual, consolidação, go-to-market), com o estado de execução registado no topo de cada ficheiro de fase.

## Notas

- Idioma de toda a UI e conteúdo: **português europeu**.
- Currículo: a fonte de verdade é a base de dados (`curriculum_contents`, `curriculum_disciplines`, `nexseed_curriculum`).
- Migrações: o histórico local pode estar dessincronizado; preferir aplicar/registar via Supabase.
