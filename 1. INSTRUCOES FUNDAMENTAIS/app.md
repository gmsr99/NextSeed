# Arquitetura e Informação da App "NextSeed"

A aplicação **NextSeed** foi desenhada para gerir e facilitar o ensino em casa (*homeschooling*), cruzando o currículo escolar tradicional com dinâmicas personalizadas aos interesses das crianças [1].

## 1. Estrutura Principal e Funcionalidades

### Dashboard Inicial
O painel de entrada oferece uma visão imediata e global do que está a acontecer [2]. Apresenta as aulas da semana, o progresso mensal, as atividades recentes e os próximos eventos [2]. 

### Perfis das Crianças
Cada criança tem uma área individual onde o sistema assume a sua idade e o ano de escolaridade [3]. Neste local são registados os seus gostos e interesses atuais (por exemplo, o tema "Sonic" ou "vulcões"), informação crucial para a personalização do ensino [2, 4, 5].

### Currículo e Planeamento
É o núcleo de aprendizagem da app, desenhado para cruzar as exigências do sistema de ensino formal (utilizando, por exemplo, o manual escolar "livro dos super miúdos") com conteúdos alternativos guardados numa base de dados própria [6, 7].
*   **Áreas de Aprendizagem:** As disciplinas são adaptadas à idade, incluindo Português (Linguagem), Matemática (Números), Projeto (Estudo do Meio), Inglês, Artes, Literacia Financeira e Literacia Digital [3, 8, 9].
*   **Conteúdos Disruptivos:** A aplicação permite integrar métodos não tradicionais e recursos da internet, como jogos fonológicos, para tornar a aprendizagem mais cativante [6].

### Registo de Atividades
Uma secção fundamental para validar o ensino doméstico perante a escola oficial [10].
*   Permite registar as atividades práticas realizadas (ex: criar um jardim de abelhas), adicionar descrições e anexar evidências fotográficas [10].
*   No final do período ou trimestre, estes registos são usados para gerar automaticamente os relatórios exigidos pelas instituições de ensino [10].
*   Serve também como uma potencial rede social, onde as atividades partilhadas podem servir de inspiração para outras famílias [11].

### Motor Criativo
Uma ferramenta automática que cruza o currículo e as bases de dados com os interesses semanais da criança preenchidos pelos pais [4].
*   **Desafios de Leitura:** O motor gera exercícios de leitura criados em formato de minissérie de segunda a quinta-feira, baseados no tema de interesse atual da criança [4, 5].

### Projetos e "Missões do Mundo"
*   **Projetos:** Atividades mais complexas e prolongadas no tempo, compostas por várias fases, como a preparação de uma "Feira de Primavera" [12]. Podem ser sugeridas pelo sistema ou receber inputs dos pais [5].
*   **Missões do Mundo (Vida Prática):** Um sistema de gamificação focado nas tarefas domésticas e do dia a dia (ex: ajudar a lavar a loiça ou pôr a mesa) [12]. A criança inicia a missão, regista o que aprendeu e como se sentiu, e ganha pontos que poderão ser convertidos em prémios dados pelos pais (ex: um chupa-chupa) [8, 12].

### Portfólio e Relatórios
*   **Portfólio:** Regista o percurso, o número de atividades feitas e as conquistas face aos objetivos de aprendizagem estabelecidos para cada área [9].
*   **Relatórios:** Fornecem dados estatísticos sobre a progressão, dando aos pais uma importante sensação de controlo e tranquilidade por saberem que o plano anual está a ser cumprido [9].

### Apoio aos Pais e Comunidade
*   **Formação para Pais:** Envio de conteúdos e dicas sobre gestão emocional, organização de tempo, planeamento familiar e gestão de conflitos [9, 13].
*   **Comunidade e Fórum:** Espaços para as famílias partilharem o que estão a fazer e tirarem dúvidas sobre o processo de *homeschooling* [13].
*   **Agenda:** Um calendário de eventos locais relevantes (ex: a hora do conto numa livraria), com a possibilidade de filtrar os eventos por região ou por tema [1, 13].

---

## 2. O Workflow Prático (Automação de Planeamento)

Para aliviar a carga mental e o tempo gasto na preparação das aulas, a app inclui um fluxo de trabalho altamente automatizado:

1.  **Formulário de Interesses:** A família preenche um formulário simples (tipicamente à sexta-feira) indicando os interesses da criança para a semana seguinte e planeando eventuais saídas para a nova sexta-feira (atividade de "ver mundo") [5, 14].
2.  **Processamento:** O sistema cruza automaticamente esses interesses com os objetivos curriculares obrigatórios e a base de dados de conteúdos criativos [14].
3.  **Entrega (E-mail com PDFs):** O sistema gera e envia automaticamente por e-mail dois documentos em PDF para os pais [14]:
    *   **Horário Estruturado:** O primeiro PDF define os blocos do dia (Matemática, Português, projeto, brincadeira livre, etc.) com atividades específicas para cada momento [14].
    *   **Guia de Atividades:** O segundo PDF oferece uma explicação detalhada (passo a passo) das atividades e inclui a lista prévia de materiais necessários, permitindo aos pais providenciar tudo com antecedência [14].

Com este processo, a família liberta-se mentalmente da necessidade de criar a agenda a partir do zero, ficando apenas encarregue de acompanhar a execução [14].