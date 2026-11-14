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

## Plano semanal: o que o pedido ao Gemini leva (publicado a 13 nov)
- Sem conteúdos marcados como "em progresso": os conteúdos dessa semana no Rumo do ano (desde 13 nov, P-12). Em pausas, semanas de balanço e fora do ano letivo: os conteúdos do período atual (set–dez 1.º, jan–mar 2.º, abr–ago 3.º). Antes ia o ano inteiro, duas vezes.
- Com conteúdos marcados como "em progresso", o plano parte desses, como antes.
- Contexto "por dominar": período atual e seguinte.
- Com várias crianças, o "Ver Mundo" de sexta é uma só saída para a família.

### Guia da semana no formato da F-02 (P-22, publicado a 14 nov)
- O Guia de Atividades (PDF) passa a abrir com "A semana em resumo" (conteúdos do Rumo do ano por criança, com as páginas do manual quando há) e "Domingo: preparar a caixa da semana" (materiais, sem imprimir nada), seguidos do portefólio.
- No fim: guião de perguntas por dia, versão curta para dias difíceis (45 minutos), registo de 2 minutos por dia e balanço da semana com os conteúdos para assinalar.
- Textos fixos em `src/lib/weekGuide.ts`. Sem alterações na BD nem na IA. Ficou de fora o "fio condutor" escrito no topo: a IA escolhe-o, mas ainda não o devolve à parte.
### Atividades mais variadas e mais fáceis de dar (P-06 a P-09, publicado a 14 nov)
- P-06: a app atribui um formato a cada bloco (`src/lib/activityFormats.ts`), a rodar ao longo da semana por criança e disciplina; irmãos à mesma hora têm formatos diferentes, exceto nos blocos em conjunto. Substitui a regra que pedia à IA para não repetir.
- P-07: nas atividades com o adulto (ou na primeira de cada disciplina, com uma criança), a descrição acaba com "Para explicar:", uma forma simples de explicar diferente da do manual.
- P-08: episódios de leitura curtos (até 120 palavras) e concretos.
- P-09 (parcial): regra de dificuldade por ano e ritmo. Ainda não usa o progresso marcado nas Áreas de Aprendizagem.
- Só instruções à IA e código da app; sem BD. P-07, P-08 e P-09 dependem de a IA seguir as regras.
### Ritmo do ano e fecho da semana (P-14, P-19, P-20, publicado a 14 nov)
- "Fechar a semana" (Rumo do ano, cartão Esta semana): os conteúdos dessa semana, tema a tema, com "Ficou aprendido" ou "Precisa de mais". Grava nas Áreas de Aprendizagem (`child_content_progress`).
- Ao guardar um plano novo, a mesma janela pergunta pela semana anterior. Substitui o diálogo antigo, que mostrava todos os conteúdos do ano por dominar.
- Ritmo: no cartão de cada criança, quantos conteúdos das semanas passadas estão aprendidos e quantos a retomar, sem linguagem de atraso.
- Atraso sem culpa: numa semana com rumo, o plano leva os conteúdos da semana e, por cima, até 2 por disciplina marcados "Precisa de mais" (`src/lib/weekClose.ts`). Antes, qualquer conteúdo "em progresso" substituía o rumo inteiro.
- Sem BD nova.

### Folha para imprimir (R-07, publicado a 14 nov)
- No plano gerado, botão "Folha para imprimir": uma página A4 com a semana toda (hora, disciplina, título e modo por criança), os materiais e o que guardar para o portefólio (`src/components/pdf/WeekSheetPDF.tsx`). O Guia de Atividades fica como versão detalhada para ler no ecrã.
- Não vai no email do plano. Relatórios e portefólio compactos ficam por fazer.

### Sugestões para o portefólio (R-10, publicado a 14 nov)
- Em cada plano, a app marca 3 a 4 atividades por criança como boas para o portefólio e diz o que guardar. A IA propõe (campo `portfolio` na resposta); a app limita a 4, prefere disciplinas diferentes e completa até 3 com dicas por disciplina (`src/lib/portfolioHints.ts`). A leitura nunca é sugerida.
- A sugestão fica no fim da descrição (" | Portefólio: …"). Aparece em cada atividade e num resumo "Para o portefólio esta semana" na vista de cada criança e no topo do Guia de Atividades (PDF).
- Sem alterações na base de dados. Planos antigos não mudam.
- Por fazer do R-10: o registo de 2 minutos por dia e ligar a sugestão ao ecrã de registo da atividade.
- Por testar: a qualidade das sugestões com a IA real.

### Semana em família e menos preparação (P-10, P-23, publicado a 14 nov)
- Com duas ou mais crianças, cada bloco tem um modo, calculado pela app (`src/lib/familyWeek.ts`) e escrito no início da descrição: "Em conjunto:", "Com o adulto:" ou "Sozinho(a):". Nunca há duas crianças com o adulto à mesma hora; o adulto alterna de bloco para bloco.
- Em conjunto: Estudo do Meio, Expressão, Projeto, Leitura e a sexta-feira. O título é o mesmo para todas (garantido por código); a descrição diz o que cada uma faz. A leitura é uma só história por episódio, com uma pergunta por criança.
- Para todas as famílias: a IA escolhe um fio condutor para a semana a partir dos conteúdos, usa os interesses em no máximo uma em cada três atividades e só pede materiais que já existem em casa (nada para imprimir ou fabricar).
- Sem alterações na base de dados nem em edge functions. Planos antigos não mudam.
- Por testar: a geração com a IA real. O que depende da IA (fio condutor, materiais, interesses, atividades realmente autónomas) só se confirma a gerar planos. O PDF de leitura ainda imprime a história uma vez por criança.
- O Plano Semanal mostra, por criança, o que o Rumo do ano traz para a semana, e não pede à família que escolha conteúdos (P-21, P-12).

## Rumo do ano (publicado a 13 nov)
- Página `/roteiro-anual`, no menu como "Rumo do ano" (antes "Currículo Anual"). Mostra o ano letivo semana a semana por criança (1.º ao 4.º ano), um cartão "Esta semana" com todas as crianças e uma vista por disciplina.
- O plano é calculado, não guardado: `src/lib/annualPlan.ts` distribui os `curriculum_contents` (período, domínio, ordem) pelas semanas. Sem alterações na BD.
- Calendário: o escolar oficial do 1.º ciclo, à semana, com pausa no Natal e na Páscoa (37 semanas em 2026/27). A última semana de cada período é de balanço. Ainda não há calendário por família (P-24, P-04).
- Limite conhecido: a ordem dentro de cada período vem do currículo carregado (por domínio). Não foi validada por uma família.

### PDF do ano (P-24, publicado a 14 nov)
- No Rumo do ano, "Descarregar o ano (PDF)": o ano da criança escolhida, semana a semana, por período, com datas, conteúdos por disciplina (ou unidades e páginas do manual), semanas de balanço e uma caixa para assinalar. Gerado no browser (`src/components/pdf/AnnualPlanPDF.tsx`).
- Um PDF por criança. A vista de família (várias crianças lado a lado) continua por fazer.

## Índices dos manuais (I-01, publicado a 14 nov)
- No Rumo do ano, cada criança tem a caixa "Manuais": a família escreve o índice (uma unidade por linha, com a página no fim se quiser). Um manual por disciplina (Português, Matemática, Estudo do Meio, Inglês, Artes).
- Nessa disciplina, o rumo deixa de usar o currículo e reparte as unidades do manual pelas semanas (mais semanas para unidades com mais páginas), a partir da semana em que o manual é adicionado ou desde o início do ano letivo. O plano semanal envia à IA a unidade e as páginas da semana, com a regra de nunca inventar nem reproduzir o conteúdo do manual.
- Crianças sem currículo na app (pré-escolar, 5.º e 6.º ano) passam a ter rumo se tiverem um manual.
- **Base de dados:** o Gil aplicou a migração `026_child_manuals.sql` e voltou a publicar `export-family-data` a 14 nov (a tabela entra na exportação de dados; a eliminação de conta já a apaga em cascata). Sem a migração, a caixa mostra só um aviso e tudo o resto funciona.
- Fronteira: só títulos e páginas, escritos pela família e visíveis só para ela (RLS). A questão de direitos de autor A-09 (doc 10) não foi validada por um jurista.
- Por testar: geração real com a IA e gravação na base de dados real (só testado com dados simulados).

## Calendário da família (P-24, publicado a 14 nov)
- No Rumo do ano, "Ajustar as semanas": data de início e de fim do ano, lista de pausas (vem com o Natal e a Páscoa do calendário escolar) e semanas de balanço ligadas ou desligadas. Uma linha por família; sem linha, vale o calendário escolar.
- O rumo (currículo e manuais) e o plano semanal passam a usar estas semanas. Uma semana conta se tiver pelo menos três dias de aulas.
- Períodos: num ano que começa entre agosto e outubro e dura até 12 meses, seguem as datas habituais (até dezembro, até à Páscoa, depois); noutros casos, o ano divide-se em três partes iguais.
- Limite: o calendário vale para um ano; no ano seguinte a família volta a ajustá-lo (até lá a app usa o escolar). Dias da semana e minutos por dia continuam por fazer (P-04).
- **Base de dados:** o Gil aplicou a migração `027_family_calendars.sql` a 14 nov.
- Por testar: gravação na base de dados real.

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
