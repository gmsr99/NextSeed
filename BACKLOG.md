# NexSeed: backlog de produto e desenvolvimento

Última atualização: 22 de novembro de 2026

Espelho em Google Docs: [NexSeed | Backlog](https://docs.google.com/document/d/1wXtLr3gHcJ5vKpuQ9a0mkORafchokye2dOJDw0dN_Cw/edit). Este ficheiro e o Doc têm o mesmo conteúdo; ver as regras de sincronização em `CLAUDE.md`.

Este backlog junta tudo o que há para fazer na app: as notas da equipa, o feedback das famílias do MVP (setembro de 2026), o documento de backlog da família piloto e a auditoria ao código de novembro. Nada foi descartado: o que não entra já fica registado com prioridade mais baixa.

As famílias aparecem como F-01, F-02 e assim por diante. Os nomes nunca entram neste documento.

Como ler:

- **Importância:** A = mexe nas duas âncoras (plano semanal ou portefólio) ou em conformidade; M = melhora a experiência de forma visível; B = desejável.
- **Urgência:** A = antes do lançamento de janeiro ou da entrega do portefólio de dezembro; M = primeiro trimestre de 2027; B = depois.
- **Esforço:** S = até 1 h; M = meio dia a 1 dia; L = vários dias.
- **Origem:** F-0X = família; Equipa = notas internas; Auditoria = revisão do código de 4 de novembro; Docs = base de conhecimento do projeto.
- **Base de dados:** Os itens marcados com BD precisam de uma migração que o Gil aplica no Supabase (o Claude não toca nas bases de dados de produção).

## Perguntas à espera de resposta

Elton: responde na coluna Resposta, quando puderes. Não tem de ser tudo de uma vez. O que responderes aqui é lido no início de cada sessão de trabalho.

| ID | Pergunta | Para quê | Resposta |
|---|---|---|---|
| Q-01 | Quem é o responsável pelos dados das famílias? Preciso do nome completo e do NIF. | Tem de aparecer na Política de Privacidade e nos Termos (B-07, B-08). Fica público no site |  |
| Q-02 | Que entidade de resolução alternativa de litígios de consumo indicamos nos Termos? | Obrigatório nos Termos (B-08). O contabilista ou o jurista sabem dizer qual se aplica |  |
| Q-03 | Quando passamos o Gemini para a versão paga (cerca de 3 € por mês)? | No gratuito, a Google pode usar o que enviamos para melhorar os produtos dela. É o bloqueante n.º 1 do documento 04 (B-01) |  |
| Q-04 | Quem faz a revisão jurídica dos textos legais? | Os rascunhos estão prontos, com 11 perguntas para o jurista (documento claude/B-07_B-08_revisao_juridica.md no projeto) |  |
| Q-05 | Publico já os rascunhos dos textos legais, com o aviso "Rascunho em revisão", ou espero pelas respostas Q-01 a Q-04? | Os textos publicados hoje são de maio de 2025 e não falam da IA. Os novos são mais corretos, mas têm campos por preencher | Esperar pelas respostas (respondido no chat a 14 nov) |
| Q-06 | O campo "Escola / Agrupamento" da ficha da criança fica (opcional) ou sai? | O documento 04 diz para não recolher a escola; a app pede-a para os relatórios |  |
| Q-07 | Os planos novos estão bons? Envia-me o PDF do Guia de Atividades de um plano gerado depois de 14 de novembro, de uma família com duas crianças. | Nunca vi um plano real com as regras novas (em conjunto, sozinho, portefólio, variedade). Só tu consegues confirmar |  |
| Q-08 | Que família testa o portefólio e o relatório numa entrega real à escola, antes de dezembro? | R-01: é a prioridade para dezembro e janeiro, e não é código |  |
| Q-10 | Páginas de exemplo (Fórum, Comunidade, Formação para Pais): escondo-as do menu até existirem a sério? | T-03: hoje aparecem com conteúdo de exemplo |  |
| Q-11 | Consegues a captura de ecrã do problema no telemóvel que a F-03 referiu? | T-08: sem ela não consigo reproduzir o erro |  |
| Q-12 | Repositório privado (B-11): o Gil publica cada entrega, ou passamos para Vercel Pro? E consegue dar-te acesso às pré-visualizações? | Com o repositório privado, as minhas publicações ficam bloqueadas. Sem acesso às pré-visualizações, só vês o que já está publicado |  |
| Q-13 | Marcos de desenvolvimento no relatório (R-05): avanço? | Pedido da F-02 e da F-05. São dados de desenvolvimento de menores: passa pelo documento 04 e mexe na base de dados |  |
| Q-14 | Em que regime está cada família do piloto: matriculada numa escola portuguesa (ensino doméstico), numa escola estrangeira ou à distância, ou outro? | Decide se o currículo nacional é a base ou só uma lente opcional (P-25). No ensino doméstico português há portefólio e provas no 4.º, 6.º e 9.º ano; fora dele não |  |
| Q-15 | Podes enviar à F-03 as 7 perguntas sobre o percurso Montessori dos 3 aos 6? Estão prontas a copiar no documento claude/Metodologias_percurso_ritmo_forma.md do projeto. | Sem a sequência de quem pratica, a app só organiza pelas cinco áreas; não inventa a ordem dos materiais (I-02) |  |
| Q-17 | Carregar o próprio PDF na NexSeed (para a app ler o índice sozinha): avançamos? Preciso de validação jurídica sobre direitos de autor antes. | Pedido teu de 16 nov. Hoje a família cola o índice e o ficheiro fica com ela. Guardar e ler ficheiros comprados a outros criadores levanta a questão A-09 do documento 10 e tem custos de armazenamento |  |

## Para testar: novidades publicadas de 13 a 15 de novembro

Elton: segue a ordem, com uma conta de duas crianças do 1.º ao 4.º ano. Na coluna Resultado escreve OK ou o que viste de diferente. Se a app instalada no telemóvel não mostrar as novidades, fecha-a e volta a abrir.

| ID | Onde | O que fazer | O que deve acontecer | Resultado |
|---|---|---|---|---|
| V-05 | Rumo do ano | Adicionar ou editar um manual, curso ou PDF: escrever uma linha por tema, repetindo a unidade no início (ex.: "Unidade 1 — Números até 100 ... 6", "Unidade 1 — Contar de 2 em 2 ... 10", "Unidade 2 — Adição ... 24") | Por baixo da caixa aparece "3 temas, em 2 unidades"; no rumo, cada semana mostra o tema e as páginas (I-01, corrigido a 16 nov) |  |
| V-14 | Plano gerado | Comparar o tipo de atividade de Português e de Matemática ao longo da semana | Tipos diferentes de dia para dia (jogo, objetos, conversa, escrita, medir); já não é sempre a mesma tarefa (P-06) |  |
| V-21 | Rumo do ano | Fechar a semana: marcar um tema Ficou aprendido e outro Precisa de mais; guardar. Depois abrir Áreas de Aprendizagem | Os dois temas mudaram de estado (Dominado e Em progresso). No plano seguinte, o segundo volta como revisão (P-14, P-20) |  |
| V-22 | Diário | Escrever um Registo de 2 minutos para as duas crianças | Aparece "Guardado no Diário" e cada criança fica com uma entrada Registo do dia no portefólio (R-10) |  |
| V-23 | Pré-escolar (se houver) | Ver o horário de uma criança do pré-escolar | A meditação aparece às 14:00 e não em cima de outra atividade (R-09) |  |
| V-24 | Metodologias | Abrir a página Metodologias | No topo, uma caixa explica o que a metodologia muda nos planos e diz qual é a vossa principal e o que ela faz (P-15) |  |
| V-27 | Rumo do ano | Tocar em "Fechar a semana", escrever uma linha em "O que ganhou" e guardar; depois abrir o Diário | No Diário fica uma entrada "Fecho da semana" nessa criança, com o que escreveste (P-19) |  |
| V-28 | Plano Semanal | Depois de marcar temas como "Ficou aprendido", gerar o plano seguinte | As atividades não voltam a ensinar esses temas e sobem um degrau (P-09) |  |
| V-31 | Plano Semanal | Num plano já guardado: tocar em Regenerar, gerar de novo e Guardar. Depois trocar uma atividade e tocar em Atualizar | Guarda sem erro e a versão sobe. Se aparecer um erro, copia-me o texto: agora mostra o motivo (T-11) |  |
| V-33 | Rumo do ano | Tocar em "Adicionar outro", escolher Matemática e colar o índice do caderno de fichas | Só depois de o Gil aplicar a migração 029: a semana de Matemática mostra os dois, cada um com o seu nome. Antes disso aparece uma mensagem a dizer que fica disponível depois de uma atualização (I-15) |  |
| V-35 | Rumo do ano ou Planeador | Em "A vossa semana", tocar em Ajustar a semana: segunda a quinta Dia completo, sexta Dia curto, desligar a saída; guardar | O cartão diz "Segunda a quinta, sexta curta, sem saída". Antes de o Gil aplicar a migração 030 aparece um aviso e não dá para ajustar (P-18, 22 nov) |  |
| V-36 | Plano Semanal | Com a semana da V-35, gerar um plano novo e descarregar os PDF | Não há "Ver Mundo"; a sexta tem só Português e Matemática de manhã; o horário e o guia seguem os mesmos dias. Experimentar também um dia "Sem estudo": esse dia fica vazio e a leitura tem menos episódios (P-18, P-04) |  |
| V-37 | Financinhas (publicado a 22 nov; depois de o Gil aplicar a migração 031) | Abrir o menu: "Financinhas" aparece a seguir a "Missões do Mundo". Abrir o endereço antigo /financial-literacy | Abre a página Financinhas. Antes da migração aparece "O Financinhas está quase pronto" (I-17) |  |
| V-38 | Financinhas | Com a criança mais nova: Começar com o Trilho, semanada sugerida, fotografia inicial. Gerar a aula da S1 com o interesse dela | Aula com 7 slides e prompt com menos de 5000 caracteres, botão Copiar, 5 perguntas faladas, atividade das três portas e a frase "As portas grandes… são os pais que abrem" no guia (I-17) |  |
| V-39 | Financinhas | Colar o prompt no Gemini Notebook ou NotebookLM | A apresentação sai em português de Portugal, sem marcas nem personagens conhecidas (I-17) |  |
| V-40 | Financinhas | Marcar a aula como dada; abrir "O que observar" e carregar em "Vi isto" num sinal | O nível dessa competência sobe em Competências; a próxima aula proposta é a S2 (I-17) |  |
| V-41 | Financinhas | Depois da S2, registar o ritual: valor, "escolhi ___ em vez de ___", usou o chão e repôs | Aparecem dois sinais para confirmar (DC1 e GP3). Nenhum nível sobe sem confirmares (I-18) |  |
| V-42 | Financinhas | Importar histórico: colar o JSON das aulas antigas, associar C1 e C2 às crianças | Mostra a lista antes de gravar; importar duas vezes não duplica; aulas sem data ficam "por dar" (I-19) |  |
| V-43 | Financinhas | Com a criança mais velha em Ciclo semanal: Gerar a aula | Tema da competência mais frágil, modo de descoberta diferente da última aula, protagonista diferente do do irmão (I-17) |  |
| V-44 | Rumo do ano | Editar um manual (ou adicionar um novo), escolher "Lição seguinte" em "Como seguem este livro?" e guardar | Não pede índice; na lista aparece "lição seguinte"; no rumo e no plano dessa disciplina aparece "Lição seguinte" todas as semanas, e a atividade diz como acompanhar sem inventar o conteúdo (I-16) |  |
| V-45 | Definições (só a F-01 e a equipa; depois da migração 032 e do convite) | Ver o cartão "Tradição da família (opcional)" e ligar: católica, calendário, próprio de Portugal, confirmar o consentimento | O cartão diz "Ligada"; a outras famílias o cartão não aparece (I-08) |  |
| V-46 | Planeador e Guia de Atividades (com a tradição ligada) | Abrir a semana de 7 de dezembro e descarregar os PDF | Aparece "Esta semana na liturgia: 2.ª semana do Advento" e a Alma Redemptoris Mater; no horário, o bloco da manhã chama-se "Orações e liturgia". Sem fichas revistas, não aparece nenhuma celebração (I-08) |  |
| V-47 | Definições (com a tradição ligada) | Tocar em "Acrescentar ao calendário da família"; depois "Desligar" | As pausas do Natal (21 dez a 3 jan) e da Semana Santa (22 mar a 4 abr) entram no calendário; desligar apaga a escolha e o Planeador deixa de mostrar a liturgia (I-08) |  |

## Ordem de implementação

| Ordem | Grande mudança | Porquê nesta posição | Imp. | Urg. | Estado |
|---|---|---|---|---|---|
| 1 | E1 · Conformidade e base | Dados de crianças em produção sem backup nem textos legais completos. Corre em paralelo e quase tudo depende do Gil ou de revisão jurídica. | A | A | Em curso |
| 2 | E8 · Correções rápidas | Pequenos erros que as famílias já encontraram e que tiram confiança. | M | A | Publicado a 13 nov (falta o T-08) |
| 3 | E3 · Rumo do ano | Mudança de fundo (13 nov): o ano planeia-se primeiro e a semana deriva dele. A app deixa de perguntar e passa a propor. É o pedido mais repetido (F-01, F-02, equipa). | A | A | Rumo do ano, manuais (I-01) e calendário da família (P-24) publicados. Faltam o PDF do ano e a vista de família |
| 4 | E2 · Atividades melhores no plano semanal | A semana passa a ser um guia que a mãe consegue dar a várias crianças ao mesmo tempo, com pouca preparação. | A | A | P-06 a P-10, P-21, P-22 e P-23 publicados. Por confirmar com planos reais (Q-07) |
| 5 | E6 · Registo, portefólio e relatórios | A primeira entrega às escolas é em dezembro e janeiro: é a prova de valor da segunda âncora. | A | A | Por fazer |
| 6 | E5 · Fecho da semana | Liga o que foi feito ao progresso, sem a família ter de ir às Áreas de Aprendizagem. Alimenta o E3 e o portefólio. | A | M | Por fazer |
| 7 | E4 · Horário e tempo flexíveis | O plano é gerado para uma semana que muitas famílias não têm. Precisa de BD e é o maior bloco de trabalho. | A | M | Versão mínima feita a 22 nov ("A nossa semana": dias de estudo, dias curtos, saída opcional). Publicado a 22 nov; falta o Gil aplicar a migração 030. Depois, minutos por criança |
| 8 | E7 · Impressão e documentos | As famílias imprimem demasiadas folhas. Alguns pontos são rápidos e podem entrar antes. | M | M | Por fazer |
| 9 | E9 · Personalização e conteúdos próprios | Pedidos com valor real mas grandes, alguns com questões legais (direitos de autor, dados religiosos). | M | B | Em estudo |
| 10 | E10 · Comunidade, conteúdos e negócio | Ideias para depois de o núcleo estar sólido. | M | B | Em estudo |
| 11 | E11 · Financinhas | Pedido do Elton (22 nov): o módulo de literacia financeira e empreendedorismo (5–12 anos) entra na app e substitui a antiga página de Literacia Financeira. Feito de raiz a partir das regras e parâmetros do Financinhas (documentos FIN_*); a experiência de outubro não é usada. | M | M | Publicado a 22 nov e aberto a todas as contas no mesmo dia (decisão do Elton, 22 nov: só há duas famílias em teste; responde à Q-19). Rever antes de abrir a novas famílias: Q-03 (Gemini pago) e o documento 04 para as observações das crianças |

## E1 · Conformidade e base

Corre em paralelo com o resto. A maior parte depende do Gil ou de revisão jurídica.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| B-05 | Backup semanal da base de dados para armazenamento próprio | Docs (D-025). Produção sem backup; é também o que desbloqueia o B-04 | A/A | M | Guia e script publicados no repositório (docs/backup-semanal.md). Aguarda o Gil fazer o primeiro |
| B-07 | Política de Privacidade: subcontratantes (Gemini, Supabase, Vercel, Resend) e dados de menores | Auditoria. A página /privacidade não menciona o Gemini (Fase A, A2 e A9) | A/A | M | Rascunho feito (branch chore/textos-legais). À espera de Q-01, Q-03, Q-04 e Q-05 |
| B-08 | Termos de Utilização: autoridade parental, cessão da posição contratual, reembolso | Auditoria. A página /termos não tem nenhuma das três (Fase A, A3 e A4; D-014) | A/A | M | Rascunho feito (branch chore/textos-legais). À espera de Q-01, Q-02, Q-04 e Q-05 |
| B-10 | A análise de cobertura aceita o family_id do pedido: obtê-lo a partir do login | Auditoria. Um utilizador autenticado pode escrever cobertura noutra família | A/A | S | App publicada a 14 nov. A correção só fica ativa quando o Gil publicar a função (branch fix/cobertura-familia-do-login) |
| B-11 | Publicação bloqueada com repositório privado na Vercel Hobby | Repositório público temporariamente; decidir entre o Gil publicar cada entrega ou Vercel Pro | A/A | S | Em curso (público temporariamente) |
| B-02 | Ativar a proteção contra passwords comprometidas no Supabase | Auditoria. Último aviso de segurança da FASE 1 | A/A | S | Aguarda Gil |
| B-06 | Confirmar regiões UE no Supabase e na Vercel | Docs (Fase A, A10) | A/A | S | Aguarda Gil |
| B-09 | Consentimentos granulares registados (quem, quando, a quê, versão dos termos) | Docs (Fase A, A6). BD | A/A | M | Feito (branch feat/consentimentos). Vai com os textos legais; precisa da migração 028 (Gil) |
| B-01 | Gemini em faturação paga | Docs (D-013). Adiado até haver receita (decisão de 4 nov); mitigado pelo OK-06 | A/M | S | Adiado (Elton) |
| B-04 | Acesso do Claude ao Supabase | Decisão do Gil (5 nov): não, enquanto não houver backup | M/B | S | Em pausa |

## E8 · Correções rápidas

Erros já encontrados pelas famílias. Pequenos, mas cada um tira confiança.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| T-08 | Página mal apresentada no telemóvel | F-03 enviou uma captura; falta saber qual é a página | M/A | S | Aguarda Elton (captura) |

## E2 · Atividades melhores no plano semanal

A funcionalidade que decide o produto. Tudo isto é trabalho nos pedidos ao Gemini e nos ecrãs: não precisa de BD.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-06 | Variedade: o plano repete o mesmo formato todos os dias ("encontra as personagens principais") | F-02. Rodar formatos por disciplina: jogo, manipulação, oral, escrita, movimento | A/A | M | Publicado a 14 nov. Por confirmar com um plano real (Q-07) |
| P-07 | Sugerir formas de ensinar cada conteúdo: uma explicação alternativa ao manual e uma forma lúdica | F-02. "Não temos formação; é isto que nos faz falta" | A/A | M | Publicado a 14 nov. Por confirmar com um plano real (Q-07) |
| P-09 | Ajustar a dificuldade ao nível real da criança | F-03. Primeiro plano com atividades complexas demais; usar idade e progresso marcado | A/A | M | Publicado a 15 nov: regra de dificuldade por ano e ritmo, e a IA recebe o que a criança já domina em cada disciplina. Por confirmar com uma família |
| P-22 | Guia semanal no formato que a F-02 usa: semana em resumo, caixa de materiais para preparar ao domingo, o que perguntar, versão curta para dias difíceis, balanço da semana | F-02 (documento Semana 1). Menos folhas e menos preparação | A/A | M | Publicado a 14 nov. Por confirmar com um plano real (Q-07) |
| P-23 | Menos preparação: materiais que há em casa, sem imprimir; interesses como tempero e não como tema de todas as atividades | Plano real de 13 nov: 46 atividades, quase todas com materiais a fabricar (puzzles, cartões, vara de pesca) e todas tematizadas pelos mesmos dois interesses | A/A | M | Publicado a 14 nov. Por confirmar com um plano real |
| P-08 | Leitura: gerar episódios curtos (1 ou 2 parágrafos) e textos concretos, em vez de só títulos | Equipa (backlog da família piloto). Menos coisas para a mãe preparar | A/M | M | Publicado a 14 nov. Por confirmar com um plano real (Q-07) |
| P-10 | Semana com tema comum e blocos para várias idades: atividade conjunta de manhã; bloco académico em que a mãe está com uma criança enquanto a outra trabalha sozinha | Equipa, F-02. Hoje o plano dá atividades paralelas e diferentes a cada criança à mesma hora | A/A | L | Publicado a 14 nov. Por confirmar com um plano real |
| P-05 | Decidir se a análise de cobertura mantém o "thinking" do Gemini | Docs (A-04) | B/M | S | Por fazer |

## E6 · Registo, portefólio e relatórios

A entrega às escolas em dezembro e janeiro é a prova de valor da segunda âncora.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| R-01 | Testar portefólio e relatório trimestral com uma família, na entrega real à escola | Docs 08 (Bloco 3) | A/A | M | Elton |
| R-02 | Corrigir o que o R-01 revelar | Depende do R-01 | A/A | M | Por fazer |
| R-03 | Validar a secção "relatórios" do Manual (está como rascunho) | Auditoria (FASE 2.3) | A/A | S | Aguarda Elton |
| R-04 | Uma atividade pode contar para várias áreas de aprendizagem | Equipa. Muitas atividades trabalham várias áreas ao mesmo tempo. BD | A/A | M | Por fazer |
| R-10 | Sugerir em cada semana o que guardar no portefólio (3 ou 4 evidências por criança) e facilitar o registo de 2 minutos por dia | F-02, equipa. Liga o plano à segunda âncora | A/A | M | Publicado a 14 nov (sugestões e registo de 2 minutos). Por confirmar com um plano real (Q-07) |
| R-05 | Registar marcos e acontecimentos importantes (todas as idades) que entram no relatório | F-02, F-05. BD; rever doc 04 (dados de desenvolvimento de menores) | M/M | M | Por fazer |
| R-06 | Crianças até 2 ou 3 anos: diário de marcos em vez de plano de atividades | F-05, equipa. Alarga a app a uma fase fora do ensino doméstico formal | M/B | M | Em estudo |

## E3 · Rumo do ano

Saber o que dar em cada altura e se o ritmo está certo. Parte já existe (Roteiro Anual por períodos, campo semanal por disciplina), mas não está ligado.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-13 | Plano anual semana a semana: para cada criança e disciplina, o que dar em cada semana do ano letivo, calculado pela app a partir do currículo (sem a família preencher nada) | F-01, F-02, equipa. F-02 construiu este plano fora da app (calendário de 29 semanas). Fase 1 não precisa de BD | A/A | L | Fase 1 publicada a 13 nov (página Rumo do ano; segue o calendário escolar oficial) |
| P-14 | "Estou no ritmo certo?": pontos de controlo por período e regra de atraso sem culpa (o que não se fez passa para a semana seguinte) | Equipa, F-02 (o plano dela tem pontos de controlo e margem em julho). Responde à insegurança dos pais | A/A | M | Publicado a 14 nov. Por confirmar com uma família |
| P-24 | Rumo do ano, fase 2: PDF do ano para imprimir, semanas e férias da própria família, e vista de família com os conteúdos comuns às várias crianças | F-02 (calendário de 29 semanas feito fora da app). A fase 1 usa o calendário escolar oficial e mostra uma criança de cada vez | A/M | M | Calendário da família e PDF do ano publicados a 14 nov. Falta a vista de família |
| P-15 | Metodologia principal e secundárias por criança, e explicar o que o plano segue | F-02. Hoje a metodologia é por família | M/M | M | Parcial, publicado a 15 nov: a página Metodologias explica o que o plano segue e que só a principal organiza. Falta a escolha por criança (BD) |
| P-16 | Pré-escolar com linha condutora (OCEPE) e explicação de como cruza com as pedagogias | F-03 | M/M | M | Publicado a 15 nov: fio condutor pelas três áreas das OCEPE, igual ao dos irmãos, e a metodologia principal organiza. Por confirmar com a F-03 |
| P-25 | Referência por criança: currículo nacional, manuais, lista própria ou metodologia (pré-escolar) | Elton, 15 nov: muitas famílias não seguem o currículo nacional. Hoje já dá com manuais; falta a lista própria e poder desligar o currículo | A/M | M | Por decidir (Q-14). Proposta no documento claude/Metodologias_percurso_ritmo_forma.md |

## E5 · Fecho da semana

Uma revisão à sexta-feira, em vez de alertas, que atualiza o progresso sozinha.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-19 | Checklist de sexta: atividades registadas, objetivos cumpridos, o que passa para a semana seguinte, preparar a próxima semana | Equipa | A/M | M | Publicado a 14 nov. Por confirmar com uma família |
| P-20 | Perguntar tema a tema se ficou aprendido ou é preciso repetir, e atualizar as Áreas de Aprendizagem | Equipa, F-02. Evita ir às Áreas de Aprendizagem à parte | A/M | M | Publicado a 14 nov. Por confirmar com uma família |

## E4 · Horário e tempo flexíveis

O maior bloco de trabalho. Precisa de BD.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-04 | Tempo por criança: dias da semana, minutos por dia, ano letivo próprio, variação inverno e verão | F-01, equipa (INS-03), Elton (testes de 22 nov: "à sexta só podemos fazer uma hora") | A/M | L | Parte publicada a 22 nov: dias de estudo e dias curtos, por família (migração 030). O ano letivo próprio já existe (P-24). Falta: minutos por criança e inverno/verão. BD |
| P-17 | Blocos sem horas rígidas, com horas sugeridas por idade e metodologia e hora fixa opcional | Equipa | A/M | M | Depende de P-04 |
| P-18 | "Ver Mundo" opcional, em qualquer dia, ou em mais do que um dia | Equipa, F-01, Elton (testes de 22 nov) | M/M | M | Publicado a 22 nov: saída à sexta ou sem saída (sexta passa a dia de estudo). Falta o Gil aplicar a migração 030. Fica para depois: saída noutro dia ou em mais do que um |

## E7 · Impressão e documentos

Menos papel e documentos mais fáceis de usar no dia a dia.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| R-07 | Versão compacta para imprimir e guia detalhado só em digital | Equipa. As famílias imprimem demasiadas folhas | M/M | M | Publicado a 14 nov: Folha para imprimir (uma página por semana). Relatórios e portefólio compactos ficam por fazer |
| R-08 | Horário de todas as crianças num só documento, com cor por criança | Equipa (backlog da família piloto) | M/M | S | Verificar: o horário unificado com cores já existe |

## E9 · Personalização e conteúdos próprios

Pedidos grandes com valor real. Ficam para depois do lançamento.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| I-07 | Áreas de aprendizagem próprias (ex.: inglês, autoconhecimento e espiritualidade, autonomia e vida prática) | Equipa. Proposta: catálogo de áreas opcionais e uma área livre | M/B | L | Em estudo. BD |
| I-08 | Tradição da família (nome discreto): calendário litúrgico, santo do dia, catecismo e pausas litúrgicas, para famílias que o liguem. Começa pela tradição católica | F-01 (questionário de 10 perguntas e plano anual, 22 nov), outra família referida por ela. Conteúdo revisto por quem pratica, nunca gerado; categoria especial de dados (doc 04, perguntas 12 e 13 ao jurista) | M/M | M | Fase 1 feita a 22 nov, no ramo `feat/licao-seguinte-e-tradicao`, só para a F-01 (decisão do Elton a 22 nov: piloto antes do parecer, sem anunciar a mais ninguém). Tempo litúrgico, antífona e pausas calculados nos dois calendários; celebrações por rever no Sheet "Tradição da família \| Celebrações e fichas para rever" (nenhuma aparece até estar revista). Falta: migração 032 (Gil), o convite da F-01 em `pilot_features`, a resposta sobre o calendário e as fichas |
| I-01 | Índices dos manuais: a família escreve o índice (unidades e páginas) e o Rumo do ano e o plano semanal passam a seguir o manual nessa disciplina | F-01 (INS-01, INS-05), F-02 (13 nov). Só títulos e páginas, nunca o conteúdo. A validação jurídica (A-09) continua em aberto. Calendário por família fica para o P-24 | A/A | L | Publicado a 14 nov. Por confirmar com uma família. A 16 nov: uma linha por tema, unidades reconhecidas, e serve também para cursos e PDF (cola-se o índice) |
| I-02 | Sequências por metodologia (ex.: Montessori), avançando conforme a criança | F-03 (INS-04) | M/B | L | À espera das respostas da F-03 (Q-15). Não se inventa uma sequência com a IA |
| I-14 | Carregar o PDF de um manual ou curso para a app ler o índice | Elton, 16 nov. Há famílias que seguem PDF comprados a vários criadores | M/B | L | Aguarda decisão (Q-17). Direitos de autor por validar |
| I-15 | Vários manuais na mesma disciplina (ex.: manual e caderno de fichas), cada um com o seu índice no rumo | Elton, 16 nov (testes) | M/M | S | Publicado a 17 nov. Falta o Gil aplicar a migração 029; até lá, o segundo manual na mesma disciplina não grava |
| I-16 | Dizer em que página vão em cada manual; o rumo continua daí | Elton, 16 nov (testes): "é importante ter a opção de colocar em que página estamos"; 22 nov: a página 21 aparecia só a 11 jan | A/M | S | Corrigido e publicado a 22 nov: pergunta "Onde vão neste manual?" (página ou tema), não guarda "já começámos" sem resposta, e ao fim de semana conta a partir da segunda seguinte (também nos manuais já guardados). Sai "Desde o início do ano". Por confirmar (V-32, V-34). A 22 nov, também o modo "lição seguinte" (o livro marca onde ficaram), no ramo `feat/licao-seguinte-e-tradicao` (V-44) |
| I-13 | Direitos e deveres: guia das leis do ensino doméstico com ligação às fontes oficiais e modelos de requerimento à escola | Elton, 15 nov: famílias precisam de se orientar e, por vezes, de se defender (ex.: escola que recusa acompanhamento, AEC, professor-tutor). Sem chatbot nesta fase | A/M | M | Aprovado a 16 nov, com revisão mensal. Por fazer: é o próximo. Textos precisam de revisão jurídica |
| I-09 | Currículo de 5.º e 6.º ano, e mais tarde 3.º ciclo | F-04 | M/B | L | Em estudo |

## E10 · Comunidade, conteúdos e negócio

Ideias para quando o núcleo estiver sólido.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| I-03 | Comunidade: perfil de família, mapa, feed de partilhas, agenda | Docs 01. Cada peça precisa de revisão RGPD | M/B | L | Em estudo |
| I-10 | Agenda: acrescentar Brincar de Rua, Toca a Andar e Follow the Flow | F-02. Depende da agenda comunitária (I-03) | B/B | S | Em estudo |
| I-11 | Links para exemplos ilustrados (Pinterest, YouTube) nas atividades | Equipa. Só links verificados: a IA inventa endereços | M/B | M | Em estudo |
| I-12 | Manuais próprios da NexSeed para venda (infoproduto) | Equipa. Decisão de negócio: levar ao projeto de estratégia | B/B | L | Em estudo |
| I-04 | Subscrição com Stripe | Docs (FASE 4.1). Para o lançamento de janeiro | A/M | M | Em estudo |
| I-05 | Página pública da coorte fundadora e do sinal de 20 euros | Docs 07 | M/M | M | Em estudo |
| I-06 | Gerador de ideias grátis, sem login | Docs 02 | B/B | M | Em estudo |

## E11 · Financinhas

Literacia financeira e mentalidade empreendedora, 5–12 anos. Ensinar decisões, não finanças. A app é do adulto: a criança não tem conta, pontos nem ecrã. Regras e conteúdo nos documentos FIN_* do projeto.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| I-17 | Financinhas: página `/financinhas` (substitui `/financial-literacy`), Trilho de Iniciação (12 sessões × 3 escalões) e ciclo adaptativo, motor determinístico (sessão ou tema, modo de descoberta, protagonista sem repetir entre irmãos), gerador (a app monta e valida o prompt ≤ 5000 caracteres), sinais "o que observar", 26 competências com níveis que só sobem por observação confirmada, fotografia de entrada e de saída, histórico | Elton, 22 nov. FIN_00, FIN_11 (A0, A2, A3, B4, B5). Sai a página antiga, que falava de juros e investimento | M/M | L | Publicado a 22 nov (só equipa). Build da Vercel a passar e 44 testes da lógica. O protagonista nunca é o nome de uma criança da família. Por testar no browser (V-37 a V-43). BD: migração 031 |
| I-18 | Ritual da semanada: cartão com os 5 passos, mealheiros e chão; registo de 30 s (valor, "escolhi ___ em vez de ___", chão usado e reposto) que propõe sinais DC1 e GP3 | FIN_11 B1 (D4: o ritual é a fonte fixa de observação) | M/M | M | Publicado a 22 nov (só equipa) |
| I-19 | Importar o histórico de aulas pela própria app (colar o JSON, associar as crianças, pré-visualizar, sem duplicados, aulas sem data ficam "por dar") | FIN_10 passo 4 e FIN_11 A1. Os dados reais nunca passam pelo repositório | M/M | M | Publicado a 22 nov (só equipa) |
| I-20 | Kit de arranque em PDF: etiquetas dos 4 frascos, Mapa de Moedas (5–6), Página da Semana (7–8), folha do sonho, ficha da fotografia inicial | FIN_11 B3 | M/M | M | Por fazer |
| I-21 | Sessão da semana no plano semanal: bloco "Financinhas" no dia da semanada, com o prompt para copiar e o guia no PDF | FIN_11 B2 | M/M | M | Por fazer |
| I-22 | Secção Financinhas nos relatórios trimestrais (3 competências fortes e 3 a trabalhar, em linguagem para a escola) | FIN_11 C2. Saiu dos Relatórios a barra da antiga Literacia Financeira | M/B | S | Por fazer |
| I-23 | Confirmar sinais a partir de um registo do Diário | FIN_11 B6 | B/B | M | Por fazer |
| I-24 | Empreendedorismo (temas 16 e 17) como Projetos com fases (mini-feira, loja) | FIN_11 C1. São os temas sem história de referência | B/B | M | Em estudo |
| I-25 | Aulas-modelo fixas do trilho (12 sessões × 3 escalões), para a primeira ronda não depender da IA | FIN_CUR_03 §10. Conteúdo, não código | M/B | L | Em estudo |
| I-26 | Famílias de "tribos" com modos de vida muito próprios: ter debaixo de olho o que pedem e como a app se adapta sem perder a base comum (currículo da DGE, ciência) | Elton, 22 nov (conversa sobre a Tradição da família) | M/B | — | Em observação: registar cada caso no documento 10 |

## Qualidade técnica (sem impacto visível)

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| T-02 | Limpar os 101 erros do verificador de tipos | Auditoria | B/M | S | Por fazer |
| T-03 | Decidir o destino das páginas mock (Fórum, Comunidade, Formação para Pais) e das pastas soltas na raiz | Auditoria (FASE 3.6) | B/M | S | Aguarda decisão |
| T-04 | Corrigir ou apagar Ponto de situação/contexto_chat.json | Auditoria | B/B | S | Por fazer |
| T-01 | Auditoria em telemóvel real: câmara, botões, PWA | Auditoria (FASE 3.5) | M/M | S | Aguarda Elton |
| T-11 | Plano Semanal perdia o formulário e o plano por guardar ao sair da página ou ao voltar à app | Elton, 16 nov (testes). A app recarregava o ecrã sempre que regressava ao primeiro plano | A/A | S | Publicado a 16 nov. Por confirmar (V-29 a V-31) |
| T-05 | Confirmar que as migrações locais correspondem à produção | Auditoria | M/B | S | Em pausa (depende de B-04) |

## Feito

O que está feito e confirmado sai daqui e passa para [`BACKLOG_ARQUIVO.md`](BACKLOG_ARQUIVO.md), para este ficheiro ficar curto. Os itens "publicado, por confirmar" ficam aqui até o Elton confirmar.
