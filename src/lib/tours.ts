// ─── Visitas guiadas (walkthroughs) ──────────────────────────────────────────
// Cada tour é uma sequência de passos ancorados a elementos reais da UI através
// do atributo `data-tour="<target>"`. O TourOverlay trata do spotlight e da
// navegação; aqui vive apenas o conteúdo e as regras de arranque.

export type TourId = "boas-vindas" | "planeador" | "plano-gerado" | "diario";

export interface TourStep {
  /** Valor do atributo data-tour do elemento a destacar. Sem target = cartão centrado. */
  target?: string;
  title: string;
  body: string;
  /** Passos ancorados à sidebar não existem em mobile (offcanvas) — são filtrados. */
  desktopOnly?: boolean;
}

export interface TourDef {
  id: TourId;
  /** Nome apresentado no menu de ajuda. */
  name: string;
  /** Rota onde o tour decorre. Ao iniciar noutra página, navega-se primeiro para cá. */
  route: string;
  /** Arranca automaticamente na primeira visita à rota (tours de página inteira). */
  autoStart?: boolean;
  steps: TourStep[];
  /** Ação principal opcional no último passo, além de "Concluir". */
  finishCta?: { label: string; route: string };
}

export const TOURS: TourDef[] = [
  {
    id: "boas-vindas",
    name: "Visita de boas-vindas",
    route: "/",
    autoStart: true,
    steps: [
      {
        title: "Bem-vindos à NexSeed 🌱",
        body: "Uma visita guiada de um minuto para conhecerem a app. Podem sair a qualquer momento — e repeti-la sempre que quiserem no botão de ajuda, no canto do ecrã.",
      },
      {
        target: "nav-planear",
        desktopOnly: true,
        title: "Planear",
        body: "O coração da NexSeed. No Planeador Semanal geram o plano de atividades de cada semana; o Roteiro Anual e a Agenda dão-vos a visão de conjunto.",
      },
      {
        target: "nav-aprender",
        desktopOnly: true,
        title: "Aprender",
        body: "Bibliotecas de ideias e conteúdos prontos a usar: projetos, missões do mundo, literacia financeira e digital.",
      },
      {
        target: "nav-registar",
        desktopOnly: true,
        title: "Registar & Provar",
        body: "Registam no Diário o que foram fazendo — e a app transforma isso no Portfólio e nos Relatórios trimestrais para a escola.",
      },
      {
        target: "dashboard-hoje",
        title: "O vosso dia, num relance",
        body: "O painel mostra as atividades planeadas para hoje. Quando ainda não há plano, é aqui que aparece o atalho para gerar o primeiro.",
      },
      {
        target: "header-ajuda",
        title: "Ajuda contextual",
        body: "Em qualquer página, este «?» abre o Manual de Instruções já na secção certa.",
      },
      {
        target: "help-button",
        title: "Dúvidas? Estamos aqui",
        body: "Este botão está sempre disponível: repetir as visitas guiadas, abrir o manual, ver as perguntas frequentes ou falar diretamente connosco.",
      },
    ],
    finishCta: { label: "Ir para o Planeador", route: "/weekly-planner" },
  },
  {
    id: "planeador",
    name: "Visita ao Planeador Semanal",
    route: "/weekly-planner",
    steps: [
      {
        target: "planner-semana",
        title: "Escolham a semana",
        body: "Por omissão está selecionada a próxima semana. Usem as setas para planear outra — cada plano cobre de segunda a sexta.",
      },
      {
        target: "planner-interesses",
        title: "Interesses da semana",
        body: "Dinossauros, vulcões, Sonic… Os interesses tematizam as atividades. A matéria é a mesma — o tema é o que motiva a criança.",
      },
      {
        target: "planner-conteudos",
        title: "O que querem ensinar",
        body: "O campo mais poderoso do planeador: indiquem os conteúdos por disciplina e a IA cria atividades que ensinam exatamente isso.",
      },
      {
        target: "planner-sexta",
        title: "Sexta-feira — Ver Mundo",
        body: "Se têm uma saída planeada (museu, quinta, biblioteca…), registem-na aqui e o plano organiza-se à volta dela.",
      },
      {
        target: "planner-leitura",
        title: "Tema de leitura",
        body: "Deste tema nasce uma mini-série de leitura em 4 episódios, de segunda a quinta. Em branco, usa o interesse principal da criança.",
      },
      {
        target: "planner-gerar",
        title: "Gerar o plano",
        body: "Quando estiver tudo pronto, cliquem aqui. A IA demora cerca de um minuto a criar o plano completo dos 5 dias.",
      },
    ],
  },
  {
    id: "plano-gerado",
    name: "Visita ao plano gerado",
    route: "/weekly-planner",
    steps: [
      {
        target: "plano-preview",
        title: "O vosso plano",
        body: "Revejam as atividades dia a dia, criança a criança — ou todos juntos na vista Família.",
      },
      {
        target: "plano-editar",
        title: "Ajustar e regenerar",
        body: "Algo que não encaixa? Voltem ao formulário, ajustem os campos e gerem uma nova versão.",
      },
      {
        target: "plano-versoes",
        title: "Histórico de versões",
        body: "Cada regeneração cria uma nova versão. Podem sempre comparar e voltar a uma anterior.",
      },
      {
        target: "plano-acoes",
        title: "Guardar, imprimir, enviar",
        body: "Guardem o plano, descarreguem os PDFs (horário + guia de atividades) ou recebam tudo por email, pronto a imprimir.",
      },
    ],
  },
  {
    id: "diario",
    name: "Visita ao Diário",
    route: "/activities",
    autoStart: true,
    steps: [
      {
        title: "O Diário 📔",
        body: "É aqui que o dia-a-dia vira prova de aprendizagem. Um registo demora menos de 30 segundos.",
      },
      {
        target: "diario-form",
        title: "Registo rápido",
        body: "Escolham a criança e a data, deem um título e, se quiserem, a área curricular e uma pequena descrição.",
      },
      {
        target: "diario-fotos",
        title: "Fotos valem ouro",
        body: "Uma foto do trabalho ou do momento enriquece o portfólio e os relatórios que apresentam à escola.",
      },
      {
        target: "diario-guardar",
        title: "Direto ao Portfólio",
        body: "Ao guardar, o registo entra automaticamente no Portfólio e alimenta os Relatórios trimestrais. Sem trabalho extra.",
      },
    ],
  },
];

export function getTour(id: TourId): TourDef | undefined {
  return TOURS.find((t) => t.id === id);
}

/** Tours que decorrem numa dada rota (o /weekly-planner tem dois). */
export function getToursForRoute(pathname: string): TourDef[] {
  return TOURS.filter((t) => t.route === pathname);
}

// ─── Persistência (localStorage, por utilizador) ─────────────────────────────
// Guardado localmente: um tour repetido num segundo dispositivo é inofensivo e
// evita-se uma migração de base de dados só para isto.

const storageKey = (userId: string) => `nexseed_tours_seen:${userId}`;

export function getSeenTours(userId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function markTourSeen(userId: string, tourId: TourId) {
  try {
    const seen = getSeenTours(userId);
    seen[tourId] = new Date().toISOString();
    localStorage.setItem(storageKey(userId), JSON.stringify(seen));
  } catch {
    /* localStorage indisponível — o tour repete na próxima sessão */
  }
}
