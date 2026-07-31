import {
  Rocket, CalendarCheck, ListChecks, BookHeart, FlaskConical,
  BarChart3, Map, Globe, Users, HelpCircle, BookOpen, type LucideIcon,
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
      { type: "h", text: "Diferença face ao Roteiro Anual" },
      { type: "p", text: "Podem estar a perguntar-se: \"mas isto não é o mesmo que o [Roteiro Anual](/roteiro-anual)?\". São duas vistas do mesmo currículo, com objectivos diferentes:" },
      { type: "ul", items: [
        "**Áreas de Aprendizagem** — gestão ativa: avaliam conteúdos, veem percentagens de progresso por disciplina e controlam o que entra (ou não) no próximo plano.",
        "**Roteiro Anual** — vista de planeamento: os mesmos conteúdos organizados pelos três períodos letivos, para verem o que vem aí e terem uma perspetiva de ano inteiro.",
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
    title: "Roteiro Anual",
    icon: Map,
    summary: "Ver o currículo do ano inteiro e acompanhar o progresso por períodos.",
    keywords: ["roteiro", "anual", "currículo", "períodos", "progresso", "ano letivo"],
    blocks: [
      { type: "p", text: "Enquanto o Planeador olha para a semana, o [Roteiro Anual](/roteiro-anual) dá-vos a vista de cima: todos os conteúdos do currículo nacional do ano de cada criança, organizados pelos três períodos letivos (Set–Dez, Jan–Mar, Abr–Jun)." },
      { type: "h", text: "Para que serve" },
      { type: "ul", items: [
        "Ver, de relance, o que falta trabalhar até ao fim do ano.",
        "Marcar conteúdos como 'a aprender', 'em progresso' ou 'dominado' por criança.",
        "Ter a tranquilidade de saber que estão no caminho certo, sem surpresas em maio.",
      ]},
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
