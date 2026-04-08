-- ============================================================================
-- NexSeed — Migration 008
-- Seed: methodology_activities
--
-- Estrutura: para cada metodologia, 1 bloco WITH + INSERT
-- Cobertura: discipline_key × faixa etária relevante
-- Objetivo: núcleo de triangulação DGE ⟷ Metodologia ⟷ Interesses
-- ============================================================================


-- ─── 1. Montessori (3–15 anos) ───────────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'montessori')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  -- Pré-escolar (3–6)
  ('life_skills'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Atividades de Vida Prática — Verter e Transferir',
   'A criança transfere água ou sementes entre recipientes usando colher, funil ou pinça. Desenvolve coordenação motora fina, concentração e sentido de ordem. O educador demonstra uma vez, depois retira-se. Cada material tem lugar fixo na prateleira.',
   ARRAY['tigelas pequenas','colheres','pinças','feijões ou água colorida','tapete de trabalho']::TEXT[],
   20::SMALLINT, 1::SMALLINT),

  ('math'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Barras Vermelhas e Azuis — Introdução ao Número',
   'A criança manipula as barras numéricas (1 a 10) no tapete, contando segmentos alternados. Liga quantidade a símbolo numérico com fichas. O material sensorial torna o número concreto antes de qualquer símbolo abstrato.',
   ARRAY['barras numéricas Montessori','fichas numéricas','tapete de trabalho']::TEXT[],
   25::SMALLINT, 2::SMALLINT),

  ('language'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Letras de Lixa — Associação Fonema-Grafema',
   'A criança traça a letra de lixa com dois dedos enquanto o educador pronuncia o som (método fonético). Depois encontra objetos ou imagens que começam com esse som. Integra tato, visão e audição para fixar a correspondência letra-som.',
   ARRAY['letras de lixa','imagens de objetos','tapete sensorial']::TEXT[],
   15::SMALLINT, 3::SMALLINT),

  ('movement'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Caminhada na Linha — Equilíbrio e Concentração',
   'A criança caminha sobre uma linha oval no chão transportando um copo de água sem derramar, ou uma campainha sem a fazer tocar. Desenvolve equilíbrio, controlo corporal, concentração. Pode evoluir para andar de costas ou de lado.',
   ARRAY['fita adesiva no chão (oval)','copo com água ou campainha pequena']::TEXT[],
   15::SMALLINT, 4::SMALLINT),

  ('arts'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Aquarela com Três Cores Primárias',
   'A criança pinta livremente com aquarela em papel húmido, usando apenas as três cores primárias. Observa como as cores se fundem e criam novas cores. Sem guião ou imagem imposta — exploração estética livre.',
   ARRAY['aquarelas','papel aguarela','esponjas','água']::TEXT[],
   30::SMALLINT, 5::SMALLINT),

  -- 1.º Ciclo (6–10)
  ('math'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Material Dourado — Introdução ao Sistema Decimal',
   'A criança manipula unidades, barras de dez, placas de cem e cubos de mil. Realiza trocas concretas (10 unidades = 1 dezena) antes de qualquer algoritmo escrito. Operações de adição e subtração com material. Prepara compreensão profunda do sistema posicional.',
   ARRAY['material dourado Montessori','fichas numéricas grandes e pequenas','tapete de trabalho']::TEXT[],
   40::SMALLINT, 6::SMALLINT),

  ('language'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Caixa de Leitura — Decodificação e Compreensão',
   'A criança lê etiquetas de objetos da caixa e coloca cada etiqueta no objeto correspondente. Progride para frases, depois para pequenos livros de leitura. Totalmente autodirigido — a criança escolhe quando está pronta para avançar.',
   ARRAY['caixa com objetos miniatura','etiquetas com palavras e frases','livretos de leitura graduados']::TEXT[],
   20::SMALLINT, 7::SMALLINT),

  ('science'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Classificação Botânica — Partes da Planta',
   'A criança usa cartões de nomenclatura botânica (raiz, caule, folha, flor, fruto, semente) para nomear e classificar partes de plantas reais. Compara plantas diferentes. Regista observações no caderno de ciências com esboços à mão.',
   ARRAY['plantas reais','cartões de nomenclatura botânica','lupa','caderno de ciências']::TEXT[],
   35::SMALLINT, 8::SMALLINT),

  ('life_skills'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Preparação de Refeição Simples',
   'A criança prepara uma refeição simples de forma autónoma: descasca fruta, corta com faca segura, mede ingredientes para receita. Depois limpa e arruma o espaço. A cozinha real torna a autonomia, a matemática (medições) e a vida prática inseparáveis.',
   ARRAY['faca de segurança','tábua de corte','ingredientes simples','receita em cartão ilustrado']::TEXT[],
   45::SMALLINT, 9::SMALLINT),

  -- 2.º e 3.º Ciclo (10–15)
  ('project'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Pesquisa Autodirigida com Apresentação',
   'O adolescente escolhe um tópico genuinamente interessante, planeia a investigação (fontes, perguntas, método), recolhe informação, organiza e apresenta ao educador ou grupo. O processo de pesquisa é tão importante como o produto. Ciclo completo de aprendizagem autodirigida.',
   ARRAY['livros de referência','acesso a biblioteca ou internet','caderno de pesquisa','cartolinas ou slides']::TEXT[],
   240::SMALLINT, 10::SMALLINT),

  ('math'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Álgebra Concreta com Letras Móveis e Equações',
   'Usando materiais manipuláveis (fichas de variável, balança de equilíbrio), o aluno resolve equações de forma concreta antes de abstrair para notação algébrica. Compreende "x" como quantidade desconhecida, não símbolo mágico. Liga à geometria e à física.',
   ARRAY['fichas de variáveis Montessori','balança de equilíbrio','caderno de matemática']::TEXT[],
   45::SMALLINT, 11::SMALLINT),

  ('science'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Experiência com Método Científico Documentado',
   'O aluno formula hipótese, planeia experimento controlado, regista dados em tabela, analisa resultados, conclui. Tópicos: densidade de líquidos, reações ácido-base, circuitos elétricos, germinação. Relatório escrito com todos os passos. Prepara para ciência rigorosa.',
   ARRAY['materiais de laboratório simples','caderno de laboratório','materiais específicos do experimento']::TEXT[],
   60::SMALLINT, 12::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 2. Pikler / RIE (0–6 anos) ──────────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'pikler')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  ('movement'::TEXT, 0::SMALLINT, 2::SMALLINT,
   'Tempo Livre no Chão — Movimento Espontâneo',
   'O bebé é colocado no chão em superfície segura e limpa, sem ser sentado ou posto a ficar de pé antes de estar pronto. O educador observa sem intervir. O bebé explora o movimento no seu ritmo natural (virar, rolar, arrastar, engatinhar). A sequência de desenvolvimento não é apressada.',
   ARRAY['tapete de atividades firme','espaço seguro sem obstáculos']::TEXT[],
   30::SMALLINT, 1::SMALLINT),

  ('social_emotional'::TEXT, 0::SMALLINT, 2::SMALLINT,
   'Cuidados com Presença Plena — Muda de Fralda como Interação',
   'Durante a muda de fralda ou banho, o educador dá atenção total à criança: fala do que vai fazer antes de fazê-lo, espera sinais de consentimento, mantém contacto ocular. A rotina de cuidados torna-se espaço de relação e comunicação, não tarefa mecânica.',
   ARRAY['espaço de muda confortável','materiais de higiene']::TEXT[],
   15::SMALLINT, 2::SMALLINT),

  ('movement'::TEXT, 2::SMALLINT, 4::SMALLINT,
   'Espaço de Movimento Seguro com Desafio Natural',
   'O toddler tem acesso a espaço com rampas suaves, degraus baixos, superfícies variadas. O educador não ajuda, não levanta, não orienta — observa e garante apenas segurança real. A criança sobe, desce, cai e levanta ao seu ritmo. Desenvolve competência motora genuína e autoconfiança.',
   ARRAY['rampa de madeira baixa','degraus seguros','superfícies variadas (relva, tapete, madeira)']::TEXT[],
   45::SMALLINT, 3::SMALLINT),

  ('life_skills'::TEXT, 2::SMALLINT, 4::SMALLINT,
   'Participação Ativa nas Rotinas de Cuidado',
   'A criança é convidada a participar ativamente (vestir, lavar mãos, arrumar brinquedos). O educador espera, oferece tempo, não faz pela criança. "Podes calçar o sapato?" — aguarda. Se não consegue, oferece assistência mínima. A autonomia crescente é celebrada com calma.',
   ARRAY['roupas fáceis de vestir','espaço organizado ao nível da criança']::TEXT[],
   20::SMALLINT, 4::SMALLINT),

  ('arts'::TEXT, 4::SMALLINT, 6::SMALLINT,
   'Exploração Sensorial com Materiais Naturais',
   'A criança explora livremente materiais naturais: areia, terra, argila, água, folhas, pedras. Sem produto final esperado — a exploração sensorial É a atividade. O educador oferece materiais variados e observa sem guiar. A criança aprende as propriedades do mundo físico através do tato.',
   ARRAY['areia','argila','água em recipiente','folhas','pedras lisas','conchas']::TEXT[],
   40::SMALLINT, 5::SMALLINT),

  ('social_emotional'::TEXT, 4::SMALLINT, 6::SMALLINT,
   'Jogo Simbólico Autodirigido',
   'A criança tem acesso a materiais abertos (tecidos, caixas, bonecas simples, utensílios reais pequenos) e inventa as suas próprias brincadeiras. O educador não dirige o jogo. Observa e pode participar SE convidado. O jogo simbólico autodirigido é o trabalho sério da criança.',
   ARRAY['tecidos variados','caixas de cartão','bonecas simples','utensílios domésticos seguros']::TEXT[],
   60::SMALLINT, 6::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 3. Waldorf (3–15 anos) ──────────────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'waldorf-rudolf-steiner')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  -- Pré-escolar (3–6)
  ('arts'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Aquarela Fluida — Pintura com Cores Vivas',
   'A criança pinta em papel húmido com aquarelas em pó diluídas, deixando as cores fluir e misturar-se. Sem imagem prévia definida — a pintura emerge do movimento e da cor. A criança descobre como o azul e o amarelo se encontram e criam verde. Experiência estética pura.',
   ARRAY['aquarelas de alta qualidade','papel de aquarela','esponja','água']::TEXT[],
   30::SMALLINT, 1::SMALLINT),

  ('movement'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Roda de Canções com Movimento — Euritmia Adaptada',
   'Canções tradicionais e sazonais cantadas com movimentos corporais que expressam o conteúdo da canção. A chuva tem movimento de dedos a descer, o sol tem braços abertos, o vento tem corpo a ondular. Ritmo, linguagem, movimento e música integrados numa só atividade.',
   ARRAY['espaço amplo livre']::TEXT[],
   20::SMALLINT, 2::SMALLINT),

  ('life_skills'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Cozinha Sazonal — Pão Artesanal',
   'A criança amassa, molda e coze pão (ou biscoitos, bolachas) em ciclo semanal fixo. O ritual de preparação é tão importante quanto o produto. Atividade sazonal: bolachinhas de especiarias no outono/inverno, biscoitos de mel na primavera. Liga nutrição, matemática, tradição cultural.',
   ARRAY['farinha','fermento ou bicarbonato','sal','água','formas de cozedura']::TEXT[],
   60::SMALLINT, 3::SMALLINT),

  -- 1.º Ciclo (6–10)
  ('language'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Introdução das Letras por Imagem e Narrativa',
   'Cada letra é apresentada através de história: "O Leão Lindo" introduz o L, a criança desenha o leão, vê a forma da letra no contorno do animal, canta uma canção com esse som. Primeiro desenha a letra muitas vezes antes de a ler. Integra narrativa, arte e fonética.',
   ARRAY['lápis de cera de abelha','papel de qualidade','caderno de letras']::TEXT[],
   30::SMALLINT, 4::SMALLINT),

  ('math'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Matemática com Ritmo Corporal — Tabuadas Vivas',
   'A tabuada do 3 é aprendida através de bater palmas e bater no peito em ritmo: bater-bater-palma (1-2-3!), bater-bater-palma (4-5-6!). O 6 é sempre palma. O corpo memoriza o padrão antes da mente. A matemática é vivida antes de ser escrita.',
   ARRAY['espaço para movimento']::TEXT[],
   15::SMALLINT, 5::SMALLINT),

  ('music'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Flauta de Bisel — Aprendizagem por Imitação',
   'A criança aprende flauta doce por imitação (sem partitura no início). O educador toca, a criança repete. Músicas simples, pentatônicas. A técnica de respiração e posição dos dedos é corrigida gentilmente. Prática diária curta (10 min). Ligação à canção do dia ou época do ano.',
   ARRAY['flauta de bisel em dó']::TEXT[],
   15::SMALLINT, 6::SMALLINT),

  ('arts'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Formas de Desenho — Geometria Viva com Lápis de Cera',
   'A criança desenha formas geométricas vivas: espirais, ondas, trançados, simetrias, formas que crescem e se transformam. Não figuras geométricas rígidas, mas formas que "respiram". Desenvolve coordenação, sentido de forma, preparação para geometria e escrita cursiva.',
   ARRAY['lápis de cera de abelha (bloco)','papel liso de qualidade']::TEXT[],
   25::SMALLINT, 7::SMALLINT),

  -- 2.º Ciclo (10–12)
  ('science'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Zoologia por Observação Viva — Caderno de Ciências Artístico',
   'Estudo de grupo de animais (répteis, insetos, mamíferos) começando pela observação direta e narrativa. A criança desenha o animal com detalhe botânico, escreve descrição de habitat, comportamento, alimentação. Sem classificação antes da observação. O caderno de ciências torna-se obra de arte científica.',
   ARRAY['caderno de ciências de capa dura','lápis de cor e de grafite','guia de campo de animais','acesso a natureza ou documentários']::TEXT[],
   50::SMALLINT, 8::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Bloco de História com Caderno Artístico — Épocas',
   'Bloco de 3-4 semanas sobre época histórica (Grécia Antiga, Idade Média, Descobrimentos). A criança ouve narrativas, faz leituras vivas, desenha cenas históricas, escreve narrações, cria mapas ilustrados. O caderno de bloco torna-se livro artístico do período.',
   ARRAY['caderno de bloco Waldorf','lápis de cor e aquarela','livros de história narrativa','mapas históricos']::TEXT[],
   60::SMALLINT, 9::SMALLINT),

  ('math'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Geometria Viva — Construção com Corda e Estacas',
   'A criança constrói figuras geométricas no jardim usando corda e estacas: triângulo equilátero, quadrado, hexágono regular. Depois transporta para papel com compasso e régua. A geometria é a estrutura viva do universo, compreendida no corpo antes de ser abstraída.',
   ARRAY['corda','estacas','compasso','régua','papel de qualidade']::TEXT[],
   45::SMALLINT, 10::SMALLINT),

  -- 3.º Ciclo (12–15)
  ('science'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Ciência com Método Científico — Observação para Teoria',
   'Experimentos estruturados em física, química ou biologia: hipótese, método, recolha de dados, análise, conclusão. Waldorf mantém a observação sensorial como ponto de partida. Física: óptica, termodinâmica; Química: reações, propriedades; Biologia: genética, ecologia.',
   ARRAY['material de laboratório básico','caderno de laboratório','livros de ciência narrativa']::TEXT[],
   60::SMALLINT, 11::SMALLINT),

  ('project'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Projeto de Pesquisa de Longa Duração — Monografia',
   'O adolescente escolhe tópico de interesse genuíno e conduz pesquisa de 4-8 semanas. Recolhe informação de múltiplas fontes, organiza, escreve monografia com texto e ilustrações. Apresenta ao educador ou grupo de forma oral. Desenvolve investigação, escrita, pensamento crítico.',
   ARRAY['livros de referência','acesso a biblioteca','caderno de pesquisa','materiais de apresentação']::TEXT[],
   300::SMALLINT, 12::SMALLINT),

  ('language'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Literatura e Expressão Escrita — Voz Pessoal',
   'Leitura de obras literárias significativas adequadas à idade. Depois escrita: não resumo, mas narração pessoal, reflexão, poesia inspirada, conto original. A voz autêntica do adolescente é encorajada. Discussão de temas, contexto histórico, questões éticas que a obra levanta.',
   ARRAY['livros literários selecionados','caderno de escrita']::TEXT[],
   45::SMALLINT, 13::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 4. Charlotte Mason (3–15 anos) ──────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'charlotte-mason-living-books')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  -- Pré-escolar (3–6)
  ('science'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Nature Walk — Observação Focada ao Ar Livre',
   'Passeio semanal na natureza com objetivo de observação: hoje observamos insetos, amanhã pássaros, depois folhas de árvores diferentes. A criança não apanha, não destrói — observa e faz perguntas. Ao regressar, desenha o que observou no caderno de natureza.',
   ARRAY['caderno de natureza','lápis de cor','lupa','guia de campo simples']::TEXT[],
   60::SMALLINT, 1::SMALLINT),

  ('language'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Narração Oral após Leitura em Voz Alta',
   'O educador lê um trecho de livro vivo (história, conto, mito) em voz alta. Depois pergunta: "Conta-me o que aconteceu." A criança narra com as suas palavras. Sem perguntas de compreensão típicas — a narração prova que compreendeu e desenvolve expressão oral.',
   ARRAY['living books selecionados por faixa etária']::TEXT[],
   20::SMALLINT, 2::SMALLINT),

  ('arts'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Caderno de Natureza — Folhas e Flores Prensadas',
   'A criança recolhe folhas, flores e sementes na natureza e pressiona-as entre páginas de livro. Depois cola no caderno com notas sobre onde encontrou, em que estação. Ao longo do ano cria registo sazonal vivo da natureza à sua volta.',
   ARRAY['caderno grosso','livros pesados para prensar','cola','lápis']::TEXT[],
   30::SMALLINT, 3::SMALLINT),

  -- 1.º Ciclo (6–10)
  ('science'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Caderno de Natureza com Desenho Científico',
   'Uma a duas vezes por semana, observação focada: inseto, planta, pássaro, nuvens. A criança desenha com detalhe e acrescenta notas: cor, tamanho, onde encontrou, comportamento observado. O caderno acumula ao longo de meses e torna-se atlas pessoal da natureza local.',
   ARRAY['caderno de natureza','lápis de grafite e cor','lupa','guia de campo']::TEXT[],
   45::SMALLINT, 4::SMALLINT),

  ('language'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Narração Escrita — Da Escuta à Escrita Pessoal',
   'Após leitura em voz alta de capítulo de living book, a criança escreve narração com as suas próprias palavras. Não é resumo mecânico — é expressão genuína do que reteve e do que considerou importante. A ortografia é corrigida gentilmente, mas a expressão pessoal é preservada.',
   ARRAY['living books de qualidade','caderno de escrita']::TEXT[],
   25::SMALLINT, 5::SMALLINT),

  ('project'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Século Visual — Mapa Cronológico Ilustrado',
   'A criança cria uma linha do tempo ilustrada (o "século visual") em papel largo, colocando figuras, eventos e imagens que descobre ao estudar história. Cada período histórico tem cor e imagem. Ao longo do ano acumula conhecimento histórico num formato visual e pessoal.',
   ARRAY['papel largo ou rolo de papel','lápis de cor','régua','cola','imagens de época']::TEXT[],
   40::SMALLINT, 6::SMALLINT),

  -- 2.º Ciclo (10–12)
  ('language'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Leitura de Literatura Clássica e Narração Estruturada',
   'Leitura de livros inteiros (não abridged): Charlotte Brontë, Charles Dickens, José Saramago (versões adaptadas). Narração escrita por capítulo. Discussão de personagens, motivações, temas. A criança desenvolve gosto literário genuíno, não análise académica mecânica.',
   ARRAY['obras literárias clássicas selecionadas','caderno de leitura']::TEXT[],
   45::SMALLINT, 7::SMALLINT),

  ('science'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Estudo de Ecossistema Local — Observação ao Longo das Estações',
   'Acompanhamento sistemático de um local específico (jardim, parque, campo) ao longo das quatro estações. A criança documenta mudanças: plantas que florescem ou morrem, aves que chegam ou partem, insetos que aparecem. Desenvolve compreensão de ecologia como sistema vivo interligado.',
   ARRAY['caderno de natureza avançado','câmara fotográfica ou smartphone','guias de campo','régua']::TEXT[],
   60::SMALLINT, 8::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Investigação Independente por Interesse Genuíno',
   'A criança escolhe tópico de paixão genuína (espécie animal, período histórico, inventor, país) e conduz investigação através de múltiplos livros vivos. Cria produto final: apresentação, dossier ilustrado, mapa detalhado, ou experiência. Educador oferece recursos, não dirige.',
   ARRAY['livros de referência selecionados','caderno de pesquisa','materiais de apresentação']::TEXT[],
   300::SMALLINT, 9::SMALLINT),

  -- 3.º Ciclo (12–15)
  ('language'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Literatura com Análise Crítica Inicial',
   'Leitura de obras significativas com discussão de temas, ponto de vista do autor, questões éticas levantadas. A análise emerge da conversa genuína, não de perguntas de ficha. A criança escreve reflexão pessoal: concordo/discordo com a personagem? Que questão a obra levanta para mim?',
   ARRAY['obras literárias de qualidade','caderno de reflexão']::TEXT[],
   45::SMALLINT, 10::SMALLINT),

  ('project'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Pesquisa de Longa Duração — Projeto de Excelência',
   'O adolescente investiga tópico de paixão genuína durante 6-10 semanas usando múltiplos livros vivos, possível entrevista com especialista, e fontes primárias quando possível. Escreve ensaio ou cria apresentação de qualidade. Desenvolve investigação, escrita, pensamento independente.',
   ARRAY['biblioteca alargada','caderno de pesquisa','fontes primárias e secundárias']::TEXT[],
   480::SMALLINT, 11::SMALLINT),

  ('science'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Nature Study Avançado — Ciência Cidadã',
   'Observação contínua documentada com classificação precisa. O adolescente pode contribuir a projetos de ciência cidadã (registo de avistamentos de aves, plantas, insetos em plataformas como iNaturalist). Desenvolve rigor científico, atenção ao detalhe, contribuição real à ciência.',
   ARRAY['caderno de natureza científico','lupa ou binóculos','guias de campo avançados','acesso a plataformas de ciência cidadã']::TEXT[],
   60::SMALLINT, 12::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 5. Forest School (3–15 anos) ────────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'forest-school')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  ('movement'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Exploração Livre em Espaço Natural',
   'A criança tem tempo não estruturado em espaço natural (jardim, parque, floresta). Corre, sobe a árvores baixas, explora charcos, descobre insetos. O educador garante segurança mas não dirige. O risco calculado (subir a um tronco, atravessar um ribeiro) é parte do desenvolvimento.',
   ARRAY['roupa adequada à meteorologia','espaço natural acessível']::TEXT[],
   90::SMALLINT, 1::SMALLINT),

  ('science'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Caça ao Tesouro de Natureza — Identificação de Elementos',
   'Lista de elementos a encontrar na natureza: uma folha com nervuras, uma pedra de cor diferente, uma pena, uma semente com "asa". A criança procura, observa, toca. No regresso, partilha descobertas. Desenvolve observação, linguagem descritiva, conexão com natureza.',
   ARRAY['saco de pano','lista de elementos a encontrar (ilustrada)']::TEXT[],
   60::SMALLINT, 2::SMALLINT),

  ('life_skills'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Acender Fogo com Supervisão — Competência Real',
   'Com supervisão direta do educador, a criança aprende sobre segurança no fogo, recolhe material de ignição (gravetos secos, folhas), aprende a construir pira e acende fogo com fósforos. Depois cozinha algo simples (torrada, fruta aquecida). Competência real que constrói autoconfiança genuína.',
   ARRAY['espaço seguro para fogo','material de ignição','fósforos (com supervisão)','alimento para cozinhar']::TEXT[],
   45::SMALLINT, 3::SMALLINT),

  ('science'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Construção de Mini Habitat — Estudo de Ecossistema',
   'A criança identifica animal ou inseto local (minhoca, joaninha, aranha), pesquisa sobre o seu habitat e alimentação, e cria mini habitat adequado (terra húmida, folhas, pedras). Observa durante semanas. Depois liberta o animal. Liga biologia à ética de responsabilidade ambiental.',
   ARRAY['recipiente transparente','terra','pedras','folhas','guia de campo local']::TEXT[],
   60::SMALLINT, 4::SMALLINT),

  ('project'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Construção de Abrigo Natural com Materiais da Floresta',
   'A criança planeia e constrói abrigo com materiais encontrados na natureza (ramos, folhas, musgos, pedras). Primeiro esboça o design no papel, depois executa. Testa se aguenta vento ou chuva. Desenvolve engenharia básica, resolução de problemas, trabalho físico.',
   ARRAY['materiais naturais encontrados in situ','corda de sisal (opcional)','caderno para esboço']::TEXT[],
   120::SMALLINT, 5::SMALLINT),

  ('math'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Medições na Natureza — Matemática Real',
   'A criança mede circunferência de troncos de árvores, altura estimada por sombra e proporção, distância entre árvores. Usa fita métrica, palmos, passos. Regista dados em tabela. Ordena árvores por tamanho. Encontra a árvore mais velha pelo diâmetro. Matemática com propósito real.',
   ARRAY['fita métrica','caderno de campo','lápis']::TEXT[],
   45::SMALLINT, 6::SMALLINT),

  ('science'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Monitorização Ambiental — Projeto de Conservação',
   'Durante semanas, a criança monitoriza indicadores de saúde ambiental num local específico: plantas invasoras, sinais de poluição, qualidade da água, presença de biodiversidade. Regista dados, analisa tendências, propõe ação. Ciência com impacto real e consciência ambiental.',
   ARRAY['caderno de campo','kit simples de pH para água','câmara fotográfica','guias de espécies locais']::TEXT[],
   90::SMALLINT, 7::SMALLINT),

  ('movement'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Orientação com Bússola e Mapa Topográfico',
   'A criança aprende a usar bússola, a ler mapa topográfico básico, e a navegar de ponto A a ponto B em espaço natural. Progride para percurso de orientação com pontos de controlo. Desenvolve competência de navegação, leitura de terreno, autonomia e confiança no exterior.',
   ARRAY['bússola','mapa topográfico da área','caderno de campo']::TEXT[],
   120::SMALLINT, 8::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Projeto de Permacultura — Design de Jardim Comestível',
   'A criança aprende princípios de permacultura, observa o espaço disponível (sol, água, vento), planeia e implementa jardim comestível: composto, zonas de plantas, rega. Acompanha ao longo de meses. Integra ciência, matemática (área, volume), ecologia e vida prática.',
   ARRAY['sementes ou plantas','ferramentas de jardim','materiais de composto','caderno de design']::TEXT[],
   180::SMALLINT, 9::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 6. Unschooling (0–15 anos) ──────────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'unschooling')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  ('project'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Projeto de Interesse Autodirigido — Dinos, Espaço, Minecraft',
   'A criança escolhe tema de paixão atual (dinossauros, espaço, jogos de vídeo, animais). O educador oferece recursos (livros, vídeos, visitas, materiais) sem impor estrutura. A criança mergulha profundamente: lê, experimenta, cria, partilha. O interesse genuíno é o melhor currículo.',
   ARRAY['acesso a biblioteca','materiais relacionados com interesse','acesso a internet com supervisão']::TEXT[],
   120::SMALLINT, 1::SMALLINT),

  ('life_skills'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Gestão de Dinheiro Real — Compras e Orçamento',
   'A criança tem mesada real e responsabilidade de gerir parte das compras da família (snacks, materiais para projetos). Planeia o que quer comprar, calcula se tem dinheiro suficiente, decide entre opções. Matemática financeira real sem folha de exercícios.',
   ARRAY['mesada real','lista de compras','acesso a loja']::TEXT[],
   60::SMALLINT, 2::SMALLINT),

  ('social_emotional'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Participação em Comunidade — Voluntariado e Grupos',
   'A criança participa em atividade comunitária de interesse: clube de leitura, grupo de escuteiros, voluntariado num jardim comunitário, associação desportiva. Aprende colaboração, responsabilidade social, pertença a algo maior. A vida social É o currículo.',
   ARRAY['acesso a grupos e atividades comunitárias']::TEXT[],
   90::SMALLINT, 3::SMALLINT),

  ('math'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Matemática em Contexto de Interesse Real',
   'Se a criança gosta de culinária: faz conversão de receitas, escala para mais pessoas, calcula custo por porção. Se gosta de jogos: calcula probabilidades, estatísticas de equipa. A matemática emerge da necessidade real, não de um manual. O educador sinaliza oportunidades matemáticas.',
   ARRAY['materiais do projeto de interesse','calculadora quando apropriado']::TEXT[],
   60::SMALLINT, 4::SMALLINT),

  ('language'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Escrita para Audiência Autêntica — Blog, Carta, Guia',
   'A criança escreve para comunicar algo que lhe importa genuinamente: um blog sobre o seu hobby, uma carta a uma empresa sobre algo que a preocupa, um guia para outros sobre tópico que domina. A audiência real (não apenas o educador) eleva a qualidade naturalmente.',
   ARRAY['computador ou papel e caneta','plataforma de publicação se adequado']::TEXT[],
   60::SMALLINT, 5::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Empreendimento ou Projeto com Impacto Real',
   'O adolescente identifica algo que quer criar ou resolver: venda de produtos artesanais, serviço para a comunidade, criação de conteúdo online, pesquisa sobre problema real. Planeia, executa, avalia resultados. O projeto tem consequências reais — sucesso e fracasso têm peso.',
   ARRAY['recursos específicos do projeto','acesso a mentores se necessário']::TEXT[],
   480::SMALLINT, 6::SMALLINT),

  ('social_emotional'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Advocacy por Causa Escolhida',
   'O adolescente identifica causa que lhe importa (ambiente, direitos animais, inclusão). Pesquisa, depois age: escreve cartas, organiza evento, cria campanha, contribui para organização. Desenvolve voz cívica, pensamento crítico, responsabilidade social. A cidadania é praticada, não ensinada.',
   ARRAY['acesso a informação','meios de comunicação e ação adequados à causa']::TEXT[],
   120::SMALLINT, 7::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 7. Educação Democrática (5–15 anos) ─────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'educacao-democratica')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  ('social_emotional'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Assembleia Democrática — Tomada de Decisão Coletiva',
   'Reunião semanal onde as crianças (e o educador como igual) discutem propostas para o espaço de aprendizagem: regras, atividades, gestão de conflitos. Cada voto tem igual peso. As decisões são vinculativas — incluindo as do educador. A criança vive democracia, não aprende sobre ela.',
   ARRAY['caderno de atas','espaço circular','regras de participação afixadas']::TEXT[],
   30::SMALLINT, 1::SMALLINT),

  ('project'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Projeto de Interesse Autodirigido com Plano',
   'A criança propõe projeto à assembleia, recebe feedback, cria plano (o quê, como, quando, com quê), executa com autonomia. O educador está disponível, mas não dirige. Apresenta resultado à comunidade. O ciclo completo de projeto autodirigido é praticado repetidamente.',
   ARRAY['caderno de plano de projeto','materiais específicos do projeto']::TEXT[],
   180::SMALLINT, 2::SMALLINT),

  ('language'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Expressão Oral em Assembleia — Argumentação Respeitosa',
   'A criança aprende a apresentar proposta, responder a questões, defender posição com argumentos e ouvir perspetivas diferentes. Práticas: um minuto de apresentação, depois perguntas da assembleia, depois voto com discussão. Desenvolve oratória, argumentação, escuta ativa.',
   ARRAY['espaço de assembleia','relógio para contagem de tempo']::TEXT[],
   30::SMALLINT, 3::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Projeto de Impacto Social — Da Ideia à Ação',
   'O adolescente identifica problema real na comunidade, propõe solução, ganha aprovação da assembleia, executa com orçamento real. Exemplos: horta comunitária, biblioteca itinerante, campanha de sensibilização. Avalia impacto. A educação tem consequência no mundo real.',
   ARRAY['orçamento real (se disponível)','materiais do projeto','parceiros comunitários']::TEXT[],
   480::SMALLINT, 4::SMALLINT),

  ('social_emotional'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Mediação de Conflitos entre Pares — Comissão de Paz',
   'Conflitos entre membros da comunidade são geridos por processo estruturado: cada parte expõe perspetiva sem interrupção, mediador (que pode ser criança) ajuda a encontrar solução mutuamente aceite. O educador não resolve — é recurso de último recurso. Desenvolve empatia, gestão emocional, negociação.',
   ARRAY['espaço privado para mediação','protocolo de mediação afixado']::TEXT[],
   30::SMALLINT, 5::SMALLINT),

  ('language'::TEXT, 10::SMALLINT, 15::SMALLINT,
   'Debate Estruturado — Posições Opostas com Argumentação',
   'A assembleia debate tópico de relevância real (regra proposta, decisão sobre espaço, questão ética). Dois grupos defendem posições opostas, mesmo que não concordem com a posição atribuída. Desenvolve capacidade de compreender múltiplas perspetivas, argumentar com evidências, mudar de posição com elegância.',
   ARRAY['tópico de debate preparado','regras de debate afixadas','cronómetro']::TEXT[],
   45::SMALLINT, 6::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 8. Project-Based Learning (5–15 anos) ───────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'project-based-learning')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  ('project'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Projeto: Construção de Ponte — Engenharia de Materiais',
   'Desafio: construir ponte com materiais limitados (palitos, massa, papel) que aguente o máximo de peso. A criança pesquisa tipos de pontes, desenha protótipo, constrói, testa com pesos, regista resultados, itera design. Produto final: ponte funcional + relatório de engenharia simples.',
   ARRAY['palitos de gelado','massa de modelar','papel','pesos para teste','caderno de projeto']::TEXT[],
   180::SMALLINT, 1::SMALLINT),

  ('science'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Investigação de Ecossistema Local — Mapa de Biodiversidade',
   'A criança investiga o ecossistema ao redor (jardim, parque) durante 4 semanas: regista todas as espécies de plantas, insetos, aves que observa. Cria mapa de biodiversidade do local. Identifica relações (predador-presa, polinizador-planta). Apresenta descobertas a audiência.',
   ARRAY['caderno de campo','câmara fotográfica','guias de campo locais','material de mapeamento']::TEXT[],
   60::SMALLINT, 2::SMALLINT),

  ('language'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Documentação de Projeto — Jornal de Engenheiro',
   'Ao longo de cada projeto, a criança mantém "jornal de engenheiro": desenhos de design, notas de teste, reflexões sobre o que funcionou e o que falhou, planos de iteração. Desenvolve escrita funcional com propósito real. O jornal é parte da avaliação do projeto.',
   ARRAY['caderno de capa dura','canetas e lápis','régua']::TEXT[],
   15::SMALLINT, 3::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Projeto: Criar Produto para Resolver Problema Real',
   'A criança identifica problema real (na família, comunidade, escola local) e cria produto que o resolve. Processo PBL completo: investigação do problema, entrevistas a utilizadores, design de soluções, prototipagem, teste com utilizadores reais, apresentação pública. Produto tem impacto no mundo real.',
   ARRAY['materiais de prototipagem variados','acesso a utilizadores para teste','materiais de apresentação']::TEXT[],
   600::SMALLINT, 4::SMALLINT),

  ('math'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Matemática Aplicada ao Projeto — Orçamentos e Escalas',
   'Em contexto de projeto (construção, horta, evento), a criança calcula orçamentos reais, converte escalas em planos de arquitetura, analisa dados recolhidos em gráficos. A matemática é ferramenta necessária para o projeto, não exercício isolado.',
   ARRAY['projeto em curso','calculadora','folhas de cálculo ou papel quadriculado']::TEXT[],
   45::SMALLINT, 5::SMALLINT),

  ('science'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Projeto Científico com Produto Funcional',
   'A criança conduz investigação científica que resulta em produto funcional: filtro de água, sistema de compostagem, painel solar simples, termómetro caseiro. Hipótese, experimento, produto funcional, relatório científico. A ciência tem aplicação imediata.',
   ARRAY['materiais específicos do projeto científico','caderno de laboratório']::TEXT[],
   300::SMALLINT, 6::SMALLINT),

  ('project'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Projeto: Solução para Desafio Comunitário Real',
   'O adolescente identifica desafio genuíno na comunidade (resíduos, acessibilidade, informação), pesquisa com profundidade (entrevistas, dados, literatura), propõe e implementa solução. Pode envolver colaboração com organização real. Apresenta impacto medido. Experiência de liderança cívica.',
   ARRAY['recursos do projeto','parceiros comunitários','materiais de implementação']::TEXT[],
   1200::SMALLINT, 7::SMALLINT),

  ('language'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Apresentação Pública de Projeto — Pitch e Defesa',
   'O adolescente apresenta projeto completo a audiência real (família, comunidade, painéis de avaliação). Prepara apresentação estruturada (problema, investigação, solução, impacto). Responde a questões críticas. Desenvolvce oratória, defesa de posição, comunicação profissional.',
   ARRAY['slides ou materiais de apresentação','espaço de apresentação','audiência real']::TEXT[],
   60::SMALLINT, 8::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 9. Inquiry-Based Learning (5–15 anos) ───────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'inquiry-based-learning')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  ('science'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Ciclo de Investigação Guiada — O que Acontece Se...?',
   'O educador apresenta fenómeno intrigante (gelo que flutua, sombra que muda, planta que se vira para o sol). A criança formula pergunta, propõe explicação (hipótese), desenha experimento simples, testa, regista observações, conclui. Ciclo científico completo em formato acessível.',
   ARRAY['materiais para fenómeno específico','caderno de investigação','lupa']::TEXT[],
   60::SMALLINT, 1::SMALLINT),

  ('project'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Pergunta Geradora — Da Curiosidade à Investigação',
   'A criança formula pergunta genuína sobre algo que observou no mundo ("Porque é que os pássaros migram?", "Como as abelhas sabem onde está o mel?"). Com apoio do educador, planeia investigação: que fontes consultar, que experimento fazer, que observações recolher. A pergunta da criança lidera.',
   ARRAY['acesso a livros de referência','caderno de investigação','materiais variados conforme pergunta']::TEXT[],
   90::SMALLINT, 2::SMALLINT),

  ('language'::TEXT, 5::SMALLINT, 10::SMALLINT,
   'Documentação de Descobertas — Livro de Investigação',
   'A criança regista investigações em livro pessoal: a pergunta, o que sabia antes, o que investigou, o que descobriu, novas perguntas que surgiram. Com desenhos e texto. Este livro é portfólio vivo do pensamento científico da criança e fonte de novas investigações.',
   ARRAY['caderno de investigação ou livro de capa dura','lápis e canetas']::TEXT[],
   20::SMALLINT, 3::SMALLINT),

  ('science'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Design de Experimento Controlado — Variáveis e Controlo',
   'A criança aprende a isolar variáveis num experimento: o que mudo (variável independente), o que meço (variável dependente), o que mantenho igual (controlo). Conduz experimento com estas regras. Analisa se os dados suportam ou refutam a hipótese. Registos em tabela e gráfico.',
   ARRAY['materiais para experimento específico','caderno de laboratório','papel quadriculado para gráficos']::TEXT[],
   90::SMALLINT, 4::SMALLINT),

  ('math'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Análise de Dados — Gráficos e Tendências',
   'A partir de dados recolhidos em investigação (temperatura ao longo do dia, crescimento de planta, resultado de experimentos), a criança representa em gráfico (barras, linhas, dispersão), calcula médias e medianas, identifica tendências e anomalias. Estatística com propósito real.',
   ARRAY['dados recolhidos em investigação','papel quadriculado','régua','calculadora']::TEXT[],
   45::SMALLINT, 5::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Investigação de Fenómeno Complexo — Multi-Ângulos',
   'A criança escolhe fenómeno complexo (mudanças climáticas, desaparecimento de abelhas, poluição local) e investiga de múltiplos ângulos: científico, social, económico, histórico. Integra perspetivas para compreensão sistémica. Produto: mapa conceptual + ensaio de síntese.',
   ARRAY['livros e artigos de referência','acesso à internet com supervisão','caderno de síntese']::TEXT[],
   300::SMALLINT, 6::SMALLINT),

  ('science'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Investigação Científica Independente — Protocolo Rigoroso',
   'O adolescente conduz investigação científica completa: revisão de literatura, formulação de hipótese testável, design de experimento com controles adequados, recolha sistemática de dados, análise estatística, conclusões com limitações reconhecidas. Escreve relatório em formato científico.',
   ARRAY['materiais de laboratório','acesso a literatura científica','software de análise de dados ou Excel']::TEXT[],
   600::SMALLINT, 7::SMALLINT),

  ('math'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Estatística Aplicada — Análise de Dados de Investigação',
   'O adolescente aplica conceitos estatísticos (média, desvio padrão, correlação, teste de hipótese simples) a dados recolhidos em investigação real. Usa software (Excel, Sheets, ou Python). A estatística é ferramenta necessária para a investigação, não matéria isolada.',
   ARRAY['dados de investigação própria','computador com Excel ou Sheets','calculadora científica']::TEXT[],
   60::SMALLINT, 8::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 10. STEAM (3–15 anos) ───────────────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'steam-methodology')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  ('arts'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Escultura com Argila e Palitos — Estruturas 3D',
   'A criança cria estruturas tridimensionais com argila (como nó) e palitos (como vigas). Começa livremente, depois com desafio: "Podes fazer uma estrutura que se aguente?" Descobre que triângulos são mais estáveis que quadrados. Integra arte e engenharia básica de forma lúdica.',
   ARRAY['argila','palitos de dentes ou espaguete cru','superfície de trabalho']::TEXT[],
   30::SMALLINT, 1::SMALLINT),

  ('science'::TEXT, 3::SMALLINT, 6::SMALLINT,
   'Ciência das Cores — Mistura de Tintas e Pigmentos',
   'A criança mistura tintas de cores primárias e observa o que acontece. Regista com pintura: "azul + amarelo = ?" Depois experimenta com luz (lanternas com celofane colorido). Descobre que cores-luz e cores-tinta se comportam diferente. Ciência e arte simultâneas.',
   ARRAY['tintas laváveis (primárias)','papel branco','lanternas','celofane colorido','pincéis']::TEXT[],
   30::SMALLINT, 2::SMALLINT),

  ('project'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Projeto: Ponte de Papel — Engenharia com Restrições',
   'Desafio de engenharia: com 10 folhas de papel, fita e cola, construir ponte de 30cm que aguente o máximo peso. A criança pesquisa formas estruturais (arco, treliça), faz esboços, constrói, testa, itera. Descobre que a forma importa mais do que a quantidade de material.',
   ARRAY['folhas de papel A4','fita-cola','cola','moedas como peso','régua']::TEXT[],
   120::SMALLINT, 3::SMALLINT),

  ('science'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Circuito Elétrico Simples — Luz, Buzzer e Interruptor',
   'A criança aprende componentes básicos de circuito (bateria, fio, LED, interruptor). Liga circuito simples que acende LED. Depois adiciona buzzer, dois LEDs em paralelo e em série. Descobre diferença entre série e paralelo. Introdução à eletricidade através de experiência direta.',
   ARRAY['kit de circuito simples (pilhas, LEDs, fios, interruptor)','suporte de pilhas']::TEXT[],
   60::SMALLINT, 4::SMALLINT),

  ('math'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Geometria com Construção 3D — Sólidos de Euler',
   'A criança constrói sólidos geométricos (cubo, pirâmide, prisma) com palitos e massa de modelar. Conta vértices, arestas e faces. Descobre a relação de Euler (V - A + F = 2). A geometria torna-se objeto físico, não figura num manual.',
   ARRAY['palitos de espaguete ou canetas','massa de modelar','papel quadriculado para registo']::TEXT[],
   60::SMALLINT, 5::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Projeto: Robótica com LEGO Mindstorms ou micro:bit',
   'A criança programa um robot para completar tarefa específica: navegar labirinto, seguir linha, medir distâncias. Processo: desenho do comportamento em pseudocódigo, programação em blocos (Scratch/MakeCode), teste, depuração, iteração. Integra programação, engenharia, matemática.',
   ARRAY['LEGO Mindstorms, micro:bit ou kit equivalente','computador com software de programação']::TEXT[],
   180::SMALLINT, 6::SMALLINT),

  ('arts'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Design Gráfico Digital — Identidade Visual de Projeto',
   'Em contexto de projeto maior, a criança cria identidade visual: logótipo, paleta de cores, tipografia, poster. Usa ferramenta digital (Canva, Inkscape). Aprende princípios básicos de design: contraste, alinhamento, repetição, proximidade. O design serve a comunicação do projeto.',
   ARRAY['computador com acesso a Canva ou Inkscape','referências visuais','briefing do projeto']::TEXT[],
   90::SMALLINT, 7::SMALLINT),

  ('project'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Projeto: Sistema de Monitorização Ambiental com Arduino',
   'O adolescente constrói sistema que monitoriza temperatura, humidade e luminosidade com sensores Arduino. Escreve código em C++ (IDE Arduino), monta circuito em protoboard, visualiza dados em gráfico em tempo real. Produto funcional com dados ambientais reais do seu espaço.',
   ARRAY['Arduino Uno','sensores (DHT11, LDR)','protoboard','fios','computador com IDE Arduino']::TEXT[],
   300::SMALLINT, 8::SMALLINT),

  ('science'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Projeto: Investigação e Inovação em Biomimética',
   'O adolescente estuda fenómeno biológico (estrutura de colmeia, hidrofobia de folha de lótus, aerodinâmica de pássaro), compreende princípio físico subjacente, e desenha/constrói protótipo de engenharia inspirado nesse princípio. Integra biologia, física, design, engenharia.',
   ARRAY['materiais de construção variados','acesso a literatura científica','ferramentas básicas de prototipagem']::TEXT[],
   600::SMALLINT, 9::SMALLINT),

  ('math'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Análise de Dados com Python — Visualização e Estatística',
   'O adolescente aprende Python básico para analisar dados de investigação: carrega CSV, calcula estatísticas descritivas, cria gráficos com matplotlib. Aplica a dados reais do projeto (ambiental, social, científico). A programação é ferramenta para pensar sobre dados.',
   ARRAY['computador com Python instalado (Anaconda)','dados de projeto em CSV','tutoriais de referência']::TEXT[],
   120::SMALLINT, 10::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 11. Reggio Emilia (0–10 anos) ───────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'reggio-emilia')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  ('arts'::TEXT, 0::SMALLINT, 4::SMALLINT,
   'Exploração Sensorial com Materiais Naturais — Atelier',
   'A criança tem acesso a mesa de exploração com materiais naturais variados: areia húmida, argila mole, água com colorante, folhas, pedras, conchas. Sem instrução. Toca, transforma, mistura, observa. O educador fotografa e documenta o processo. A exploração sensorial é o currículo.',
   ARRAY['areia','argila mole','água colorida','folhas','pedras','conchas','recipientes variados']::TEXT[],
   45::SMALLINT, 1::SMALLINT),

  ('social_emotional'::TEXT, 0::SMALLINT, 4::SMALLINT,
   'Jogo Simbólico Partilhado — Construção de Narrativa Coletiva',
   'Duas ou mais crianças pequenas têm acesso a materiais abertos (blocos, tecidos, figuras simples). O educador observa como a narrativa coletiva emerge — quem propõe, quem adapta, como os conflitos são geridos. Intervém minimamente. Documenta com câmara. O jogo social é o principal currículo desta idade.',
   ARRAY['blocos de madeira','tecidos','figuras simples','espaço amplo']::TEXT[],
   60::SMALLINT, 2::SMALLINT),

  ('arts'::TEXT, 4::SMALLINT, 6::SMALLINT,
   'Atelier — Escultura e Construção com Materiais Abertos',
   'No atelier Reggio, a criança usa materiais ricos (argila, arame, palitos, tecido, papel reciclado, objetos encontrados) para dar forma tridimensional a ideia ou emoção. Sem modelo a copiar. O "atelierista" documenta o processo com fotos e notas. O produto e o processo têm igual valor.',
   ARRAY['argila','arame','palitos','papel reciclado','tecido','objetos encontrados','câmara para documentação']::TEXT[],
   60::SMALLINT, 3::SMALLINT),

  ('project'::TEXT, 4::SMALLINT, 6::SMALLINT,
   'Projeto de Investigação Emergente — Documentado',
   'A criança expressa curiosidade ("Porque é que as minhocas saem quando chove?"). O educador documenta a pergunta, propõe investigação: observar minhocas, ler sobre elas, experimentar. A criança investiga ao seu ritmo. O educador cria "painel de documentação" com fotos, desenhos, falas da criança.',
   ARRAY['caderno de documentação','câmara fotográfica','materiais específicos da investigação','painéis de documentação']::TEXT[],
   90::SMALLINT, 4::SMALLINT),

  ('language'::TEXT, 4::SMALLINT, 6::SMALLINT,
   'Narrativa Emergente — As Cem Linguagens da Criança',
   'A criança expressa pensamento e emoção através de múltiplas linguagens: desenho, modelagem, movimento, voz, construção. O educador documenta cada expressão e cria espaço para que a criança "conta a sua história" em diferentes formatos. A literacia emerge naturalmente desta riqueza expressiva.',
   ARRAY['materiais de arte variados','espaço de expressão','câmara para documentação']::TEXT[],
   45::SMALLINT, 5::SMALLINT),

  ('project'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Projeto de Longa Duração com Documentação Rica',
   'A criança e o educador co-constroem projeto de investigação que dura semanas (a cidade, as árvores, a luz, a água). Cada sessão tem investigação, expressão artística, e documentação. O educador cria painéis que mostram o percurso da aprendizagem. A memória do processo é partilhada e revisitada.',
   ARRAY['materiais variados do projeto','painéis de documentação','câmara','caderno de registo']::TEXT[],
   300::SMALLINT, 6::SMALLINT),

  ('science'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Investigação de Fenómeno Natural — A Luz e as Sombras',
   'A criança investiga um fenómeno natural de múltiplos ângulos: observa (como a sombra muda ao longo do dia?), experimenta (o que acontece com luz de diferentes ângulos?), representa artisticamente (pintura de sombras, teatro de sombras), e documenta descobertas. Ciência e arte indissociáveis.',
   ARRAY['lanterna','objetos variados','papel branco grande','tintas','caderno de descobertas']::TEXT[],
   60::SMALLINT, 7::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 12. Classical Education (6–15 anos) ─────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'classical-education')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  -- Grammar Stage (6–10)
  ('language'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Gramática e Ortografia — Base Sólida da Língua',
   'Ensino explícito e sistemático de regras gramaticais: classes de palavras, conjugações verbais, concordância. Ditados regulares para fixar ortografia. Cópia de textos de qualidade para desenvolver caligrafia e assimilar bom português. A gramática é a base sobre a qual toda a expressão escrita posterior repousa.',
   ARRAY['gramática de referência','caderno de ditados','textos selecionados para cópia']::TEXT[],
   30::SMALLINT, 1::SMALLINT),

  ('math'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Aritmética com Domínio Factual — Operações e Tabuadas',
   'Domínio sólido das quatro operações com números inteiros. Memorização das tabuadas até 12×12 através de prática regular (10 min diários). Divisão longa, frações, decimais apresentados sequencialmente. O aluno deve ter fluência calculatória antes de avançar para conceitos abstratos.',
   ARRAY['fichas de prática de aritmética','cartões de tabuada','livro de aritmética clássico']::TEXT[],
   30::SMALLINT, 2::SMALLINT),

  ('science'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Ciências Naturais — Classificação e Nomenclatura',
   'Estudo de reinos naturais com classificação sistemática: reino animal (vertebrados/invertebrados, mamíferos/répteis), reino vegetal (angiospermas/gimnospermas), minerais. O aluno aprende a nomear e classificar com rigor. Desenho científico detalhado de espécimes. Base factual para ciência posterior.',
   ARRAY['atlas de ciências naturais','caderno de ciências com desenho','coleção de espécimes (folhas, pedras)']::TEXT[],
   40::SMALLINT, 3::SMALLINT),

  ('language'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Poesia e Textos Clássicos — Memorização e Recitação',
   'Memorização semanal de poema ou trecho de prosa de qualidade. O aluno recita de memória com dicção clara. Ao longo do ano, acumula repertório de textos significativos da literatura portuguesa e universal. A memorização não é apenas exercício — fixa modelos de excelência linguística.',
   ARRAY['antologia de poesia e prosa selecionada','caderno de memorização']::TEXT[],
   15::SMALLINT, 4::SMALLINT),

  -- Logic Stage (10–12)
  ('language'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Dialética — Análise de Argumento e Falácias Lógicas',
   'O aluno aprende a identificar a estrutura de um argumento (premissas, conclusão), a testar a sua validade, e a reconhecer falácias comuns (ad hominem, falsa dicotomia, apelo à autoridade). Analisa textos, discursos e publicidade com estas ferramentas. A lógica é a gramática do raciocínio.',
   ARRAY['manual de lógica básica','exemplos de argumentos (textos, discursos, publicidade)','caderno de lógica']::TEXT[],
   45::SMALLINT, 5::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Ensaio Estruturado — Tese, Argumentos, Conclusão',
   'O aluno escreve ensaios com estrutura rigorosa: tese clara, três argumentos com evidências, refutação de contra-argumento, conclusão. Tópicos em história, filosofia ou ciências. O educador avalia clareza da tese, qualidade das evidências, coerência lógica. A escrita persuasiva é competência central.',
   ARRAY['fontes de referência para o tópico','caderno de rascunho','guia de estrutura de ensaio']::TEXT[],
   90::SMALLINT, 6::SMALLINT),

  ('math'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Álgebra e Lógica Matemática — Demonstrações',
   'Álgebra clássica com ênfase na compreensão dos princípios, não apenas na manipulação. Introdução a demonstrações matemáticas simples (propriedades dos números, teoremas geométricos). O aluno aprende a provar, não apenas a calcular. Geometria euclidiana com demonstrações.',
   ARRAY['livro de álgebra clássico','livro de geometria euclidiana','caderno de demonstrações']::TEXT[],
   45::SMALLINT, 7::SMALLINT),

  -- Rhetoric Stage (12–15)
  ('language'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Retórica — Escrita Persuasiva e Oratória',
   'O adolescente estuda retórica clássica (ethos, pathos, logos) e aplica em discursos e ensaios. Escreve ensaios de argumento sobre tópicos genuinamente controversos. Pratica discurso oral perante audiência. O objetivo é articular pensamento com clareza, elegância e força persuasiva.',
   ARRAY['manual de retórica','modelos de discursos clássicos','caderno de escrita']::TEXT[],
   60::SMALLINT, 8::SMALLINT),

  ('project'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Debate Socrático e Discussão de Grandes Ideias',
   'O adolescente lê texto filosófico, histórico ou literário significativo e participa em discussão socrática: o educador faz perguntas abertas, não dá respostas. O adolescente defende posição, ouve objeções, revisa posição se necessário. Desenvolve pensamento rigoroso e gosto pelo diálogo intelectual.',
   ARRAY['textos filosóficos e literários selecionados','caderno de notas']::TEXT[],
   60::SMALLINT, 9::SMALLINT),

  ('science'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Ciência com História da Ciência — Contexto e Método',
   'O adolescente estuda descobertas científicas no seu contexto histórico: como Galileu chegou ao heliocentrismo, como Newton formulou a gravitação, como Darwin desenvolveu a teoria da evolução. Compreende a ciência como empreendimento humano, não conjunto de factos. Depois conduz experimento histórico.',
   ARRAY['livros de história da ciência','materiais de laboratório para experimentos históricos','caderno de laboratório']::TEXT[],
   90::SMALLINT, 10::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 13. Movimento Escola Moderna (6–15 anos) ────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'movimento-escola-moderna')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  -- 1.º Ciclo (6–10)
  ('language'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Texto Livre — Escrita Autêntica da Criança',
   'A criança escreve livremente sobre o que lhe importa genuinamente: um acontecimento, um sentimento, uma observação, uma história inventada. Sem tema imposto. O educador ajuda na revisão, mas preserva a voz da criança. O melhor texto é partilhado com o grupo e pode ser publicado no jornal de classe.',
   ARRAY['caderno de texto livre','lápis e caneta']::TEXT[],
   30::SMALLINT, 1::SMALLINT),

  ('social_emotional'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Conselho Cooperativo — Gestão Democrática do Espaço',
   'Reunião semanal onde crianças e educador gerem a vida em comum: planeiam atividades, resolvem conflitos, propõem e votam mudanças. Cada criança tem voz e voto igual. As decisões são vinculativas para todos, incluindo o educador. Democracia vivida, não ensinada.',
   ARRAY['caderno de atas do conselho','espaço circular']::TEXT[],
   30::SMALLINT, 2::SMALLINT),

  ('project'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'PIT — Plano Individual de Trabalho Semanal',
   'A criança (com apoio do educador) planeia o seu trabalho para a semana: que áreas vai trabalhar, que dificuldades quer superar, que projeto vai avançar. No fim da semana, avalia o que completou e o que fica pendente. Desenvolve autonomia, autogestão e responsabilidade.',
   ARRAY['ficha de PIT (semanal)','caderno de registo de trabalho']::TEXT[],
   20::SMALLINT, 3::SMALLINT),

  ('math'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Ficheiros de Matemática Cooperativa',
   'Cada criança trabalha em ficheiro de matemática no seu nível (não no nível da turma). Quando termina exercício, consulta a solução afixada e auto-corrige. O educador circula e explica dúvidas individuais. A diferenciação pedagógica é estrutural, não exceção.',
   ARRAY['ficheiros de matemática graduados','soluções afixadas para auto-correção','caderno de matemática']::TEXT[],
   30::SMALLINT, 4::SMALLINT),

  -- 2.º Ciclo (10–12)
  ('language'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Texto Livre Avançado — Múltiplos Géneros com Edição Rigorosa',
   'A criança escreve regularmente em géneros variados: narrativa, crónica, poesia, artigo de opinião, reflexão pessoal. Processo de edição mais rigoroso: rascunho, revisão com par, versão final. Os melhores textos são publicados no jornal de classe ou em blog partilhado com famílias.',
   ARRAY['caderno de escrita','computador para edição','jornal de classe']::TEXT[],
   45::SMALLINT, 5::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Projetos Colaborativos Complexos — Produto para Comunidade',
   'Grupo trabalha durante semanas em projeto que culmina em produto para comunidade mais alargada: documentário sobre tema de investigação, exposição, publicação de livro de pesquisa coletiva, organização de evento. Cada criança tem papel específico. Integra múltiplas disciplinas.',
   ARRAY['materiais específicos do projeto','câmara de vídeo ou fotografia','computador para edição']::TEXT[],
   600::SMALLINT, 6::SMALLINT),

  ('math'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Matemática em Contexto Real — Orçamento, Gráficos, Escala',
   'A matemática serve um projeto ou investigação real. A criança calcula orçamento para viagem de classe, analisa gráficos de dados investigados, desenha planta de arquitetura em escala, estima custos. A matemática é ferramenta para fazer coisas que importam genuinamente.',
   ARRAY['projeto em curso','calculadora','papel quadriculado','régua']::TEXT[],
   45::SMALLINT, 7::SMALLINT),

  -- 3.º Ciclo (12–15)
  ('project'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Investigação Independente Profunda — Monografia',
   'O adolescente identifica pergunta de investigação genuinamente interessante, conduz pesquisa rigorosa (fontes múltiplas, entrevistas se relevante, análise crítica de informação), escreve ensaio académico ou monografia. Torna-se "especialista" no tópico. Apresenta a audiência real.',
   ARRAY['acesso a biblioteca e internet','caderno de pesquisa','software de escrita']::TEXT[],
   600::SMALLINT, 8::SMALLINT),

  ('social_emotional'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Participação em Projeto de Impacto Social',
   'O adolescente identifica problema real (lixo, exclusão, ambiente, informação) e trabalha em solução com impacto real: campanha de sensibilização, organização de evento comunitário, criação de recurso educativo, voluntariado. Cidadania praticada com responsabilidade genuína.',
   ARRAY['recursos específicos do projeto de impacto','parceiros comunitários']::TEXT[],
   480::SMALLINT, 9::SMALLINT),

  ('language'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Conteúdo Multimédia Publicável — Blog, Podcast ou Vídeo',
   'O adolescente cria conteúdo de qualidade para audiência real: blog com artigos sobre tema de interesse, podcast com episódios regulares, canal YouTube educativo. O conteúdo reflete investigação genuína e expressão autêntica. A audiência real (não apenas o educador) eleva a qualidade.',
   ARRAY['computador','microfone (para podcast)','câmara (para vídeo)','plataforma de publicação']::TEXT[],
   120::SMALLINT, 10::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ─── 14. Blended Learning (6–15 anos) ────────────────────────────────────────

WITH m AS (SELECT id FROM methodologies WHERE slug = 'blended-learning')
INSERT INTO methodology_activities
  (methodology_id, discipline_key, age_min, age_max,
   activity_title, activity_description, materials, duration_minutes, sort_order)
SELECT m.id, v.discipline_key, v.age_min, v.age_max,
       v.activity_title, v.activity_description, v.materials,
       v.duration_minutes, v.sort_order
FROM m,
(VALUES
  -- 1.º Ciclo (6–10)
  ('math'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Khan Academy Matemática — Prática Adaptativa + Aplicação Física',
   'A criança usa Khan Academy para praticar conceito matemático no seu nível (o sistema adapta ao ritmo). Depois de dominar online, aplica em contexto físico: problema de matemática com objetos reais. O digital oferece prática imediata e feedback; o físico oferece compreensão contextualizada.',
   ARRAY['computador ou tablet com Khan Academy','objetos para aplicação física','caderno de matemática']::TEXT[],
   45::SMALLINT, 1::SMALLINT),

  ('language'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Leitura Digital e Narração Oral — Livros em Áudio + Discussão',
   'A criança ouve audiolivro ou podcast educativo adequado à faixa etária. Depois narra oralmente o que ouviu e responde a perguntas abertas do educador. Alterna com leitura física de living books. O digital expande o acesso a conteúdo; a narração garante compreensão profunda.',
   ARRAY['tablet ou computador com audiolivros','living books físicos']::TEXT[],
   30::SMALLINT, 2::SMALLINT),

  ('project'::TEXT, 6::SMALLINT, 10::SMALLINT,
   'Projeto Híbrido Digital-Físico — Investigação e Produto',
   'A criança investiga tópico usando recursos digitais (vídeos documentários, artigos simples, imagens). Depois cria produto físico: maquete, poster ilustrado, modelo 3D em argila, experimento. O digital fornece informação; o físico dá expressão e profundidade à aprendizagem.',
   ARRAY['tablet com acesso a recursos educativos','materiais para produto físico','caderno de projeto']::TEXT[],
   120::SMALLINT, 3::SMALLINT),

  -- 2.º Ciclo (10–12)
  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Investigação Temática com Avaliação Crítica de Fontes',
   'A criança escolhe tema e pesquisa usando múltiplos recursos online (Khan Academy, Wikipedia, documentários, artigos Newsela). Aprende a avaliar fontes: quem escreveu? Tem base? Há bias? Sintetiza em apresentação visual (Google Slides, Canva). Literacia informacional crítica como competência central.',
   ARRAY['computador com acesso a internet','Canva ou Google Slides','caderno de síntese']::TEXT[],
   180::SMALLINT, 4::SMALLINT),

  ('science'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Laboratório Virtual — PhET e Simulações Interativas',
   'A criança usa PhET Interactive Simulations (Colorado) para explorar fenómenos físicos e químicos de forma segura: circuitos, movimento de projéteis, equilíbrio de forças, reações químicas. Muda parâmetros e observa resultados. Depois replica fenómeno fisicamente quando possível.',
   ARRAY['computador com acesso a PhET (phet.colorado.edu)','caderno de laboratório','materiais físicos para replica quando possível']::TEXT[],
   60::SMALLINT, 5::SMALLINT),

  ('language'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Criação de Conteúdo Multimédia — Vídeo ou Podcast Educativo',
   'A criança pesquisa tópico, escreve script, grava vídeo ou episódio de podcast explicando o que aprendeu. Edita em iMovie ou Audacity (gratuito). Produzir conteúdo educativo para outro obriga a compreensão profunda. A audiência (família, amigos) oferece motivação autêntica.',
   ARRAY['computador ou tablet','microfone','câmara ou smartphone','iMovie ou Audacity']::TEXT[],
   120::SMALLINT, 6::SMALLINT),

  ('project'::TEXT, 10::SMALLINT, 12::SMALLINT,
   'Programação em Python — Criar Programa com Propósito',
   'A criança aprende Python básico (variáveis, condicionais, ciclos, funções) através de Code.org ou Codecademy. Depois cria programa com propósito próprio: calculadora, quiz, jogo simples, gerador de histórias. O produto funcional motivante supera qualquer exercício sem propósito.',
   ARRAY['computador com Python instalado ou Replit online','tutoriais de referência (Code.org, Codecademy)']::TEXT[],
   90::SMALLINT, 7::SMALLINT),

  -- 3.º Ciclo (12–15)
  ('project'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Projeto Pessoal Digital de Longa Duração — Portfólio',
   'O adolescente desenvolve projeto digital duradouro de interesse genuíno: website, aplicação, série de vídeo YouTube, podcast, livro auto-publicado, game em Unity. O projeto evolui ao longo de meses. Cria portfólio autêntico que demonstra competências reais para candidaturas futuras.',
   ARRAY['computador','ferramentas específicas do projeto (Unity, Flutter, WordPress, etc.)','plataforma de publicação']::TEXT[],
   1200::SMALLINT, 8::SMALLINT),

  ('science'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Investigação Académica com Google Scholar e Fontes Peer-Reviewed',
   'O adolescente identifica pergunta de investigação, acede a artigos académicos (Google Scholar, PubMed, JSTOR), lê e sintetiza evidência científica, distingue entre evidência e opinião. Escreve revisão de literatura ou ensaio de síntese. Prepara para rigor académico universitário.',
   ARRAY['computador com acesso a Google Scholar','caderno de síntese','software de referências bibliográficas']::TEXT[],
   180::SMALLINT, 9::SMALLINT),

  ('language'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Análise Crítica de Algoritmos e Misinformação',
   'O adolescente aprende como algoritmos de recomendação funcionam (Netflix, YouTube, Instagram), como a misinformação se propaga, como identificar deepfakes e propaganda. Analisa exemplos reais. Escreve reflexão ou artigo sobre implicações para democracia e cognição. Literacia digital crítica.',
   ARRAY['computador com acesso a exemplos de misinformação','artigos sobre media literacy','caderno de análise']::TEXT[],
   60::SMALLINT, 10::SMALLINT),

  ('project'::TEXT, 12::SMALLINT, 15::SMALLINT,
   'Contribuição a Comunidade Online de Aprendizado',
   'O adolescente participa ativamente em comunidades online de interesse (Stack Overflow para programação, fóruns científicos, comunidades de escritores). Faz perguntas de qualidade, oferece respostas com fundamentação, aprende de pares globais. A aprendizagem social digital como extensão do currículo.',
   ARRAY['computador com acesso a plataformas de comunidade','perfil verificado e responsável']::TEXT[],
   60::SMALLINT, 11::SMALLINT)

) AS v(discipline_key, age_min, age_max, activity_title, activity_description, materials, duration_minutes, sort_order);


-- ============================================================================
-- FIM DA MIGRATION 008
-- ============================================================================
