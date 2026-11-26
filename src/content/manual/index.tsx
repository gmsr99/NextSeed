import {
  Rocket, CalendarCheck, ListChecks, BookHeart, FlaskConical,
  BarChart3, Map, Globe, Users, HelpCircle, BookOpen, PiggyBank, type LucideIcon,
} from "lucide-react";

// ─── Modelo de conteúdo do Manual ───────────────────────────────────────────────
// Conteúdo estático, versionado com o código. Para editar o manual, mexe aqui.
// Formatação inline suportada no texto: **negrito** e [texto](/rota ou https://url).

export type ManualBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string };

export interface ManualSection {
  slug: string;
  title: string;
  icon: LucideIcon;
  /** Frase curta mostrada no índice e no topo da secção. */
  summary: string;
  /** Termos extra para a pesquisa (além do título e do corpo). */
  keywords: string[];
  blocks: ManualBlock[];
  /** Conteúdo por validar pelos fundadores antes do lançamento. */
  draft?: boolean;
}

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    slug: "comecar",
    title: "Como começar",
    icon: Rocket,
    summary: "O que é a NexSeed e como está organizada em quatro passos simples.",
    keywords: ["onboarding", "primeiros passos", "introdução", "começar", "tutorial", "visita guiada", "tour", "ajuda"],
    blocks: [
      { type: "p", text: "A **NexSeed** é a vossa companheira de ensino doméstico. Foi pensada para famílias que educam os filhos em casa e que querem estrutura e tranquilidade — sem precisarem de formação pedagógica. A ideia é simples: a app trata do planeamento pesado para que vocês fiquem com a parte boa, que é aprender com os vossos filhos." },
      { type: "h", text: "A NexSeed em quatro passos" },
      { type: "p", text: "Toda a aplicação se organiza à volta de quatro verbos. Se perceberem estes quatro, percebem a app inteira:" },
      { type: "ol", items: [
        "**Planear** — todas as semanas, a NexSeed gera um plano de atividades para cada criança, cruzando o currículo nacional, a vossa metodologia e os interesses do momento da criança.",
        "**Fazer** — recebem o plano em PDF (horário + guia de atividades com materiais). Imprimem, ou seguem no ecrã, e fazem as atividades com as crianças.",
        "**Registar** — à medida que vão fazendo, registam no Diário o que correu bem, com fotos e notas. Demora segundos.",
        "**Provar** — esses registos viram automaticamente o Portfólio e os Relatórios trimestrais que apresentam à escola, com o currículo a ser cumprido visível a qualquer momento.",
      ]},
      { type: "callout", text: "Não precisam de usar tudo ao mesmo tempo. Comecem pelo Planeador Semanal. O resto vem naturalmente." },
      { type: "h", text: "Primeira semana" },
      { type: "ol", items: [
        "Confirmem o perfil de cada criança em [Crianças](/children): idade, ano de escolaridade e interesses atuais.",
        "(Opcional) Escolham uma [metodologia](/metodologias) — ou deixem em 'sem preferência'.",
        "Vão ao [Planeador Semanal](/weekly-planner), indiquem os interesses da semana e gerem o primeiro plano.",
        "Recebem o plano por email em PDF. A partir daí, é rock and roll.",
      ]},
      { type: "h", text: "Visitas guiadas e ajuda sempre à mão" },
      { type: "p", text: "Nas primeiras visitas às páginas principais, a NexSeed mostra **visitas guiadas** passo a passo sobre o próprio ecrã. Podem sair a qualquer momento — e repeti-las quando quiserem." },
      { type: "callout", text: "O **botão de ajuda** (a boia 🛟, no canto inferior direito) está sempre disponível: repete as visitas guiadas, abre este manual na secção certa, mostra as perguntas frequentes e permite falar diretamente connosco." },
    ],
  },
  {
    slug: "planeador",
    title: "Planeador Semanal",
    icon: CalendarCheck,
    summary: "O coração da NexSeed: como a IA cria o plano e o que faz com os vossos dados.",
    keywords: ["planeador", "plano semanal", "ia", "gemini", "gerar plano", "pdf", "horário", "inteligência artificial"],
    blocks: [
      { type: "p", text: "O Planeador Semanal é o coração da NexSeed. Uma vez por semana — tipicamente à sexta-feira, para a semana seguinte — preenchem um formulário curto e a app gera um plano completo de 5 dias para cada criança." },
      { type: "h", text: "O que a IA cruza" },
      { type: "p", text: "O plano não é aleatório. A inteligência artificial combina três coisas:" },
      { type: "ul", items: [
        "**O currículo nacional** (DGE) do ano de escolaridade de cada criança — para garantir que se cumprem os objetivos oficiais.",
        "**A vossa metodologia** — se escolheram, por exemplo, Montessori ou Waldorf, as atividades refletem essa abordagem.",
        "**Os interesses da criança** — se a criança adora vulcões, a matemática dessa semana pode contar erupções e o português pode ser uma história sobre um vulcão.",
      ]},
      { type: "callout", text: "Os interesses servem para **tematizar**, nunca para substituir os objetivos. 'Contagem até 10' com interesse 'dinossauros' torna-se 'contar dinossauros' — o objetivo curricular mantém-se." },
      { type: "h", text: "O plano é uma proposta, não uma ordem" },
      { type: "p", text: "O que a NexSeed gera é um ponto de partida editável. Conhecem os vossos filhos melhor do que qualquer algoritmo: troquem atividades, saltem o que não faz sentido naquele dia, adaptem. A app está ao vosso serviço, não o contrário." },
      { type: "h", text: "O que recebem" },
      { type: "ul", items: [
        "**Horário estruturado** — os blocos de cada dia (Matemática, Português, Projeto, Leitura, brincadeira livre) com uma atividade concreta em cada momento.",
        "**Guia de atividades** — explicação passo a passo de cada atividade e a lista de materiais necessários, para prepararem tudo com antecedência.",
        "**Guia de leitura** — uma mini-série de leitura de segunda a quinta, em capítulos, sobre o tema de interesse da criança.",
      ]},
      { type: "h", text: "Privacidade dos dados" },
      { type: "p", text: "Para gerar o plano, enviamos ao serviço de IA apenas o necessário: ano de escolaridade, interesses e o primeiro nome da criança. Não enviamos morada, fotos nem dados de identificação. Saibam mais em [Família, conta e privacidade](/ajuda/familia)." },
      { type: "h", text: "Com várias crianças" },
      { type: "p", text: "Quando há mais do que uma criança, cada atividade começa por dizer como se faz, para não terem de estar em dois sítios ao mesmo tempo:" },
      { type: "ul", items: [
        "**Em conjunto** — todas fazem a mesma atividade, cada uma ao seu nível (Estudo do Meio, Expressão, Projeto, Leitura e a sexta-feira).",
        "**Com o adulto** — é a vez dessa criança ter a vossa atenção, por exemplo para um conteúdo novo.",
        "**Sozinho(a)** — a criança consegue fazer sem ajuda enquanto estão com a outra. No bloco seguinte, trocam.",
      ]},
      { type: "h", text: "O que guardar para o portefólio" },
      { type: "p", text: "Em cada semana, a NexSeed marca três ou quatro atividades por criança como boas para o [portefólio](/portfolio) e diz o que guardar (uma foto, a folha, um desenho). Aparecem em cada atividade e num resumo no topo do plano e do Guia de Atividades. Chegam essas: o resto da semana não precisa de ficar registado." },
      { type: "callout", text: "As atividades usam o que já há em casa: nada para imprimir nem para fabricar antes. E cada semana tem um fio condutor que liga as disciplinas." },
    ],
  },
  {
    slug: "conteudos-da-semana",
    title: "Conteúdos desta semana",
    icon: ListChecks,
    summary: "Como dizer à NexSeed exatamente o que querem ensinar numa semana.",
    keywords: ["conteúdos", "manual escolar", "matéria", "ensinar", "objetivos", "semana"],
    blocks: [
      { type: "p", text: "Às vezes não querem deixar tudo à IA — têm um manual escolar a seguir, ou querem trabalhar uma matéria específica esta semana. É para isso que serve o campo **Conteúdos desta semana** no Planeador." },
      { type: "h", text: "Como usar" },
      { type: "ol", items: [
        "No Planeador Semanal, em cada criança, encontram um campo por disciplina.",
        "Escrevam o que querem trabalhar — por exemplo, em Matemática: 'tabuada do 3 e do 4', ou em Português: 'os ditongos'.",
        "A IA dá **prioridade máxima** a estes conteúdos. Todas as atividades dessa disciplina nessa semana vão ensiná-los, usando os interesses só para os tornar divertidos.",
      ]},
      { type: "callout", text: "Deixem o campo vazio se quiserem que a NexSeed escolha os conteúdos com base no currículo e no que a criança ainda não dominou. É perfeitamente válido alternar." },
    ],
  },
  {
    slug: "metodologias",
    title: "Metodologias",
    icon: BookHeart,
    summary: "As 14 abordagens pedagógicas e como escolher a vossa.",
    keywords: ["metodologia", "montessori", "waldorf", "charlotte mason", "unschooling", "pedagogia", "abordagem"],
    blocks: [
      { type: "p", text: "Uma metodologia é a 'filosofia' com que ensinam. A NexSeed conhece 14 abordagens reconhecidas e usa a vossa escolha para dar cor e forma às atividades que gera." },
      { type: "h", text: "Não sabem qual escolher?" },
      { type: "p", text: "Sem problema. Podem deixar em **'sem preferência'** — a app gera atividades equilibradas e variadas. Mais tarde, à medida que descobrem o que funciona com os vossos filhos, podem escolher e até combinar abordagens." },
      { type: "h", text: "Como funciona a escolha" },
      { type: "ul", items: [
        "Podem definir uma metodologia para a família inteira, ou uma **metodologia diferente por criança** (no perfil de cada criança).",
        "Algumas metodologias combinam melhor do que outras — a página [Metodologias](/metodologias) mostra a compatibilidade entre elas.",
        "A metodologia influencia o estilo das atividades, mas o currículo nacional é sempre respeitado.",
      ]},
    ],
  },
  {
    slug: "areas-aprendizagem",
    title: "Áreas de Aprendizagem",
    icon: BookOpen,
    summary: "Gerir o currículo de cada criança e avaliar conteúdos de 1 (a aprender) a 3 (dominado).",
    keywords: ["áreas de aprendizagem", "currículo", "conteúdos", "avaliação", "dominado", "progresso", "disciplinas", "gestão de conteúdos"],
    blocks: [
      { type: "p", text: "As [Áreas de Aprendizagem](/learning-areas) são o vosso painel de gestão curricular por criança. Aqui veem **todos os conteúdos do currículo nacional** (DGE) do ano da criança, organizados por disciplina, e podem avaliar cada conteúdo à medida que ele é trabalhado." },
      { type: "h", text: "O sistema de avaliação 1-2-3" },
      { type: "p", text: "Cada conteúdo pode estar num de três estados:" },
      { type: "ul", items: [
        "**1 — A aprender** (círculo vazio): ainda não foi trabalhado, ou mal foi introduzido.",
        "**2 — Em progresso** (relógio): a criança está a trabalhar o conteúdo mas ainda não domina.",
        "**3 — Dominado** (visto verde): a criança consolidou o conteúdo.",
      ]},
      { type: "p", text: "Para avaliar, clicam nos três botões circulares à direita de cada conteúdo. A mudança é imediata e fica associada a essa criança." },
      { type: "h", text: "Como isto afeta o Planeador" },
      { type: "callout", text: "Os conteúdos marcados como **Dominado** deixam automaticamente de entrar nos planos seguintes gerados pela IA. Assim, a NexSeed concentra-se no que a criança ainda precisa de aprender — sem repetir o que já sabe." },
      { type: "p", text: "Isto significa que manter as Áreas de Aprendizagem atualizadas ajuda a IA a gerar planos cada vez mais certeiros: quanto mais preciso for o vosso registo, mais útil é o próximo plano." },
      { type: "h", text: "Diferença face ao Rumo do ano" },
      { type: "p", text: "Podem estar a perguntar-se: \"mas isto não é o mesmo que o [Rumo do ano](/roteiro-anual)?\". São duas vistas do mesmo currículo, com objectivos diferentes:" },
      { type: "ul", items: [
        "**Áreas de Aprendizagem** — gestão ativa: avaliam conteúdos, veem percentagens de progresso por disciplina e controlam o que entra (ou não) no próximo plano.",
        "**Rumo do ano** — vista de planeamento: os mesmos conteúdos distribuídos pelas semanas do ano letivo, para verem o que vem aí e terem uma perspetiva de ano inteiro.",
      ]},
      { type: "h", text: "Anos cobertos" },
      { type: "p", text: "Os conteúdos curriculares estão disponíveis para o **Pré-escolar** e do **1.º ao 4.º ano**. Se uma criança tiver um ano ainda sem currículo detalhado na app, verão uma mensagem a indicar isso." },
    ],
  },
  {
    slug: "diario-portfolio",
    title: "Diário, Portfólio e Marcos",
    icon: FlaskConical,
    summary: "Registar o que fizeram, com fotos, e ver o percurso a crescer.",
    keywords: ["diário", "atividades", "portfólio", "fotos", "registo", "marcos", "evidências"],
    blocks: [
      { type: "p", text: "Estas três secções são, na verdade, o mesmo: a memória do percurso de aprendizagem dos vossos filhos. Registam num sítio e aparece nos outros." },
      { type: "h", text: "Diário" },
      { type: "p", text: "Sempre que fizerem uma atividade — do plano ou espontânea — registem-na no [Diário](/activities): um título, uma nota curta, a disciplina e, se quiserem, **fotos**. É a prova concreta de que a aprendizagem aconteceu." },
      { type: "p", text: "Se a atividade veio do plano, escolham-na em **Do plano da semana**: a app preenche a criança, o título, a área e o dia, e só falta a foto e, se quiserem, as **Observações**. Quando uma atividade trabalha mais do que uma área, marquem as outras em **Também trabalhou**: conta em todas no portefólio e nos relatórios." },
      { type: "callout", text: "As fotos das crianças ficam guardadas de forma privada e só acessíveis à vossa família. Vê [Família, conta e privacidade](/ajuda/familia)." },
      { type: "h", text: "Portfólio" },
      { type: "p", text: "O [Portfólio](/portfolio) é a linha do tempo automática de tudo o que registaram, com filtros por criança e por disciplina. É o que mostram a quem quiser ver o caminho percorrido — incluindo a escola." },
      { type: "h", text: "Marcos" },
      { type: "p", text: "Para crianças mais pequenas (ou para momentos especiais de qualquer idade), os **Marcos** registam conquistas de desenvolvimento: as primeiras palavras, a primeira vez que andou de bicicleta, a primeira leitura sozinha." },
    ],
  },
  {
    slug: "relatorios",
    title: "Relatórios e a parte legal",
    icon: BarChart3,
    summary: "Os relatórios trimestrais e o enquadramento do ensino doméstico em Portugal.",
    keywords: ["relatórios", "trimestre", "escola", "legal", "matrícula", "avaliação", "pev", "lei"],
    draft: true,
    blocks: [
      { type: "p", text: "Os [Relatórios](/reports) transformam o que registaram ao longo do trimestre num documento organizado, com estatísticas de progresso e cobertura do currículo. Exportam em PDF e entregam." },
      { type: "h", text: "Porque é que isto importa" },
      { type: "p", text: "Em Portugal, o ensino doméstico e o ensino individual são legais e estão enquadrados na lei. As crianças estão matriculadas numa **escola de referência** (a 'escola-âncora'), e há momentos de **avaliação** — habitualmente provas e a entrega de evidências do trabalho realizado." },
      { type: "p", text: "Os relatórios e o portfólio da NexSeed servem precisamente para esses momentos: mostram, de forma estruturada e com evidências, que o currículo está a ser cumprido." },
      { type: "callout", text: "⚠️ Esta secção descreve o enquadramento geral e será revista e atualizada com informação legal verificada antes do lançamento. Confirmem sempre os requisitos específicos junto da vossa escola-âncora e da legislação em vigor, que pode mudar." },
    ],
  },
  {
    slug: "roteiro-anual",
    title: "Rumo do ano",
    icon: Map,
    summary: "O ano inteiro, semana a semana, a partir do currículo de cada criança.",
    keywords: ["rumo", "roteiro", "anual", "plano anual", "currículo", "períodos", "semanas", "ano letivo", "família", "juntos", "irmãos"],
    blocks: [
      { type: "p", text: "Enquanto o Planeador olha para a semana, o [Rumo do ano](/roteiro-anual) dá-vos a vista de cima: a NexSeed distribui os conteúdos do currículo de cada criança pelas semanas do ano letivo, período a período. Não têm de decidir, semana a semana, o que ensinar a seguir." },
      { type: "h", text: "Para que serve" },
      { type: "ul", items: [
        "Ver o ano inteiro de uma vez: o que já passou, onde estão e o que vem aí.",
        "Ver, no cartão **Esta semana**, os conteúdos de todas as crianças lado a lado.",
        "Gerar o plano semanal sem escolher conteúdos: o Planeador parte do que o rumo traz para essa semana.",
      ]},
      { type: "h", text: "Como é feito" },
      { type: "ul", items: [
        "As semanas seguem o calendário escolar, com pausa no Natal e na Páscoa, até dizerem o contrário.",
        "Em **Ajustar as semanas** escolhem quando começa e acaba o vosso ano e quando param. Se não param no verão, basta mudar a data de fim; o rumo reparte tudo pelas vossas semanas.",
        "A última semana de cada período é de **balanço**: sem conteúdos novos, para rever e escolher o que entra no portefólio.",
        "Alguns conteúdos (por exemplo, de Artes) trabalham-se **ao longo do ano** e não têm semana marcada.",
        "Podem alternar entre **Semana a semana** e **Por disciplina**.",
        "Com mais do que uma criança, escolham **A família** no seletor: as crianças aparecem lado a lado, semana a semana, e cada semana diz o que podem fazer **juntos** (Estudo do Meio, Artes ou Formação Pessoal e Social, e o domínio, quando é o mesmo). Um tema para todos, cada um na parte do seu ano. Português e Matemática ficam sempre no nível de cada um.",
      ]},
      { type: "h", text: "Se trabalham com manuais" },
      { type: "p", text: "Na caixa **Manuais**, escolham a disciplina, deem um nome ao manual e escrevam o índice: uma unidade por linha. Se puserem no fim de cada linha a página onde a unidade começa, a NexSeed dá mais semanas às unidades maiores e diz que páginas trabalhar em cada semana." },
      { type: "ul", items: [
        "Nessa disciplina, o rumo e o plano semanal passam a seguir o manual em vez do currículo.",
        "Colem sempre o índice completo, mesmo que já vão a meio, e digam em **Onde vão neste manual?** a última página que fizeram (ou o tema onde vão). O que está para trás fica feito e a NexSeed sabe o que já aprenderam; o rumo continua daí, na semana que estão a preparar.",
        "Ao fim de semana, a semana que estão a preparar já é a seguinte.",
        "Se seguem o livro lição a lição e é o livro que marca onde ficaram, escolham **Lição seguinte** em \"Como seguem este livro?\". Cada semana o plano diz \"lição seguinte\" e prepara o resto à volta. O índice é opcional, mas ajuda: com ele (as lições pela ordem), a NexSeed estima um ritmo realista para chegarem ao fim do ano, sem vos pedir quanto dura cada lição.",
        "O ritmo acerta-se sozinho: as lições que marcarem como dadas no fecho da semana saem da conta e as que faltam repartem-se pelas semanas que faltam.",
        "A NexSeed guarda só os títulos e as páginas que escreverem. As atividades do plano acompanham essas páginas; não substituem o manual.",
        "Funciona para qualquer ano, incluindo os que ainda não têm currículo na app.",
      ]},
      { type: "h", text: "Um plano que cabe no dia" },
      { type: "ul", items: [
        "Cada dia tem um **núcleo de 3 atividades** por criança: Português, Matemática e uma terceira que vai rodando. A leitura é uma história em família, três vezes por semana.",
        "O que aparece como **Se houver tempo** é extra: se o dia correr bem, fazem; se não, não faz falta.",
        "Cada atividade dura o tempo de atenção da idade: cerca de 10 minutos no pré-escolar, 15 a 20 no 1.º e 2.º ano, 20 a 25 no 3.º e 4.º.",
        "Com os PDF vem **o mapa da semana de cada criança**: os dias, as atividades com um desenho e uma caixa para ela marcar, e linhas em branco para tarefas da casa.",
        "O horário vem **sem horas**: segue a ordem dos blocos, à vossa hora. Se preferirem horas sugeridas, liguem \"Mostrar horas no horário\" em \"A vossa semana\".",
        "Em \"A vossa semana\" podem marcar um **Dia livre**: sem currículo, fica só o momento da manhã em família e a leitura em voz alta.",
        "Também em \"A vossa semana\", cada dia pode ter uma **saída** (uma visita, uma ida a uma comunidade): de manhã, à tarde ou o dia todo, as vezes que quiserem. Essa parte do dia fica sem atividades e o horário mostra \"Saída\". A saída de sexta o dia todo é a \"Ver Mundo\", que o plano prepara convosco.",
        "**Semana difícil?** No Início, em \"Semana difícil? Fiquem só com o essencial\", o resto da semana fica leve: a leitura e o momento da manhã. O resto passa a \"Semana leve\", fica no plano se der e não conta para estarem em dia. Não é uma semana falhada, e podem voltar ao plano normal quando quiserem.",
      ]},
      { type: "h", text: "No Início: o dia, a semana e o ano" },
      { type: "ul", items: [
        "**Hoje** mostra o que cada criança tem no plano para hoje. Marquem a caixa quando estiver feito.",
        "**A semana** diz se vão em dia ou quase lá. O que ficar para trás encaixa-se noutro dia ou passa para a semana seguinte.",
        "**O ano** compara o que já foi dado com o que falta até 30 de junho, com julho de folga. Toquem na caixa para ver cada disciplina: a barra é o que foi dado, o traço é o que o rumo previa até hoje.",
        "À sexta, **Fechar a semana · 5 min**: marquem o que foi dado. Se precisar de mais, toquem em **Precisa de mais**: conta como dado e volta no plano seguinte como revisão curta (cerca de 10 minutos, com outro formato, e um título que começa por **Rever ·**). Há no máximo duas revisões por criança por semana, para não encher o plano. O que não marcarem passa para a semana seguinte como atividade normal.",
        "Se um tema voltar **3 vezes** e ainda precisar de mais, deixa de voltar sozinho e aparece **Com atenção** no Rumo do ano, com a sugestão de outra abordagem. Quando quiserem retomá-lo, carreguem em **Voltar a propor**.",
        "A **nota** do fecho é só para vocês: fica no Diário e não vai para o plano nem para a inteligência artificial.",
      ]},
      { type: "callout", text: "O rumo é uma orientação, não uma dívida. Se uma semana correr de outra maneira, ele continua lá. O que marcarem como **Dominado** nas Áreas de Aprendizagem deixa de entrar nos planos, e o que marcarem como **Em progresso** passa à frente do rumo." },
    ],
  },
  {
    slug: "missoes-recompensas",
    title: "Missões do Mundo e Recompensas",
    icon: Globe,
    summary: "Gamificar a vida prática do dia a dia com pontos e prémios.",
    keywords: ["missões", "mundo", "recompensas", "prémios", "pontos", "vida prática", "gamificação", "tarefas"],
    blocks: [
      { type: "p", text: "As [Missões do Mundo](/world-missions) trazem a aprendizagem para a vida prática: pôr a mesa, regar as plantas, ajudar a fazer o jantar. Cada missão que a criança completa vale pontos." },
      { type: "h", text: "Como funciona o ciclo" },
      { type: "ol", items: [
        "A criança inicia uma missão (uma tarefa do dia a dia).",
        "No fim, regista o que aprendeu e como se sentiu — pequena reflexão que vale ouro.",
        "Ganha pontos.",
        "Os pontos trocam-se por **recompensas** que vocês definem (um gelado, uma ida ao parque, escolher o filme da noite).",
      ]},
      { type: "callout", text: "As recompensas são definidas por vocês, na app. Quando a criança pede para trocar pontos, vocês aprovam — fica tudo registado." },
    ],
  },
  {
    slug: "financinhas",
    title: "Financinhas",
    icon: PiggyBank,
    summary: "Aprender a decidir com dinheiro, dos 5 aos 12 anos: uma história por semana e um ritual de 5 minutos.",
    keywords: ["financinhas", "dinheiro", "semanada", "mesada", "mealheiro", "poupar", "literacia financeira", "empreender"],
    blocks: [
      { type: "p", text: "O [Financinhas](/financinhas) não ensina finanças: ensina a decidir. Como se deseja, como se espera, como se escolhe, como se cria valor para os outros e como se agradece. O dinheiro aparece sempre como ferramenta e escolha, nunca como medo ou culpa." },
      { type: "h", text: "Como funciona" },
      { type: "ol", items: [
        "Começas com o **Trilho de Iniciação**: 12 sessões por ordem, uma por semana. Tu só escolhes o universo da história (o interesse do momento).",
        "A app gera a aula: o texto para colares no Gemini Notebook ou no NotebookLM (que faz a apresentação ilustrada), o quiz, as atividades e o guia para ti. Revês tudo antes de mostrares à criança.",
        "A partir da sessão 2 há quatro mealheiros (🐷 Gastar, 🎯 Poupar, ❤️ Dar, 🚀 Investir), o chão do 🐷 e um caderninho em papel. Todas as semanas, no mesmo dia, fazem o ritual da semanada e registas em 30 segundos.",
        "No [Plano Semanal](/weekly-planner) aparece o cartão **Financinhas desta semana**: o dia da semanada de cada criança e a aula por dar, com o botão **Copiar o prompt**. Em **Descarregar PDFs** sai também o guia do adulto, o quiz e as atividades dessa aula. A aula prepara-se sempre na página Financinhas.",
        "Em **Kit de arranque (PDF)**, no topo da página, estão as etiquetas dos quatro frascos e da linha do chão, o Mapa de Moedas (5–6 anos), a Página da Semana (7–8 anos), a folha do sonho e a ficha da fotografia inicial, para imprimir.",
        "Nos dias seguintes, em **O que observar**, confirmas o que viste acontecer. É isso, e só isso, que faz subir as competências.",
        "Depois da sessão 12 passam ao **ciclo semanal**: a app escolhe o tema pelas competências mais frágeis e pelo que a criança está a viver.",
      ]},
      { type: "callout", text: "A app é tua, não da criança: ela não tem conta, pontos nem ecrã, e o caderninho fica em papel. A semanada nunca é prémio nem castigo." },
      { type: "p", text: "Para a IA vai só a idade aproximada (o escalão), o interesse e a situação que escreveres. Nunca o nome nem a data de nascimento. Não escrevas nomes de pessoas na situação da semana." },
    ],
  },
  {
    slug: "familia",
    title: "Família, conta e privacidade",
    icon: Users,
    summary: "Convidar o outro progenitor, gerir a conta e o tratamento de dados.",
    keywords: ["família", "convidar", "conta", "privacidade", "rgpd", "dados", "membros", "apagar conta"],
    blocks: [
      { type: "h", text: "Convidar o outro progenitor" },
      { type: "p", text: "Nas [Definições](/settings) podem convidar outra pessoa (o outro pai/mãe, um avô que ajuda) para a vossa família. Recebe um email com um convite e passa a ter acesso à mesma família." },
      { type: "h", text: "Os vossos dados" },
      { type: "ul", items: [
        "Cada família só vê os seus próprios dados. Ninguém de fora da vossa família acede às vossas crianças, atividades ou fotos.",
        "As fotos ficam em armazenamento privado, acessível apenas à vossa família.",
        "Ao gerar planos, partilhamos com o serviço de IA apenas o mínimo necessário (ano escolar, interesses, primeiro nome) — nunca morada, contactos ou fotos.",
      ]},
      { type: "h", text: "Controlo total" },
      { type: "p", text: "Podem alterar ou apagar os vossos dados a qualquer momento. Apagar a conta remove a família e tudo o que lhe está associado. Consultem a [Política de Privacidade](/privacidade) e os [Termos](/termos) para os detalhes." },
    ],
  },
  {
    slug: "faq",
    title: "Perguntas frequentes",
    icon: HelpCircle,
    summary: "Respostas rápidas às dúvidas mais comuns.",
    keywords: ["faq", "dúvidas", "perguntas", "ajuda", "problemas"],
    blocks: [
      { type: "h", text: "Tenho de gerar um plano todas as semanas?" },
      { type: "p", text: "Não é obrigatório, mas é o ritmo ideal. Cada plano cobre uma semana. Podem gerar quando quiserem e adaptar à vossa vida." },
      { type: "h", text: "E se tiver mais do que uma criança?" },
      { type: "p", text: "A NexSeed foi feita para famílias com várias crianças. Gera um plano para cada uma e, quando há irmãos de idades diferentes, alinha os horários para vos facilitar a vida." },
      { type: "h", text: "Posso mudar as atividades que a IA sugere?" },
      { type: "p", text: "Sim, sempre. O plano é uma proposta editável. Vocês mandam." },
      { type: "h", text: "Preciso de saber 'dar aulas'?" },
      { type: "p", text: "Não. O guia de atividades explica cada passo e os materiais. Foi desenhado para pais sem qualquer formação pedagógica." },
      { type: "h", text: "Os meus filhos têm idades muito diferentes. Funciona?" },
      { type: "p", text: "Funciona. Desde o pré-escolar ao 4.º ano, a app adapta o nível de cada criança e, havendo irmãos, sugere como aproveitar a mesma atividade em níveis diferentes." },
      { type: "h", text: "Como revejo as visitas guiadas?" },
      { type: "p", text: "Cliquem no botão de ajuda (a boia, no canto inferior direito de qualquer página) e escolham a visita guiada. Cada página principal tem a sua — e a visita de boas-vindas pode ser revista a partir de qualquer sítio." },
    ],
  },
];

export function getManualSection(slug: string): ManualSection | undefined {
  return MANUAL_SECTIONS.find((s) => s.slug === slug);
}
