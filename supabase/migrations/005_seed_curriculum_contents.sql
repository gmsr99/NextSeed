-- Migration 005: Seed dos 525 conteúdos das Gestões de Conteúdos (1.º Ciclo)
-- Fonte: gestao_de_conteudos/1ano.json a 4ano.json
-- Gerado automaticamente — sem perdas de informação

DO $
DECLARE
  v_data    jsonb;
  v_year    text;
  v_yr      jsonb;
  v_disc    text;
  v_dc      jsonb;
  v_per_raw text;
  v_period  text;
  v_pr      jsonb;
  v_domain  text;
  v_dm      jsonb;
  v_content text;
  v_sort    int;
BEGIN
  v_data := $
{
  "1": {
    "Artes_Visuais": {
      "1º_2º_e_3º_Periodos": {
        "Apropriação e Reflexão": [
          "Observação e apreciação dos diferentes universos visuais (obras e artefactos de arte – pintura, escultura, desenho, assemblage, colagem, fotografia, instalação, land´art, banda desenhada, design, arquitetura, artesanato, multimédia, linguagens cinematográficas, entre outros), utilizando um vocabulário específico e adequado.",
          "Mobilizar a linguagem elementar das artes visuais (cor, forma, linha, textura, padrão, proporção e desproporção, plano, luz, espaço, volume, movimento, ritmo, matéria, …) integrada em diferentes contextos culturais (movimentos artísticos, épocas e geografias)."
        ],
        "Interpretação e Comunicação": [
          "Dialogar sobre o que vê e sente, de modo a construir múltiplos discursos e leituras da(s) realidade(s).",
          "Compreender a intencionalidade dos símbolos e dos sistemas de comunicação visual.",
          "Apreciar as diferentes manifestações artísticas e outras realidades visuais."
        ],
        "Experimentação e Criação": [
          "Integrar a linguagem das artes visuais, assim como várias técnicas de expressão (pintura; desenho - incluindo esboços, esquemas, e itinerários; técnica mista; assemblage; land´art; escultura; maqueta; fotografia, entre outras) nas suas experimentações: físicas e/ou digitais.",
          "Experimentar possibilidades expressivas dos materiais (carvão vegetal, pasta de modelar, barro, pastel seco, tinta cenográfica, pincéis e trinchas, rolos, papéis de formatos e características diversas, entre outros) e das diferentes técnicas, adequando o seu uso a diferentes contextos e situações.",
          "Escolher técnicas e materiais de acordo com a intenção expressiva das suas produções plásticas.",
          "Manifestar capacidades expressivas e criativas nas suas produções plásticas, evidenciando os conhecimentos adquiridos.",
          "Utilizar vários processos de registo de ideias (ex.: diários gráficos), de planeamento (ex.: projeto, portfólio) e de trabalho (ex.: individual, em grupo e em rede).",
          "Apreciar os seus trabalhos e os dos seus colegas, mobilizando diferentes critérios de argumentação."
        ]
      }
    },
    "Estudo_do_Meio": {
      "1º_Periodo": {
        "Sociedade": [
          "À descoberta de si mesmo: A sua identificação; O seu corpo; A segurança do seu corpo; Os membros da sua família."
        ],
        "Natureza": [
          "À descoberta de si mesmo: Os seus gostos e preferências; O seu corpo; O seu passado próximo."
        ],
        "Tecnologia": [
          "À descoberta dos outros e das instituições: Outras pessoas com quem mantém relações próximas.",
          "À descoberta das inter-relações entre espaços: Datas e locais importantes.",
          "À descoberta dos materiais e objetos: Manusear objetos em situações Concretas."
        ]
      },
      "2º_Periodo": {
        "Sociedade": [
          "À descoberta de si mesmo.",
          "À descoberta dos outros e das instituições: A sua escola."
        ],
        "Natureza": [
          "À descoberta de si mesmo: A saúde do seu corpo.",
          "À descoberta de si mesmo: As suas perspetivas para o futuro próximo.",
          "A descoberta dos materiais e objectos: A casa."
        ],
        "Tecnologia": [
          "À descoberta dos outros e das instituições: As pessoas da escola.",
          "À descoberta das inter-relações entre espaços: Localizar espaços em relação a um ponto de referência; O espaço da sua escola; Os seus itinerários.",
          "À descoberta dos materiais e objetos: Comportamentos de risco; Manusear objetos."
        ]
      },
      "3º_Periodo": {
        "Natureza": [
          "À descoberta do ambiente natural: Os seres vivos do seu ambiente.",
          "À descoberta do ambiente natural: Os aspetos físicos do meio local; Identificar cores, sons e cheiros da Natureza."
        ],
        "Tecnologia": [
          "À descoberta do ambiente natural: Realizar experiências com alguns materiais e objetos de uso corrente (sal, açúcar, leite, madeira, barro, cortiça, areia, papel, cera, objetos variados…).",
          "À descoberta do ambiente natural: Realizar experiências com a água e com o som."
        ]
      }
    },
    "Matematica": {
      "1º_Periodo": {
        "Números": [
          "Números naturais até 10: Significados de número natural; Usos do número natural.",
          "Relações numéricas: Factos básicos da adição; Composição e decomposição; Factos básicos da adição e sua relação com a subtração.",
          "Cálculo mental: Estratégias.",
          "Adição e Subtração: Significado e usos; Relação entre adição e subtração."
        ],
        "Álgebra": [
          "Regularidades em sequências: Sequências de repetição.",
          "Expressões e relações: Igualdades aritméticas; Propriedades das operações."
        ],
        "Dados e Probabilidades": [
          "Questões estatísticas, recolha e organização de dados: Questões estatísticas; Fontes primárias de dados; Métodos de recolha de dados (observar e inquirir); Recolha de dados; Registo de dados (listas e tabelas de contagem); Comunicação e divulgação de um estudo.",
          "Representações Gráficas: Gráfico de pontos; Análise crítica de gráficos.",
          "Análise de dados: Interpretação e conclusão."
        ],
        "Geometria e Medida": [
          "Orientação espacial: Posição e localização.",
          "Sólidos: Sólidos e superfícies.",
          "Figuras planas: Polígonos elementares, círculo e outras figuras."
        ]
      },
      "2º_Periodo": {
        "Números": [
          "Números naturais até 50: Significados de número natural; Usos do número natural.",
          "Relações numéricas: Factos básicos da adição; Composição e decomposição; Estimativas de cálculo.",
          "Cálculo mental: Estratégias.",
          "Adição e Subtração: Significado e usos; Relação entre adição e subtração."
        ],
        "Álgebra": [
          "Regularidades em sequências: Sequências de repetição.",
          "Expressões e relações: Igualdades aritméticas; Relações numéricas e algébricas."
        ],
        "Dados e Probabilidades": [
          "Questões estatísticas, recolha e organização de dados: Questões estatísticas; Fontes primárias de dados; Métodos de recolha de dados (observar e inquirir); Recolha de dados; Registo de dados (listas e tabelas de contagem).",
          "Representações gráficas: Pictogramas e gráfico de pontos.",
          "Análise de dados: Comunicação e divulgação de um estudo; público-alvo; Apresentações orais; Interpretação e conclusão."
        ],
        "Geometria e Medida": [
          "Figuras planas: Polígonos elementares, círculo e outras figuras.",
          "Operações com figuras: Composição e decomposição.",
          "Tempo: Sequências de acontecimentos; Calendários."
        ]
      },
      "3º_Periodo": {
        "Números": [
          "Números naturais até 100: Significados de número natural; Usos do número natural.",
          "Sistema de numeração decimal: Valor posicional.",
          "Relações numéricas: Factos básicos da adição; Composição e decomposição; Estimativas de cálculo.",
          "Cálculo mental: Estratégias.",
          "Adição e Subtração: Significado e usos; Relação entre adição e subtração."
        ],
        "Álgebra": [
          "Regularidades em sequências.",
          "Expressões e relações: igualdades aritméticas; Relações numéricas e algébricas; Propriedades das operações."
        ],
        "Dados e Probabilidades": [
          "Questões estatísticas, recolha e organização de dados: Questões estatísticas; Fontes primárias de dados; Métodos de recolha de dados (observar e inquirir); Recolha de dados; Registo de dados (listas e tabelas de contagem).",
          "Representações gráficas: Pictogramas e gráfico de pontos.",
          "Análise de dados: Comunicação e divulgação de um estudo; público-alvo; Apresentações orais; Interpretação e conclusão."
        ],
        "Geometria e Medida": [
          "Operações com figuras: Composição e decomposição.",
          "Comprimento: Significado; Medição e unidades de medida; Usos do comprimento."
        ]
      },
      "Ao_longo_do_ano": {
        "Capacidades Matemáticas": [
          "Resolução de problemas: Processo; Estratégias.",
          "Raciocínio matemático: Conjeturar e generalizar; Classificar; Justificar.",
          "Pensamento computacional: Abstração; Decomposição; Reconhecimento de padrões; Algoritmia; Depuração.",
          "Comunicação matemática: Expressão de ideias; Discussão de ideias.",
          "Representações matemáticas: Representações múltiplas; Conexões entre representações; Linguagem simbólica matemática.",
          "Conexões matemáticas: Conexões internas; Conexões externas.",
          "Modelos matemáticos: Linguagem simbólica matemática."
        ]
      }
    },
    "Portugues": {
      "1º_Periodo": {
        "Oralidade": [
          "Interação discursiva: Princípio de cortesia; Resposta, pergunta, pedido.",
          "Compreensão e expressão: Articulação, entoação e ritmo; Vocabulário: alargamento, adequação; Informação essencial; Instrução; Frase; Expressão de ideias e de sentimentos."
        ],
        "Leitura e Escrita": [
          "Alfabeto e grafemas: Alfabeto (i, u, o, a, e, p, t, l, d, m, v); Letra maiúscula, letra minúscula; Valores fonológicos de grafemas, dígrafos e ditongos (iu, ui, oi, ou, ai, au, ão, ei, eu, ãe, al/el/il/ol/ul).",
          "Consciência fonológica e habilidades fonémicas: Perceção e discriminação fonéticas; Consciência silábica; Sensibilidade fonológica; Consciência fonémica.",
          "Fluência de leitura: velocidade, precisão e prosódia: Palavras e pseudopalavras monossilábicas, dissilábicas e trissilábicas; Palavras regulares e irregulares.",
          "Compreensão de texto: Textos de características narrativas, informativas, descritivas; Poema, banda desenhada; Vocabulário: alargamento e adequação; Sentidos do texto: sequência de acontecimentos, mudança de espaço, tema, assunto, informação essencial, intenções e emoções de personagens.",
          "Ortografia e pontuação: Sílabas, palavras (regulares e irregulares), pseudopalavras, frases; Letra de imprensa, letra manuscrita; Frases; Sinais de pontuação: ponto final, ponto de interrogação.",
          "Produção escrita: Frases simples; Legendas de imagens."
        ],
        "Iniciação à Educação Literária": [
          "Audição e leitura: Obras de literatura para a infância, textos da tradição popular \"Pelo muro acima\", \"Um, dois, três, quatro\", \"Frutos\".",
          "Compreensão de texto: Rima; Antecipação de conteúdos; Reconto; Expressão de sentimentos e de emoções.",
          "Memorização e recitação: Trava-línguas, lengalenga; poema.",
          "Produção expressiva: Histórias inventadas; Recriação de textos."
        ],
        "Gramática": [
          "Morfologia e lexicologia: Nome: flexão em género e número (regular)."
        ]
      },
      "2º_Periodo": {
        "Oralidade": [
          "Interação discursiva: Princípio de cortesia; Resposta, pergunta, pedido.",
          "Compreensão e expressão: Articulação, entoação e ritmo; Vocabulário: alargamento, adequação; Informação essencial; Instrução; Frase; Expressão de ideias e de sentimentos."
        ],
        "Leitura e Escrita": [
          "Consciência fonológica e habilidades fonémicas: Perceção e discriminação fonéticas; Consciência silábica; Sensibilidade fonológica; Consciência fonémica.",
          "Alfabeto e grafemas: Alfabeto (c, q, n, r, b, g, j, f, s); Letra maiúscula, letra minúscula; Valores fonológicos de grafemas, dígrafos e ditongos (-rr-;-r-; ar/er/ir/or/ur); Valores fonológicos de grafemas, dígrafos e ditongos (gue/gui, ge/gi).",
          "Fluência de leitura: velocidade, precisão e prosódia: Palavras e pseudopalavras monossilábicas, dissilábicas e trissilábicas; Palavras regulares e irregulares.",
          "Compreensão de texto: Textos de características narrativas, informativas, descritivas; Poema, banda desenhada; Vocabulário: alargamento e adequação; Sentidos do texto: sequência de acontecimentos, mudança de espaço, tema, assunto, informação essencial, intenções e emoções de personagens.",
          "Ortografia e pontuação: Sílabas, palavras (regulares e irregulares), pseudopalavras; Frases; Sinais de pontuação: ponto final, ponto de interrogação; Letra de imprensa, letra manuscrita.",
          "Produção escrita: Frases simples; Legendas de imagens; Pequenos textos."
        ],
        "Iniciação à Educação Literária": [
          "Audição e leitura: Obras de literatura para a infância, textos da tradição popular \"Vamos contar um segredo\".",
          "Compreensão de texto: Antecipação de conteúdos; Reconto; Expressão de sentimentos e de emoções.",
          "Produção expressiva: Histórias inventadas."
        ],
        "Gramática": [
          "Morfologia e lexicologia: Sinónimos e antónimos: reconhecimento.",
          "Unidades da língua: Palavra, sílaba fonemas.",
          "Classe de palavras: Nome próprio.",
          "Vocabulário: Alargamento e adequação.",
          "Ortografia e pontuação: Correspondência fonema-grafema; Sinais de pontuação (ponto final)."
        ]
      },
      "3º_Periodo": {
        "Oralidade": [
          "Compreensão e expressão: Articulação, entoação e ritmo; Vocabulário: alargamento, adequação; Informação essencial; Instrução; Frase; Expressão de ideias e de sentimentos."
        ],
        "Leitura e Escrita": [
          "Consciência fonológica e habilidades fonémicas: Perceção e discriminação fonéticas; Consciência silábica; Sensibilidade fonológica; Consciência fonémica.",
          "Alfabeto e grafemas: Alfabeto (z, h, x, k, w, y); Letra maiúscula, letra minúscula; Valores fonológicos de grafemas, dígrafos e ditongos (-ss-; ce/ci; ça/ço/çu; as/es/is/os/us; ãos/ões/ães; -s-; az/ez/iz/oz/uz); Valores fonológicos de grafemas, dígrafos e ditongos (an/en/in/on/un; am/em/im/om/um; ans/ens/ins/ons/uns; nh; lh; br/cr/dr/fr/gr/pr/tr/vr; bl/cl/dl/fl/gl/pl/tl; valores de x).",
          "Fluência de leitura: velocidade, precisão e prosódia: Palavras e pseudopalavras monossilábicas, dissilábicas e trissilábicas; Palavras regulares e irregulares; Textos.",
          "Ortografia e pontuação: Sílabas, palavras (regulares e irregulares), pseudopalavras; Frases; Sinais de pontuação: ponto final, ponto de interrogação; Letra de imprensa, letra manuscrita.",
          "Produção escrita: Frases simples; Legendas de imagens; Pequenos textos."
        ],
        "Iniciação à Educação Literária": [
          "Audição e leitura: Obras de literatura para a infância, textos da tradição popular \"A história do Pedrito Coelho\".",
          "Compreensão de texto: Antecipação de conteúdos; Reconto; Expressão de sentimentos e de emoções.",
          "Produção expressiva: Histórias inventadas; Recriação de textos."
        ],
        "Gramática": [
          "Unidades da língua: Palavra, sílaba fonemas.",
          "Morfologia e lexicologia: Nome e adjetivo qualificativo: flexão em género e número (regular).",
          "Classe de palavras: Nome próprio.",
          "Vocabulário: Alargamento e adequação.",
          "Ortografia e pontuação: Correspondência fonema-grafema; Sinais de pontuação (ponto final)."
        ]
      }
    }
  },
  "2": {
    "Artes_Visuais": {
      "1º_2º_e_3º_Periodos": {
        "Apropriação e Reflexão": [
          "Observação e apreciação dos diferentes universos visuais (obras e artefactos de arte – pintura, escultura, desenho, assemblage, colagem, fotografia, instalação, land´art, banda desenhada, design, arquitetura, artesanato, multimédia, linguagens cinematográficas, entre outros), utilizando um vocabulário específico e adequado.",
          "Mobilizar a linguagem elementar das artes visuais (cor, forma, linha, textura, padrão, proporção e desproporção, plano, luz, espaço, volume, movimento, ritmo, matéria, …) integrada em diferentes contextos culturais (movimentos artísticos, épocas e geografias)."
        ],
        "Interpretação e Comunicação": [
          "Dialogar sobre o que vê e sente, de modo a construir múltiplos discursos e leituras da(s) realidade(s).",
          "Compreender a intencionalidade dos símbolos e dos sistemas de comunicação visual.",
          "Apreciar as diferentes manifestações artísticas e outras realidades visuais."
        ],
        "Experimentação e Criação": [
          "Integrar a linguagem das artes visuais, assim como várias técnicas de expressão (pintura; desenho - incluindo esboços, esquemas, e itinerários; técnica mista; assemblage; land´art; escultura; maqueta; fotografia, entre outras) nas suas experimentações: físicas e/ou digitais.",
          "Experimentar possibilidades expressivas dos materiais (carvão vegetal, pasta de modelar, barro, pastel seco, tinta cenográfica, pincéis e trinchas, rolos, papéis de formatos e características diversas, entre outros) e das diferentes técnicas, adequando o seu uso a diferentes contextos e situações.",
          "Escolher técnicas e materiais de acordo com a intenção expressiva das suas produções plásticas.",
          "Manifestar capacidades expressivas e criativas nas suas produções plásticas, evidenciando os conhecimentos adquiridos.",
          "Utilizar vários processos de registo de ideias (ex.: diários gráficos), de planeamento (ex.: projeto, portfólio) e de trabalho (ex.: individual, em grupo e em rede).",
          "Apreciar os seus trabalhos e os dos seus colegas, mobilizando diferentes critérios de argumentação."
        ]
      }
    },
    "Estudo_do_Meio": {
      "1º_Periodo": {
        "Sociedade": [
          "As regras de boa convivência (diálogo, negociação, compromisso)."
        ],
        "Natureza": [
          "Ossos e músculos.",
          "Os principais órgãos do corpo humano (coração, pulmões, estômago e rins).",
          "A vacinação e o uso de medicamentos.",
          "O bem-estar."
        ],
        "Cidadania": [
          "Saúde.",
          "Igualdade de género.",
          "Interculturalidade.",
          "Direitos humanos."
        ],
        "Sociedade / Natureza / Tecnologia": [
          "Passado pessoal e familiar.",
          "Localizar Portugal.",
          "Diferentes grupos e comunidades.",
          "A influência de outros povos e culturas.",
          "Os Direitos da Criança."
        ]
      },
      "2º_Periodo": {
        "Sociedade / Natureza / Tecnologia": [
          "Plantas e itinerários.",
          "Segurança individual e coletiva.",
          "Representar lugares.",
          "As instituições e os serviços.",
          "Os símbolos do consumidor.",
          "Os meios de comunicação.",
          "Os recursos tecnológicos.",
          "Segurança na internet.",
          "A temperatura dos materiais."
        ],
        "Cidadania": [
          "Literacia financeira e educação para o consumo.",
          "Media."
        ]
      },
      "3º_Periodo": {
        "Natureza": [
          "As características dos animais (revestimento, alimentação, locomoção e reprodução).",
          "As características das plantas (tipo de raiz, tipo de caule, forma da folha, folha caduca/persistente, cor da flor, fruto e semente).",
          "Os seres vivos e o seu habitat.",
          "Ameaças à biodiversidade."
        ],
        "Sociedade / Natureza / Tecnologia": [
          "A importância da água, do ar e do solo.",
          "Os problemas ambientais.",
          "As estações do ano (estados de tempo típicos das estações do ano em Portugal e a sua variabilidade).",
          "Mudanças de estado físico (evaporação, condensação, solidificação, fusão).",
          "O ciclo da água."
        ],
        "Cidadania": [
          "Bem-estar animal.",
          "Desenvolvimento sustentável.",
          "Educação Ambiental."
        ]
      }
    },
    "Matematica": {
      "1º_Periodo": {
        "Números": [
          "Números naturais até 299: Ler e representar, usando uma diversidade de representações. Comparar e ordenar números naturais, de forma crescente e decrescente.",
          "Sistema de numeração decimal: Valor posicional.",
          "Relações numéricas: Factos básicos da adição. Composição e decomposição. Factos básicos da adição e sua relação com a subtração. Números ordinais até 20.º",
          "Cálculo mental: Estratégias.",
          "Multiplicação/ Divisão: Significado e usos da multiplicação e da divisão. Relação entre a multiplicação e a divisão."
        ],
        "Capacidades Matemáticas": [
          "Resolução de Problemas: Processo. Estratégias.",
          "Raciocínio Matemático: Conjeturar e generalizar. Classificar. Justificar.",
          "Pensamento Computacional: Pensamento. Abstração. Decomposição. Reconhecimento de padrões. Algoritrmia. Depuração.",
          "Comunicação Matemática: Expressão e discussão de ideias.",
          "Representações matemáticas: Representações múltiplas. Conexões entre representações. Linguagem simbólica matemática.",
          "Conexões matemáticas: Conexões internas e externas.",
          "Modelos matemáticos."
        ],
        "Dados": [
          "Questões estatísticas, recolha e organização de dados: Questões estatísticas. Recolha de dados (fontes primárias e métodos). Tabela de frequências absolutas. Diagramas de Carroll.",
          "Representações Gráficas.",
          "Análise de dados: Interpretação e conclusão."
        ],
        "Álgebra": [
          "Expressões e relações: Igualdades numéricas. Relações numéricas e algébricas. Propriedades das operações."
        ],
        "Geometria e Medida": [
          "Orientação espacial: Itinerários.",
          "Sólidos: Características dos sólidos."
        ]
      },
      "2º_Periodo": {
        "Capacidades Matemáticas": [
          "Resolução de Problemas: Processo. Estratégias.",
          "Raciocínio Matemático: Conjeturar e generalizar. Classificar. Justificar.",
          "Pensamento Computacional: Abstração. Decomposição. Reconhecimento de padrões. Algoritrmia. Depuração.",
          "Comunicação Matemática: Expressão e discussão de ideias.",
          "Representações matemáticas: Representações múltiplas. Conexões entre representações. Linguagem simbólica matemática.",
          "Conexões matemáticas: Conexões internas e externas.",
          "Modelos matemáticos."
        ],
        "Números": [
          "Números naturais até 699: Ler e representar, usando uma diversidade de representações. Comparar e ordenar números naturais, de forma crescente e decrescente.",
          "Sistema de numeração decimal: Valor posicional.",
          "Relações numéricas: Factos básicos da multiplicação (tabuadas do 2, 4, 5, 10 e 3). Composição e decomposição.",
          "Cálculo mental: Estratégias.",
          "Multiplicação/ Divisão: Significado e usos da multiplicação e da divisão. Relação entre a multiplicação e a divisão."
        ],
        "Álgebra": [
          "Regularidades em sequências: Sequências de repetição e crescimento.",
          "Expressões e relações: Igualdades aritméticas. Relações numéricas e algébricas. Propriedades das operações."
        ],
        "Dados": [
          "Questões estatísticas, recolha e organização de dados: Questões estatísticas. Recolha de dados (fontes primárias e métodos).",
          "Representações Gráficas: Pictogramas. Gráficos de barras. Análise crítica de gráficos.",
          "Análise de dados."
        ],
        "Geometria e Medida": [
          "Orientação espacial: Vistas e plantas.",
          "Figuras Planas: Polígonos."
        ]
      },
      "3º_Periodo": {
        "Capacidades Matemáticas": [
          "Resolução de Problemas: Processo. Estratégias.",
          "Raciocínio Matemático: Conjeturar e generalizar. Classificar. Justificar.",
          "Pensamento Computacional: Abstração. Decomposição. Reconhecimento de padrões. Algoritrmia. Depuração.",
          "Comunicação Matemática: Expressão e discussão de ideias.",
          "Representações matemáticas: Representações múltiplas. Conexões entre representações. Linguagem simbólica matemática.",
          "Conexões matemáticas: Conexões internas e externas.",
          "Modelos matemáticos."
        ],
        "Números": [
          "Números naturais até 1000: Significados de número natural. Usos do número natural. Arredondar números naturais à dezena ou centena mais próxima.",
          "Sistema de numeração decimal: Valor posicional.",
          "Relações numéricas: Factos básicos da multiplicação e sua relação com a divisão. Composição e decomposição.",
          "Frações: Significado de fração. Relações entre frações.",
          "Cálculo mental: Estratégias. Estimativas de cálculo.",
          "Multiplicação/ Divisão: Significado e usos da multiplicação e da divisão. Relação entre a multiplicação e a divisão."
        ],
        "Dados": [
          "Representações Gráficas: Gráfico de barras. Análise crítica de gráficos.",
          "Análise de dados: Interpretação e conclusão. Resumo dos dados – Moda.",
          "Comunicação e divulgação de um estudo: Público-alvo. Recursos para a comunicação (posters)."
        ],
        "Álgebra": [
          "Expressões e Relações: Relações numéricas e algébricas."
        ],
        "Geometria e Medida": [
          "Área: Significado. Medição e unidades de medida. Usos da área.",
          "Operações com figuras: Deslizar, rodar e voltar.",
          "Comprimento: Medição e unidades de medida.",
          "Perímetro: Usos do comprimento."
        ]
      }
    },
    "Portugues": {
      "1º_Periodo": {
        "Oralidade": [
          "Interação discursiva: Princípio de cooperação e cortesia. Resposta, pergunta, pedido.",
          "Compreensão e expressão: Articulação, entoação e ritmo. Vocabulário: alargamento, adequação, variedade. Informação essencial. Instrução. Frase. Expressão de ideias e de sentimentos. Expressão orientada: reconto, conto; simulação, dramatização."
        ],
        "Leitura e Escrita": [
          "Alfabeto e grafemas: Alfabeto (consolidação). Correspondências grafofonémicas (grafemas com diacrítico, dígrafos e ditongos). Correspondências fonográficas.",
          "Fluência de leitura: velocidade, precisão e prosódia: Palavras e pseudopalavras, com complexidade silábica crescente; palavras regulares e irregulares; textos.",
          "Compreensão de texto: Textos de características: narrativas, descritivas, associados a finalidades diferentes. Vocabulário: alargamento, adequação e variedade. Sentidos do texto: sequência de acontecimentos, mudança de espaço; encadeamentos de causa e efeito; tema, assunto; informação essencial; articulação de factos e de ideias.",
          "Pesquisa e registo da informação.",
          "Ortografia e pontuação: Sílabas, palavras, pseudopalavras, frases, texto. Acentos gráficos e til. Sinais de pontuação. Letra de imprensa, letra manuscrita.",
          "Produção de texto: Pequenas narrativas. Planificação de texto: ideias-chave. Redação e revisão de texto: concordância; tempos verbais; utilização de sinónimos e de pronomes; apresentação gráfica."
        ],
        "Educação Literária": [
          "Audição e leitura: Obras de literatura para a infância, textos da tradição popular; outros textos literários selecionados pelo aluno, sob orientação (Listagem PNL). Selecionar livros para leitura pessoal, apresentando as razões das suas escolhas. Formas de leitura: silenciosa; em voz alta; em coro.",
          "Compreensão de texto: Antecipação de conteúdos/temas. Inferências (de sentimento – atitude). (Re)conto; alteração de passagens em texto narrativo. Expressão de sentimentos e de emoções.",
          "Memorização e recitação: Lengalengas; trava-línguas; adivinhas rimadas; poemas.",
          "Produção expressiva: Histórias inventadas. Recriação de textos."
        ],
        "Gramática": [
          "Classificação de palavras quanto ao número de sílabas.",
          "Sílaba tónica e átona.",
          "Acentos, sinais gráficos e pontuação.",
          "Sinónimos e antónimos: reconhecimento.",
          "Classe de palavras: Nome próprio e comum (Flexão de género e número). Determinante artigo."
        ]
      },
      "2º_Periodo": {
        "Oralidade": [
          "Interação discursiva: Princípio de cortesia. Resposta, pergunta, pedido.",
          "Compreensão e expressão: Articulação, entoação e ritmo. Vocabulário: alargamento, adequação e variedade. Informação essencial. Instrução. Frase. Expressão de ideias e de sentimentos. Reconto de histórias e narração de situações vividas e imaginadas. Jogos de simulação e dramatização."
        ],
        "Leitura e Escrita": [
          "Consciência fonológica e habilidades fonémicas: Perceção e discriminação fonéticas. Consciência silábica. Sensibilidade fonológica. Consciência fonémica.",
          "Fluência de leitura: velocidade, precisão e prosódia: Palavras e pseudopalavras, com complexidade silábica crescente; palavras regulares e irregulares; textos.",
          "Compreensão de texto: Textos de características: narrativas, descritivas, informativas, associados a finalidades diferentes. Poema. Vocabulário: alargamento, adequação e variedade. Sentidos do texto: sequência de acontecimentos, mudança de espaço; encadeamentos de causa e efeito; tema, assunto; informação essencial; articulação de factos e de ideias.",
          "Pesquisa e registo da informação.",
          "Ortografia e pontuação: Acentos gráficos e til. Sinais de pontuação.",
          "Produção de texto: Planificação de texto: ideias-chave. Escrita de textos curtos com diversas finalidades (narrar, informar e explicar). Redação e revisão de texto: concordância; tempos verbais; utilização de sinónimos e de pronomes; apresentação gráfica."
        ],
        "Educação Literária": [
          "Audição e leitura: Obras de literatura para a infância, textos da tradição popular; outros textos literários selecionados pelo aluno, sob orientação (Listagem PNL). Leitura de narrativas e poemas adequados à idade, por iniciativa própria ou de outrem. Formas de leitura: silenciosa; em voz alta; em coro.",
          "Compreensão de texto: Antecipação de conteúdos/temas. Compreender narrativas literárias. (Re)conto de histórias. Explicitar o sentido dos poemas escutados ou lidos. Valorizar a diversidade cultural dos textos (ouvidos ou lidos). Expressão de sentimentos e de emoções. Dizer, de modo dramatizado, trava-línguas, lengalengas e poemas memorizados (treino da voz, dos gestos, das pausas, da entoação e da expressão facial).",
          "Produção expressiva: Histórias inventadas. Recriação de textos."
        ],
        "Gramática": [
          "Morfologia e lexicologia: Sinónimos e antónimos: reconhecimento.",
          "Classe de palavras: Adjetivo (flexão género e número). Pronome pessoal. Verbo (infinitivo). Conectores.",
          "Acentos, sinais gráficos e pontuação.",
          "Sinónimos e antónimos: reconhecimento."
        ]
      },
      "3º_Periodo": {
        "Oralidade": [
          "Compreensão e expressão: Articulação, entoação e ritmo. Vocabulário: alargamento, adequação. Informação essencial. Instrução. Perguntas, pedidos e respostas. Expressão de ideias e de sentimentos. Planear, produzir e avaliar os seus próprios textos. Reconto de histórias e narração de situações vividas e imaginadas. Jogos de simulação e dramatização."
        ],
        "Leitura e Escrita": [
          "Consciência fonológica e habilidades fonémicas: Perceção e discriminação fonéticas. Consciência silábica. Sensibilidade fonológica. Consciência fonémica.",
          "Fluência de leitura: velocidade, precisão e prosódia: Palavras e pseudopalavras, com complexidade silábica crescente; palavras regulares e irregulares; textos.",
          "Compreensão de texto: Textos de características: narrativas, descritivas, informativas, associados a finalidades diferentes. Vocabulário: alargamento, adequação e variedade. Sentidos do texto: sequência de acontecimentos, mudança de espaço; encadeamentos de causa e efeito; tema, assunto; informação essencial; articulação de factos e de ideias.",
          "Pesquisa e registo da informação.",
          "Ortografia e pontuação: Acentos gráficos e til. Sinais de pontuação.",
          "Produção de texto: Planificação de texto: ideias-chave. Redação e revisão de texto: concordância; tempos verbais; utilização de sinónimos e de pronomes; apresentação gráfica."
        ],
        "Educação Literária": [
          "Ortografia e pontuação: Sílabas, palavras (regulares e irregulares), pseudopalavras. Frases. Sinais de pontuação: ponto final, ponto de interrogação. Letra de imprensa, letra manuscrita.",
          "Produção escrita: Frases simples. Legendas de imagens. Pequenos textos.",
          "Audição e leitura: Obras de literatura para a infância, textos da tradição popular; outros textos literários selecionados pelo aluno, sob orientação (Listagem PNL). Leitura de narrativas e poemas adequados à idade, por iniciativa própria ou de outrem. Formas de leitura: silenciosa; em voz alta; em coro.",
          "Compreensão de texto: Antecipação de conteúdos/temas. Compreender narrativas literárias. (Re)conto de histórias. Explicitar o sentido dos poemas escutados ou lidos. Valorizar a diversidade cultural dos textos (ouvidos ou lidos). Expressão de sentimentos e de emoções. Dizer, de modo dramatizado, trava-línguas línguas, lengalengas e poemas memorizados (treino da voz, dos gestos, das pausas, da entoação e da expressão facial).",
          "Produção expressiva: Histórias inventadas. Recriação de textos."
        ],
        "Gramática": [
          "Conhecimento lexical (passivo e ativo).",
          "Classe de palavras: Interjeição.",
          "Significados conotativos."
        ]
      }
    }
  },
  "3": {
    "Artes_Visuais": {
      "1º_2º_e_3º_Periodos": {
        "Apropriação e Reflexão": [
          "Observação e apreciação dos diferentes universos visuais (obras e artefactos de arte – pintura, escultura, desenho, assemblage, colagem, fotografia, instalação, land´art, banda desenhada, design, arquitetura, artesanato, multimédia, linguagens cinematográficas, entre outros), utilizando um vocabulário específico e adequado.",
          "Mobilizar a linguagem elementar das artes visuais (cor, forma, linha, textura, padrão, proporção e desproporção, plano, luz, espaço, volume, movimento, ritmo, matéria, …) integrada em diferentes contextos culturais (movimentos artísticos, épocas e geografias)."
        ],
        "Interpretação e Comunicação": [
          "Dialogar sobre o que vê e sente, de modo a construir múltiplos discursos e leituras da(s) realidade(s).",
          "Compreender a intencionalidade dos símbolos e dos sistemas de comunicação visual.",
          "Apreciar as diferentes manifestações artísticas e outras realidades visuais."
        ],
        "Experimentação e Criação": [
          "Integrar a linguagem das artes visuais, assim como várias técnicas de expressão (pintura; desenho - incluindo esboços, esquemas, e itinerários; técnica mista; assemblage; land´art; escultura; maqueta; fotografia, entre outras) nas suas experimentações: físicas e/ou digitais.",
          "Experimentar possibilidades expressivas dos materiais (carvão vegetal, pasta de modelar, barro, pastel seco, tinta cenográfica, pincéis e trinchas, rolos, papéis de formatos e características diversas, entre outros) e das diferentes técnicas, adequando o seu uso a diferentes contextos e situações.",
          "Escolher técnicas e materiais de acordo com a intenção expressiva das suas produções plásticas.",
          "Manifestar capacidades expressivas e criativas nas suas produções plásticas, evidenciando os conhecimentos adquiridos.",
          "Utilizar vários processos de registo de ideias (ex.: diários gráficos), de planeamento (ex.: projeto, portfólio) e de trabalho (ex.: individual, em grupo e em rede).",
          "Apreciar os seus trabalhos e os dos seus colegas, mobilizando diferentes critérios de argumentação."
        ]
      }
    },
    "Estudo_do_Meio": {
      "1º_Periodo": {
        "Sociedade": [
          "Direitos humanos.",
          "Igualdade de Género.",
          "Diversidade Cultural.",
          "Direitos da Criança.",
          "Problemas Sociais.",
          "Unidades de tempo (década, século e milénio e as referências temporais a.C e d.C).",
          "História e vestígios do passado local.",
          "Fontes históricas.",
          "Diversidade de etnias e culturas na comunidade.",
          "Estados Europeus.",
          "Semelhanças entre povos europeus."
        ],
        "Sociedade / Natureza / Tecnologia": [
          "Saúde: Álcool, tabaco e outras drogas; Estilos de vida saudável; Primeiros socorros.",
          "Desenvolvimento sustentável: Formas físicas da superfície terrestre; Formas de relevo e recursos hídricos; Agentes erosivos; Sólidos, líquidos e gases; Identificar a existência de transformações reversíveis."
        ]
      },
      "2º_Periodo": {
        "Natureza": [
          "Desenvolvimento sustentável e Bem-estar animal: Seres vivos (reprodução e características dos seus descendentes); Seres vivos (fatores do meio ambiente); Preservação da Natureza."
        ],
        "Sociedade / Natureza": [
          "Educação ambiental: Modificações, problemas ambientais e consequências."
        ]
      },
      "3º_Periodo": {
        "Tecnologia": [
          "Interferência do Oceano na vida humana.",
          "Educação para a sexualidade (afetos).",
          "Movimentos da Terra.",
          "Fases da Lua.",
          "Orientação e localização no espaço.",
          "Experiências: comportamentos da luz e de ímanes.",
          "Educação para o Consumo: Diferenças e semelhanças entre o passado e o presente.",
          "Linguagem específica da tecnologia (informações e símbolos).",
          "Potencialidades e normas de segurança da Internet.",
          "Problemas sociais da Tecnologia.",
          "Papel dos media na informação.",
          "Aplicação de forças.",
          "Manuseamento de objetos tecnológicos."
        ]
      },
      "1º_2º_e_3º_Periodos": {
        "Cidadania e Desenvolvimento": [
          "Saber colocar questões, levantar hipóteses, fazer inferências, comprovar resultados e saber comunicá-los, reconhecendo como se constrói o conhecimento."
        ]
      }
    },
    "Matematica": {
      "1º_Periodo": {
        "Números": [
          "Números naturais: Usos do número natural; Sistema de numeração decimal; Composição e decomposição; Valor posicional; Relações numéricas; Factos básicos da multiplicação e sua relação com a divisão.",
          "Frações: Significado de fração.",
          "Operações: Significado e usos das operações; Algoritmo da adição; Factos básicos da multiplicação e sua relação com a divisão."
        ],
        "Álgebra": [
          "Regularidades em sequências: Sequências de repetição.",
          "Expressões e relações: Igualdades aritméticas; Relações numéricas e algébricas.",
          "Cálculo mental: Estratégias de cálculo mental; Estimativas de cálculo.",
          "Relações numéricas: Propriedades das operações."
        ],
        "Geometria e Medida": [
          "Orientação espacial.",
          "Medição e unidades de medida: Usos do comprimento; Medição e unidades de medida.",
          "Tempo: Usos do tempo."
        ],
        "Dados e Probabilidades": [
          "Questões estatísticas, recolha e organização de dados: Questões estatísticas; Recolha de dados (fontes secundárias e métodos).",
          "Representações gráficas: Análise crítica de gráficos.",
          "Análise e resumo dos dados: Moda, mínimo e máximo.",
          "Representações gráficas: Análise crítica de dados e gráficos; Interpretação e conclusão."
        ]
      },
      "2º_Periodo": {
        "Dados e Probabilidades": [
          "Questões estatísticas, recolha e organização de dados: Tabelas de frequências absolutas; Análise crítica de dados e gráficos; Resumo de dados (moda, mínimo e máximo); Interpretação e conclusão.",
          "Comunicação e divulgação de um estudo: Público-alvo; Recursos para a comunicação (infográficos).",
          "Representações gráficas: Diagrama de caule e folhas (simples).",
          "Probabilidades."
        ],
        "Números e Operações": [
          "Números naturais: Usos do número natural; Sistema de numeração decimal; Valor posicional.",
          "Operações: Algoritmo da subtração; Algoritmo da adição (com reagrupamento).",
          "Relações numéricas: Factos básicos da multiplicação e sua relação com a divisão.",
          "Cálculo mental e estratégias: Estimativas de cálculo."
        ],
        "Geometria e Medida": [
          "Sólidos: Prismas e pirâmides regulares.",
          "Massa: Significado; Medição e unidade de medida; Usos da massa."
        ],
        "Álgebra": [
          "Sequências de crescimento.",
          "Expressões e relações: Igualdades aritméticas.",
          "Sistema de numeração decimal.",
          "Relações numéricas: Factos básicos da multiplicação e sua relação com a divisão.",
          "Cálculo mental e estratégias."
        ]
      },
      "3º_Periodo": {
        "Dados e Probabilidades": [
          "Representação e tratamento de dados: Analisar e interpretar informação de natureza estatística representada de diversas formas; Reconhecer e dar exemplos de acontecimentos certos e impossíveis, e acontecimentos possíveis (prováveis e pouco prováveis)."
        ],
        "Geometria e Medida": [
          "Operações com figuras: Reflexão.",
          "Área: Figuras equivalentes; Usos da área.",
          "Figuras planas: Ângulos.",
          "Operações com figuras: Rotação.",
          "Dinheiro: Usos do dinheiro."
        ],
        "Números": [
          "Cálculo mental: Estratégias de cálculo mental.",
          "Operações: Algoritmo da subtração, com reagrupamento; Significado e usos das operações.",
          "Frações: Relações entre frações.",
          "Números naturais: Usos do número natural.",
          "Relações numéricas: Factos básicos da multiplicação e sua relação com a divisão."
        ],
        "Álgebra": [
          "Expressões e relações: Igualdades aritméticas; Propriedades das operações; Relações numéricas e algébricas."
        ]
      },
      "Ao_longo_do_ano": {
        "Capacidades Matemáticas": [
          "Resolução de problemas: Processo; Estratégias.",
          "Raciocínio matemático: Conjeturar e generalizar; Classificar; Justificar.",
          "Pensamento computacional: Abstração; Decomposição; Reconhecimento de padrões; Algoritmia; Depuração.",
          "Comunicação matemática: Expressão de ideias; Discussão de ideias.",
          "Representações matemáticas: Representações múltiplas; Conexões entre representações; Linguagem simbólica matemática.",
          "Conexões matemáticas: Conexões internas; Conexões externas.",
          "Modelos matemáticos: Linguagem simbólica matemática."
        ]
      }
    },
    "Portugues": {
      "1º_2º_e_3º_Periodos": {
        "Oralidade": [
          "Escutar para aprender e construir conhecimentos.",
          "Produzir um discurso oral com correção.",
          "Produzir discursos com diferentes finalidades, tendo em conta a situação e o interlocutor."
        ],
        "Leitura e Escrita": [
          "Desenvolver a consciência fonológica e operar com fonemas – consolidação.",
          "Ler em voz alta palavras e textos.",
          "Ler textos diversos.",
          "Apropriar-se de novos vocábulos.",
          "Organizar os conhecimentos do texto.",
          "Relacionar o texto com conhecimentos anteriores e compreendê-lo.",
          "Monitorizar a compreensão.",
          "Elaborar e aprofundar ideias e conhecimentos.",
          "Planificar a escrita de textos.",
          "Redigir corretamente.",
          "Escrever textos narrativos."
        ],
        "Educação Literária": [
          "Ler e ouvir ler textos literários.",
          "Ler para apreciar textos literários.",
          "Ler em termos pessoais.",
          "Dizer e escrever, em termos pessoais e criativos."
        ]
      },
      "1º_Periodo": {
        "Gramática": [
          "Fonologia: Explicar aspetos fundamentais da fonologia do Português; Classificar palavras quanto ao número de sílabas; Distinguir sílaba tónica e átona; Classificar palavras quanto à posição da sílaba tónica.",
          "Classe de palavras: Conhecer propriedades das palavras; Identificar nomes próprios e comuns; Identificar as três conjugações verbais; Identificar pronomes pessoais (forma tónica).",
          "Identificar os determinantes demonstrativos e possessivos; Identificar o quantificador numeral; Identificar advérbios de negação e afirmação.",
          "Distinguir palavras variáveis de invariáveis; Reconhecer masculinos e femininos de radical diferente; Formar o plural de adjetivos terminados em –ão; Formar o feminino de nomes e de adjetivos terminados em –ão; Flexionar nomes pessoais (número, género e pessoa)."
        ]
      },
      "2º_Periodo": {
        "Gramática": [
          "Analisar e estruturar unidades sintáticas.",
          "Conjugar os verbos regulares e os irregulares mais frequentes (por exemplo: dizer, estar, fazer, ir, poder, querer, ser, ter, vir) no presente do indicativo.",
          "Identificar os seguintes tipos de frase: declarativa, interrogativa e exclamativa.",
          "Distinguir frase afirmativa de negativa.",
          "Identificar marcas do discurso direto no modo escrito.",
          "Expandir e reduzir frases, acrescentando, substituindo, deslocando ou suprimindo palavras e grupos de palavras.",
          "Identificar sinónimos e antónimos.",
          "Reconhecer frases que pertencem à mesma família."
        ]
      },
      "3º_Periodo": {
        "Gramática": [
          "Compreender processos de formação de organização do léxico.",
          "Identificar radicais de palavras de uso mais frequente.",
          "Identificar afixos de uso mais frequente.",
          "Identificar pronomes pessoais.",
          "Produzir novas palavras a partir de sufixos e prefixos."
        ]
      }
    }
  },
  "4": {
    "Artes_Visuais": {
      "1º_2º_e_3º_Periodos": {
        "Apropriação e Reflexão": [
          "Observação e apreciação dos diferentes universos visuais (obras e artefactos de arte – pintura, escultura, desenho, assemblage, colagem, fotografia, instalação, land´art, banda desenhada, design, arquitetura, artesanato, multimédia, linguagens cinematográficas, entre outros), utilizando um vocabulário específico e adequado.",
          "Mobilizar a linguagem elementar das artes visuais (cor, forma, linha, textura, padrão, proporção e desproporção, plano, luz, espaço, volume, movimento, ritmo, matéria, …) integrada em diferentes contextos culturais (movimentos artísticos, épocas e geografias)."
        ],
        "Interpretação e Comunicação": [
          "Dialogar sobre o que vê e sente, de modo a construir múltiplos discursos e leituras da(s) realidade(s).",
          "Compreender a intencionalidade dos símbolos e dos sistemas de comunicação visual.",
          "Apreciar as diferentes manifestações artísticas e outras realidades visuais."
        ],
        "Experimentação e Criação": [
          "Integrar a linguagem das artes visuais, assim como várias técnicas de expressão (pintura; desenho - incluindo esboços, esquemas, e itinerários; técnica mista; assemblage; land´art; escultura; maqueta; fotografia, entre outras) nas suas experimentações: físicas e/ou digitais.",
          "Experimentar possibilidades expressivas dos materiais (carvão vegetal, pasta de modelar, barro, pastel seco, tinta cenográfica, pincéis e trinchas, rolos, papéis de formatos e características diversas, entre outros) e das diferentes técnicas, adequando o seu uso a diferentes contextos e situações.",
          "Escolher técnicas e materiais de acordo com a intenção expressiva das suas produções plásticas.",
          "Manifestar capacidades expressivas e criativas nas suas produções plásticas, evidenciando os conhecimentos adquiridos.",
          "Utilizar vários processos de registo de ideias (ex.: diários gráficos), de planeamento (ex.: projeto, portfólio) e de trabalho (ex.: individual, em grupo e em rede).",
          "Apreciar os seus trabalhos e os dos seus colegas, mobilizando diferentes critérios de argumentação."
        ]
      }
    },
    "Estudo_do_Meio": {
      "1º_Periodo": {
        "Natureza e Tecnologia": [
          "Corpo humano: Sistemas do corpo humano.",
          "Modificações biológicas e comportamentais na adolescência.",
          "Mecanismos simples da defesa do organismo.",
          "Importância da evolução tecnológica para a saúde."
        ],
        "Sociedade": [
          "História de Portugal: O passado nacional.",
          "Património natural e vestígios materiais do passado.",
          "Direitos Humanos: Direitos Humanos.",
          "A Declaração Universal dos Direitos Humanos."
        ]
      },
      "2º_Periodo": {
        "Sociedade e Tecnologia": [
          "União Europeia: União Europeia.",
          "Fluxos Migratórios.",
          "Evolução da Tecnologia - transportes e telecomunicações."
        ],
        "Natureza": [
          "Natureza e ambiente: Animais e plantas em via de extinção.",
          "Interferência da vida humana no oceano.",
          "O aumento da população mundial e a qualidade do ambiente.",
          "Espaço: A Terra do Sistema Solar.",
          "Representações da Terra.",
          "Processos para referenciar os pontos cardeais.",
          "Sismos, vulcões, rochas e solo: Sismos e vulcões."
        ]
      },
      "3º_Periodo": {
        "Tecnologia": [
          "Evolução tecnológica e previsão/redução de catástrofes naturais.",
          "A tecnologia no tempo: Evolução tecnológica e prevenção/redução do efeito de catástrofes tecnológicas.",
          "Objetos tecnológicos do passado e do presente.",
          "Fontes de energia e circuitos elétricos.",
          "Uso das TIC com segurança, respeito e responsabilidade."
        ],
        "Sociedade e Natureza": [
          "Relevo e distribuição da população: Formas de relevo, rios, lagos e lagoas.",
          "Diferentes formas de relevo em mapas hipsométricos.",
          "Distribuição espacial da população.",
          "O património natural."
        ]
      }
    },
    "Matematica": {
      "1º_Periodo": {
        "Números": [
          "Números naturais até 200 000: Usos do número natural; Sistema de numeração decimal; Valor posicional.",
          "Relações numéricas: Composição e decomposição.",
          "Cálculo mental: Estratégias.",
          "Operações: Algoritmo da adição e subtração; Algoritmo da multiplicação com números naturais.",
          "Frações: Significado de fração; Relações entre frações."
        ],
        "Dados e Probabilidades": [
          "Representações Gráficas: Diagrama de caule e folhas."
        ],
        "Álgebra": [
          "Regularidades em sequências: Sequências de crescimento.",
          "Expressões e relações: Igualdades aritméticas."
        ],
        "Geometria e Medida": [
          "Sólidos: Prismas e pirâmides regulares; Planificações.",
          "Figuras planas: Quadriláteros; Retas paralelas e retas perpendiculares; Círculo e circunferência."
        ]
      },
      "2º_Periodo": {
        "Números": [
          "Números naturais até 400 000: Usos do número natural; Sistema de numeração decimal; Valor posicional.",
          "Relações numéricas: Composição e decomposição.",
          "Cálculo mental: Estratégias; Estimativas de cálculo.",
          "Operações: Algoritmo da divisão com números naturais.",
          "Frações e decimais: Significado de decimal; Relações entre decimais; Relações entre representações."
        ],
        "Dados e Probabilidades": [
          "Representações Gráficas: Diagrama de caule e folhas."
        ],
        "Álgebra": [
          "Regularidades em sequências: Sequências de crescimento.",
          "Expressões e relações: Relações numéricas e algébricas."
        ],
        "Geometria e Medida": [
          "Área: Medição e unidades de medida; Usos da área.",
          "Capacidade: Significado; Medição e unidades de medida; Usos da capacidade.",
          "Dinheiro: Usos do dinheiro."
        ]
      },
      "3º_Periodo": {
        "Números": [
          "Números naturais até 1 000 000: Usos do número natural; Sistema de numeração decimal; Valor posicional.",
          "Relações numéricas: Composição e decomposição; Factos básicos da multiplicação e sua relação com a divisão.",
          "Cálculo mental: Estratégias; Estimativas de cálculo.",
          "Operações: Algoritmo da divisão com números naturais; Algoritmo da adição e subtração envolvendo decimais."
        ],
        "Dados e Probabilidades": [
          "Questões estatísticas, recolha e organização de dados: Questões estatísticas; Recolha de dados (fontes e secundárias).",
          "Representações Gráficas: Gráficos de barras duplos (justapostas); Análise crítica de gráficos.",
          "Análise de dados: Interpretação e conclusão.",
          "Comunicação e divulgação de um estudo: Público-alvo; Recursos para a comunicação oral e escrita.",
          "Probabilidades: Convicção sobre acontecimentos."
        ],
        "Álgebra": [
          "Regularidades em sequências: Sequências de crescimento.",
          "Expressões e relações: Relações numéricas e algébricas."
        ],
        "Geometria e Medida": [
          "Operações com figuras: Simetria de reflexão; Simetria de rotação."
        ]
      },
      "Ao_longo_do_ano": {
        "Capacidades Matemáticas": [
          "Resolução de problemas: Processo; Estratégias.",
          "Raciocínio matemático: Conjeturar e generalizar; Classificar; Justificar.",
          "Pensamento computacional: Abstração; Decomposição; Reconhecimento de padrões; Algoritmia; Depuração.",
          "Comunicação matemática: Expressão de ideias; Discussão de ideias.",
          "Representações matemáticas: Representações múltiplas; Conexões entre representações; Linguagem simbólica matemática.",
          "Conexões matemáticas: Conexões internas; Conexões externas.",
          "Modelos matemáticos: Linguagem simbólica matemática."
        ]
      }
    },
    "Portugues": {
      "1º_Periodo": {
        "Oralidade": [
          "Interação discursiva.",
          "Compreensão e expressão."
        ],
        "Leitura": [
          "Fluência de leitura.",
          "Compreensão de texto."
        ],
        "Educação Literária": [
          "Leitura e audição.",
          "Produção expressiva."
        ],
        "Escrita": [
          "Planificação de texto.",
          "Produção de texto.",
          "Revisão de texto."
        ],
        "Gramática": [
          "Onomatopeias.",
          "Formação de palavras e família de palavras.",
          "Significado de prefixos e sufixos.",
          "Sujeito/GN; Predicado/GV.",
          "Plurais irregulares de nomes e adjetivos.",
          "Femininos irregulares de nomes e adjetivos.",
          "Conectores discursivos.",
          "Ampliar, expandir, modificar e reduzir frases.",
          "Frases complexas."
        ]
      },
      "2º_Periodo": {
        "Oralidade": [
          "Interação discursiva.",
          "Compreensão e expressão.",
          "Produção de discurso oral."
        ],
        "Leitura": [
          "Fluência de leitura.",
          "Compreensão de texto.",
          "Localização de informação explícita.",
          "Realização de leitura silenciosa e autónoma."
        ],
        "Educação Literária": [
          "Leitura e audição.",
          "Produção expressiva.",
          "Apresentação de livros."
        ],
        "Escrita": [
          "Pesquisa e registo de informação.",
          "Produção de texto.",
          "Ortografia e pontuação (grafia, pontuação e translineação, configuração gráfica e sinais auxiliares da escrita)."
        ],
        "Gramática": [
          "Nomes comuns coletivos.",
          "Graus dos nomes.",
          "Tempos verbais: pretérito imperfeito do modo indicativo.",
          "Modo imperativo.",
          "Pronomes pessoais (formas tónicas e átonas) em frases afirmativas.",
          "Pronomes pessoais em frases negativas e com advérbios pré-verbais."
        ]
      },
      "3º_Periodo": {
        "Oralidade": [
          "Interação discursiva.",
          "Compreensão e expressão.",
          "Produção de discurso oral.",
          "Pesquisa e registo da informação."
        ],
        "Leitura": [
          "Fluência de leitura.",
          "Compreensão de texto.",
          "Ler textos com características narrativas e descritivas de maior complexidade."
        ],
        "Educação Literária": [
          "Leitura e audição.",
          "Produção expressiva.",
          "Apresentação de livros."
        ],
        "Escrita": [
          "Ortografia e pontuação.",
          "Produção de texto.",
          "Pesquisa e registo de informação.",
          "Aperfeiçoamento de texto."
        ],
        "Gramática": [
          "Determinantes interrogativos.",
          "Preposições.",
          "Pronomes possessivos.",
          "Pronomes demonstrativos.",
          "Sentido literal e sentido figurado de palavras ou expressões.",
          "Expressões idiomáticas."
        ]
      }
    }
  }
}
  $;

  FOR v_year, v_yr IN SELECT * FROM jsonb_each(v_data) LOOP
    FOR v_disc, v_dc IN SELECT * FROM jsonb_each(v_yr) LOOP
      FOR v_per_raw, v_pr IN SELECT * FROM jsonb_each(v_dc) LOOP
        v_period := CASE v_per_raw
          WHEN '1º_Periodo'             THEN '1'
          WHEN '2º_Periodo'             THEN '2'
          WHEN '3º_Periodo'             THEN '3'
          WHEN '1º_2º_e_3º_Periodos' THEN 'all'
          WHEN 'Ao_longo_do_ano'          THEN 'all'
          ELSE v_per_raw
        END;
        FOR v_domain, v_dm IN SELECT * FROM jsonb_each(v_pr) LOOP
          v_sort := 0;
          FOR v_content IN SELECT jsonb_array_elements_text(v_dm) LOOP
            INSERT INTO curriculum_contents
              (school_year, discipline, period, domain, content, sort_order)
            VALUES
              (v_year, lower(v_disc), v_period, v_domain, v_content, v_sort);
            v_sort := v_sort + 1;
          END LOOP;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seed concluído: % conteúdos inseridos',
    (SELECT count(*) FROM curriculum_contents);
END;
$;
