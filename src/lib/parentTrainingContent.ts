export type ContentCategory =
  | "gestao-emocional"
  | "organizacao-tempo"
  | "planeamento-familiar"
  | "visitas-saidas"
  | "relacoes-familiares"
  | "proposito-valores";

export interface CategoryInfo {
  id: ContentCategory;
  label: string;
  description: string;
  icon: string;
}

export interface TrainingContent {
  id: string;
  category: ContentCategory;
  type: "dica" | "checklist" | "sugestao" | "reflexao";
  title: string;
  body: string;
  items?: string[];
  dayContext?: "monday" | "friday" | "other";
}

export const categories: CategoryInfo[] = [
  { id: "gestao-emocional", label: "Gestão Emocional", description: "Ferramentas para lidar com emoções e promover equilíbrio interior.", icon: "🧘" },
  { id: "organizacao-tempo", label: "Organização do Tempo", description: "Estratégias para gerir o dia-a-dia com mais calma e intencionalidade.", icon: "⏳" },
  { id: "planeamento-familiar", label: "Planeamento Familiar", description: "Dicas para organizar a vida familiar de forma colaborativa.", icon: "📋" },
  { id: "visitas-saidas", label: "Visitas e Saídas em Família", description: "Ideias para momentos ao ar livre e experiências culturais.", icon: "🌿" },
  { id: "relacoes-familiares", label: "Relações Familiares", description: "Fortalecer vínculos e comunicação dentro da família.", icon: "💛" },
  { id: "proposito-valores", label: "Propósito e Valores", description: "Reflexões sobre o sentido e os princípios que guiam a família.", icon: "🌟" },
];

export const contentLibrary: TrainingContent[] = [
  // Gestão Emocional
  { id: "ge1", category: "gestao-emocional", type: "dica", title: "A pausa dos 90 segundos", body: "Quando sentires uma emoção forte, respira fundo e espera 90 segundos. É o tempo que o corpo precisa para processar a reação química inicial. Depois disso, a resposta é uma escolha.", dayContext: "monday" },
  { id: "ge2", category: "gestao-emocional", type: "reflexao", title: "O espelho emocional", body: "As crianças não fazem o que dizemos — fazem o que fazemos. Hoje, observa como reages a uma frustração pequena. Essa é a lição que estás a dar.", dayContext: "other" },
  { id: "ge3", category: "gestao-emocional", type: "checklist", title: "Check-in emocional diário", body: "Uma rotina simples para toda a família.", items: ["Pergunta: 'Como te sentes hoje, de 1 a 5?'", "Partilha uma coisa boa do dia", "Nomeia uma dificuldade sem julgamento", "Termina com um gesto de carinho"] },
  { id: "ge4", category: "gestao-emocional", type: "sugestao", title: "O frasco da calma", body: "Cria um frasco com água, glitter e cola transparente. Quando alguém precisar de se acalmar, agita o frasco e observa o glitter assentar. Uma metáfora visual poderosa para crianças e adultos.", dayContext: "friday" },

  // Organização do Tempo
  { id: "ot1", category: "organizacao-tempo", type: "dica", title: "A regra dos 3 blocos", body: "Divide o teu dia em 3 blocos: manhã, tarde e noite. Em cada bloco, escolhe apenas 1 prioridade. Tudo o resto é bónus. Menos pressão, mais presença.", dayContext: "monday" },
  { id: "ot2", category: "organizacao-tempo", type: "checklist", title: "Ritual de domingo à noite", body: "Prepara a semana com calma e intenção.", items: ["Revê a agenda da semana", "Prepara refeições ou listas de compras", "Define 3 prioridades para a semana", "Planeia 1 momento especial em família", "Prepara mochilas e materiais"] },
  { id: "ot3", category: "organizacao-tempo", type: "sugestao", title: "Tempo 'não estruturado'", body: "Reserva pelo menos 1 hora por dia onde ninguém tem nada planeado. Sem atividades, sem ecrãs, sem pressa. É nesse espaço vazio que a criatividade e a conexão acontecem.", dayContext: "friday" },
  { id: "ot4", category: "organizacao-tempo", type: "reflexao", title: "Ocupado vs. presente", body: "Estar ocupado não é o mesmo que estar presente. Esta semana, pergunta-te: 'Estou a correr para onde?' Às vezes, parar é o passo mais produtivo.", dayContext: "other" },

  // Planeamento Familiar
  { id: "pf1", category: "planeamento-familiar", type: "dica", title: "A reunião familiar semanal", body: "Reserva 15 minutos por semana para uma 'reunião' em família. Cada membro partilha algo que correu bem, algo que gostaria de melhorar, e um desejo para a semana seguinte.", dayContext: "monday" },
  { id: "pf2", category: "planeamento-familiar", type: "checklist", title: "Planeamento de férias consciente", body: "Para férias que recarregam de verdade.", items: ["Define o objetivo: descanso, aventura ou conexão?", "Envolve as crianças na escolha do destino", "Planeia dias livres sem itinerário", "Limita o tempo de ecrã durante as férias", "Cria um 'diário de viagem' em família"] },
  { id: "pf3", category: "planeamento-familiar", type: "sugestao", title: "O quadro de contribuições", body: "Cria um quadro visual onde cada membro da família tem tarefas adaptadas à sua idade. Não são 'tarefas domésticas' — são contribuições para o lar. A linguagem muda tudo.", dayContext: "friday" },

  // Visitas e Saídas
  { id: "vs1", category: "visitas-saidas", type: "sugestao", title: "Passeio sensorial na natureza", body: "Na próxima saída ao ar livre, proponham um desafio: encontrar 5 texturas diferentes, 3 sons distintos e 2 cheiros novos. Transforma uma caminhada simples numa aventura de descoberta.", dayContext: "friday" },
  { id: "vs2", category: "visitas-saidas", type: "dica", title: "Museus sem pressão", body: "Quando visitarem um museu, não tentem ver tudo. Escolham 3 obras ou peças e passem tempo real com elas. Perguntem às crianças: 'O que vês? O que sentes? O que inventarias?'", dayContext: "monday" },
  { id: "vs3", category: "visitas-saidas", type: "checklist", title: "Kit de exploração familiar", body: "Prepara um kit para ter sempre no carro.", items: ["Lupa e binóculos pequenos", "Caderno e lápis para desenhar", "Saco para recolher tesouros naturais", "Garrafa de água e snacks saudáveis", "Mapa da região ou trilho"] },

  // Relações Familiares
  { id: "rf1", category: "relacoes-familiares", type: "dica", title: "Os 8 segundos do abraço", body: "Um abraço de pelo menos 8 segundos liberta oxitocina — a hormona da conexão. Hoje, experimenta abraçar cada membro da família assim, sem pressa.", dayContext: "monday" },
  { id: "rf2", category: "relacoes-familiares", type: "reflexao", title: "Ouvir para compreender", body: "Da próxima vez que o teu filho te contar algo, resiste ao impulso de resolver, ensinar ou corrigir. Apenas ouve. Diz: 'Conta-me mais.' É o maior presente que podes dar.", dayContext: "other" },
  { id: "rf3", category: "relacoes-familiares", type: "sugestao", title: "Noite de jogos analógicos", body: "Uma vez por semana, desliguem todos os ecrãs e joguem um jogo de tabuleiro ou cartas. Não importa qual — o que importa é o riso, a conversa e o tempo partilhado.", dayContext: "friday" },

  // Propósito e Valores
  { id: "pv1", category: "proposito-valores", type: "reflexao", title: "A carta ao futuro", body: "Escreve uma carta ao teu filho para ele ler daqui a 10 anos. O que gostarias que ele soubesse sobre este momento? Sobre quem ele é agora? Sobre o que sentes?", dayContext: "other" },
  { id: "pv2", category: "proposito-valores", type: "dica", title: "O valor da semana", body: "Escolham um valor em família — coragem, gratidão, paciência — e durante a semana, procurem exemplos desse valor no dia-a-dia. Ao jantar, partilhem o que encontraram.", dayContext: "monday" },
  { id: "pv3", category: "proposito-valores", type: "sugestao", title: "Projeto de gratidão", body: "Criem um 'frasco da gratidão' familiar. Todos os dias, cada pessoa escreve num papel algo pelo qual é grato e coloca no frasco. No final do mês, leiam todos juntos.", dayContext: "friday" },
  { id: "pv4", category: "proposito-valores", type: "checklist", title: "Conversas com propósito", body: "Perguntas para jantares mais profundos.", items: ["'Qual foi o momento mais corajoso do teu dia?'", "'Se pudesses mudar uma coisa no mundo, o que seria?'", "'O que é que te faz sentir seguro?'", "'De que forma ajudaste alguém hoje?'"] },
];

export function getContentForDay(selectedCategories: ContentCategory[]): { weeklyTip: TrainingContent | null; weekendSuggestion: TrainingContent | null } {
  const day = new Date().getDay();
  const filtered = contentLibrary.filter((c) => selectedCategories.includes(c.category));
  if (filtered.length === 0) return { weeklyTip: null, weekendSuggestion: null };

  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7)); // weekly seed
  const mondayContent = filtered.filter((c) => c.dayContext === "monday" || c.type === "dica" || c.type === "reflexao");
  const fridayContent = filtered.filter((c) => c.dayContext === "friday" || c.type === "sugestao");

  const weeklyTip = mondayContent.length > 0 ? mondayContent[seed % mondayContent.length] : filtered[0];
  const weekendSuggestion = fridayContent.length > 0 ? fridayContent[(seed + 1) % fridayContent.length] : filtered[1] || filtered[0];

  return { weeklyTip, weekendSuggestion };
}

export function getContentByCategory(category: ContentCategory): TrainingContent[] {
  return contentLibrary.filter((c) => c.category === category);
}

export function getTypeLabel(type: TrainingContent["type"]): string {
  const map: Record<string, string> = { dica: "Dica", checklist: "Checklist", sugestao: "Sugestão", reflexao: "Reflexão" };
  return map[type] || type;
}

export function getTypeColor(type: TrainingContent["type"]): string {
  const map: Record<string, string> = {
    dica: "bg-primary/15 text-primary",
    checklist: "bg-accent/15 text-accent-foreground",
    sugestao: "bg-secondary text-secondary-foreground",
    reflexao: "bg-muted text-muted-foreground",
  };
  return map[type] || "";
}
