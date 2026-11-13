# NexSeed — Ponto de situação
**Atualizado:** 12 de novembro de 2026 (auditoria ao código de 4 nov; substitui a versão de março)

O que falta fazer está em `BACKLOG.md`. Este ficheiro descreve o que **existe**.

## Fase do projeto
Beta com famílias convidadas, sem pagamentos. Lançamento comercial da coorte fundadora previsto para janeiro de 2027. Último trabalho de código antes desta auditoria: julho de 2026 (FASES 1 a 5); setembro só teve um commit de teste.

## Stack
React + TypeScript + Vite + Tailwind + shadcn/ui · TanStack Query · Supabase (Postgres/RLS, Auth, Storage privado, 8 edge functions) · Gemini 2.5 Flash via edge function · PDFs no browser · PWA · Vercel → nexseed.pt (branch `main`).

## Funcionalidades disponíveis (rotas)
| Área | Rotas |
|---|---|
| Planear | `/` (dashboard "Hoje" com conclusão de atividades), `/weekly-planner` (gerador com regeneração por atividade), `/roteiro-anual`, `/creative-engine` (Ideias Rápidas), `/projects`, `/calendar` |
| Aprender | `/learning-areas`, `/curriculum`, `/world-missions` (com prémios), `/financial-literacy`, `/digital-literacy` |
| Registar e provar | `/activities` (com fotos), `/portfolio`, `/reports` (PDF trimestral) |
| Sistema | `/children`, `/metodologias`, `/extracurricular`, `/settings` (exportar dados, eliminar conta), `/onboarding`, `/ajuda` (manual), `/admin/feedback` (equipa) |
| Públicas | `/login`, `/privacidade`, `/termos`, `/accept-invite` |

Fórum, Comunidade e Formação para Pais existem no código mas estão fora do menu e das rotas (mocks).

## Plano semanal: o que o pedido ao Gemini leva (desde 12 nov, a aguardar aprovação)
- Sem conteúdos marcados como "em progresso": os conteúdos dessa semana no Rumo do ano (desde 13 nov, P-12). Em pausas, semanas de balanço e fora do ano letivo: os conteúdos do período atual (set–dez 1.º, jan–mar 2.º, abr–ago 3.º). Antes ia o ano inteiro, duas vezes.
- Com conteúdos marcados como "em progresso", o plano parte desses, como antes.
- Contexto "por dominar": período atual e seguinte.
- Com várias crianças, o "Ver Mundo" de sexta é uma só saída para a família.
- O Plano Semanal mostra, por criança, o que o Rumo do ano traz para a semana, e não pede à família que escolha conteúdos (P-21, P-12).

## Rumo do ano (desde 13 nov, a aguardar aprovação)
- Página `/roteiro-anual`, no menu como "Rumo do ano" (antes "Currículo Anual"). Mostra o ano letivo semana a semana por criança (1.º ao 4.º ano), um cartão "Esta semana" com todas as crianças e uma vista por disciplina.
- O plano é calculado, não guardado: `src/lib/annualPlan.ts` distribui os `curriculum_contents` (período, domínio, ordem) pelas semanas. Sem alterações na BD.
- Calendário: o escolar oficial do 1.º ciclo, à semana, com pausa no Natal e na Páscoa (37 semanas em 2026/27). A última semana de cada período é de balanço. Ainda não há calendário por família (P-24, P-04).
- Limite conhecido: a ordem dentro de cada período vem do currículo carregado (por domínio), não de um manual. Não foi validada por uma família.

## Segurança e dados: estado verificado no código
| Tema | Estado |
|---|---|
| Chaves do Gemini fora do cliente | Feito (julho). Gemini só via `generate-weekly-plan`, chaves rodadas |
| Fotos de crianças | Bucket privado, signed URLs de 1 h. Desde 5 nov: compressão no cliente (~≤350 KB) que também remove a localização GPS |
| Edge functions | Todas com autenticação (`verify_jwt`) |
| Exportar e apagar dados | Feito (edge functions `export-family-data`, `delete-family-account`) |
| Gemini em faturação paga | **Por confirmar** (B-01). É o bloqueante de RGPD nº 1 |
| Proteção de passwords comprometidas | **Por ativar** no Supabase (B-02) |
| Nomes das crianças no pedido ao Gemini | Substituídos por pseudónimos ("Criança A") no plano semanal, na regeneração e nas Ideias Rápidas; o nome é reposto no resultado (P-03, publicado a 5 nov). A análise de cobertura não envia nomes de crianças, mas envia os títulos e descrições das atividades tal como a família os escreveu |
| Análise de cobertura | Recebe o `family_id` do pedido em vez do login (B-10) |
| Privacidade e Termos | Páginas existem mas faltam: subcontratantes (Gemini), cessão da posição contratual, reembolso, consentimentos (B-07 a B-09) |

## Limites desta auditoria
- **A base de dados não foi verificada ao vivo.** Por decisão do dono do repositório (5 nov), o Claude não interage com as bases de dados de produção enquanto não houver backup (B-04, B-05). O estado acima vem do código, das migrações (001 a 025) e dos registos de execução das fases.
- **Repositório público temporariamente** (desde 5 nov à noite) para a Vercel Hobby aceitar publicações de colaboradores; volta a privado no fim desta ronda de trabalho (B-11). O histórico do git ainda contém nomes da família piloto (removidos dos ficheiros atuais).

## Famílias no beta
Ver documento 10 (base de conhecimento do projeto). Aqui não se registam nomes.
