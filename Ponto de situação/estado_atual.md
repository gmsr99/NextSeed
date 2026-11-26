# NexSeed — Ponto de situação
**Atualizado:** 26 de novembro de 2026 (plano essencial e mapa da criança publicados; rumo em família, Financinhas no plano, kit e Direitos e deveres por publicar). Versão anterior: 12 de novembro de 2026 (auditoria ao código de 4 nov)

O que falta fazer está em `BACKLOG.md`. Este ficheiro descreve o que **existe**.

## Fase do projeto
Beta com famílias convidadas, sem pagamentos. Lançamento comercial da coorte fundadora previsto para janeiro de 2027. Último trabalho de código antes desta auditoria: julho de 2026 (FASES 1 a 5); setembro só teve um commit de teste.

## Stack
React + TypeScript + Vite + Tailwind + shadcn/ui · TanStack Query · Supabase (Postgres/RLS, Auth, Storage privado, 8 edge functions) · Gemini 2.5 Flash via edge function · PDFs no browser · PWA · Vercel → nexseed.pt (branch `main`).

## Funcionalidades disponíveis (rotas)
| Área | Rotas |
|---|---|
| Planear | `/` (dashboard "Hoje" com conclusão de atividades), `/weekly-planner` (gerador com regeneração por atividade), `/roteiro-anual`, `/creative-engine` (Ideias Rápidas), `/projects`, `/calendar` |
| Aprender | `/learning-areas`, `/curriculum`, `/world-missions` (com prémios), `/financinhas` (só equipa por agora; `/financial-literacy` redireciona), `/digital-literacy` |
| Registar e provar | `/activities` (com fotos), `/portfolio`, `/reports` (PDF trimestral) |
| Sistema | `/children`, `/metodologias`, `/extracurricular`, `/settings` (exportar dados, eliminar conta), `/onboarding`, `/ajuda` (manual), `/admin/feedback` (equipa) |
| Públicas | `/login`, `/privacidade`, `/termos`, `/accept-invite` |

Fórum, Comunidade e Formação para Pais existem no código mas estão fora do menu e das rotas (mocks).

## Financinhas (publicado a 22 nov, aberto a todas as contas; migração 031 aplicada a 25 nov)
- O protagonista nunca é o primeiro nome de uma criança da família (`avoidNames` no motor); a lista de nomes não tem nomes do piloto.
- Substitui a antiga página estática de Literacia Financeira (tinha juros e investimento, contra as regras do módulo). Sai também a barra "Literacia Financeira" dos Relatórios.
- Lógica em `src/lib/financinhas/`: `catalog.ts` (26 competências, 23 temas, 12 sessões do trilho × 3 escalões, 8 modos de descoberta, protagonistas, fotografia, ritual), `engine.ts` (motor determinístico), `levels.ts` (níveis derivados dos eventos; uma observação nunca faz descer), `generator.ts` (pedido ao Gemini com resposta estruturada; a app monta o prompt da apresentação ≤ 5000 caracteres, valida slides, quiz e termos proibidos, e repete com correção), `ritual.ts`, `importer.ts`, `access.ts`. Testes em `src/lib/__tests__/financinhas.test.ts`.
- BD: migração 031 (`fin_profiles`, `fin_lessons`, `fin_signals`, `fin_skill_events`, `fin_rituals`, `fin_snapshots`, RLS por família, cascata com a criança). As tabelas entram no export de dados (edge function `export-family-data`, a publicar à parte).
- Ao Gemini vai: escalão etário, interesse, situação escrita pelo adulto, plano do motor e protagonista fictício. Nunca o nome nem a data de nascimento.
- Visível só para a equipa (`FINANCINHAS_FOR_ALL = false`) até à Q-03 e à Q-19.
- Por fazer: kit em PDF (I-20), ligação ao plano semanal (I-21) e aos relatórios (I-22).

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

## Metodologias, pré-escolar e fecho da semana (publicado a 15 nov)
- Cada metodologia tem um papel (`src/lib/methodologyRoles.ts`): percurso próprio (Montessori, Charlotte Mason, Clássica), ritmo (Waldorf, Forest School, Pikler) ou forma de trabalhar (as restantes). Só a principal organiza; as outras duas temperam a forma. A página Metodologias explica isto.
- Pré-escolar (P-16): a semana segue um fio condutor pelas três áreas das Orientações Curriculares, o mesmo dos irmãos. Com Montessori como principal, organiza pelas cinco áreas; a app não inventa a sequência de materiais (I-02, à espera da F-03).
- A IA devolve o tema da semana; aparece no plano e no guia e fica guardado em `weekly_plans.reading_theme` quando a família não escreveu um tema de leitura.
- Fechar a semana: além de "Ficou aprendido" e "Precisa de mais", duas linhas opcionais por criança (o que ganhou, onde teve dificuldade), guardadas no Diário como "Fecho da semana". Não são enviadas à IA (Gemini ainda no gratuito, B-01).
- A IA recebe até três conteúdos "[já domina]" por disciplina em foco, para ajustar o nível (P-09).
- Sem alterações à base de dados.
- Por testar: geração real com a IA (só o texto do pedido foi verificado) e gravação da entrada do Diário na base de dados real.
- Por decidir: referência por criança em vez do currículo nacional como base (P-25, Q-14).

## Manuais: vários por disciplina e página onde vão (17 nov)
- O cartão de manuais grava por id. Com a migração **029** (aplicada a 25 nov) pode haver mais do que um manual na mesma disciplina (ex.: manual e caderno de fichas); cada um segue o seu índice e o nome do manual aparece à frente de cada tema. Antes da 029 o segundo manual não grava e a família vê uma mensagem clara.
- "Já fizeram até à página": marca como feitos os temas anteriores e retoma o tema começado na página seguinte (marcas `done`/`from` dentro de `entries`, sem coluna nova). O rumo passa a repartir o que falta a partir desta semana.
- Testado com dados simulados num browser; não testado na base de dados real.

## Correções dos testes de 16 nov
- **Plano Semanal não se perde (T-11):** a app recarregava o ecrã sempre que voltava ao primeiro plano (evento de sessão do Supabase) e apagava o plano por guardar. Corrigido no `AuthContext`. Além disso, o formulário e o plano por guardar ficam num rascunho neste dispositivo (`src/lib/planDraft.ts`), por família e semana; apaga-se ao guardar e ao terminar a sessão.
- Erros ao guardar passam a mostrar o motivo. A falha "não deixa guardar" não foi reproduzida como erro da base de dados; a causa provável era o recarregamento acima. Por confirmar (V-31).
- **Manuais, cursos e PDF (I-01):** uma linha por tema; a unidade repetida no início da linha é reconhecida ("3 temas, em 2 unidades"). O cartão serve também para cursos e PDF comprados: cola-se o índice, o ficheiro fica com a família. Carregar o ficheiro não está feito (I-14, Q-17).

## Lição seguinte com índice, Tradição em Metodologias e lembrete de domingo (22 nov, ramo `feat/licao-indice-e-domingo`)
- **Lição seguinte (I-16):** o modo guarda-se como uma linha marcadora no fim de `child_manuals.entries` (`{ next: true, lessonDays }`), a seguir ao índice, se houver. `indexEntries()` tira-a; as posições das outras linhas não mudam. Com índice, as lições por dar repartem-se pelas semanas que faltam **a contar da semana atual** (`buildAnnualPlan(..., now)`), e cada uma aparece como "Lição seguinte · <título>". Sem pergunta sobre a duração da lição: o ritmo acerta-se com o que a família marca no fecho. No Início, o previsto até hoje destes manuais é a fração do ano já passada.
- **Tradição (I-08):** o cartão aparece também em Metodologias (`#tradicao`); no Início, uma linha discreta, uma vez, só para quem tem o convite.
- **Lembrete de domingo (DASH fase 5):** migração **033**, aplicada a 25 nov (`family_notification_prefs`, `sunday_reminders_sent`), função `send-sunday-reminder` (só aceita a service role key; envia às 20h de Lisboa, uma vez por família e semana, ao `families.email`; não envia em pausas nem a quem já tem plano), cartão em Definições. O agendamento (pg_cron + pg_net + Vault) está comentado no fim da 033. `?teste=<family_id>` envia já, só para essa família.
- **Não testado:** browser e base de dados real; a função não foi executada.

## Início redesenhado, DASH (22 nov)
- `src/pages/Index.tsx`: Hoje (sem cor) com os itens de cada criança e caixa (`weekly_plan_items.completed_at`); caixas **A semana** (em dia, quase lá, por preparar) e **O ano** (ritmo até 30 de junho, folga até 31 de julho). Fim de semana sem plano: "A próxima semana" com o rumo. Sem Missões.
- `src/lib/dashboard.ts`: regras da semana e do ritmo (testes em `dashboard.test.ts`). Dado = `dominado`; dado + precisa de mais = `em_progresso` (sem migração). O ritmo conta os dois; o recente usa `updated_at` das últimas 4 semanas.
- `WeekCloseDialog` refeito: dado, precisa de mais e nota (Diário, nunca para a IA); manuais marcam a unidade feita na última parte. Popup à sexta depois das 12h, uma vez (localStorage).
- Planeador: os temas da semana anterior que não foram dados voltam com os "em progresso" (até 2 por disciplina), só para quem marcou algum tema nos últimos 14 dias. `?semana=proxima` abre a semana seguinte.
- **Não testado num browser** (sem conta de demonstração nem pré-visualização acessível). Por fazer: fase 5 (email de domingo).

## Catecismo em família (26 nov, ramo `feat/catecismo-em-familia`, por publicar)
- I-08 fase 2: `src/lib/tradicao/catechism.ts` (lê a lista colada, pergunta da semana, cinco etapas seg–sex), `useFamilyCatechism` (sem a migração **038**, `available=false` e a tradição funciona como antes), `CatechismSettings` dentro do cartão da Tradição em Definições, linha no `LiturgyWeekCard` do Planeador e caixa no Guia de Atividades. Só números e títulos; as respostas ficam no livro. Nada vai para a IA. Desligar a tradição apaga a linha e o catecismo.

## Rumo em família, Financinhas no plano, kit e Direitos (26 nov, ramo `feat/rumo-familia`, por publicar)
- **P-24** (`src/lib/familyYear.ts`): "A família" no seletor do Rumo do ano (com 2+ crianças com rumo). Semanas alinhadas pela segunda-feira; "Para fazerem juntos" quando 2+ crianças têm Estudo do Meio, Artes ou FPS na mesma semana, com o domínio quando coincide. Português, Matemática e Inglês nunca são comuns. Sem BD.
- **I-21** (`src/lib/financinhas/weekSession.ts`, `FinancinhasWeekCard`, `FinancinhasWeekPDF`): no Plano Semanal, por criança com perfil, o dia da semanada e a aula `por_dar` mais antiga, com "Copiar o prompt"; em Descarregar PDFs sai `nexseed-financinhas-*.pdf` (guia, quiz, atividades, desafio; emojis dos mealheiros trocados por palavras). Não gera aulas nem mexe no horário.
- **I-20** (`FinancinhasKitPDF`): botão "Kit de arranque (PDF)" na página Financinhas, 5 páginas; círculos do Mapa de Moedas com 25 mm.
- **I-13** (`/direitos`, `src/content/direitos.ts`, acesso em `src/lib/direitosAccess.ts`): o essencial do DL 70/2021 (e DL 8/2025) com o artigo em cada ponto e 5 modelos de requerimento. **Só a equipa vê** até à revisão jurídica (Q-20).
- **Não testado num browser nem com PDFs gerados** (sem node_modules nesta sessão e sem conta de demonstração): build e testes da Vercel por confirmar no ramo.

## Plano essencial e mapa da criança (26 nov, publicado; migração 036 e `send-weekly-plan` por aplicar)
- **P-27** (`src/lib/essentialPlan.ts`): a leitura de terça sai (`dropReadingDay`), os blocos da tarde (≥ 14:00, menos leitura e saída) levam o prefixo "Se houver tempo · " no título (`markOptional`, nos dois geradores e ao regenerar), o pedido à IA leva "~N min" por bloco (`targetMinutes`: pré 8/10/12, 1.º 15, 2.º 18, 3.º 20, 4.º 25) e a regra 17 (duração). Horário sem horas por omissão: `SchedulePDF` mostra a ordem dos blocos, `WeekSheetPDF`, `ActivityGuidePDF` e o Planeador mostram a duração (`slotText`). A opção vive em `family_week_routines.schedule_mode` (migração **036**); sem a 036, lê-se e grava-se sem a coluna e fica sem horas. No Início, as opcionais não contam para "Em dia".
- **R-11** (`ChildWeekMapPDF`): uma página por criança, com desenhos SVG simples por disciplina (sem imagens externas), caixas, tarefas da casa e autocolantes. Nos PDF descarregados e no email (`send-weekly-plan` aceita `mapB64`/`mapName`; precisa de ser publicada de novo).
- Corrigido também: o Hoje mostrava a disciplina pela chave interna ("language"); o fecho da semana comparava chaves com nomes e não pré-marcava.

## Financinhas no relatório trimestral (26 nov, ramo `feat/financinhas-relatorio`)
- `src/lib/financinhas/report.ts`: três competências fortes (nível ≥ 2) e três a trabalhar, só com eventos observados até ao fim do período; sem secção com menos de duas observadas. `TrimesterReportPDF` mostra a secção antes da declaração; em Relatórios há a opção "Incluir Financinhas" (ligada por omissão). Nada vai para a IA.
- A capa do relatório citava o Decreto-Lei 55/2018 e o Despacho Normativo 10-B/2018 (regime antigo); passa a citar o Decreto-Lei n.º 70/2021, que aprova o regime jurídico do ensino individual e do ensino doméstico.

## Financinhas aberto a todas as contas (22 nov)
- `FINANCINHAS_FOR_ALL = true` em `src/lib/financinhas/access.ts`, por decisão do Elton (só duas famílias em teste). Antes de entrarem famílias novas: Gemini pago (Q-03) e documento 04. O convite por família (`pilot_features` 'financinhas') fica no código para quando se voltar a fechar.

## Lição seguinte e Tradição da família (publicado a 22 nov)
- **Lição seguinte (I-16):** cada manual pode ser seguido pelo índice ou em "lição seguinte". Guarda-se como uma entrada marcadora em `child_manuals.entries` (`NEXT_LESSON_ENTRIES`, sem migração); o rumo põe "Lição seguinte" em todas as semanas de aulas a partir do arranque e o pedido ao Gemini sabe que não conhece a lição.
- **Tradição da família (I-08, fase 1, piloto só da F-01):** `src/lib/tradicao/` calcula o ano litúrgico (Páscoa, Advento, Epifania e Batismo em Portugal, tempos, antífona mariana) nos calendários atual e de 1962, e as pausas do Natal e da Semana Santa. `celebrations.ts` tem as celebrações do Advento ao Batismo, todas por rever: a app só mostra fichas com `revisto: true`. Migração **032** (`family_traditions` com o consentimento, `pilot_features` para o convite). O cartão vive em Definições e só aparece a quem tem o convite ou é da equipa. Planeador: "Esta semana na liturgia"; Guia de Atividades: a mesma caixa; horário: "Orações e liturgia". Nada vai para a IA.
- Verificado: testes das bibliotecas (substituto do vitest) e verificação de tipos com declarações simplificadas. **Não testado:** browser e base de dados real.

## Manuais e "A nossa semana" (publicado a 22 nov)
- **Onde vão no manual (I-16):** o cartão pergunta "Onde vão neste manual?" (ainda não começámos / já começámos). Já começámos pede a última página feita (índice com páginas) ou o tema onde vão (sem páginas); sem resposta não guarda. O rumo reparte o que falta a partir da semana que estão a preparar: ao sábado e ao domingo, a seguinte (`planningMonday` em `annualPlan.ts`). Os manuais já guardados ao fim de semana ficam corrigidos sem os editar. Saiu a opção "Desde o início do ano".
- **A nossa semana (P-18, parte do P-04):** tabela `family_week_routines` (migração **030**, aplicada a 25 nov): para cada dia, dia completo, dia curto (só a manhã, antes das 10:42) ou sem estudo, e se há saída à sexta. `src/lib/familyRoutine.ts` aplica-a ao esqueleto do plano com IA, ao plano sem IA, aos blocos fixos do horário e às perguntas do guia. Sexta sem saída fica com a estrutura de segunda (sem leitura); os episódios de leitura renumeram-se. Sem linha na tabela (ou antes da 030), tudo fica como antes.
- Verificado: testes das bibliotecas (corridos com um substituto do vitest, sem dependências instaladas) e verificação de tipos com declarações simplificadas. **Não testado:** num browser e na base de dados real.

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
- **Base de dados:** desde 25 nov o Claude tem acesso à produção (ver "Acesso ao Supabase" no CLAUDE.md). A 25 nov aplicou as migrações 029 a 033 (verificadas: tabelas, RLS e políticas). A 034 (cascata dos convites ao apagar a conta) foi aplicada no mesmo dia, junto com a nova `delete-family-account`, que deixa de responder "ok" quando a eliminação falha. Falta a 028 (consentimentos). Ainda por publicar: `analyze-curriculum-coverage`, `export-family-data`, `send-sunday-reminder` e o agendamento do lembrete de domingo.
- **Repositório público temporariamente** (desde 5 nov à noite) para a Vercel Hobby aceitar publicações de colaboradores; volta a privado no fim desta ronda de trabalho (B-11). O histórico do git ainda contém nomes da família piloto (removidos dos ficheiros atuais).

## Famílias no beta
Ver documento 10 (base de conhecimento do projeto). Aqui não se registam nomes.
