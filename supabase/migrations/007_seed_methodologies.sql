-- ============================================================================
-- NexSeed — Migration 007
-- Seed: methodologies + methodology_principles + methodology_compatibility
--
-- 14 metodologias pedagógicas para homeschooling
-- Fonte: /Curriculo_Nexseed/*.md
-- ============================================================================


-- ─── 1. METHODOLOGIES ────────────────────────────────────────────────────────

INSERT INTO methodologies
  (slug, name, category, short_description, philosophy_summary, intensity,
   materials_cost, age_min, age_max, ai_generation_style, keywords, sort_order)
VALUES

-- 01. Montessori
('montessori',
 'Metodologia Montessori',
 'pedagogias-classicas',
 'Aprendizagem autónoma com materiais sensoriais estruturados, respeitando os períodos sensitivos do desenvolvimento de cada criança.',
 'Criada por Maria Montessori, baseia-se na liberdade dentro de limites, num ambiente preparado que favorece a independência, e em materiais que contêm o controlo do erro. A criança é guiada por períodos sensitivos naturais.',
 'media', 'alto', 3, 12,
 'A IA deve gerar atividades que promovam autonomia, utilizem materiais estruturados e concretos, seguindo períodos sensitivos do desenvolvimento. Cada atividade deve incluir apresentação clara, etapas isoladas, e oportunidade de repetição e refinamento.',
 ARRAY['períodos sensitivos','ambiente preparado','isolamento de dificuldades','controlo do erro','materiais manipulativos','autonomia','ciclo de trabalho','vida prática','educação cósmica','aprendizagem sensorial','autogestão','observação científica'],
 1),

-- 02. Pikler / RIE
('pikler',
 'Metodologia Pikler / Educação RIE',
 'natureza-experiencia',
 'Abordagem centrada no bebé e toddler: movimento autónomo, brincar livre não dirigido, e momentos de cuidado como conexão profunda.',
 'Criada pela pediatra húngara Emmi Pikler, valoriza a criança como ser competente desde o nascimento. O adulto observa sem interferir, permitindo que o desenvolvimento motor e cognitivo ocorra no ritmo natural da criança.',
 'baixa', 'baixo', 0, 6,
 'A IA deve gerar atividades que promovam movimento autónomo, brincar livre não estruturado, e momentos de cuidado (feeding, diapering, bathing) como conexão significativa. Enfatize respeito pela iniciativa da criança, ausência de intervenção adulta desnecessária, e materiais simples, seguros, e de exploração aberta.',
 ARRAY['movimento autónomo','brincar livre','cuidado como conexão','observação respeitosa','respeito pela iniciativa','ritmo natural','materiais simples','vínculo seguro','RIE','Emmi Pikler','não interferência','exploração aberta'],
 2),

-- 03. Waldorf
('waldorf-rudolf-steiner',
 'Metodologia Waldorf (Rudolf Steiner)',
 'pedagogias-classicas',
 'Educação que integra artes em todas as disciplinas, organizada em épocas temáticas de 3-4 semanas, respeitando os ciclos de desenvolvimento em septénios.',
 'Rudolf Steiner criou esta pedagogia em 1919 baseada na Antroposofia. A educação respeita os ciclos de 7 anos do desenvolvimento humano, usa a imaginação como veículo de aprendizagem, e integra artes, movimento e vida prática em todas as disciplinas.',
 'alta', 'medio', 3, 15,
 'A IA deve gerar planos que integrem artes em todas as disciplinas, respeitando os ritmos de 7 anos (septénios), criando épocas de ensino temáticas de 3-4 semanas com atividades que equilibrem movimento, criatividade e pensamento conceptual.',
 ARRAY['septénios','épocas de ensino','main lesson blocks','ritmo','artes integradas','imaginação','euritmia','Rudolf Steiner','livro da época','materiais naturais','natureza','desenho de forma','aguarelas'],
 3),

-- 04. Charlotte Mason
('charlotte-mason-living-books',
 'Metodologia Charlotte Mason',
 'pedagogias-classicas',
 'Educação com livros vivos, narração como forma de assimilação, nature study semanal e lições curtas de 15-20 minutos que mantêm a atenção plena.',
 'Charlotte Mason (1842-1923) defendia que "a criança é uma pessoa" e que a aprendizagem genuína vem de ideias vivas, não de manuais secos. O currículo inclui narração, nature journal, picture study, composer study, e hábitos regulares.',
 'media', 'baixo', 3, 15,
 'A IA deve gerar planos que enfatizem "livros vivos" em vez de manuais, usando narrativa como forma principal de assimilação, integrando Nature Study com cadernos de observação, cultivando hábitos regulares, incluindo "short lessons" (15-20 minutos), e fornecendo tempo significativo para jogo livre, música, arte e natureza.',
 ARRAY['livros vivos','narração','nature study','hábitos','lições curtas','picture study','composer study','caderno de natureza','história viva','atenção focada','poesia','vida prática','Charlotte Mason'],
 4),

-- 05. Forest School
('forest-school',
 'Forest School (Escola na Floresta)',
 'natureza-experiencia',
 'Aprendizagem regular e consistente ao ar livre, com risco controlado, exploração sensorial e investigação emergente da natureza.',
 'Inspirada na tradição escandinava de "friluftsliv", a Forest School proporciona aprendizagem holística na natureza. Respeita a autonomia infantil, valoriza o risco benéfico, e usa o ambiente natural como currículo vivo.',
 'media', 'baixo', 3, 12,
 'Atividades centradas em observação da natureza, exploração sensorial, construção com materiais naturais, resolução de problemas em ambiente não controlado, e desenvolvimento de competências de resiliência. Gere tarefas sazonais, desafios progressivos de risco controlado, e integrações interdisciplinares a partir de descobertas naturais.',
 ARRAY['friluftsliv','natureza','risco controlado','exploração sensorial','autonomia','outdoor','investigação natural','biofilia','documentação','ritmo sazonal','construção natural','land art','observação'],
 5),

-- 06. Unschooling
('unschooling',
 'Unschooling (Desescolarização)',
 'alta-autonomia',
 'Aprendizagem completamente autodirecionada pelo interesse genuíno da criança, usando a vida real como currículo e o adulto como facilitador.',
 'John Holt (1923-1985) propôs que as crianças são aprendizes naturais quando não forçadas. O Unschooling confia plenamente na curiosidade infantil, usa "strewing" (semear oportunidades), e documenta uma jornada única de aprendizagem.',
 'baixa', 'baixo', 6, 15,
 'Atividades emergentes a partir de interesse genuíno da criança, não impostas. Gere sugestões baseadas em descobertas espontâneas, ofereça recursos e oportunidades (strewing), facilite conexões entre interesses e conceitos curriculares, documente jornada de aprendizagem autodirecionada. Linguagem não-prescritiva, aberta, exploratória.',
 ARRAY['interesse genuíno','autodireção','strewing','confiança','vida real como currículo','autonomia','John Holt','curiosidade','aprendizagem natural','portfólio','sem currículo','jogo livre'],
 6),

-- 07. Educação Democrática
('educacao-democratica',
 'Educação Democrática',
 'alta-autonomia',
 'Comunidade de aprendizagem com voto igual para crianças e adultos, autonomia genuína e tomada de decisão coletiva através de assembleia regular.',
 'Inspirada em A.S. Neill e Summerhill (1921), a educação democrática trata a criança como cidadã plena. Assembleia semanal, restorative justice, e aprendizagem autodirecionada constroem responsabilidade, cidadania e autoconfiança reais.',
 'media', 'baixo', 10, 15,
 'Atividades centradas em escolha genuína da criança, tomada de decisão partilhada, investigação autodirecionada, e responsabilidade pessoal. Gere opções em vez de prescrições, facilite assembleia familiar, sugira projetos a escolher, desenvolva consciência cívica e participação comunitária. Tom é respeitoso, democrático, empoderador.',
 ARRAY['assembleia','voto igual','democracia','restorative justice','autonomia','responsabilidade comunitária','cidadania','Summerhill','A.S. Neill','conselho','liberdade com limites','jogo livre'],
 7),

-- 08. Project-Based Learning
('project-based-learning',
 'Aprendizagem Baseada em Projetos (PBL)',
 'aprendizagem-ativa',
 'Projetos autênticos com pergunta condutora, investigação sustentada, rondas de feedback e produto final partilhado com audiência real.',
 'Baseada em John Dewey e formalizada pelo Buck Institute for Education, o PBL organiza a aprendizagem em torno de problemas reais. A criança investiga, colabora, revisa e apresenta — desenvolvendo as 4Cs: criatividade, pensamento crítico, comunicação e colaboração.',
 'media', 'medio', 3, 15,
 'A IA deve estruturar projetos com pergunta condutora clara, marcos de entrega definidos e integração natural de múltiplas disciplinas. Cada projeto deve incluir momentos de investigação, reflexão crítica e um produto final público ou autêntico.',
 ARRAY['pergunta condutora','produto final público','investigação sustentada','autenticidade','voz e escolha','reflexão','crítica e revisão','colaboração','4Cs','projetos reais','interdisciplinar','Gold Standard PBL'],
 8),

-- 09. Inquiry-Based Learning
('inquiry-based-learning',
 'Aprendizagem por Investigação (IBL)',
 'aprendizagem-ativa',
 'Ciclos iterativos de investigação baseados em perguntas abertas: observação, hipótese, teste, análise e nova pergunta.',
 'O IBL reclamou o instinto investigativo natural das crianças para o processo educativo. Cada investigação parte de uma pergunta aberta, passa por observação sistemática e teste de hipóteses, e termina em comunicação de achados — formando cientistas e pensadores críticos.',
 'media', 'baixo', 3, 15,
 'A IA deve estruturar ciclos de investigação com perguntas abertas no cerne, guiando o aluno através de observação, questionamento, pequenos testes e reflexão. Atividades devem ser escaláveis em complexidade conforme idade. Enfatizar que investigação é iterativa e as respostas levam a novas perguntas.',
 ARRAY['perguntas abertas','ciclo de investigação','observação sistemática','hipóteses','método científico','evidência','iteração','curiosidade','tolerância para incerteza','investigação científica','análise de dados'],
 9),

-- 10. STEAM
('steam-methodology',
 'STEAM — Science, Technology, Engineering, Arts & Mathematics',
 'contemporaneo',
 'Integração disciplinar genuína de Ciência, Tecnologia, Engenharia, Artes e Matemática através de Design Thinking, prototipagem e falha produtiva.',
 'STEAM integra cinco disciplinas não como silos mas como sistema coeso de resolução de problemas. O Design Thinking estrutura o processo: Empatia → Definição → Ideação → Prototipagem → Teste. A falha é dados, não insucesso.',
 'media', 'baixo', 3, 15,
 'A IA deve desenhar atividades integradas que combinam pensamento científico com criatividade artística. Cada atividade deve ter clara ligação STEAM (qual é a componente S? T? E? A? M?). Incluir Design Thinking como metodologia de ideação. Foco em aprendizagem através de making, prototipagem, e iteração.',
 ARRAY['design thinking','prototipagem','iteração','falha produtiva','making','criatividade','integração disciplinar','ciência','tecnologia','engenharia','artes','matemática','inovação'],
 10),

-- 11. Reggio Emilia
('reggio-emilia',
 'Abordagem Reggio Emilia',
 'natureza-experiencia',
 'Currículo emergente das curiosidades das crianças, documentação pedagógica visual, atelier artístico e as cem linguagens de expressão.',
 'Criada por Loris Malaguzzi em Itália pós-guerra, a abordagem Reggio coloca a criança como protagonista. O currículo emerge das suas questões e interesses; o atelier e a documentação visual tornam o pensamento infantil visível.',
 'media', 'medio', 3, 10,
 'Gera atividades baseadas em perguntas abertas, projetos emergentes a partir de curiosidades infantis, com enfoque em documentação visual, trabalho em pequenos grupos e exploração multissensorial. Favorece o processo sobre o resultado final.',
 ARRAY['cem linguagens','currículo emergente','documentação pedagógica','atelier','ambiente como terceiro educador','projetos longos','Loris Malaguzzi','protagonismo infantil','escuta ativa','cesto de tesouros','pequenos grupos'],
 11),

-- 12. Classical Education
('classical-education',
 'Educação Clássica (Trivium)',
 'pedagogias-classicas',
 'Educação estruturada em três fases do Trivium: Grammar Stage (memorização), Logic Stage (análise crítica) e Rhetoric Stage (expressão eloquente).',
 'Baseada na tradição greco-romana, a educação clássica organiza-se pelo Trivium. Na Grammar Stage (6-10), a criança memoriza factos, latim e clássicos. Na Logic Stage (10-14), questiona e debate. Na Rhetoric Stage (14+), expressa com eloquência.',
 'alta', 'baixo', 3, 15,
 'Gera atividades progressivas alinhadas com as três fases do Trivium, enfatizando memorização na Grammar Stage, análise crítica na Logic Stage, e expressão eloquente na Rhetoric Stage. Incorpora grandes obras literárias, cronologia histórica, e desenvolvimento do pensamento lógico estruturado.',
 ARRAY['trivium','grammar stage','logic stage','rhetoric stage','memorização','latim','great books','história cronológica','dialética','retórica','carácter','obras clássicas','Platão','Aristóteles'],
 12),

-- 13. Movimento da Escola Moderna
('movimento-escola-moderna',
 'Movimento da Escola Moderna (MEM)',
 'aprendizagem-ativa',
 'Metodologia portuguesa baseada em cooperação, texto livre autêntico, correspondência escolar e Plano Individual de Trabalho (PIT) diferenciado.',
 'Fundado por Sérgio Niza em 1966, inspirado em Freinet, o MEM coloca a comunicação autêntica no centro da aprendizagem. Cada criança tem um PIT personalizado; o Conselho Cooperativo semanal governa democraticamente a comunidade de aprendizagem.',
 'media', 'baixo', 6, 15,
 'Gera atividades cooperativas, textos livres, correspondência significativa, projetos colaborativos e instrumentos de pilotagem (PIT, plano individual). Enfatiza comunicação autêntica, responsabilidade colectiva, diferenciação pedagógica dentro de grupos heterogéneos e documentação colaborativa.',
 ARRAY['PIT','plano individual de trabalho','texto livre','correspondência escolar','conselho cooperativo','diário de turma','Sérgio Niza','Freinet','cooperação','diferenciação pedagógica','comunicação autêntica','jornal de classe'],
 13),

-- 14. Blended Learning
('blended-learning',
 'Aprendizagem Híbrida (Blended Learning)',
 'contemporaneo',
 'Combinação intencional de instrução online (vídeos, plataformas adaptativas) com aprendizagem offline presencial, mantendo equilíbrio saudável.',
 'O Blended Learning integra tecnologia digital como ferramenta — não fim — de aprendizagem. Plataformas como Khan Academy, Duolingo e Scratch oferecem feedback imediato e personalização; o trabalho offline garante experiência sensorial e social.',
 'media', 'baixo', 6, 15,
 'Gera planos que combinam instrução online (vídeos, plataformas interativas, jogos educativos) com atividades offline (projetos práticos, discussão, movimento). Integra ferramentas digitais específicas (Khan Academy, Duolingo, Scratch), mantendo equilíbrio saudável tela/offline. Aproveita dados de aprendizagem digital para personalização.',
 ARRAY['online offline','Khan Academy','Duolingo','Scratch','personalização','tecnologia como ferramenta','feedback imediato','tempo de tela','híbrido','plataformas educativas','flipped learning','adaptativo'],
 14)

ON CONFLICT (slug) DO NOTHING;


-- ─── 2. METHODOLOGY PRINCIPLES ───────────────────────────────────────────────

INSERT INTO methodology_principles (methodology_id, title, description, sort_order)

-- ── Montessori ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Autorresponsabilidade e Liberdade Coordenada', 'A criança é livre para escolher as atividades que deseja, desde que respeitem o ambiente preparado e o bem comum. A liberdade ocorre dentro de limites claros; a responsabilidade pessoal acompanha cada escolha.'),
  (2, 'Períodos Sensitivos', 'Existem momentos específicos do desenvolvimento em que a criança está naturalmente inclinada a adquirir certas competências — linguagem, ordem, movimento, pequenos objetos. O educador observa e oferece o material certo no momento certo.'),
  (3, 'Ambiente Preparado', 'O espaço físico é co-educador: mobiliário à medida da criança, materiais organizados e acessíveis, ambiente ordenado e esteticamente cuidado. Cada detalhe convida à ação independente.'),
  (4, 'Aprendizagem Sensorial como Base', 'Antes de qualquer abstração, a criança trabalha com materiais que ativam todos os sentidos — cilindros de madeira, barras vermelhas, caixas de textura. A perceção sensorial refinada alicerça toda a aprendizagem futura.'),
  (5, 'Isolamento de Dificuldades', 'Cada material Montessori trabalha um único conceito de cada vez. A criança não fica sobrecarregada com múltiplas variáveis; o foco total permite compreensão genuína.'),
  (6, 'Controlo do Erro Embutido no Material', 'Os materiais contêm em si próprios a verificação de erro — a criança pode descobrir e corrigir sem depender do adulto, cultivando autocrítica construtiva e independência.'),
  (7, 'Ciclos de Trabalho Ininterrupto', 'O período de trabalho deve durar 2-3 horas sem interrupção, permitindo à criança atingir estados de concentração profunda. Interrupções frequentes destroem a qualidade da aprendizagem.'),
  (8, 'Observação Científica do Educador', 'O adulto observa sistematicamente — interesses, dificuldades, progresso — e usa essa observação para decidir quando apresentar materiais novos, quando recuar, quando intervir.'),
  (9, 'Desenvolvimento Holístico', 'A metodologia abrange vida prática, desenvolvimento sensorial, linguagem, matemática, ciências, artes e educação moral. A criança é educada na sua totalidade, não apenas academicamente.'),
  (10, 'Ritmo Natural do Desenvolvimento', 'Não existem pressões de calendário escolar arbitrário. Cada criança avança ao seu próprio ritmo; alguns conceitos florescem aos 4 anos, outros aos 7. O adulto respeita este cronograma individual.'),
  (11, 'Comunidade e Paz', 'O espaço Montessori é uma comunidade viva onde se aprende a partilhar, ajudar, resolver conflitos. O objetivo educativo inclui construir seres que contribuem para uma sociedade mais pacífica.')
) AS p(sort_order, title, description)
WHERE m.slug = 'montessori'

UNION ALL

-- ── Pikler ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'A Criança é um Ser Competente', 'Desde o nascimento, a criança tem iniciativa e capacidades próprias. O adulto reconhece esta competência inata e responde a ela em vez de a substituir pela sua própria agenda de ensino.'),
  (2, 'Movimento Autónomo', 'A criança desenvolve movimento (rolar, engatinhar, andar) no seu próprio cronograma, sem aceleração ou exercícios estruturados. Colocar a criança em posições que não consegue assumir por si mesma prejudica a confiança motora.'),
  (3, 'Momentos de Cuidado como Conexão', 'Alimentação, muda de fralda, banho e sono são oportunidades de comunicação e vínculo profundo, não tarefas a "despachar". O adulto está presente, fala com a criança e convida à cooperação ativa.'),
  (4, 'Brincar Livre Sem Estrutura', 'O melhor brinquedo para uma criança pequena é frequentemente um objeto simples — colher de madeira, tecido, caixa. A criança decide o que fazer. O adulto não dirige nem "ensina" como brincar.'),
  (5, 'Ambiente Seguro e Contido', 'O espaço é suficientemente seguro para exploração livre com mínima interferência. Simples, organizado, sem excesso de estímulos ou brinquedos sofisticados com "uso correto".'),
  (6, 'Observação Atenta do Adulto', 'O adulto observa profundamente sem intervir desnecessariamente. Resiste ao impulso de "ajudar" ou "ensinar" — a menos que a criança esteja em perigo ou peça apoio.'),
  (7, 'Respeito Pela Dignidade da Criança', 'Cada interação inclui respeito — comunicar o que está a acontecer, pedir cooperação, tratar a criança como pessoa e não como objeto a manipular.'),
  (8, 'Ritmo Natural Não Acelerado', 'Não há pressão para atingir marcos de desenvolvimento "a tempo". Acelerar através de exercícios pode paradoxalmente prejudicar a confiança motora e emocional a longo prazo.'),
  (9, 'Vínculos Seguros com Figuras Consistentes', 'Uma criança emocionalmente segura explora com confiança. A estabilidade das figuras de cuidado primárias é fundamental para que a autonomia floresça de forma saudável.'),
  (10, 'Materiais Simples e de Exploração Aberta', 'Tecidos, peças de madeira, objetos naturais — materiais que convidam à exploração aberta, sem um "uso correto". A criança aprende mais através de exploração livre do que de brinquedos dirigidos.')
) AS p(sort_order, title, description)
WHERE m.slug = 'pikler'

UNION ALL

-- ── Waldorf ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Os Septénios — Ciclos de 7 Anos', 'O desenvolvimento humano processa-se em ciclos de 7 anos. O primeiro (0-7) é da vontade e imitação; o segundo (7-14) da imaginação e sentimento; o terceiro (14-21) do pensamento e raciocínio. O currículo respeita e serve cada fase.'),
  (2, 'Ritmo e Repouso', 'O ritmo diário, semanal e anual é essencial. Atividade e repouso, inspiração e expiração, escola e férias — todos seguem padrões naturais que sustentam o bem-estar e a aprendizagem.'),
  (3, 'Épocas de Ensino — Main Lesson Blocks', 'O currículo organiza-se em blocos temáticos de 3-4 semanas (épocas) que mergulham profundamente num tema, integrando múltiplas disciplinas sob uma narrativa coerente. Rompe com a fragmentação de aulas de 45 minutos.'),
  (4, 'Integração das Artes em Todas as Disciplinas', 'As artes não são extra — são o coração do processo. Cada disciplina passa pela arte: matemática explorada em geometria e desenho, história trazida à vida por pintura e narrativa, ciências pela observação artística da natureza.'),
  (5, 'O Papel Central da Imaginação', 'A imaginação é cultivada como faculdade essencial, especialmente dos 7-14 anos. As crianças aprendem por imagens, contos e alegoria. A fantasia é caminho legítimo para compreensão profunda.'),
  (6, 'A Criança como Ser em Desenvolvimento Integral', 'A criança não é adulto em miniatura nem recipiente vazio. É ser único com dinâmica interna de crescimento. Conteúdos e metodologias devem respeitar o que é apropriado em cada fase.'),
  (7, 'O Educador como Artista', 'O educador Waldorf cria uma obra de arte viva — não com tinta, mas com imagens, ritmo, movimento e relacionamento. Precisa de conhecer profundamente cada criança e apresentar o currículo com entusiasmo genuíno.'),
  (8, 'Natureza e Vida Prática', 'O contacto direto com a natureza e atividades práticas úteis (jardim, cozinha, tecelagem) são fundamentais. Esta conexão com o mundo material equilibra o trabalho imaginativo e conceptual.'),
  (9, 'Livro da Época — Main Lesson Book', 'O aluno não usa manuais. Cria o seu próprio caderno de época com ilustrações, escrita, resolução de problemas — tornando-se co-criador do conhecimento. Cada livro é único e pessoal.'),
  (10, 'Ausência de Tecnologia nos Primeiros Anos', 'Especialmente até aos 14 anos, tecnologia digital é evitada ou limitada. Experiências multissensoriais diretas são consideradas essenciais para o desenvolvimento pleno da imaginação e do pensamento.'),
  (11, 'Avaliação Qualitativa e Observação', 'Não existem testes estandardizados nem notas numéricas. O progresso é avaliado por observação cuidadosa, portfólios e relatórios narrativos que descrevem desenvolvimento académico, social, emocional e artístico.'),
  (12, 'Comunidade e Celebração', 'Celebrações sazonais, festas e eventos comunitários não são distrações — são o currículo em ação, enraizando a aprendizagem em ritmo e significado partilhados.')
) AS p(sort_order, title, description)
WHERE m.slug = 'waldorf-rudolf-steiner'

UNION ALL

-- ── Charlotte Mason ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'A Criança é uma Pessoa', 'Fundação de tudo. A criança não é recipiente a encher nem carácter a moldar. É pessoa com inteligência, preferências e dignidade próprias, que o educador respeita e serve.'),
  (2, 'Ideias Vivas vs. Conhecimento Morto', 'O currículo insiste em "livros vivos" — escritos com entusiasmo e boa prosa — em vez de manuais secos. Uma história que traz personagens à vida permite compreensão verdadeira; uma lista de factos mata o interesse.'),
  (3, 'Narração como Forma Principal de Assimilação', 'Após leitura ou audição, a criança narra — oral, escrita ou dramaticamente — o que compreendeu. A narração prova assimilação genuína e desenvolve linguagem, memória e organização de pensamento.'),
  (4, 'Educação de Hábitos', 'Hábitos são "segunda natureza". O educador cultiva deliberadamente hábitos de atenção, obediência, trabalho cuidado e gentileza. Uma vez estabelecidos, estes hábitos libertam energia mental para a aprendizagem.'),
  (5, 'Lições Curtas e Atenção Focada', 'Crianças jovens têm períodos de atenção limitados. Lições de 10-20 minutos com foco intenso são mais eficazes do que aulas longas que levam à fadiga mental e à desatenção.'),
  (6, 'Nature Study como Parte Essencial do Currículo', 'Observação regular e sistemática da natureza — plantas, insetos, pássaros, clima — desenvolve capacidade científica viva, conexão com ciclos naturais e atitude contemplativa. O Nature Journal documenta estas observações.'),
  (7, 'Educação Estética e Artística Integrada', 'Artes, música, poesia e caligrafia não são extras. Picture Study (estudo de obra de arte) e Composer Study são partes regulares do currículo que desenvolvem sensibilidade e amor pela beleza.'),
  (8, 'Vida Prática e Responsabilidade Real', 'As crianças devem trabalhar genuinamente — cozinhar, limpar, cuidar do jardim. Este trabalho desenvolve competências práticas, responsabilidade e sentido de contribuição real.'),
  (9, 'Atmosfera, Disciplina e Vida', 'Mason identificou três instrumentos de educação: a atmosfera criada pela presença do educador, a disciplina estabelecida por hábitos, e a vida vivida e experienciada. O educador não força — cria condições para que o florescer aconteça.'),
  (10, 'Tempo Livre e Jogo Não-Estruturado', 'As crianças precisam de tempo significativo para brincar livremente, sem supervisão adulta. É aqui que criatividade, imaginação, amizade e resolução independente de problemas florescem.'),
  (11, 'Poesia, Literatura e Linguagem Viva', 'Exposição regular a poesia e literatura de qualidade desenvolve não apenas literacia mas sensibilidade linguística. A memorização de poesia (Poetry Recitation) é prática regular e joyful.'),
  (12, 'Currículo Abrangente Mas Não Sobrecarregado', 'O currículo cobre história, literatura, ciências, geografia, arte, música, trabalho manual — mas com profundidade, não com pressa. Melhor menos, compreendido profundamente, do que tudo superficialmente.')
) AS p(sort_order, title, description)
WHERE m.slug = 'charlotte-mason-living-books'

UNION ALL

-- ── Forest School ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Aprendizagem Baseada na Exploração Livre', 'A criança é investigadora natural. As atividades emergem das suas descobertas, perguntas e interesses quando observa a natureza. O educador transforma descobertas em oportunidades pedagógicas intencionais.'),
  (2, 'Risco Controlado e Beneficial Risk', 'Escalar árvores, usar ferramentas reais, caminhar em terreno irregular — estes riscos benéficos desenvolvem confiança, resiliência e resolução de problemas, sempre dentro de parâmetros de segurança.'),
  (3, 'Conexão Biofílica com a Natureza', 'Os seres humanos têm afinidade inata com a natureza (biofilia). A exposição regular restaura bem-estar emocional, reduz stress e cria base segura para o desenvolvimento da criança.'),
  (4, 'Desenvolvimento Integral e Equilibrado', 'Num passeio pela floresta, a criança desenvolve simultaneamente competências motoras, cognitivas, emocionais, sociais e criativas. Esta integração natural é uma força fundamental da metodologia.'),
  (5, 'Autonomia e Agência Infantil', 'As crianças têm poder real sobre o seu processo — escolhem para onde ir, o que explorar, com quem colaborar. O educador fornece estrutura e intenção pedagógica, mas não dirige o aprendente.'),
  (6, 'Educador como Observador Reflexivo', 'Em vez de transmitir conhecimento, o educador observa, documenta, identifica oportunidades ocultas e questiona intencionalmente para estender o pensamento. É papel profundamente diferente do ensino tradicional.'),
  (7, 'Aprendizagem Sensorial Profunda', 'A natureza oferece estímulos sensoriais ricos — texturas de cascas, sons de vento, aromas de flores e terra. Esta estimulação sensorial intensa é base para compreensão cognitiva mais profunda.'),
  (8, 'Rotina e Ritmo Natural', 'As atividades seguem ritmos naturais — estações, ciclos diários de luz e sombra. Esta sintonia cria congruência entre o desenvolvimento da criança e o processo educativo.'),
  (9, 'Interdisciplinaridade Orgânica', 'Construir uma cabana integra geometria, física, história de construção, arte e muito mais. O conhecimento emerge integrado porque o mundo natural não está compartimentalizado em disciplinas.'),
  (10, 'Documentação e Narrativa Contínua', 'A aprendizagem é documentada através de fotografias, notas, narrativas. Esta documentação serve avaliação, comunicação com pais e ajuda a criança a compreender a sua própria jornada.'),
  (11, 'Resolução de Conflitos Comunitária', 'Conflitos são oportunidades de aprendizagem emocional. Em vez de punição, usam-se restorative practices — compreensão de perspetivas, reparação de relacionamentos, acordos comunitários.')
) AS p(sort_order, title, description)
WHERE m.slug = 'forest-school'

UNION ALL

-- ── Unschooling ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Aprendizagem é Natural e Contínua', 'Os seres humanos nascem aprendizes. Uma criança pequena aprende constantemente — linguagem, movimento, relações sociais — sem ensino formal. O Unschooling reconhece que este impulso não cessa aos 6 anos se não for suprimido.'),
  (2, 'Interesse e Curiosidade como Guia', 'Quando genuinamente interessada, a criança aprende com profundidade que nenhuma imposição replica. Uma criança obcecada por dinossauros aprende paleontologia, biologia, arte e escrita — porque a curiosidade a conduz.'),
  (3, 'Autonomia e Agência Infantil', 'A criança, não o adulto, é agente da sua aprendizagem. As decisões sobre o quê, como e em que ritmo aprender são primeiramente da criança, com apoio adulto. Autonomia genuína nasce de parceria respeitosa.'),
  (4, 'Confiança no Processo de Aprendizagem', 'Os adultos confiam que, com ambiente rico e apoio respeitoso, a criança vai explorar e aprender naturalmente. A motivação intrínseca é suficiente quando não é destruída por pressão extrínseca.'),
  (5, 'Vida Real como Currículo', 'O currículo não é documento — é a vida quotidiana. Cozinhar é matemática. Viajar é geografia e história. Reparar algo é engenharia. Ajudar alguém é ética e desenvolvimento social.'),
  (6, 'Respeito e Relação', 'O adulto não é transmissor nem disciplinador — é mentor, facilitador, companheiro de jornada. A criança é pessoa completa com ideias e capacidades próprias. Esta relação de respeito mútuo é a fundação.'),
  (7, 'Documentação e Reflexão Contínua', 'Sem currículo estruturado ou testes, o Unschooling requer documentação intencional — registos de leitura, projetos, aprendizagens — para criar narrativa contínua da jornada educativa.'),
  (8, 'Ambiente Rico de Possibilidades — Strewing', 'O adulto semeia oportunidades sem imposição. Uma casa com livros variados, materiais, acesso a diferentes ambientes e participação na vida adulta real estimula aprendizagem orgânica.'),
  (9, 'Responsabilidade Social e Ética', 'Liberdade académica não significa ausência de valores. Famílias Unschooling trabalham responsabilidade, empatia e ética através de participação comunitária, discussão e modelagem de comportamento ético.'),
  (10, 'Ritmo Pessoal e Desenvolvimento Individual', 'Uma criança pode ser leitora precoce e matemática mais lenta — ou vice-versa. O Unschooling oferece espaço para este desenvolvimento desigual, sem pressão ou etiquetagem negativa.'),
  (11, 'Integração e Holismo', 'O conhecimento não é compartimentalizado. Estudar história do Japão integra naturalmente história, geografia, arte, linguagem, religião e matemática — como acontece na vida real.'),
  (12, 'Transformação Contínua', 'Unschooling não é método estático — é filosofia que evolui. Famílias aprendem, refinam e ajustam em resposta ao que observam sobre como os seus filhos aprendem. Flexibilidade é característica essencial.')
) AS p(sort_order, title, description)
WHERE m.slug = 'unschooling'

UNION ALL

-- ── Educação Democrática ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Igualdade de Voz e Participação', 'Na assembleia comunitária, uma criança de 8 anos tem um voto; um adulto tem um voto. Não "voto educado por adulto", mas voto genuinamente igual. A voz da criança é legitimamente contada nas decisões que a afetam.'),
  (2, 'Autorregulação e Responsabilidade Pessoal', 'Sem regulação externa constante, a criança aprende a auto-regular. A criança que participou na criação de uma regra é muito mais provável de a cumprir do que aquela a quem foi imposta.'),
  (3, 'Liberdade com Limite Comunitário', 'Educação democrática não é liberdade absoluta. É liberdade dentro de limites estabelecidos democraticamente. A criança escolhe o que aprender — mas dentro de parâmetros onde a liberdade não prejudica a comunidade.'),
  (4, 'Conflito como Oportunidade de Aprendizagem', 'Conflitos entre membros da comunidade são oportunidades para aprendizagem emocional genuína. Em vez de punição, usam-se restorative practices — compreensão de perspetivas, reparação de relacionamentos.'),
  (5, 'Aprendizagem Autodirecionada', 'Não existe currículo imposto. A criança escolhe o que, quando e como aprender, suportada pelos recursos da comunidade. O ambiente estimula; a criança dirige.'),
  (6, 'Integridade e Honestidade', 'Numa comunidade democrática, a criança compreende que a sua integridade pessoal importa para o funcionamento do grupo. A honestidade emerge de compreensão, não de imposição moral.'),
  (7, 'Desenvolvimento da Cidadania Genuína', 'A criança que experiencia democracia genuína desde cedo — voz contada, responsabilidade real, direitos respeitados — desenvolve compreensão profunda de cidadania e de como participar na sociedade.'),
  (8, 'Respeito e Dignidade', 'Todas as pessoas — independentemente de idade — são tratadas com respeito fundamental. Não há gritaria, humilhação ou desonra. Em conflito, a pessoa é respeitada mesmo que o comportamento seja questionado.'),
  (9, 'Tempo e Espaço para Jogo Livre', 'Apesar da participação em estrutura comunitária formal, há muito espaço para jogo livre — talvez o elemento educativo mais importante, onde a criança experimenta, cria e estabelece relacionamentos genuínos.'),
  (10, 'Transparência e Comunicação Aberta', 'Decisões comunitárias são tomadas transparentemente. As razões das regras são explicadas. Quando uma regra é quebrada, o processo é aberto. Esta transparência constrói confiança real.'),
  (11, 'Múltiplas Formas de Aprendizagem', 'A comunidade oferece variedade — aulas formais, tutoria individual, aprendizagem independente, grupos de projeto, aprendizagem experimental. A criança pode engajar com toda esta variedade conforme interesse e necessidade.'),
  (12, 'Responsabilidade Comunitária', 'A criança não está apenas na comunidade — é responsável por ela. Participa na limpeza, manutenção e cuidado do espaço. Aprende como as suas ações (ou inações) afetam o coletivo.')
) AS p(sort_order, title, description)
WHERE m.slug = 'educacao-democratica'

UNION ALL

-- ── Project-Based Learning ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Problema ou Pergunta Desafiante', 'O coração de qualquer projeto é uma questão aberta que não tem resposta simples ou óbvia. Deve ser intrigante o suficiente para manter interesse sustentado durante semanas de investigação.'),
  (2, 'Investigação Sustentada', 'O projeto requer investigação contínua ao longo de dias ou semanas — pesquisa, experiências, entrevistas, múltiplas fontes. Esta profundidade desenvolve literacia, pensamento científico e resolução de problemas.'),
  (3, 'Autenticidade', 'O trabalho tem contexto real e propósito genuíno. Não é exercício teórico — tem audiência real, usa ferramentas do mundo real e aborda problemas que realmente importam fora do contexto educativo.'),
  (4, 'Voz e Escolha do Aluno', 'Os alunos têm agência no projeto — escolhem o tópico específico, as fontes, como organizar o trabalho, que forma toma o produto final. Esta autonomia aumenta significativamente o engajamento.'),
  (5, 'Reflexão Estruturada', 'Momentos regulares de pausa para pensar sobre o que foi aprendido, como a investigação progrediu e quais foram as dificuldades. Diários de investigação e auto-avaliação são ferramentas essenciais.'),
  (6, 'Crítica e Revisão', 'Antes do produto final, há múltiplas rondas de feedback construtivo. O aluno revisa e melhora com base no feedback. Ensina que qualidade se constrói através de iteração, não perfeição à primeira tentativa.'),
  (7, 'Produto Público', 'O projeto culmina num produto partilhado com audiência real — apresentação, artigo, exposição, site, vídeo, protótipo. Isto afasta a aprendizagem da esfera meramente académica.'),
  (8, 'Colaboração Intencional', 'Quando apropriado, o projeto envolve trabalho em equipa com papéis definidos, comunicação clara e responsabilidades partilhadas. Em homeschooling, pode ser com irmãos ou especialistas externos.'),
  (9, 'Conexão com Competências do Século XXI', 'O PBL desenvolve naturalmente as 4Cs: Criatividade (soluções originais), Pensamento Crítico (analisar e sintetizar), Comunicação (explicar ideias) e Colaboração (trabalhar com outros para fins comuns).')
) AS p(sort_order, title, description)
WHERE m.slug = 'project-based-learning'

UNION ALL

-- ── Inquiry-Based Learning ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Perguntas Abertas são o Motor', 'Uma pergunta aberta não tem resposta simples "certa". "O que acontece quando colocamos esta planta no escuro?" é aberta. Estas perguntas mantêm a investigação em movimento porque há múltiplos caminhos a explorar.'),
  (2, 'O Ciclo de Investigação é Iterativo', 'Investigação não é linear. É Pergunta → Investigação → Descoberta → Novas Perguntas → Investigação Mais Profunda. Cada descoberta provoca novas questões, aprofundando a compreensão.'),
  (3, 'Observação Sistemática', 'Observação não é apenas "ver". É atenção deliberada, registo detalhado, procura de padrões. Uma criança que observa uma formiga conta direções, mede distâncias, nota preferências de superfície.'),
  (4, 'Construção de Hipóteses Baseada em Observação', 'Uma hipótese não é palpite aleatório. É previsão fundamentada em observação prévia: "Acredito que X porque observei Y." Liga observação a previsão de forma lógica.'),
  (5, 'Teste e Recolha de Evidência', 'Depois da hipótese, há teste. A criança desenha como testar — que variável muda, o que mantém constante, como mede o resultado. Desenvolve pensamento experimental rigoroso.'),
  (6, 'Análise de Dados e Padrões', 'Depois do teste, há dados. A criança analisa padrões, exceções e causas possíveis — qualitativa ou quantitativamente. Procura o que confirma, o que surpreende.'),
  (7, 'Conclusão Baseada em Evidência', 'A criança conclui baseada no que observou, não no que esperava. Se a hipótese estava errada, há aprendizagem profunda sobre como o mundo funciona realmente.'),
  (8, 'Reflexão Crítica', 'Após a conclusão, o investigador questiona o próprio processo: "Como sei que a minha conclusão é verdadeira? E se houvesse outra variável? Como repetiria diferente?" Isto é accountability científica.'),
  (9, 'Comunicação de Achados', 'A investigação não está completa até ser comunicada. Não como teste — como explicação a outros: "Descobri X porque observei Y. Testei Z e o resultado foi…" Desenvolve pensamento científico comunicável.'),
  (10, 'Tolerância para Incerteza e Ambiguidade', 'Em investigação real, respostas nem sempre são claras. A criança aprende a lidar com complexidade — "às vezes sim, às vezes não, depende de…" — sem precisar de certeza absoluta.'),
  (11, 'Engajamento com Comunidade de Investigadores', 'Investigação não é atividade solitária. Discussão com outros, feedback de colegas e especialistas torna o pensamento mais rigoroso. A comunidade de investigadores afina as perguntas e as conclusões.')
) AS p(sort_order, title, description)
WHERE m.slug = 'inquiry-based-learning'

UNION ALL

-- ── STEAM ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Integração Disciplinar Genuína', 'STEAM não é disciplinas ensinadas lado a lado. É disciplinas que funcionam juntas porque o problema assim o requer. Ciência, engenharia, arte e matemática são necessárias simultaneamente, não sequencialmente.'),
  (2, 'Design Thinking como Metodologia Central', 'Processo estruturado: Empatia (entender o problema) → Definição (articular claramente) → Ideação (gerar soluções criativas) → Prototipagem (construir versão rápida) → Teste (experimentar e aprender).'),
  (3, 'Fazer e Criar — Making & Creating', 'STEAM não é observacional. É criação ativa. A criança faz algo — um protótipo, uma instalação, um jogo. Através do making, conceitos abstratos tornam-se concretos e significativos.'),
  (4, 'Iteração e Prototipagem Rápida', 'A primeira versão raramente é perfeita. STEAM valoriza construção rápida, teste, aprendizagem e melhoria em ciclos repetidos. Este ciclo build-test-learn-improve é central ao processo.'),
  (5, 'Tolerância para Falha — Productive Failure', 'Em STEAM, "falha" é dados. Se o protótipo não funciona, porquê? O que se aprendeu? Como se itera? Esta mentalidade torna a falha produtiva, não desmotivadora.'),
  (6, 'Criatividade e Inovação como Competências Centrais', 'Não há resposta única "correta". Um problema pode ter múltiplas soluções criativas e válidas. A criança é encorajada a pensar diferente, explorar ideias não-convencionais, ser inovadora.'),
  (7, 'Autenticidade e Propósito Real', 'O melhor STEAM resolve um problema real ou cria algo que será usado. Um sensor que monitoriza o jardim. Uma instalação artística para exposição. Um jogo que outros vão jogar.'),
  (8, 'Colaboração e Pensamento Sistémico', 'Muitos projetos STEAM requerem múltiplas perspetivas. Colaboração com colegas desenvolve pensamento sistémico — como as partes se conectam no todo e como o todo é maior que as partes.'),
  (9, 'Tecnologia como Ferramenta, Não Fim em Si', 'Tecnologia é usada porque o projeto assim o requer, não por si mesma. Programação não é ensinada por aprender a programar — é ensinada porque o projeto precisa de um objeto que responda a sensores.'),
  (10, 'Conexão com Mundo Real e Carreira', 'STEAM oferece visão de como estas disciplinas funcionam na vida profissional real, inspirando e orientando interesses de carreira em ciências, tecnologia, engenharia, artes e matemática.')
) AS p(sort_order, title, description)
WHERE m.slug = 'steam-methodology'

UNION ALL

-- ── Reggio Emilia ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'A Criança como Protagonista', 'A criança não é recetor passivo de instrução, mas sujeito ativo, competente e curioso que constrói o seu próprio conhecimento. O educador segue a iniciativa infantil mais do que impõe currículo.'),
  (2, 'Aprendizagem Emergente', 'O currículo emerge das curiosidades, interesses e questões das crianças, não de planificação prévia. O educador observa temas de interesse e amplia-os em projetos de curta, média ou longa duração.'),
  (3, 'As Cem Linguagens', 'As crianças expressam-se em múltiplas linguagens: fala, movimento, desenho, pintura, escultura, música, dramatização, construção, jogo. Nenhuma é privilegiada; todas são válidas e importantes.'),
  (4, 'Documentação Pedagógica', 'O trabalho das crianças é observado, registado (fotografias, vídeos, escritas) e apresentado em painéis e portfolios. A documentação torna visível o pensamento infantil e comunica às famílias.'),
  (5, 'O Atelier e a Importância da Arte', 'O atelier (espaço artístico dedicado) é o coração — lugar de exploração sensorial e experimentação com cores, texturas e materiais. O atelierista trabalha com as crianças em projetos artísticos complexos.'),
  (6, 'O Ambiente como Terceiro Educador', 'O espaço é cuidadosamente pensado para ser bonito, organizado e inspirador. A disposição de materiais, luz e convites à exploração ensinam tanto quanto o educador. O ambiente comunica respeito.'),
  (7, 'Colaboração e Construção Social', 'A aprendizagem ocorre em contextos sociais — pequenos grupos, diálogo entre pares, co-construção de significados. A resolução colaborativa de problemas é tão valiosa quanto a descoberta individual.'),
  (8, 'Relação Tripartida: Criança-Educador-Família', 'A educação é responsabilidade partilhada. As famílias não são espectadoras mas parceiras ativas, participando em decisões, partilhando informações e envolvendo-se em projetos.'),
  (9, 'Observação e Escuta Atenta', 'O educador é observador atento que escuta — interesses, questões, hipóteses — e permite que esses momentos de curiosidade guiem a ação pedagógica. A escuta é prática diária e sistemática.'),
  (10, 'Projetos de Longa Duração', 'Temas de interesse podem desenvolver-se em projetos que duram semanas ou meses, permitindo profundidade e complexidade crescente. Os projetos entrelaçam várias áreas de conhecimento.'),
  (11, 'Avaliação como Processo Contínuo', 'A avaliação não é baseada em testes ou comparações entre crianças, mas em observação contínua, documentação de progresso e reflexão sobre o processo. Cada criança é reconhecida nas suas particularidades.'),
  (12, 'Comunidade de Aprendizagem', 'A família e grupos de crianças funcionam como comunidade onde todos crescem, refletem e aprendem juntos. Reuniões regulares de diálogo promovem transparência e decisão partilhada.')
) AS p(sort_order, title, description)
WHERE m.slug = 'reggio-emilia'

UNION ALL

-- ── Classical Education ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'O Trivium como Estrutura Desenvolvimental', 'A educação progride por três etapas: Grammar Stage (6-10, memorização e factos), Logic Stage (10-14, pensamento crítico), Rhetoric Stage (14+, expressão eloquente). Cada fase serve o desenvolvimento natural da mente.'),
  (2, 'Memorização como Alicerce', 'Na Grammar Stage, memorização é celebrada — factos, poesia, latim, multiplicação, datas históricas. Estes são blocos sobre os quais o edifício intelectual será construído em fases posteriores.'),
  (3, 'Latim como Lingua Mater', 'O latim é estudado sistematicamente para iluminar a estrutura da língua portuguesa, abrir acesso a textos clássicos e desenvolver compreensão etimológica. Não se procura fluência oral, mas literacia passiva.'),
  (4, 'História Cronológica como Eixo', 'Em vez de períodos históricos aleatórios, estuda-se história ocidental cronologicamente em ciclo de quatro anos: Antiguidade → Medievos → Renascimento → Modernidade. Permite compreender o desenvolvimento de ideias.'),
  (5, 'Great Books — Grandes Obras', 'Literatura não é substituída por resumos. A criança lê clássicos na íntegra: Homero, Platão, Shakespeare, Camões. A exposição a grande pensamento desenvolve a mente e internaliza estruturas de raciocínio.'),
  (6, 'Dialética como Método', 'Na Logic Stage, a criança aprende a argumentar, identificar falácias e questionar. O método socrático e discussões estruturadas onde a criança defende posições desenvolvem pensamento crítico genuíno.'),
  (7, 'Retórica como Objetivo Final', 'A educação culmina em jovem adulto que pensa claramente e comunica persuasivamente — oralmente e por escrito. Retórica não é manipulação, mas arte de persuadir com verdade e virtude.'),
  (8, 'Integração Curricular', 'Disciplinas não são silos. Quando se estuda o Renascimento, aprende-se perspetiva matemática em pintura, astronomia heliocêntrica e humanismo literário simultaneamente. O contexto é sempre histórico e literário.'),
  (9, 'Desenvolvimento de Carácter', 'A educação clássica visa não apenas instruir a mente mas formar o carácter. Estudo de vidas exemplares, reflexão sobre virtude e emulação de excelência visam desenvolvimento moral e intelectual integrado.'),
  (10, 'Trivium como Processo de Aprendizagem', 'Para qualquer tema novo, a criança primeiro recolhe a "gramática" (factos, terminologia), depois aplica lógica (questiona, analisa), finalmente articula retoricamente (explica, escreve com eloquência).'),
  (11, 'Estrutura Académica Clara', 'Diferentemente de pedagogias vagas, a educação clássica oferece cronograma claro, expectativas definidas por idade e tópicos específicos a cobrir. Esta estrutura é particularmente valiosa em homeschooling.'),
  (12, 'Disciplina e Hábito como Instrumentos', 'Desenvolvimento de bons hábitos — estudo consistente, leitura profunda, escrita regular, discussão respeitosa — é componente explícito. O educador não está constantemente a motivar; estabelece estrutura e expectativa.')
) AS p(sort_order, title, description)
WHERE m.slug = 'classical-education'

UNION ALL

-- ── MEM ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'A Criança como Pessoa Completa', 'A criança não é "aluno" a ensinar, mas pessoa com direitos, dignidade e capacidades. Respeitá-la significa permitir que participe nas decisões sobre o seu próprio processo educacional.'),
  (2, 'Aprendizagem através da Comunicação Autêntica', 'O motor de aprendizagem é comunicação real — carta enviada para pessoa verdadeira, discussão sobre tema que importa, expressão genuína de pensamento. O contexto real torna a aprendizagem significativa.'),
  (3, 'Cooperação e Solidariedade como Valores Centrais', 'Competição individual é evitada; cooperação é cultivada. As crianças trabalham em grupos, deliberam juntas sobre regras, tomam decisões coletivas. A comunidade funciona como microssociedade democrática.'),
  (4, 'Diferenciação Pedagógica Obrigatória', 'Dentro de um grupo heterogéneo, cada criança tem Plano Individual de Trabalho (PIT) personalizado. A criança avançada aprofunda; a criança em dificuldade recebe apoio específico — ambas na mesma comunidade.'),
  (5, 'O Texto Livre como Expressão Genuína', 'A escrita começa com "escreve o que desejares" — a criança escreve a sua história, o seu pensamento. O educador oferece feedback, convida à revisão, publica no jornal de classe. Voz autêntica antes de gramática imposta.'),
  (6, 'Correspondência Escolar e Comunicação Real', 'As crianças escrevem cartas reais para correspondentes em outras escolas ou cidades. Recebem respostas. Isto motiva escrita genuína — não é "dever de casa" sem sentido, é comunicação esperada e significativa.'),
  (7, 'Documentação Colaborativa e Transparência', 'A vida da classe é documentada no Diário de Turma — registo de decisões, conflitos resolvidos e aprendizados. Painéis visuais mostram progresso de projetos. Tudo é transparente e acessível a todos.'),
  (8, 'Conselho Cooperativo como Órgão Central', 'A reunião semanal em círculo — com avaliação de semana, resolução de conflitos, propostas e celebrações — é onde a democracia é vivida. As decisões emergem de diálogo coletivo, não de autoridade adulta.'),
  (9, 'Integração Curricular através de Projetos', 'Disciplinas não são compartimentos. Um projeto sobre "Água" envolve Português (escrita, poesia), Matemática (medições, gráficos), Estudo do Meio (ciclo hidrológico), Artes. O aprendizado é integrado e significativo.'),
  (10, 'Respeito pelos Ritmos Individuais', 'Não há "a turma toda aprende isto agora". A criança que precisa de mais tempo recebe-o; a criança pronta para aprofundar continua. O educador diferencia o ritmo sem separar — todos numa comunidade.'),
  (11, 'Educador como Facilitador e Investigador', 'O educador não é autoridade que transmite. É facilitador que observa, questiona, oferece recursos e guia investigação. É também investigador — constantemente interrogando a sua prática.'),
  (12, 'Educação para Emancipação', 'O objetivo final não é transmitir conhecimentos, mas desenvolver cidadãos pensadores e críticos, capazes de ação social. Valores de solidariedade, democracia e justiça social são explícitos.')
) AS p(sort_order, title, description)
WHERE m.slug = 'movimento-escola-moderna'

UNION ALL

-- ── Blended Learning ──
SELECT m.id, p.title, p.description, p.sort_order
FROM methodologies m,
(VALUES
  (1, 'Tecnologia é Ferramenta, não Fim', 'Um vídeo mau é tão improdutivo quanto uma aula presencial mau. A tecnologia deve servir um objetivo educacional claro: acesso a qualidade, prática personalizada, feedback imediato, amplificação do que o educador pode fazer.'),
  (2, 'Aprendizagem Ativa é Prioridade', 'Blended learning não é a criança a ver vídeos passivamente por horas. É: assistir vídeo introdutório (15-20 min), depois engajar com atividade ativa — resolver problema, discussão, projeto, experimento.'),
  (3, 'Dados Informam Personalização', 'Plataformas digitais recolhem dados: que conceito a criança dominou? Onde ainda tem dificuldade? Algoritmos adaptativos ajustam a dificuldade. O educador usa estes dados para oferecer prática direcionada.'),
  (4, 'Equilíbrio Tela/Offline é Crítico', 'Recomendações pediátricas sugerem máximo 1-2 horas de tela educativa diária para crianças 6+. Blended learning respeita isto — a tela é um recurso entre muitos, não o centro de tudo.'),
  (5, 'Certas Atividades Requerem Presença Física', 'Aprender a tocar bola não é possível por vídeo. Discussão aprofundada de literatura é mais rica presencialmente. Construção colaborativa é mais eficaz ao vivo. Blended learning reconhece estas limitações.'),
  (6, 'Autonomia Estudantil é Desenvolvida', 'A aprendizagem digital oferece oportunidade para praticar aprender independentemente — seguir instruções, gerir tempo, buscar ajuda. Prepara para aprendizagem futura autónoma.'),
  (7, 'Acesso a Recursos Globais', 'A internet democratiza o acesso — uma criança em aldeia portuguesa pode aprender com os melhores professores do mundo, aceder a bibliotecas virtuais infinitas e interagir com especialistas em qualquer campo.'),
  (8, 'Feedback Imediato Amplia Aprendizagem', 'Ferramentas digitais oferecem feedback instantâneo. A criança aprende do erro imediatamente, em vez de esperar semanas por um papel com marca vermelha. Isto acelera a consolidação.'),
  (9, 'Documentação Digital Oferece Transparência', 'Portfólios digitais, dashboards de progresso e registos de atividade permitem que pais, educadores e criança vejam o progresso em tempo real. A aprendizagem torna-se visível e comunicável.'),
  (10, 'Aprendizagem Colaborativa Também é Possível Online', 'Ferramentas como Google Docs, Padlet e fóruns permitem que as crianças trabalhem juntas mesmo à distância. A colaboração não depende exclusivamente da presença física.')
) AS p(sort_order, title, description)
WHERE m.slug = 'blended-learning'

ON CONFLICT DO NOTHING;


-- ─── 3. METHODOLOGY COMPATIBILITY ────────────────────────────────────────────
-- Pares ordenados: methodology_a_id < methodology_b_id (garantido pelo sort_order)
-- Compatibilidade baseada em: 00_INDEX.md + sinergias de cada ficheiro

INSERT INTO methodology_compatibility (methodology_a_id, methodology_b_id, compatibility, notes)
SELECT
  LEAST(a.id, b.id),
  GREATEST(a.id, b.id),
  c.compatibility,
  c.notes
FROM (VALUES
  ('montessori',               'charlotte-mason-living-books',  'excelente',  'Autonomia Montessori + living books Mason: criança no centro, materiais ricos, respeito pelo desenvolvimento.'),
  ('montessori',               'reggio-emilia',                 'excelente',  'Ambas colocam a criança como protagonista com ambiente preparado e exploração sensorial profunda.'),
  ('montessori',               'pikler',                        'excelente',  'Continuidade natural: Pikler para bebés/toddlers, Montessori para pré-escolar e além.'),
  ('montessori',               'waldorf-rudolf-steiner',        'boa',        'Tensão teórica (Montessori: concreto/real; Waldorf: imaginativo/artístico) mas elementos práticos combinam bem.'),
  ('montessori',               'inquiry-based-learning',        'muito-boa',  'IBL estende a curiosidade científica Montessori com ciclos de investigação mais formalizados.'),
  ('montessori',               'educacao-democratica',          'muito-boa',  'Ambiente preparado Montessori + voz genuína democrática: respeito pela criança como base comum.'),
  ('waldorf-rudolf-steiner',   'charlotte-mason-living-books',  'muito-boa',  'Ritmo e natureza Waldorf + living books e nature study Mason: profundo alinhamento pedagógico.'),
  ('waldorf-rudolf-steiner',   'forest-school',                 'muito-boa',  'Natureza e ritmo sazonal Waldorf + aprendizagem ao ar livre Forest School: sinergia natural.'),
  ('waldorf-rudolf-steiner',   'unschooling',                   'muito-boa',  'Respeitar o ritmo da criança e seguir interesse genuíno alinha Waldorf e Unschooling.'),
  ('charlotte-mason-living-books', 'forest-school',             'muito-boa',  'Nature study estruturado Mason + exploração livre Forest School: nature journal e observação partilhados.'),
  ('charlotte-mason-living-books', 'classical-education',       'muito-boa',  'Estrutura clássica + living books Mason: bases sólidas com conteúdo vivo e interessante.'),
  ('forest-school',            'unschooling',                   'excelente',  'Natureza + liberdade: criança dirige exploração em ambiente natural rico de oportunidades.'),
  ('forest-school',            'educacao-democratica',          'muito-boa',  'Autonomia na natureza + decisão comunitária: liberdade responsável em ambiente de confiança.'),
  ('unschooling',              'inquiry-based-learning',        'muito-boa',  'Curiosidade genuína + ciclo de investigação: IBL oferece estrutura ao impulso investigativo do Unschooling.'),
  ('unschooling',              'educacao-democratica',          'excelente',  'Ambas valorizam agência genuína da criança: IBL + democracia = liberdade com estrutura comunitária.'),
  ('project-based-learning',  'steam-methodology',             'excelente',  'Projetos com produto final + integração STEAM: combinação natural para aprendizagem autêntica e criativa.'),
  ('project-based-learning',  'inquiry-based-learning',        'excelente',  'Investigação sustentada IBL + produto final PBL: investigação com propósito e audiência real.'),
  ('project-based-learning',  'movimento-escola-moderna',      'muito-boa',  'Cooperação MEM + projetos PBL: comunicação autêntica com produto real partilhado.'),
  ('project-based-learning',  'blended-learning',              'muito-boa',  'Projetos com ferramentas digitais: pesquisa online, criação de conteúdo digital, apresentações multimédia.'),
  ('inquiry-based-learning',  'steam-methodology',             'excelente',  'Método científico IBL + integração disciplinar STEAM: investigação com Design Thinking.'),
  ('inquiry-based-learning',  'reggio-emilia',                 'muito-boa',  'Projetos emergentes Reggio + ciclos de investigação IBL: aprendizagem guiada pela curiosidade infantil.'),
  ('steam-methodology',       'blended-learning',              'muito-boa',  'Tecnologia como ferramenta STEAM + plataformas blended: programação, prototipagem digital e criação.'),
  ('steam-methodology',       'movimento-escola-moderna',      'muito-boa',  'Projetos cooperativos MEM + STEAM: criação colaborativa com componente científica e artística.'),
  ('movimento-escola-moderna','classical-education',           'boa',        'Alguma tensão (MEM: emergente/cooperativo; Classical: estruturado/memorização), mas texto livre + grandes obras podem coexistir.'),
  ('reggio-emilia',           'pikler',                        'excelente',  'Continuidade natural: Pikler para bebés, Reggio para pré-escolar. Ambas respeitam a iniciativa infantil.')
) AS c(slug_a, slug_b, compatibility, notes)
JOIN methodologies a ON a.slug = c.slug_a
JOIN methodologies b ON b.slug = c.slug_b
WHERE a.id <> b.id

ON CONFLICT (methodology_a_id, methodology_b_id) DO NOTHING;


-- ============================================================================
-- FIM DA MIGRATION 007
-- ============================================================================
