# NexSeed V2 — Ponto de Situação
**Atualizado:** 25 de março de 2026

---

## Stack Técnica

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui + framer-motion
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **IA:** Gemini 2.5 Flash (Motor Criativo)
- **PDF:** @react-pdf/renderer
- **Dados:** TanStack React Query (useQuery / useMutation)
- **Deploy:** Vercel → nextseed.pt (ligado ao branch `main` do GitHub)

---

## Fase 1 — Motor de Automação

| # | Funcionalidade | Estado |
|---|---|---|
| 1.1 | Formulário de input semanal (interesses, projetos) | ✅ WeeklyPlanner com Gemini |
| 1.2 | Geração automática cruzando interesses + currículo | ✅ Motor Criativo (Gemini 2.5 Flash) |
| 1.3 | Dinâmicas específicas (leitura, sexta, projetos) | ✅ Projetos com fases |
| 1.4 | Email automático com 2 PDFs | ⚠️ PDF trimestral existe; envio por email ainda não implementado |

---

## Fase 2 — App Principal

### ✅ Concluído e ligado ao Supabase

| Página | Rota | Detalhe |
|---|---|---|
| Dashboard | `/` | Visão geral da semana, atividades recentes |
| Perfis das Crianças | `/children` | CRUD completo, ligado à tabela `children` |
| Áreas de Aprendizagem | `/learning-areas` | Currículo DGE real para Pré-escolar, 1º, 2º, 3º e 4º ano |
| Planeador Semanal | `/weekly-planner` | Geração com Gemini + currículo real |
| Motor Criativo | `/creative-engine` | Gemini 2.5 Flash; "Realizar" → Atividades; "Guardar" → Projetos |
| Registo de Atividades | `/activities` | Upload de fotos (Supabase Storage), portfólio, PDF trimestral |
| Projetos | `/projects` | Fases com checkboxes, biblioteca de templates, ligado à BD |
| Missões do Mundo | `/world-missions` | Gamificação com pontos, por criança, persistido no Supabase |
| Portfólio | `/portfolio` | Timeline real com filtros por criança e disciplina |
| Relatórios | `/reports` | KPIs reais, gráfico de tendência, export PDF trimestral |
| Literacia Financeira | `/financial-literacy` | Página existente |
| Literacia Digital | `/digital-literacy` | Página existente |

### ⚠️ Parcialmente implementado

| Página | Rota | Estado |
|---|---|---|
| Formação para Pais | `/parent-training` | Estrutura existe, conteúdo mock |

### ⏳ Por fazer (mock ou vazio)

| Página | Rota | Estado |
|---|---|---|
| Comunidade | `/community` | Mock — sem ligação a BD |
| Fórum | `/forum` | Mock — sem ligação a BD |
| Agenda / Calendário | `/calendar` | Mock — sem eventos reais |

---

## Base de Dados (Supabase)

### Tabelas principais

| Tabela | Descrição |
|---|---|
| `families` | Uma família por conta |
| `children` | Crianças da família (nome, ano escolar, interesses) |
| `activities` | Atividades registadas (data, disciplina, fotos, descrição) |
| `projects` | Projetos com fases em JSONB |
| `mission_completions` | Completações de Missões do Mundo (por criança, com pontos) |
| `curriculum_disciplines` | Currículo DGE — 5 anos escolares × 6–7 disciplinas |
| `weekly_plans` | Planos semanais gerados pelo Gemini |

### Storage

| Bucket | Uso |
|---|---|
| `activity-photos` | Fotos das atividades (público, upload autenticado) |

### RLS
Todas as tabelas usam `my_family_id()` para isolamento de dados por família.

---

## Currículo DGE (na BD)

| Ano | Disciplinas | Estado |
|---|---|---|
| Pré-escolar | Linguagem, Matemática, Expressão Artística, Conhecimento do Mundo, Ed. Física, Formação Pessoal | ✅ |
| 1º ano | Português, Matemática, Estudo do Meio, Ed. Artística, Ed. Física, Cidadania | ✅ |
| 2º ano | Português, Matemática, Estudo do Meio, Inglês (AEC), Ed. Artística, Ed. Física, Cidadania | ✅ |
| 3º ano | Português, Matemática, Estudo do Meio, Inglês, Ed. Artística, Ed. Física, Cidadania | ✅ |
| 4º ano | Português, Matemática, Estudo do Meio, Inglês, Ed. Artística, Ed. Física, Cidadania | ✅ |

Fontes JSON em `src/data/curriculos/` e `curriculos/` (raiz). Usados pelo Motor Criativo via `curriculumLoader.ts` e pela página `/learning-areas` via `useCurriculum()` (Supabase).

---

## Próximos Passos Sugeridos

1. **Email automático** — Edge Function Supabase + Resend API para enviar os 2 PDFs à sexta-feira (o passo mais próximo do objetivo original da Fase 1)
2. **Prémios (Missões do Mundo)** — sistema de prémios definidos pelos pais, resgatáveis com pontos
3. **Relatórios estatísticos** — gráficos de progressão face aos objetivos do currículo ao longo do tempo
4. **Comunidade / Fórum** — se houver interesse em abrir a plataforma a outras famílias

---

## Crianças da Família Malta

| Nome | Ano Escolar |
|---|---|
| Bryan Malta | 2º ano |
| Noa Malta | Pré-escolar |
