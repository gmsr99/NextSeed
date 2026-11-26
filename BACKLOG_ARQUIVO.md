# NexSeed: arquivo do backlog

Itens feitos e confirmados, retirados do `BACKLOG.md` para o manter curto. Os IDs nunca se reutilizam.

## Publicado e confirmado

| ID | Item | Secção de origem | Estado final |
|---|---|---|---|
| V-09 a V-20, V-25, V-26, V-29, V-30, V-32, V-34 | Testes do plano gerado, do formulário e dos manuais | Para testar | Confirmados pelo Elton a 22 nov (Testes NexSeed) |
| R-08 | Horário de todas as crianças num só documento, com cor por criança | E7 · Impressão e documentos | Já existia (SchedulePDF, cor por criança e legenda); confirmado no código a 26 nov |
| B-12 | Gil: publicar as migrações 026 (child_manuals) e 027 (family_calendars) e voltar a publicar a função export-family-data | E1 · Conformidade e base | Feito pelo Gil a 14 nov |
| T-06 | No perfil da criança só deixa escolher um interesse | E8 · Correções rápidas | Publicado a 13 nov |
| T-07 | Data de nascimento: escolher ano, mês e dia diretamente | E8 · Correções rápidas | Publicado a 13 nov |
| T-09 | Aviso claro de que o currículo só existe até ao 4.º ano | E8 · Correções rápidas | Publicado a 13 nov |
| R-09 | Intervalo vazio entre as 13:45 e as 15:00 no horário | E8 · Correções rápidas | Publicado a 13 nov |
| P-11 | "Ver Mundo": uma saída para a família toda, não uma por criança | E8 · Correções rápidas | Publicado a 13 nov |
| T-10 | Guia de Leitura: a pergunta aparecia repetida dentro do texto do episódio ("\| Pergunta: …") | E8 · Correções rápidas | Publicado a 13 nov |
| P-01 | Sem conteúdos marcados, enviar só os do período atual em vez do ano inteiro | E2 · Atividades melhores no plano semanal | Publicado a 13 nov |
| P-02 | Aviso no Plano Semanal quando uma criança não tem conteúdos marcados | E2 · Atividades melhores no plano semanal | Publicado a 13 nov |
| P-21 | Deixar de perguntar "o que quero ensinar esta semana": o campo passa a opcional, com a indicação de que a NexSeed escolhe os conteúdos | E2 · Atividades melhores no plano semanal | Publicado a 13 nov |
| P-12 | O plano semanal parte sozinho dos conteúdos da semana no plano anual; a família só ajusta se quiser | E3 · Rumo do ano | Publicado a 13 nov |

## Feito antes de 13 nov 2026

| ID | Item | Data |
|---|---|---|
| OK-06 | Nomes das crianças deixam de ser enviados ao Gemini (era o P-03) | publicado a 5 nov 2026 |
| OK-01 | Fotos comprimidas antes do upload; remove a localização GPS | publicado a 5 nov 2026 |
| OK-02 | Nomes da família piloto retirados da documentação e do exemplo do onboarding | publicado a 5 nov 2026 |
| OK-03 | Gemini só no servidor, chaves rodadas; fotos privadas; funções com autenticação | julho 2026 (FASE 1) |
| OK-04 | Onboarding, Manual em /ajuda, visitas guiadas, dashboard "Hoje", PWA | julho 2026 (FASES 2 e 3) |
| OK-05 | Exportar dados e eliminar conta; feedback e métricas em /admin/feedback | julho 2026 (FASES 4.5 e 5) |

## Testes confirmados pelo Elton a 26 nov 2026

| ID | Onde | O que fazer | O que deve acontecer | Resultado |
|---|---|---|---|---|
| V-14 | Plano gerado | Comparar o tipo de atividade de Português e de Matemática ao longo da semana | Tipos diferentes de dia para dia (jogo, objetos, conversa, escrita, medir); já não é sempre a mesma tarefa (P-06) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-24 | Metodologias | Abrir a página Metodologias | No topo, uma caixa explica o que a metodologia muda nos planos e diz qual é a vossa principal e o que ela faz (P-15) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-33 | Rumo do ano | Tocar em "Adicionar outro", escolher Matemática e colar o índice do caderno de fichas | Só depois de o Gil aplicar a migração 029: a semana de Matemática mostra os dois, cada um com o seu nome. Antes disso aparece uma mensagem a dizer que fica disponível depois de uma atualização (I-15) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-35 | Rumo do ano ou Planeador | Em "A vossa semana", tocar em Ajustar a semana: segunda a quinta Dia completo, sexta Dia curto, desligar a saída; guardar | O cartão diz "Segunda a quinta, sexta curta, sem saída". Antes de o Gil aplicar a migração 030 aparece um aviso e não dá para ajustar (P-18, 22 nov) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-36 | Plano Semanal | Com a semana da V-35, gerar um plano novo e descarregar os PDF | Não há "Ver Mundo"; a sexta tem só Português e Matemática de manhã; o horário e o guia seguem os mesmos dias. Experimentar também um dia "Sem estudo": esse dia fica vazio e a leitura tem menos episódios (P-18, P-04) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-37 | Financinhas (publicado a 22 nov; depois de o Gil aplicar a migração 031) | Abrir o menu: "Financinhas" aparece a seguir a "Missões do Mundo". Abrir o endereço antigo /financial-literacy | Abre a página Financinhas. Antes da migração aparece "O Financinhas está quase pronto" (I-17) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-48 | Início, num dia de aulas com plano | Ver o Hoje e marcar uma caixa | Cada criança mostra as atividades de hoje com caixa; marcar risca; "Ver o dia" e "Registar atividades" funcionam; não há Missões no Início (P-26) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-50 | Início, sexta depois das 12h | Abrir a app | Aparece "Fechar a semana" uma vez, com os temas da semana; "Precisa de mais" só se ativa num tema marcado; no fim, "Semana fechada" e "Preparar a próxima semana" abre a semana seguinte no Planeador (P-26) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-51 | Planeador, semana a seguir a um fecho | Gerar o plano | Os temas não marcados e os "precisa de mais" voltam (no máximo dois por disciplina); a nota do fecho aparece no Diário e não no plano (P-26) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-52 | Rumo do ano › Manuais | Editar um manual, escolher "Lição seguinte", colar o índice (as lições pela ordem) e dizer onde vão | A janela diz "Faltam N lições em N semanas: cerca de N por semana"; no rumo e no plano, esta semana mostra "Lição seguinte · <a próxima lição>"; depois de marcar lições como dadas no fecho, o plano seguinte começa na lição a seguir; no Início, o ritmo do ano conta esse manual (I-16) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
| V-64 | Fechar a semana e depois Plano Semanal | À sexta, marcar dois ou três temas com "Precisa de mais"; gerar o plano da semana seguinte | Aparecem no máximo 2 atividades "Rever · …" por criança, curtas (cerca de 10 min) e com outro formato; os temas não marcados voltam como atividades normais (P-26, fase 3) | Confirmado a 26/11 (caixa marcada no Testes NexSeed) |
