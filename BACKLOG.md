# NexSeed: backlog de produto e desenvolvimento

Última atualização: 27 de novembro de 2026

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
| Q-20 | "Direitos e deveres" (I-13) está pronto como rascunho, só visível à equipa. Quem revê os textos e os 5 modelos de requerimento: o mesmo jurista da Q-04 ou uma associação de famílias em ensino doméstico? | Até haver revisão, as famílias não veem a página. Depois basta-me um "revisto" para a abrir a todas |  |

## Para testar: novidades publicadas de 13 a 15 de novembro

Elton: segue a ordem, com uma conta de duas crianças do 1.º ao 4.º ano. Na coluna Resultado escreve OK ou o que viste de diferente. Se a app instalada no telemóvel não mostrar as novidades, fecha-a e volta a abrir.

| ID | Onde | O que fazer | O que deve acontecer | Resultado |
|---|---|---|---|---|
| V-05 | Rumo do ano | Adicionar ou editar um manual, curso ou PDF: escrever uma linha por tema, repetindo a unidade no início (ex.: "Unidade 1 — Números até 100 ... 6", "Unidade 1 — Contar de 2 em 2 ... 10", "Unidade 2 — Adição ... 24") | Por baixo da caixa aparece "3 temas, em 2 unidades"; no rumo, cada semana mostra o tema e as páginas (I-01, corrigido a 16 nov) |  |
| V-22 | Diário | Escrever um Registo de 2 minutos para as duas crianças | Aparece "Guardado no Diário" e cada criança fica com uma entrada Registo do dia no portefólio (R-10) |  |
| V-23 | Pré-escolar (se houver) | Ver o horário de uma criança do pré-escolar | A meditação aparece às 14:00 e não em cima de outra atividade (R-09) |  |
| V-28 | Plano Semanal | Depois de marcar temas como "Ficou aprendido", gerar o plano seguinte | As atividades não voltam a ensinar esses temas e sobem um degrau (P-09) |  |
| V-31 | Plano Semanal | Num plano já guardado: tocar em Regenerar, gerar de novo e Guardar. Depois trocar uma atividade e tocar em Atualizar | Guarda sem erro e a versão sobe. Se aparecer um erro, copia-me o texto: agora mostra o motivo (T-11) |  |
| V-38 | Financinhas | Com a criança mais nova: Começar com o Trilho, semanada sugerida, fotografia inicial. Gerar a aula da S1 com o interesse dela | Aula com 7 slides e prompt com menos de 5000 caracteres, botão Copiar, 5 perguntas faladas, atividade das três portas e a frase "As portas grandes… são os pais que abrem" no guia (I-17) |  |
| V-39 | Financinhas | Colar o prompt no Gemini Notebook ou NotebookLM | A apresentação sai em português de Portugal, sem marcas nem personagens conhecidas (I-17) |  |
| V-40 | Financinhas | Marcar a aula como dada; abrir "O que observar" e carregar em "Vi isto" num sinal | O nível dessa competência sobe em Competências; a próxima aula proposta é a S2 (I-17) |  |
| V-41 | Financinhas | Depois da S2, registar o ritual: valor, "escolhi ___ em vez de ___", usou o chão e repôs | Aparecem dois sinais para confirmar (DC1 e GP3). Nenhum nível sobe sem confirmares (I-18) |  |
| V-42 | Financinhas | Importar histórico: colar o JSON das aulas antigas, associar C1 e C2 às crianças | Mostra a lista antes de gravar; importar duas vezes não duplica; aulas sem data ficam "por dar" (I-19) |  |
| V-43 | Financinhas | Com a criança mais velha em Ciclo semanal: Gerar a aula | Tema da competência mais frágil, modo de descoberta diferente da última aula, protagonista diferente do do irmão (I-17) |  |
| V-45 | Definições (só a F-01 e a equipa; depois da migração 032 e do convite) | Ver o cartão "Tradição da família (opcional)" e ligar: católica, calendário, próprio de Portugal, confirmar o consentimento | O cartão diz "Ligada"; a outras famílias o cartão não aparece (I-08) |  |
| V-46 | Planeador e Guia de Atividades (com a tradição ligada) | Abrir a semana de 7 de dezembro e descarregar os PDF | Aparece "Esta semana na liturgia: 2.ª semana do Advento" e a Alma Redemptoris Mater; no horário, o bloco da manhã chama-se "Orações e liturgia". Sem fichas revistas, não aparece nenhuma celebração (I-08) |  |
| V-47 | Definições (com a tradição ligada) | Tocar em "Acrescentar ao calendário da família"; depois "Desligar" | As pausas do Natal (21 dez a 3 jan) e da Semana Santa (22 mar a 4 abr) entram no calendário; desligar apaga a escolha e o Planeador deixa de mostrar a liturgia (I-08) |  |
| V-49 | Início | Tocar em "A semana" e depois em "O ano" | A semana: os 5 dias com feitas/previstas. O ano: frase "Faltam N temas em N semanas…", uma barra por disciplina com o traço do previsto, e "a consolidar" quando houver (P-26) |  |
| V-53 | Início e Metodologias (só a F-01, com o convite) | Abrir o Início | Aparece uma linha discreta "Têm disponível a Tradição da família"; "Ver" leva a Metodologias, ao cartão; "Agora não" não volta a mostrar (I-08) |  |
| V-54 | Definições (depois da migração 033) | Ver o cartão "Lembrete de domingo" e desligar | O interruptor fica desligado depois de recarregar; nesse domingo não chega email (P-26) |  |
| V-55 | Email (depois da 033, da função e do agendamento) | Domingo, sem plano para a semana seguinte | Às 20h chega ao responsável da conta "A semana que vem já tem rumo 🌱", com o botão "Preparar a semana"; com plano feito, não chega (P-26) |  |
| V-56 | Relatórios | Escolher uma criança com observações no Financinhas, o período "Este trimestre", deixar "Incluir Financinhas" ligado e Exportar PDF | Antes da declaração aparece "Literacia financeira e iniciativa (Financinhas)" com pontos fortes e a trabalhar; a capa cita o Decreto-Lei n.º 70/2021. Com a opção desligada, a secção não aparece (I-22) |  |
| V-57 | Plano Semanal | Gerar um plano novo | Cada dia tem 3 atividades por criança (Português, Matemática e uma terceira), a leitura só à segunda, quarta e quinta, e a atividade da tarde começa por "Se houver tempo ·". As atividades são curtas e práticas (cerca de 18 min no 2.º ano, 10 a 12 no pré-escolar). No Início, as "se houver tempo" não contam para "Em dia" (P-27) |  |
| V-58 | Horário e Folha da semana | Descarregar os PDF sem mexer em nada; depois, em A vossa semana, ligar "Mostrar horas no horário" e descarregar de novo | Primeiro: a coluna diz "Ordem" (1.º bloco, Pausa, Almoço…) e cada criança tem "atividades de cerca de N min"; a folha mostra a duração. Depois (só com a migração 036): voltam as horas (P-27) |  |
| V-59 | Plano Semanal › Descarregar PDFs | Abrir "nexseed-mapa-criancas" | Uma página por criança: dias, atividades com desenho e caixa, "Se houver tempo" mais pequeno, "As minhas tarefas" com linhas em branco e autocolantes. No pré-escolar, desenhos maiores e títulos de 3 palavras (R-11) |  |
| V-60 | Rumo do ano (conta com duas crianças do 1.º ciclo) | No seletor, escolher "A família" | As crianças aparecem lado a lado em cada semana; nas semanas em que as duas têm Estudo do Meio, Artes ou FPS aparece "Para fazerem juntos"; Português e Matemática nunca aparecem como comuns; semanas de balanço sem conteúdos (P-24) |  |
| V-61 | Plano Semanal (conta com perfil no Financinhas) | Gerar ou abrir o plano; ver o cartão "Financinhas desta semana"; com uma aula por dar, Copiar o prompt e Descarregar PDFs | O cartão diz o dia da semanada e a aula; o prompt fica copiado; sai "nexseed-financinhas" com o guia, o quiz e as atividades, sem emojis partidos. Sem aula por dar: "Preparar em Financinhas" (I-21) |  |
| V-62 | Financinhas | Carregar em "Kit de arranque (PDF)" e imprimir uma página | Cinco páginas: etiquetas dos quatro frascos (e a versão 5–6 com "Inventar") e a linha do chão; Mapa de Moedas; Página da Semana; folha do sonho; fotografia inicial com as 6 perguntas. Os círculos do Mapa de Moedas têm o tamanho de uma moeda (I-20) |  |
| V-63 | Menu › Direitos e deveres (só a equipa) | Ler as secções e copiar um modelo de requerimento | Cada ponto tem o artigo ao lado; o aviso "Rascunho em revisão jurídica" aparece; Copiar põe o modelo na área de transferência; numa conta de família normal a página diz "em breve" e não aparece no menu (I-13) |  |
| V-65 | Fecho da semana e Rumo do ano (só depois da migração 037) | Marcar a mesma revisão "Rever · …" com "Precisa de mais" em três fechos seguidos | No terceiro fecho aparece "Com atenção" na mensagem final; o tema deixa de vir no plano; no Rumo do ano, em Esta semana, aparece em "Com atenção" com "Voltar a propor", que o devolve ao plano seguinte (P-26) |  |
| V-66 | Definições › Tradição da família (só a F-01 e a equipa; depois da migração 038) | Em "Catecismo em família", colar 3 ou 4 perguntas ("1. Quem nos criou?"…), escolher a posição e guardar; abrir o Planeador e descarregar o Guia; carregar em "Já sabem de cor" | O Planeador mostra "Catecismo da semana: Pergunta n.º …" com as cinco etapas; o Guia tem a caixa com as etapas de segunda a sexta; "passar à seguinte" muda a pergunta; desligar a tradição apaga também o catecismo (I-08, fase 2) |  |
| V-67 | A vossa semana | Pôr a quarta como "Dia livre", guardar e gerar o plano | Na quarta só aparece a leitura (e o momento da manhã no horário); os outros dias não mudam. (P-29) |  |
| V-68 | Início, num dia de aulas com plano | Carregar em "Semana difícil? Fiquem só com o essencial" e confirmar; depois "Voltar ao plano normal" | Daqui até sexta as atividades passam a "Semana leve · …" (menos a leitura e a saída) e A semana mostra Em dia; voltar tira o prefixo (P-28) |  |
| V-69 | A vossa semana | Pôr "Saída à tarde" na terça e "Saída de manhã" na quarta; guardar, gerar o plano e abrir o Horário | Na terça à tarde e na quarta de manhã não há atividades; o horário mostra "Saída (tarde)" e "Saída (manhã)"; o resumo diz "saídas à terça à tarde, à quarta de manhã…" (P-30) |  |
| V-70 | Plano Semanal, separador da criança do pré-escolar | Gerar ou abrir o plano e ver cada dia | Entre as atividades aparecem, em cinzento, os blocos fixos: Ritual de Chegada (ou Orações e liturgia), Pausa, Almoço, Relaxamento / Descanso e as saídas (nota do Elton no V-23) |  |
| V-71 | Diário › Nova Atividade (com um plano desta semana) | Em "Do plano da semana", escolher uma atividade; juntar uma foto e uma observação; guardar | Criança, título, área, descrição e dia ficam preenchidos; no portefólio a descrição acaba com "Observações: …" (R-12) |  |
| V-72 | Diário › Nova Atividade (só depois da migração 039) | Escolher a área principal e, em "Também trabalhou", mais uma ou duas; guardar | No portefólio a atividade mostra todas as áreas e aparece ao filtrar por qualquer uma; nos relatórios conta em cada área (R-04) |  |
| V-73 | Plano Semanal (num plano já guardado) | Regenerar, gerar de novo e Guardar | Guarda sem o erro "weekly_plans_family_id_week_start_key" (substitui a última versão; com a migração 040 volta a criar uma versão nova) (V-31) |  |
| V-74 | Início | Tocar em "A semana" | Por baixo dos 5 dias aparecem as atividades de cada dia, com ✓ nas feitas (V-49) |  |
| V-75 | Agenda | Abrir a Agenda | Só aparece o calendário da família (plano, extracurriculares, eventos da família); já não há separadores Eventos, Mapa nem Por Região, nem eventos inventados. Criar, editar e apagar um evento da família funciona como antes (I-03a, 1A) |  |
| V-76 | Agenda › Perto de nós (só depois da migração 041 e da sementeira aprovada) | Escolher Caldas da Rainha em "Ver perto de" | Aparecem blocos por distância (Perto, A uma curta viagem, Para um dia inteiro; "Mais longe" fechado). Óbidos vem antes de Leiria e Lisboa. Encontros com etiqueta rosa e ícone de pessoas, eventos com etiqueta azul-petróleo e ícone de bilhete (I-03a, 1B) |  |
| V-77 | Agenda › Perto de nós | Tocar em "Usar a minha localização" e aceitar | O seletor muda para o concelho onde estão. Aparece "Guardar como o nosso concelho" com o intuito escrito; só guarda se tocarem (I-03a) |  |
| V-78 | Definições › Agenda da comunidade | Pôr "Teatro e espetáculos" em "Não mostrar" e voltar à Agenda | Os espetáculos saem da lista; "Mostrar tudo (+N)" volta a mostrá-los. Pôr "Arte e trabalhos manuais" em "Mostrar primeiro" faz a oficina subir dentro do seu bloco (I-03a) |  |
| V-79 | Agenda › Propor um evento (conta grátis) | Propor um encontro semanal até ao fim de janeiro | Fica em "As nossas propostas" como "À espera da equipa" e não aparece na Agenda até ser publicado (I-03a) |  |
| V-80 | Agenda › Triagem (Elton ou Andrea) | Publicar uma proposta e recusar outra com motivo | A publicada aparece em "Perto de nós"; quem propôs a recusada vê "Desta vez não publicámos: …" (I-03a) |  |
| V-81 | Agenda › Juntar à nossa agenda | Juntar um evento e abrir "Minha família" nesse dia | O evento está lá com a cor do tipo; se quem organiza o cancelar, aparece riscado com "(cancelado)" (I-03a) |  |
| V-82 | Plano Semanal › Descarregar PDFs (depois de gerar um plano novo, com interesses) | Abrir "nexseed-mapa-criancas" | Por criança: título "Semana de [interesses]" com "A semana de [nome]" por baixo; "A grande pergunta" ou "O tema da semana"; no 1.º–2.º "O que quero descobrir esta semana", no 3.º–4.º "O meu objetivo da semana"; atividades com títulos simples; em baixo, as tarefas e o canto "Esta semana aprendi… / E construí…" (no pré-escolar, "Desenha…"). Tudo numa página (R-13) |  |
| V-83 | Início › Hoje | Tocar em "Mostrar à criança" | Abre "A semana de…" no ecrã, uma criança de cada vez (botões com os nomes), dias com caixas grandes, o dia de hoje destacado e "No fim da semana" em baixo. Sem pontos nem percentagens (R-14) |  |
| V-84 | A semana da criança | Marcar uma caixa e voltar ao Início | A mesma atividade aparece feita no Hoje (é o mesmo "feito"); ao marcar todas as do núcleo de um dia, aparece "Dia feito" |  |
| V-85 | Plano Semanal › interesses de cada criança | Abrir "Para ajudar a escolher" | Três perguntas para o adulto (ex.: "O que pediu para ver ou fazer mais de 5 vezes esta semana?"); na semana seguinte são outras (P-31) |  |

## Ordem de implementação

| Ordem | Grande mudança | Porquê nesta posição | Imp. | Urg. | Estado |
|---|---|---|---|---|---|
| 1 | E1 · Conformidade e base | Dados de crianças em produção sem backup nem textos legais completos. Corre em paralelo e quase tudo depende do Gil ou de revisão jurídica. | A | A | Em curso |
| 2 | E8 · Correções rápidas | Pequenos erros que as famílias já encontraram e que tiram confiança. | M | A | Publicado a 13 nov (falta o T-08) |
| 3 | E3 · Rumo do ano | Mudança de fundo (13 nov): o ano planeia-se primeiro e a semana deriva dele. A app deixa de perguntar e passa a propor. É o pedido mais repetido (F-01, F-02, equipa). | A | A | Rumo do ano, manuais (I-01), calendário da família e PDF do ano (P-24) publicados. Vista de família publicada a 26 nov |
| 4 | E2 · Atividades melhores no plano semanal | A semana passa a ser um guia que a mãe consegue dar a várias crianças ao mesmo tempo, com pouca preparação. | A | A | P-06 a P-10, P-21, P-22 e P-23 publicados. Por confirmar com planos reais (Q-07) |
| 5 | E6 · Registo, portefólio e relatórios | A primeira entrega às escolas é em dezembro e janeiro: é a prova de valor da segunda âncora. | A | A | Por fazer |
| 6 | E5 · Fecho da semana | Liga o que foi feito ao progresso, sem a família ter de ir às Áreas de Aprendizagem. Alimenta o E3 e o portefólio. | A | M | Por fazer |
| 7 | E4 · Horário e tempo flexíveis | O plano é gerado para uma semana que muitas famílias não têm. Precisa de BD e é o maior bloco de trabalho. | A | M | Versão mínima feita a 22 nov ("A nossa semana": dias de estudo, dias curtos, saída opcional). Publicado a 22 nov; migração 030 aplicada a 25 nov. Plano essencial, horário sem horas e mapa da criança (P-27, R-11) publicados a 26 nov; falta aplicar a migração 036 |
| 8 | E7 · Impressão e documentos | As famílias imprimem demasiadas folhas. Alguns pontos são rápidos e podem entrar antes. | M | M | Por fazer |
| 9 | E9 · Personalização e conteúdos próprios | Pedidos com valor real mas grandes, alguns com questões legais (direitos de autor, dados religiosos). | M | B | Em estudo |
| 10 | E10 · Comunidade, conteúdos e negócio | Ideias para depois de o núcleo estar sólido. | M | B | Em estudo |
| 11 | E11 · Financinhas | Pedido do Elton (22 nov): o módulo de literacia financeira e empreendedorismo (5–12 anos) entra na app e substitui a antiga página de Literacia Financeira. Feito de raiz a partir das regras e parâmetros do Financinhas (documentos FIN_*); a experiência de outubro não é usada. | M | M | Publicado a 22 nov e aberto a todas as contas no mesmo dia (decisão do Elton, 22 nov: só há duas famílias em teste; responde à Q-19). Rever antes de abrir a novas famílias: Q-03 (Gemini pago) e o documento 04 para as observações das crianças |
| 12 | E12 · A criança autora do seu percurso | Decisão do Elton (26 nov, D-027 e D-028 no doc 09): a criança vê-se na semana, vê o caminho e celebra o que aprendeu e construiu. Princípio para todas as peças; estas são as primeiras. | M | M | R-13, R-14 e P-31 feitos a 27 nov (ramo `feat/crianca-autora`), por publicar. I-29 e R-15 especificados, por aprovar |

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
| B-04 | Acesso do Claude ao Supabase | Decisão do Gil (5 nov): não, enquanto não houver backup | M/B | S | Feito a 25 nov: o Gil deu ao Claude acesso ao Supabase e à Vercel (tokens no Mac dele; ver CLAUDE.md) |

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
| R-04 | Uma atividade pode contar para várias áreas de aprendizagem | Equipa. Muitas atividades trabalham várias áreas ao mesmo tempo. BD | A/A | M | Publicado a 26 nov (nota do Elton no V-22): no Diário, "Também trabalhou" com as outras áreas; o portefólio mostra e filtra por todas; os relatórios contam a atividade em cada área; o PDF trimestral diz "Também trabalhou". Migração 039 (`extra_disciplines`); sem ela, guarda só a principal e avisa. V-72 |
| R-12 | No Diário, registar a partir de uma atividade do plano da semana: a app preenche criança, título, área, descrição e dia; a família junta a foto e as observações | Elton, nota no V-22 (26 nov) | A/M | S | Publicado a 26 nov: "Do plano da semana" no topo da Nova Atividade e campo "Observações", que se junta à descrição. Sem migração. V-71 |
| R-10 | Sugerir em cada semana o que guardar no portefólio (3 ou 4 evidências por criança) e facilitar o registo de 2 minutos por dia | F-02, equipa. Liga o plano à segunda âncora | A/A | M | Publicado a 14 nov (sugestões e registo de 2 minutos). Por confirmar com um plano real (Q-07) |
| R-05 | Registar marcos e acontecimentos importantes (todas as idades) que entram no relatório | F-02, F-05. BD; rever doc 04 (dados de desenvolvimento de menores) | M/M | M | Por fazer |
| R-06 | Crianças até 2 ou 3 anos: diário de marcos em vez de plano de atividades | F-05, equipa. Alarga a app a uma fase fora do ensino doméstico formal | M/B | M | Em estudo |

## E3 · Rumo do ano

Saber o que dar em cada altura e se o ritmo está certo. Parte já existe (Roteiro Anual por períodos, campo semanal por disciplina), mas não está ligado.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-13 | Plano anual semana a semana: para cada criança e disciplina, o que dar em cada semana do ano letivo, calculado pela app a partir do currículo (sem a família preencher nada) | F-01, F-02, equipa. F-02 construiu este plano fora da app (calendário de 29 semanas). Fase 1 não precisa de BD | A/A | L | Fase 1 publicada a 13 nov (página Rumo do ano; segue o calendário escolar oficial) |
| P-14 | "Estou no ritmo certo?": pontos de controlo por período e regra de atraso sem culpa (o que não se fez passa para a semana seguinte) | Equipa, F-02 (o plano dela tem pontos de controlo e margem em julho). Responde à insegurança dos pais | A/A | M | Publicado a 14 nov. Por confirmar com uma família |
| P-24 | Rumo do ano, fase 2: PDF do ano para imprimir, semanas e férias da própria família, e vista de família com os conteúdos comuns às várias crianças | F-02 (calendário de 29 semanas feito fora da app). A fase 1 usa o calendário escolar oficial e mostra uma criança de cada vez | A/M | M | Calendário da família e PDF do ano publicados a 14 nov. Vista de família publicada a 26 nov: "A família" no seletor do Rumo do ano, crianças lado a lado e "Para fazerem juntos" (Estudo do Meio, Artes, FPS; domínio quando coincide). V-60 |
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
| P-18 | "Ver Mundo" opcional, em qualquer dia, ou em mais do que um dia | Equipa, F-01, Elton (testes de 22 nov) | M/M | M | Publicado a 22 nov: saída à sexta ou sem saída (sexta passa a dia de estudo); migração 030 aplicada a 25 nov. Por confirmar (V-35, V-36). Fica para depois: saída noutro dia ou em mais do que um |
| P-27 | Plano essencial: núcleo de 3 atividades por dia por criança, o resto "se houver tempo"; duração de cada atividade pela idade (2 a 3 minutos por ano de idade nas tarefas guiadas); horário em blocos sem horas, e a família põe as horas se quiser | Elton, notas de 24/10 e 26/11 nos testes: "ainda não houve um único dia em que tenha conseguido fazer tudo"; tabela de tempos de concentração por idade | A/A | M | Publicado a 26 nov (aprovado pelo Elton): núcleo de 3 por dia, leitura em 3 dias (sai a de terça), tarde "Se houver tempo", duração pela idade no pedido à IA e nos PDF, horário sem horas por omissão (decisão do Elton) com a opção "Mostrar horas no horário" em A vossa semana. Migração 036 para guardar a opção; sem ela, fica sem horas. V-57 a V-58 |
| P-28 | Semana difícil: com um toque, o resto da semana fica só com a leitura e o momento da manhã, sem culpa | Plano anual da F-01: "se a semana correr mal, só as Orações e a Leitura. Não é uma semana falhada". Elton, 26 nov: "Sim, faz isso" | A/M | S | Publicado a 26 nov: no Início, "Semana difícil? Fiquem só com o essencial"; o resto da semana passa a "Semana leve · …", não conta para Em dia e desfaz-se com "Voltar ao plano normal". Sem migração. V-68 |
| P-29 | Dia livre na semana da família: sem currículo, só o momento da manhã em família (ou as orações, com a Tradição) e a leitura em voz alta | Plano anual da F-01 (22 nov): "4 dias de currículo e 1 Dia Livre". Elton, 26 nov: "Sim, faz isso" | M/M | S | Publicado a 26 nov: nova opção "Dia livre" em A vossa semana, sem migração (os dias já são uma lista). A leitura de terça fica se a terça for livre. V-67 |
| P-30 | Saídas em qualquer dia, as vezes que quiserem, de manhã, à tarde ou o dia todo (uma visita, uma ida a uma comunidade) | Elton, 26 nov: "a saída pode ser outro dia além da sexta… pode acontecer mais vezes… só à tarde ou só de manhã" | A/M | S | Publicado a 26 nov: em A vossa semana, cada dia tem a sua saída (nenhuma, manhã, tarde, dia todo); essa parte do dia fica sem currículo e o horário mostra "Saída". A sexta o dia todo continua a ser a "Ver Mundo" preparada pelo plano. Sem migração (guarda-se dentro de `days`). V-69 |
| P-26 | Início redesenhado (DASH): Hoje com os itens de cada criança; caixas A semana e O ano; fecho da semana à sexta (dado, precisa de mais, nota); ritmo do ano até 30 de junho | Elton, 22 nov (spec claude/DASH_Redesenho_Inicio.md v3.1, aprovada às 23:16) | A/A | L | Fases 1, 2 e 4 publicadas a 22 nov. Fase 3 completada a 26 nov (ramo `feat/revisoes-curtas`): o que ficou "precisa de mais" volta como revisão curta ([rever], cerca de 10 min, outro formato, título "Rever · …"), no máximo 2 por criança por semana, uma disciplina de cada vez; o que não foi dado volta como [retomar] (até 2 por disciplina). Publicado a 26 nov. Paragem ao fim de 3 revisões seguidas publicada a 26 nov: o tema passa a "Com atenção" no Rumo do ano, com "Voltar a propor"; precisa da migração 037 (`review_count`); sem ela, tudo funciona como antes. V-64, V-65. Fase 5 (publicada a 23 nov): email de domingo às 20h para o responsável da conta (decisão do Elton), ligado por omissão e desligável em Definições; não sai em pausas. Migração 033 aplicada a 25 nov; falta publicar a função send-sunday-reminder e o agendamento. Base legal: hipótese de execução de contrato (comunicação do serviço), na lista do jurista (pergunta 14). Fica por fazer: acertos que mudam o plano |

## E7 · Impressão e documentos

Menos papel e documentos mais fáceis de usar no dia a dia.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| R-07 | Versão compacta para imprimir e guia detalhado só em digital | Equipa. As famílias imprimem demasiadas folhas | M/M | M | Publicado a 14 nov: Folha para imprimir (uma página por semana). Relatórios e portefólio compactos ficam por fazer |
| R-11 | Mapa semanal da criança: uma página por criança, visual, com dias, disciplinas e tema, caixa para a criança marcar e linhas livres para tarefas da casa; sai com os outros PDF | Elton, nota de 24/11 nos testes | M/M | M | Publicado a 26 nov: PDF "A semana de …", uma página por criança, com desenhos simples por disciplina (maiores e com menos palavras no pré-escolar, a pedido do Elton), caixas, tarefas da casa e espaço para autocolantes. Sai com os PDF e no email (depois de voltar a publicar send-weekly-plan). V-59 |

## E9 · Personalização e conteúdos próprios

Pedidos grandes com valor real. Ficam para depois do lançamento.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| I-07 | Áreas de aprendizagem próprias (ex.: inglês, autoconhecimento e espiritualidade, autonomia e vida prática) | Equipa. Proposta: catálogo de áreas opcionais e uma área livre | M/B | L | Em estudo. BD |
| I-08 | Tradição da família (nome discreto): calendário litúrgico, santo do dia, catecismo e pausas litúrgicas, para famílias que o liguem. Começa pela tradição católica | F-01 (questionário de 10 perguntas e plano anual, 22 nov), outra família referida por ela. Conteúdo revisto por quem pratica, nunca gerado; categoria especial de dados (doc 04, perguntas 12 e 13 ao jurista) | M/M | M | Fase 1 feita a 22 nov, só para a F-01 (decisão do Elton a 22 nov: piloto antes do parecer, sem anunciar a mais ninguém). Tempo litúrgico, antífona e pausas calculados nos dois calendários; celebrações por rever no Sheet "Tradição da família \| Celebrações e fichas para rever" (nenhuma aparece até estar revista). Migração 032 aplicada a 25 nov. Falta: o convite da F-01 em `pilot_features`, a resposta sobre o calendário e as fichas. Cartão também em Metodologias e convite discreto no Início para quem tem o convite (publicado a 23 nov, V-53). **Fase 2 (catecismo em família) publicada a 26 nov** (pedido do Elton; falta a migração 038): em Definições › Tradição da família, a família cola os números e os títulos das perguntas do seu livro (as respostas ficam no livro); uma pergunta por semana para todos, com as cinco etapas de segunda a sexta, no Planeador e no Guia de Atividades; "Já sabem de cor: passar à seguinte". Migração 038 (colunas na `family_traditions`, apagadas ao desligar). Nada vai para a IA. Pergunta 13 ao jurista ainda por responder. V-66 |
| I-27 | Blocos fixos da família na Tradição: orações (~10 min), calendário da manhã (~3 a 5 min) e leitura em voz alta (um capítulo, sem perguntas), todos os dias, para todos | Plano anual da F-01 (22 nov). Hoje só o primeiro bloco passa a "Orações e liturgia" | M/M | S | Por fazer. Só com a Tradição ligada; sem IA |
| I-28 | Fio condutor anual: um tema por semana pensado para o ano inteiro (no plano da F-01, das Ciências), com projetos ou visitas de estudo a fechar cada unidade | Plano anual da F-01 (22 nov). Hoje o fio condutor é escolhido semana a semana | M/B | M | Por fazer. Depois da P-28, P-29 e I-27 |
| I-01 | Índices dos manuais: a família escreve o índice (unidades e páginas) e o Rumo do ano e o plano semanal passam a seguir o manual nessa disciplina | F-01 (INS-01, INS-05), F-02 (13 nov). Só títulos e páginas, nunca o conteúdo. A validação jurídica (A-09) continua em aberto. Calendário por família fica para o P-24 | A/A | L | Publicado a 14 nov. Por confirmar com uma família. A 16 nov: uma linha por tema, unidades reconhecidas, e serve também para cursos e PDF (cola-se o índice) |
| I-02 | Sequências por metodologia (ex.: Montessori), avançando conforme a criança | F-03 (INS-04) | M/B | L | À espera das respostas da F-03 (Q-15). Não se inventa uma sequência com a IA |
| I-14 | Carregar o PDF de um manual ou curso para a app ler o índice | Elton, 16 nov. Há famílias que seguem PDF comprados a vários criadores | M/B | L | Aguarda decisão (Q-17). Direitos de autor por validar |
| I-15 | Vários manuais na mesma disciplina (ex.: manual e caderno de fichas), cada um com o seu índice no rumo | Elton, 16 nov (testes) | M/M | S | Publicado a 17 nov; migração 029 aplicada a 25 nov. Por confirmar (V-33) |
| I-16 | Dizer em que página vão em cada manual; o rumo continua daí | Elton, 16 nov (testes): "é importante ter a opção de colocar em que página estamos"; 22 nov: a página 21 aparecia só a 11 jan | A/M | S | Corrigido e publicado a 22 nov: pergunta "Onde vão neste manual?" (página ou tema), não guarda "já começámos" sem resposta, e ao fim de semana conta a partir da segunda seguinte (também nos manuais já guardados). Sai "Desde o início do ano". Por confirmar (V-32, V-34). A 22 nov, também o modo "lição seguinte" (o livro marca onde ficaram) (publicado a 22 nov). A 23 nov (publicado): "lição seguinte" pode ter índice (opcional). Sem perguntar quanto dura uma lição (Elton, 23 nov): o ritmo estima-se com as lições que faltam a dividir pelas semanas que faltam, a contar da semana atual, e acerta-se com o que a família marca como dado no fecho. (V-52) |
| I-13 | Direitos e deveres: guia das leis do ensino doméstico com ligação às fontes oficiais e modelos de requerimento à escola | Elton, 15 nov: famílias precisam de se orientar e, por vezes, de se defender (ex.: escola que recusa acompanhamento, AEC, professor-tutor). Sem chatbot nesta fase | A/M | M | Aprovado a 16 nov, com revisão mensal. Rascunho publicado a 26 nov: página `/direitos` com matrícula, protocolo, professor-tutor e portefólio, provas, direitos (manuais, ação social, AEC) e desacordo com a escola, cada ponto com o artigo do DL 70/2021 (e DL 8/2025), e 5 modelos de requerimento para copiar. Só a equipa vê até à revisão jurídica (Q-20). V-63 |
| I-09 | Currículo de 5.º e 6.º ano, e mais tarde 3.º ciclo | F-04 | M/B | L | Em estudo |

## E10 · Comunidade, conteúdos e negócio

Ideias para quando o núcleo estiver sólido.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| I-03 | Comunidade: perfil de família, mapa, feed de partilhas, agenda | Docs 01. Cada peça precisa de revisão RGPD | M/B | L | Em estudo |
| I-03a | Agenda da comunidade: famílias e entidades propõem encontros e eventos para crianças e famílias, com triagem; a família vê primeiro o que está perto (concelho, por anéis de distância) e o que prefere ("O que preferimos"); dois tipos com cor própria (Encontro de comunidade, Evento); "Juntar à nossa agenda" | Elton, 26 nov (problemas 1 e 4 do doc 01; D-001, D-002). Spec v2 aprovada a 26 nov, 11:38 (claude/AGENDA_Especificacao.md; como construir: claude/AGENDA_Pacote_Implementacao.md). BD (041) | A/M | M | 1A (sai o conteúdo inventado; fica "Minha família") publicada a 26 nov (V-75). 1B (agenda da comunidade) publicada a 27 nov, à espera da migração 041 (V-76 a V-81; nota de entrega em claude/AGENDA_Estado_1B.md). Precisa da migração 041 e da sementeira (`supabase/seeds/041_agenda_sementeira_dez2026.sql`, 10 eventos verificados; os encontros do Oeste vêm do Elton). Concelho e preferências ficam numa tabela própria (`family_event_settings`), fora de `families`, para a equipa não ler o concelho. Concelhos: centro de cada concelho calculado a partir da CAOP da DGT, em vez da sede (Elton, 26 nov, 11:55). Decisões de 26 nov: triagem pelo Elton ou pela Andrea (basta um; papel `team_admins` que já existe); 8 categorias mais "Encontros de comunidade" como preferência; proposta só com conta (grátis ou paga); "Não mostrar" esconde, com "Mostrar tudo"; Course Commons sem contacto por agora (a Fase 2 começa por testar a recolha automática); o Claude semeia pelo menos 15 eventos reais como pendentes e o Elton aprova; sem hierarquia entre tipos; território consultável sem guardar, concelho guardado opcional, localização calculada no aparelho. ⚠️ Antes da 1B em produção: doc 04 e Política de Privacidade com o concelho. Em janeiro: nova sementeira (os eventos de Natal acabam a 3 jan) |
| I-10 | Agenda: acrescentar Brincar de Rua, Toca a Andar e Follow the Flow | F-02. Depende da agenda comunitária (I-03) | B/B | S | Em estudo |
| I-11 | Links para exemplos ilustrados (Pinterest, YouTube) nas atividades | Equipa. Só links verificados: a IA inventa endereços | M/B | M | Em estudo |
| I-12 | Manuais próprios da NexSeed para venda (infoproduto) | Equipa. Decisão de negócio: levar ao projeto de estratégia | B/B | L | Em estudo |
| I-04 | Subscrição com Stripe | Docs (FASE 4.1). Para o lançamento de janeiro | A/M | M | Em estudo |
| I-05 | Página pública da coorte fundadora e do sinal de 20 euros | Docs 07 | M/M | M | Em estudo |
| I-06 | Gerador de ideias grátis, sem login | Docs 02 | B/B | M | Em estudo |

## E11 · Financinhas

Literacia financeira e mentalidade empreendedora, 5–12 anos. Ensinar decisões, não finanças. A app é do adulto: a criança não tem conta nem pontos; vê o seu progresso em papel ou na vista do adulto, sem prémios nem streaks (D-028, 26 nov). Regras e conteúdo nos documentos FIN_* do projeto.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| I-17 | Financinhas: página `/financinhas` (substitui `/financial-literacy`), Trilho de Iniciação (12 sessões × 3 escalões) e ciclo adaptativo, motor determinístico (sessão ou tema, modo de descoberta, protagonista sem repetir entre irmãos), gerador (a app monta e valida o prompt ≤ 5000 caracteres), sinais "o que observar", 26 competências com níveis que só sobem por observação confirmada, fotografia de entrada e de saída, histórico | Elton, 22 nov. FIN_00, FIN_11 (A0, A2, A3, B4, B5). Sai a página antiga, que falava de juros e investimento | M/M | L | Publicado a 22 nov (só equipa). Build da Vercel a passar e 44 testes da lógica. O protagonista nunca é o nome de uma criança da família. Por testar no browser (V-37 a V-43). BD: migração 031 |
| I-18 | Ritual da semanada: cartão com os 5 passos, mealheiros e chão; registo de 30 s (valor, "escolhi ___ em vez de ___", chão usado e reposto) que propõe sinais DC1 e GP3 | FIN_11 B1 (D4: o ritual é a fonte fixa de observação) | M/M | M | Publicado a 22 nov (só equipa) |
| I-19 | Importar o histórico de aulas pela própria app (colar o JSON, associar as crianças, pré-visualizar, sem duplicados, aulas sem data ficam "por dar") | FIN_10 passo 4 e FIN_11 A1. Os dados reais nunca passam pelo repositório | M/M | M | Publicado a 22 nov (só equipa) |
| I-20 | Kit de arranque em PDF: etiquetas dos 4 frascos, Mapa de Moedas (5–6), Página da Semana (7–8), folha do sonho, ficha da fotografia inicial | FIN_11 B3 | M/M | M | Publicado a 26 nov: botão "Kit de arranque (PDF)" na página Financinhas, 5 páginas (etiquetas e linha do chão, Mapa de Moedas, Página da Semana, folha do sonho com quadradinhos e noites, fotografia inicial). Sem emojis no PDF: cor e palavra por mealheiro; "Inventar" na versão 5–6. V-62 |
| I-21 | Sessão da semana no plano semanal: bloco "Financinhas" no dia da semanada, com o prompt para copiar e o guia no PDF | FIN_11 B2 | M/M | M | Publicado a 26 nov: cartão "Financinhas desta semana" no Plano Semanal (dia da semanada, aula por dar, Copiar o prompt, ou "Preparar em Financinhas") e PDF `nexseed-financinhas` com guia, quiz, atividades e desafio. Não entra no horário (a semanada é muitas vezes ao fim de semana). V-61 |
| I-22 | Secção Financinhas nos relatórios trimestrais (3 competências fortes e 3 a trabalhar, em linguagem para a escola) | FIN_11 C2. Saiu dos Relatórios a barra da antiga Literacia Financeira | M/B | S | Publicado a 26 nov: secção "Literacia financeira e iniciativa" no relatório trimestral, só com competências observadas, e a opção "Incluir Financinhas" |
| I-23 | Confirmar sinais a partir de um registo do Diário | FIN_11 B6 | B/B | M | Por fazer |
| I-24 | Empreendedorismo (temas 16 e 17) como Projetos com fases (mini-feira, loja) | FIN_11 C1. São os temas sem história de referência | B/B | M | Em estudo |
| I-25 | Aulas-modelo fixas do trilho (12 sessões × 3 escalões), para a primeira ronda não depender da IA | FIN_CUR_03 §10. Conteúdo, não código | M/B | L | Em estudo |
| I-26 | Famílias de "tribos" com modos de vida muito próprios: ter debaixo de olho o que pedem e como a app se adapta sem perder a base comum (currículo da DGE, ciência) | Elton, 22 nov (conversa sobre a Tradição da família) | M/B | — | Em observação: registar cada caso no documento 10 |

## E12 · A criança autora do seu percurso

Decisão do Elton (26 nov, D-027 no doc 09): a criança participa na construção e na direção do que aprende e sabe onde está e para onde vai. A direção junta o que ela quer, o que precisa e o que o adulto vê que a ajuda. Celebra-se o que aprendeu e construiu. Sem pontos trocados por prémios, streaks, rankings nem comparação entre irmãos; a criança não tem conta (D-028). Especificações (projeto): claude/CRI_01_A_Minha_Semana_Especificacao.md (R-13, R-14, P-31), claude/CRI_02_Missoes_sem_premios.md (I-29), claude/CRI_03_Mapa_da_Viagem.md (R-15).

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| R-13 | Mapa da criança v2 ("A Minha Semana"), em cima do R-11: título da semana com o interesse dela ("A Semana do Futebol"); atividades em frases de criança pedidas ao gerador na mesma chamada (campo curto por atividade, com recurso ao título atual); à sexta, "Esta semana aprendi… e construí…"; variante 9–12 com aspeto de agenda de projeto ("O meu objetivo da semana") | Elton, 26 nov (D-027). Spec aprovada pelo Elton a 27 nov ("sim") | M/M | S–M | Feito no ramo `feat/crianca-autora` (27 nov), por publicar. Sem BD e sem campo novo: os títulos das atividades passam a ser pedidos à IA em linguagem para a criança ler (regra 9 do prompt). V-82 |
| R-14 | Vista no ecrã do mapa da criança: a mesma página e a mesma mecânica, na conta do adulto, para mostrar à criança e marcar com ela. Sem login, avatar nem notificações para a criança; sem estatísticas do adulto. Papel por omissão, ecrã como opção | Elton, 26 e 27 nov: há crianças que preferem o ecrã e é mais fácil medir o uso (D-028) | M/M | M | Feito no ramo `feat/crianca-autora` (27 nov), por publicar: página `/semana-da-crianca`, botão "Mostrar à criança" no Início. As caixas usam o `completed_at` que já existe: nada novo guardado, nem contagem de aberturas. V-83, V-84 |
| P-31 | Perguntas orientadoras ao adulto no formulário dos interesses da semana: 2 ou 3 opcionais e rotativas ("O que pediu para ver ou fazer mais de 5 vezes esta semana?", "Onde ficou mais tempo sem dar pelo tempo?", "O que construiu sem lhe pedirem?", "Onde desistiu depressa, e o que achas que faltou?") | Elton, 26 nov: o adulto orienta com o seu discernimento, não só "o que te apetece?" | M/M | S | Feito no ramo `feat/crianca-autora` (27 nov), por publicar: "Para ajudar a escolher" por baixo dos interesses, 3 de 7 perguntas por semana. Não se guarda nem vai à IA. V-85 |
| I-29 | Missões do Mundo sem prémios: saem os pontos trocados por prémios dos pais; entram níveis de mestria por missão ("já faço sozinho, próxima missão"), confirmados pelo adulto | D-027 e D-028 (26 nov). O desenho atual troca pontos por guloseimas, o que contraria a decisão e a regra de que a semanada nunca é prémio | M/M | M–L | Especificado a 27 nov (claude/CRI_02_Missoes_sem_premios.md): passos de mestria 1–4 confirmados pelo adulto, próxima missão, jardim das qualidades; saem pontos e prémios da interface. BD (042). ⚠️ doc 04 antes de produção. Por aprovar |
| R-15 | Mapa da Viagem: o percurso do ano da criança em linguagem dela, a partir do Rumo do ano, com títulos de mestre ligados a marcos observados e figuras de referência variadas (com uma apresentação curta para o adulto quando a criança não as conhece) | Elton, 26 nov (D-027) | M/B | M–L | Especificado a 27 nov (claude/CRI_03_Mapa_da_Viagem.md): caminho do ano com estações do Rumo do ano conquistadas por conteúdos dominados, títulos de mestre de uma lista fixa revista. Sem BD. Por aprovar |

## Qualidade técnica (sem impacto visível)

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| T-02 | Limpar os 101 erros do verificador de tipos | Auditoria | B/M | S | Por fazer |
| T-03 | Decidir o destino das páginas mock (Fórum, Comunidade, Formação para Pais) e das pastas soltas na raiz | Auditoria (FASE 3.6) | B/M | S | Aguarda decisão |
| T-04 | Corrigir ou apagar Ponto de situação/contexto_chat.json | Auditoria | B/B | S | Por fazer |
| T-01 | Auditoria em telemóvel real: câmara, botões, PWA | Auditoria (FASE 3.5) | M/M | S | Aguarda Elton |
| T-11 | Plano Semanal perdia o formulário e o plano por guardar ao sair da página ou ao voltar à app | Elton, 16 nov (testes). A app recarregava o ecrã sempre que regressava ao primeiro plano | A/A | S | Publicado a 16 nov. Por confirmar (V-29 a V-31) |
| T-12 | Quem entra por convite ficava também com uma família própria vazia (e podia cair nela) | Gil, 25 nov (patch). Migração 035 no ramo `fix/convite-sem-onboarding`: o registo por convite já não cria família, aceitar o convite apaga a família vazia e há uma limpeza única das famílias vazias antigas | A/M | S | **Parado de propósito (decisão do Elton, 26 nov: "para não fazermos asneira").** A limpeza apaga famílias: só avança com um backup feito e com o resultado de `docs/sql/035_previsao_limpeza.sql` visto pelo Elton (quantas famílias, se a conta convidada dele é uma delas), numa sessão no Mac do Gil. Hipótese: separar a limpeza da correção do convite |
| T-05 | Confirmar que as migrações locais correspondem à produção | Auditoria | M/B | S | Em pausa (depende de B-04) |

## Feito

O que está feito e confirmado sai daqui e passa para [`BACKLOG_ARQUIVO.md`](BACKLOG_ARQUIVO.md), para este ficheiro ficar curto. Os itens "publicado, por confirmar" ficam aqui até o Elton confirmar.
