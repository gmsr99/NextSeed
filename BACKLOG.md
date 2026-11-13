# NexSeed: backlog de produto e desenvolvimento

Última atualização: 13 de novembro de 2026

Espelho em Google Docs: [NexSeed | Backlog](https://docs.google.com/document/d/1wXtLr3gHcJ5vKpuQ9a0mkORafchokye2dOJDw0dN_Cw/edit). Este ficheiro e o Doc têm o mesmo conteúdo; ver as regras de sincronização em `CLAUDE.md`.

Este backlog junta tudo o que há para fazer na app: as notas da equipa, o feedback das famílias do MVP (setembro de 2026), o documento de backlog da família piloto e a auditoria ao código de novembro. Nada foi descartado: o que não entra já fica registado com prioridade mais baixa.

As famílias aparecem como F-01, F-02 e assim por diante. Os nomes nunca entram neste documento.

Como ler:

- **Importância:** A = mexe nas duas âncoras (plano semanal ou portefólio) ou em conformidade; M = melhora a experiência de forma visível; B = desejável.
- **Urgência:** A = antes do lançamento de janeiro ou da entrega do portefólio de dezembro; M = primeiro trimestre de 2027; B = depois.
- **Esforço:** S = até 1 h; M = meio dia a 1 dia; L = vários dias.
- **Origem:** F-0X = família; Equipa = notas internas; Auditoria = revisão do código de 4 de novembro; Docs = base de conhecimento do projeto.
- **Base de dados:** Os itens marcados com BD precisam de uma migração que o Gil aplica no Supabase (o Claude não toca nas bases de dados de produção).

## Ordem de implementação

| Ordem | Grande mudança | Porquê nesta posição | Imp. | Urg. | Estado |
|---|---|---|---|---|---|
| 1 | E1 · Conformidade e base | Dados de crianças em produção sem backup nem textos legais completos. Corre em paralelo e quase tudo depende do Gil ou de revisão jurídica. | A | A | Em curso |
| 2 | E8 · Correções rápidas | Pequenos erros que as famílias já encontraram e que tiram confiança. | M | A | Publicado a 13 nov (falta o T-08) |
| 3 | E3 · Rumo do ano | Mudança de fundo (13 nov): o ano planeia-se primeiro e a semana deriva dele. A app deixa de perguntar e passa a propor. É o pedido mais repetido (F-01, F-02, equipa). | A | A | Fase 1 publicada a 13 nov. Manuais (I-01) e calendário da família (P-24) em pré-visualização, à espera do Gil (B-12) |
| 4 | E2 · Atividades melhores no plano semanal | A semana passa a ser um guia que a mãe consegue dar a várias crianças ao mesmo tempo, com pouca preparação. | A | A | P-01, P-02 e P-21 publicados a 13 nov. P-10 e P-23 especificados e aprovados |
| 5 | E6 · Registo, portefólio e relatórios | A primeira entrega às escolas é em dezembro e janeiro: é a prova de valor da segunda âncora. | A | A | Por fazer |
| 6 | E5 · Fecho da semana | Liga o que foi feito ao progresso, sem a família ter de ir às Áreas de Aprendizagem. Alimenta o E3 e o portefólio. | A | M | Por fazer |
| 7 | E4 · Horário e tempo flexíveis | O plano é gerado para uma semana que muitas famílias não têm. Precisa de BD e é o maior bloco de trabalho. | A | M | Aguarda decisão |
| 8 | E7 · Impressão e documentos | As famílias imprimem demasiadas folhas. Alguns pontos são rápidos e podem entrar antes. | M | M | Por fazer |
| 9 | E9 · Personalização e conteúdos próprios | Pedidos com valor real mas grandes, alguns com questões legais (direitos de autor, dados religiosos). | M | B | Em estudo |
| 10 | E10 · Comunidade, conteúdos e negócio | Ideias para depois de o núcleo estar sólido. | M | B | Em estudo |

## E1 · Conformidade e base

Corre em paralelo com o resto. A maior parte depende do Gil ou de revisão jurídica.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| B-05 | Backup semanal da base de dados para armazenamento próprio | Docs (D-025). Produção sem backup; é também o que desbloqueia o B-04 | A/A | M | Gil; o Claude prepara o guia |
| B-07 | Política de Privacidade: subcontratantes (Gemini, Supabase, Vercel, Resend) e dados de menores | Auditoria. A página /privacidade não menciona o Gemini (Fase A, A2 e A9) | A/A | M | Por fazer: rascunho + revisão jurídica |
| B-08 | Termos de Utilização: autoridade parental, cessão da posição contratual, reembolso | Auditoria. A página /termos não tem nenhuma das três (Fase A, A3 e A4; D-014) | A/A | M | Por fazer: rascunho + revisão jurídica |
| B-10 | A análise de cobertura aceita o family_id do pedido: obtê-lo a partir do login | Auditoria. Um utilizador autenticado pode escrever cobertura noutra família | A/A | S | Por fazer: o Claude escreve, o Gil publica |
| B-11 | Publicação bloqueada com repositório privado na Vercel Hobby | Repositório público temporariamente; decidir entre o Gil publicar cada entrega ou Vercel Pro | A/A | S | Em curso (público temporariamente) |
| B-02 | Ativar a proteção contra passwords comprometidas no Supabase | Auditoria. Último aviso de segurança da FASE 1 | A/A | S | Aguarda Gil |
| B-06 | Confirmar regiões UE no Supabase e na Vercel | Docs (Fase A, A10) | A/A | S | Aguarda Gil |
| B-09 | Consentimentos granulares registados (quem, quando, a quê, versão dos termos) | Docs (Fase A, A6). BD | A/A | M | Por fazer (precisa de especificação) |
| B-01 | Gemini em faturação paga | Docs (D-013). Adiado até haver receita (decisão de 4 nov); mitigado pelo OK-06 | A/M | S | Adiado (Elton) |
| B-04 | Acesso do Claude ao Supabase | Decisão do Gil (5 nov): não, enquanto não houver backup | M/B | S | Em pausa |
| B-12 | Gil: publicar as migrações 026 (child_manuals) e 027 (family_calendars) e voltar a publicar a função export-family-data | I-01 e P-24. Sem as migrações, os manuais aparecem só como aviso, o calendário não se pode ajustar e o resto da app funciona igual | A/A | S | Aguarda o Gil |

## E8 · Correções rápidas

Erros já encontrados pelas famílias. Pequenos, mas cada um tira confiança.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| T-06 | No perfil da criança só deixa escolher um interesse | F-04. O código não tem limite, por isso é erro de interface | M/A | S | Publicado a 13 nov |
| T-07 | Data de nascimento: escolher ano, mês e dia diretamente | F-03. Hoje é preciso recuar mês a mês até ao ano certo | M/A | S | Publicado a 13 nov |
| T-08 | Página mal apresentada no telemóvel | F-03 enviou uma captura; falta saber qual é a página | M/A | S | Aguarda Elton (captura) |
| T-09 | Aviso claro de que o currículo só existe até ao 4.º ano | F-04. Uma criança de 5.º ou 6.º ano é criada sem currículo e sem aviso | M/A | S | Publicado a 13 nov |
| R-09 | Intervalo vazio entre as 13:45 e as 15:00 no horário | Equipa (backlog da família piloto) | M/A | S | Publicado a 13 nov |
| P-11 | "Ver Mundo": uma saída para a família toda, não uma por criança | F-03. O plano mandou duas crianças para dois sítios diferentes no mesmo dia | M/A | S | Publicado a 13 nov |
| T-10 | Guia de Leitura: a pergunta aparecia repetida dentro do texto do episódio ("\| Pergunta: …") | Plano real de 13 nov | M/A | S | Publicado a 13 nov |

## E2 · Atividades melhores no plano semanal

A funcionalidade que decide o produto. Tudo isto é trabalho nos pedidos ao Gemini e nos ecrãs: não precisa de BD.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-01 | Sem conteúdos marcados, enviar só os do período atual em vez do ano inteiro | Docs 03 e 10. Planos sem prioridade clara | A/A | M | Publicado a 13 nov |
| P-02 | Aviso no Plano Semanal quando uma criança não tem conteúdos marcados | Docs 10 (INS-06). As famílias não encontram a marcação | A/A | S | Publicado a 13 nov |
| P-21 | Deixar de perguntar "o que quero ensinar esta semana": o campo passa a opcional, com a indicação de que a NexSeed escolhe os conteúdos | F-02. Passo intermédio até ao P-12 | A/A | S | Publicado a 13 nov |
| P-06 | Variedade: o plano repete o mesmo formato todos os dias ("encontra as personagens principais") | F-02. Rodar formatos por disciplina: jogo, manipulação, oral, escrita, movimento | A/A | M | Por fazer |
| P-07 | Sugerir formas de ensinar cada conteúdo: uma explicação alternativa ao manual e uma forma lúdica | F-02. "Não temos formação; é isto que nos faz falta" | A/A | M | Por fazer |
| P-09 | Ajustar a dificuldade ao nível real da criança | F-03. Primeiro plano com atividades complexas demais; usar idade e progresso marcado | A/A | M | Por fazer |
| P-22 | Guia semanal no formato que a F-02 usa: semana em resumo, caixa de materiais para preparar ao domingo, o que perguntar, versão curta para dias difíceis, balanço da semana | F-02 (documento Semana 1). Menos folhas e menos preparação | A/A | M | Por fazer (precisa de especificação) |
| P-23 | Menos preparação: materiais que há em casa, sem imprimir; interesses como tempero e não como tema de todas as atividades | Plano real de 13 nov: 46 atividades, quase todas com materiais a fabricar (puzzles, cartões, vara de pesca) e todas tematizadas pelos mesmos dois interesses | A/A | M | Por fazer |
| P-08 | Leitura: gerar episódios curtos (1 ou 2 parágrafos) e textos concretos, em vez de só títulos | Equipa (backlog da família piloto). Menos coisas para a mãe preparar | A/M | M | Por fazer |
| P-10 | Semana com tema comum e blocos para várias idades: atividade conjunta de manhã; bloco académico em que a mãe está com uma criança enquanto a outra trabalha sozinha | Equipa, F-02. Hoje o plano dá atividades paralelas e diferentes a cada criança à mesma hora | A/A | L | Por fazer (precisa de especificação) |
| P-05 | Decidir se a análise de cobertura mantém o "thinking" do Gemini | Docs (A-04) | B/M | S | Por fazer |

## E6 · Registo, portefólio e relatórios

A entrega às escolas em dezembro e janeiro é a prova de valor da segunda âncora.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| R-01 | Testar portefólio e relatório trimestral com uma família, na entrega real à escola | Docs 08 (Bloco 3) | A/A | M | Elton |
| R-02 | Corrigir o que o R-01 revelar | Depende do R-01 | A/A | M | Por fazer |
| R-03 | Validar a secção "relatórios" do Manual (está como rascunho) | Auditoria (FASE 2.3) | A/A | S | Aguarda Elton |
| R-04 | Uma atividade pode contar para várias áreas de aprendizagem | Equipa. Muitas atividades trabalham várias áreas ao mesmo tempo. BD | A/A | M | Por fazer |
| R-10 | Sugerir em cada semana o que guardar no portefólio (3 ou 4 evidências por criança) e facilitar o registo de 2 minutos por dia | F-02, equipa. Liga o plano à segunda âncora | A/A | M | Por fazer |
| R-05 | Registar marcos e acontecimentos importantes (todas as idades) que entram no relatório | F-02, F-05. BD; rever doc 04 (dados de desenvolvimento de menores) | M/M | M | Por fazer |
| R-06 | Crianças até 2 ou 3 anos: diário de marcos em vez de plano de atividades | F-05, equipa. Alarga a app a uma fase fora do ensino doméstico formal | M/B | M | Em estudo |

## E3 · Rumo do ano

Saber o que dar em cada altura e se o ritmo está certo. Parte já existe (Roteiro Anual por períodos, campo semanal por disciplina), mas não está ligado.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-12 | O plano semanal parte sozinho dos conteúdos da semana no plano anual; a família só ajusta se quiser | F-02: perguntar "o que queres ensinar" cria insegurança em vez de a resolver. Faz parte do P-13 | A/A | M | Publicado a 13 nov |
| P-13 | Plano anual semana a semana: para cada criança e disciplina, o que dar em cada semana do ano letivo, calculado pela app a partir do currículo (sem a família preencher nada) | F-01, F-02, equipa. F-02 construiu este plano fora da app (calendário de 29 semanas). Fase 1 não precisa de BD | A/A | L | Fase 1 publicada a 13 nov (página Rumo do ano; segue o calendário escolar oficial) |
| P-14 | "Estou no ritmo certo?": pontos de controlo por período e regra de atraso sem culpa (o que não se fez passa para a semana seguinte) | Equipa, F-02 (o plano dela tem pontos de controlo e margem em julho). Responde à insegurança dos pais | A/A | M | Depende de P-13 |
| P-24 | Rumo do ano, fase 2: PDF do ano para imprimir, semanas e férias da própria família, e vista de família com os conteúdos comuns às várias crianças | F-02 (calendário de 29 semanas feito fora da app). A fase 1 usa o calendário escolar oficial e mostra uma criança de cada vez | A/M | M | Calendário da família feito, em pré-visualização (depende do B-12). Faltam o PDF do ano e a vista de família |
| P-15 | Metodologia principal e secundárias por criança, e explicar o que o plano segue | F-02. Hoje a metodologia é por família | M/M | M | Por fazer. BD |
| P-16 | Pré-escolar com linha condutora (OCEPE) e explicação de como cruza com as pedagogias | F-03 | M/M | M | Por fazer |

## E5 · Fecho da semana

Uma revisão à sexta-feira, em vez de alertas, que atualiza o progresso sozinha.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-19 | Checklist de sexta: atividades registadas, objetivos cumpridos, o que passa para a semana seguinte, preparar a próxima semana | Equipa | A/M | M | Por fazer |
| P-20 | Perguntar tema a tema se ficou aprendido ou é preciso repetir, e atualizar as Áreas de Aprendizagem | Equipa, F-02. Evita ir às Áreas de Aprendizagem à parte | A/M | M | Por fazer |

## E4 · Horário e tempo flexíveis

O maior bloco de trabalho. Precisa de BD.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| P-04 | Tempo por criança: dias da semana, minutos por dia, ano letivo próprio, variação inverno e verão | F-01, equipa (INS-03) | A/M | L | Aguarda decisão. BD |
| P-17 | Blocos sem horas rígidas, com horas sugeridas por idade e metodologia e hora fixa opcional | Equipa | A/M | M | Depende de P-04 |
| P-18 | "Ver Mundo" opcional, em qualquer dia, ou em mais do que um dia | Equipa, F-01 | M/M | M | Por fazer. BD |

## E7 · Impressão e documentos

Menos papel e documentos mais fáceis de usar no dia a dia.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| R-07 | Versão compacta para imprimir e guia detalhado só em digital | Equipa. As famílias imprimem demasiadas folhas | M/M | M | Por fazer |
| R-08 | Horário de todas as crianças num só documento, com cor por criança | Equipa (backlog da família piloto) | M/M | S | Verificar: o horário unificado com cores já existe |

## E9 · Personalização e conteúdos próprios

Pedidos grandes com valor real. Ficam para depois do lançamento.

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| I-07 | Áreas de aprendizagem próprias (ex.: inglês, autoconhecimento e espiritualidade, autonomia e vida prática) | Equipa. Proposta: catálogo de áreas opcionais e uma área livre | M/B | L | Em estudo. BD |
| I-08 | Módulo católico: calendário litúrgico, santo do dia, catecismo | F-01 (e outra família referida). Conteúdo revisto, não gerado; rever doc 04 (crenças religiosas) | M/B | L | Em estudo |
| I-01 | Índices dos manuais: a família escreve o índice (unidades e páginas) e o Rumo do ano e o plano semanal passam a seguir o manual nessa disciplina | F-01 (INS-01, INS-05), F-02 (13 nov). Só títulos e páginas, nunca o conteúdo. A validação jurídica (A-09) continua em aberto. Calendário por família fica para o P-24 | A/A | L | Feito, em pré-visualização. Só funciona depois de o Gil publicar a migração 026 (B-12) |
| I-02 | Sequências por metodologia (ex.: Montessori), avançando conforme a criança | F-03 (INS-04) | M/B | L | Em estudo |
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

## Qualidade técnica (sem impacto visível)

| ID | Item | Origem e porquê | Imp./Urg. | Esforço | Estado |
|---|---|---|---|---|---|
| T-02 | Limpar os 101 erros do verificador de tipos | Auditoria | B/M | S | Por fazer |
| T-03 | Decidir o destino das páginas mock (Fórum, Comunidade, Formação para Pais) e das pastas soltas na raiz | Auditoria (FASE 3.6) | B/M | S | Aguarda decisão |
| T-04 | Corrigir ou apagar Ponto de situação/contexto_chat.json | Auditoria | B/B | S | Por fazer |
| T-01 | Auditoria em telemóvel real: câmara, botões, PWA | Auditoria (FASE 3.5) | M/M | S | Aguarda Elton |
| T-05 | Confirmar que as migrações locais correspondem à produção | Auditoria | M/B | S | Em pausa (depende de B-04) |

## Feito recentemente

| ID | Item | Data |
|---|---|---|
| OK-06 | Nomes das crianças deixam de ser enviados ao Gemini (era o P-03) | publicado a 5 nov 2026 |
| OK-01 | Fotos comprimidas antes do upload; remove a localização GPS | publicado a 5 nov 2026 |
| OK-02 | Nomes da família piloto retirados da documentação e do exemplo do onboarding | publicado a 5 nov 2026 |
| OK-03 | Gemini só no servidor, chaves rodadas; fotos privadas; funções com autenticação | julho 2026 (FASE 1) |
| OK-04 | Onboarding, Manual em /ajuda, visitas guiadas, dashboard "Hoje", PWA | julho 2026 (FASES 2 e 3) |
| OK-05 | Exportar dados e eliminar conta; feedback e métricas em /admin/feedback | julho 2026 (FASES 4.5 e 5) |
