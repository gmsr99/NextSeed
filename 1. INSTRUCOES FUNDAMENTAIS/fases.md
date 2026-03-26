# Arquitetura e Informação do Projeto "NexSeed"

O projeto **NexSeed** foi desenhado para gerir e facilitar o ensino em casa (*homeschooling*), cruzando o currículo escolar com dinâmicas personalizadas. No entanto, o projeto divide-se numa fase inicial de automação (urgente) e numa visão de futuro (a aplicação completa).

---

## 1. Fase 1: O Fluxo de Automação Urgente (O Foco Atual)

Para aliviar a carga mental da mãe (Andreia) e poupar o tempo gasto na preparação das aulas, a primeira fase do projeto deixa de lado a estrutura visual complexa ("tirando a app") e foca-se estritamente num motor prático e automatizado [1].

### 1.1. O Formulário de Input
Tudo começa com um formulário simples que a Andreia preenche, tipicamente à sexta-feira [1]. 
*   **Interesses:** Regista os interesses atuais das crianças (Brian e Noa) para a semana seguinte [1].
*   **Projetos e Saídas:** Pode dar inputs específicos sobre projetos a realizar e sugerir ou planear a atividade de sexta-feira, dedicada a "ver mundo" (visitas e saídas) [2].

### 1.2. O Processamento Automático
O sistema pega na informação do formulário e cruza os interesses semanais com o currículo do sistema de ensino (disciplinas e livros) e com os conteúdos alternativos e jogos de uma base de dados própria [1].

### 1.3. Dinâmicas Específicas Geradas
Existem três conteúdos principais que fogem à geração automática padrão e têm regras próprias:
*   **Estímulo à Leitura (Minisséries):** A última atividade da tarde para o Brian é um exercício de leitura criado em formato de minissérie, de segunda a quinta-feira, baseado no seu tema de interesse atual (por exemplo, criar uma história contínua sobre vulcões) [2].
*   **Sexta-feira ("Ver Mundo"):** A rotina de sexta-feira é diferente, focada em saídas e visitas, podendo o destino ser sugerido pelo sistema ou introduzido previamente no formulário [2].
*   **Projetos:** Atividades que podem ser sugeridas automaticamente ou receber inputs diretos dos pais [2].

### 1.4. A Entrega (Output)
Após gerar a proposta, o sistema envia automaticamente um email com **dois ficheiros PDF** [1]:
*   **1º PDF (O Horário):** Um documento com os blocos de tempo definidos (matemática, português, projeto, brincadeira livre, leitura) e uma atividade específica alocada a cada momento [1].
*   **2º PDF (Guia de Atividades e Materiais):** Um documento com a explicação passo a passo das atividades e uma lista prévia de todos os materiais necessários para a semana, permitindo à Andreia fazer as compras e preparar tudo com antecedência [1].

A partir do momento em que a mãe recebe estes dois PDFs, fica totalmente liberta da carga mental de planear a agenda, restando-lhe apenas aplicar as atividades com as crianças ("é rock and roll") [1].

---

## 2. Fase 2: Estrutura Principal da App (Visão de Futuro)

A longo prazo, a plataforma NexSeed evoluirá para uma aplicação completa com as seguintes secções:

### 2.1. Dashboard Inicial
O painel de entrada oferece uma visão imediata com as aulas da semana, o progresso mensal da criança, as atividades recentes e os próximos eventos [3]. 

### 2.2. Perfis das Crianças
Cada criança tem uma área individual que regista a sua idade, ano de escolaridade e os seus gostos e interesses atuais (como o tema "Sonic") [4, 5]. Esta informação é a base para a personalização do ensino [3].

### 2.3. Currículo e Planeamento
O núcleo de aprendizagem da app que cruza o currículo formal com abordagens alternativas:
*   **Áreas de Aprendizagem:** Inclui Português (Linguagem), Matemática (Números), Projeto (Estudo do Meio), Inglês, Artes, Literacia Financeira e Literacia Digital [4, 6].
*   **Conteúdos Disruptivos e Base de Dados:** O sistema de ensino base (ex: o manual escolar "livro dos super miúdos") é complementado com uma base de dados alimentada por conteúdos não tradicionais da internet, como jogos fonológicos [7, 8].

### 2.4. Registo de Atividades
Uma secção fundamental para validar o ensino doméstico:
*   Permite registar as atividades práticas realizadas (ex: criar um jardim de abelhas), com descrições e evidências fotográficas [9].
*   No final do trimestre ou período, gera automaticamente os relatórios necessários para entregar na escola [9].
*   Tem potencial para funcionar como uma rede social de partilha de inspiração entre diferentes famílias [10].

### 2.5. Motor Criativo
O motor que gera sugestões cruzando as bases de dados e manuais escolares com os interesses que os pais definem semanalmente (ex: criar histórias do Sonic se for o interesse atual) [5].

### 2.6. Projetos e "Missões do Mundo"
*   **Projetos:** Biblioteca de atividades complexas e prolongadas, divididas por várias fases (ex: preparar uma "Feira de Primavera") [5, 11].
*   **Missões do Mundo (Vida Prática):** Sistema de gamificação de tarefas do dia a dia (ex: ajudar a lavar a loiça, pôr a mesa) [11]. A criança inicia a missão, regista como se sentiu e o que aprendeu, ganhando pontos que podem ser trocados por prémios atribuídos pelos pais (ex: um chupa-chupa) [6, 11].

### 2.7. Portfólio e Relatórios
*   **Portfólio:** Regista o percurso, as conquistas e o número de atividades feitas de acordo com os objetivos de cada área [12].
*   **Relatórios:** Fornecem dados estatísticos sobre a progressão face aos objetivos anuais, transmitindo aos pais uma sensação de controlo sobre o caminho percorrido [12].

### 2.8. Apoio aos Pais e Comunidade
*   **Formação para Pais:** Envio de conteúdos sobre gestão emocional, organização de tempo, planeamento familiar e gestão de conflitos [12, 13].
*   **Comunidade e Fórum:** Espaços de partilha e entreajuda para famílias tirarem dúvidas sobre *homeschooling* [13].
*   **Agenda:** Um calendário global de eventos relevantes (ex: a hora do conto numa livraria local), com filtros por região e tema [13, 14].