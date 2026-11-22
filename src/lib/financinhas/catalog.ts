// Financinhas · catálogo (conhecimento estruturado, camada 1)
//
// Fonte: FIN_CUR_01 (competências), FIN_CUR_02 (mapa curricular), FIN_CUR_03
// (trilho v6), FIN_SIS_03 (modos de descoberta). Este ficheiro é conteúdo
// pedagógico comum a todas as famílias: nenhum dado de crianças entra aqui.
//
// As chaves (AD1, MD6, número do tema, número da sessão) são estáveis e
// separadas do texto, para o produto poder vir a ser bilingue (D3).

export type Tier = "5-6" | "7-8" | "9-12";
export const TIERS: Tier[] = ["5-6", "7-8", "9-12"];

export type DomainCode = "CP" | "AD" | "DC" | "CS" | "VL" | "RH" | "GP";

export const DOMAINS: { code: DomainCode; name: string }[] = [
  { code: "CP", name: "Crença positiva (transversal)" },
  { code: "AD", name: "Autodomínio" },
  { code: "DC", name: "Decisão e pensamento crítico" },
  { code: "CS", name: "Consciência de consumo" },
  { code: "VL", name: "Criação de valor e iniciativa" },
  { code: "RH", name: "Relação humana e emocional" },
  { code: "GP", name: "Gestão prática na vida real" },
];

export interface Skill {
  code: string;
  domain: DomainCode;
  name: string;
  /** O que o adulto consegue ver acontecer (referência 7–8 anos). */
  observable: string;
}

export const SKILLS: Skill[] = [
  { code: "CP", domain: "CP", name: "Crença positiva sobre o dinheiro", observable: "Fala de dinheiro com naturalidade, sem ansiedade nem culpa, e tem orgulho nas suas decisões." },
  { code: "AD1", domain: "AD", name: "Resistir ao impulso", observable: "Perante uma vontade súbita, faz uma pausa antes de decidir." },
  { code: "AD2", domain: "AD", name: "Esperar com propósito", observable: "Poupa ou espera várias semanas por uma coisa sem desistir." },
  { code: "AD3", domain: "AD", name: "Reconhecer a vontade passageira", observable: "Dias depois, nota sozinha que já não quer aquilo." },
  { code: "DC1", domain: "DC", name: "Escolher entre opções", observable: "Explica porque escolheu A e não B." },
  { code: "DC2", domain: "DC", name: "Desejo vs necessidade", observable: "Classifica uma coisa como \"preciso\" ou \"apetece-me\"." },
  { code: "DC3", domain: "DC", name: "Desejo vs sonho", observable: "Nomeia um sonho e o que está a fazer para lá chegar." },
  { code: "DC4", domain: "DC", name: "Pensar nas consequências", observable: "Diz \"se gastar isto, fico sem aquilo\" antes de decidir." },
  { code: "CS1", domain: "CS", name: "Reconhecer o suficiente", observable: "Diz \"já tenho que chegue\" sem ser preciso lembrar." },
  { code: "CS2", domain: "CS", name: "Resistir à tentação das coleções", observable: "Lida bem com não ter todas as peças de uma coleção." },
  { code: "CS3", domain: "CS", name: "Identificar desejos infetados", observable: "Reconhece que passou a querer algo depois de o ver num anúncio ou na loja." },
  { code: "CS4", domain: "CS", name: "Valorizar segunda mão", observable: "Propõe usar, trocar ou dar em vez de comprar novo." },
  { code: "VL1", domain: "VL", name: "Criar algo de valor", observable: "Produz por iniciativa própria algo útil ou bonito para alguém." },
  { code: "VL2", domain: "VL", name: "Resolver problemas dos outros", observable: "Nota uma necessidade de outra pessoa e propõe uma solução." },
  { code: "VL3", domain: "VL", name: "Persistir na dificuldade", observable: "Quando algo não corre bem, tenta de novo." },
  { code: "VL4", domain: "VL", name: "Iniciativa e \"sociedades\"", observable: "Organiza ou colabora num pequeno projeto com outros." },
  { code: "VL5", domain: "VL", name: "Dinheiro como retorno do valor", observable: "Liga \"criei ou ajudei\" a \"recebi\"." },
  { code: "RH1", domain: "RH", name: "Gratidão", observable: "Agradece sem lhe pedirem." },
  { code: "RH2", domain: "RH", name: "Generosidade", observable: "Oferece algo seu por iniciativa própria." },
  { code: "RH3", domain: "RH", name: "Empatia", observable: "Ajusta-se ao que o outro está a sentir." },
  { code: "RH4", domain: "RH", name: "O que não se compra", observable: "Valoriza tempo e experiências acima de objetos." },
  { code: "GP1", domain: "GP", name: "Gerir a semanada", observable: "Sabe quanto tem e em que mealheiro." },
  { code: "GP2", domain: "GP", name: "Poupar com objetivo", observable: "Separa dinheiro para uma meta e acompanha quanto falta." },
  { code: "GP3", domain: "GP", name: "Poupar para proteção e oportunidade", observable: "Mantém o chão do 🐷; se o usa, repõe-o sozinha." },
  { code: "GP4", domain: "GP", name: "Orçamento de desejos do dia a dia", observable: "Pesa se vale a pena antes de gastar." },
  { code: "GP5", domain: "GP", name: "Calcular e registar", observable: "Soma, subtrai e regista no caderninho." },
];

export const SKILL_CODES = SKILLS.map((s) => s.code);
export const skillByCode = (code: string) => SKILLS.find((s) => s.code === code);

export const LEVEL_LABELS: Record<number, string> = {
  1: "Emergente",
  2: "Em desenvolvimento",
  3: "Consolidado",
  4: "Autónomo",
};
export const LEVEL_HINTS: Record<number, string> = {
  1: "Ainda não aparece sozinho.",
  2: "Aparece com ajuda ou lembrete.",
  3: "Aparece sozinho em situações conhecidas.",
  4: "Transfere para situações novas.",
};

// ─── Modos de descoberta ────────────────────────────────────────────────────
// Linguagem interna: os códigos nunca vão para o prompt nem para os slides.

export interface DiscoveryMode {
  code: string;
  name: string;
  /** Como a descoberta acontece (instrução para o gerador). */
  how: string;
}

export const DISCOVERY_MODES: DiscoveryMode[] = [
  { code: "MD1", name: "Cálculo", how: "As contas revelam o \"depois\": moedas grandes, somas passo a passo, balança, caderninho." },
  { code: "MD2", name: "Erro vivido", how: "A personagem decide primeiro e sente a consequência; aprende sem culpa e termina em \"para a próxima já sei\"." },
  { code: "MD3", name: "Tempo", how: "Não há decisão: ao longo de dias ou semanas a vontade desfaz-se, ou confirma-se, sozinha." },
  { code: "MD4", name: "Pergunta de outro", how: "Alguém faz UMA boa pergunta e a personagem responde sozinha. Pergunta, nunca lição." },
  { code: "MD5", name: "Espelho", how: "Vê outra criança fazer (bem ou mal) e reconhece-se, sem julgar o outro." },
  { code: "MD6", name: "Imprevisto", how: "Esgotou, choveu, o preço mudou: a escolha forçada revela o que afinal queria." },
  { code: "MD7", name: "Comparação física", how: "Pôr as coisas lado a lado, sentir a mão vazia, ver o mealheiro: o corpo mostra o que a cabeça ainda não sabia." },
  { code: "MD8", name: "Pelo outro", how: "A solução aparece quando a personagem olha para o que outra pessoa precisa." },
];
export const MODE_CODES = DISCOVERY_MODES.map((m) => m.code);
export const modeByCode = (code: string) => DISCOVERY_MODES.find((m) => m.code === code);

/** Skills em que o cálculo (MD1) faz sentido; fora delas MD1 evita-se (sobre-utilizado). */
export const CALC_SKILLS = ["GP1", "GP2", "GP4", "GP5"];

export const VICTORIES = ["orgulho", "alívio", "riso", "gratidão", "laço com alguém"];

// ─── Temas (23) ─────────────────────────────────────────────────────────────

export type ThemeStatus = "coberto" | "parcial" | "sem_recurso";

export interface Theme {
  number: number;
  block: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  title: string;
  /** Skill principal (a que o ciclo adaptativo usa para escolher o tema). */
  primary: string;
  /** Todas as skills que o tema trabalha (principal primeiro). */
  skills: string[];
  /** Ideia central, em uma frase, para orientar o gerador. */
  idea: string;
  status: ThemeStatus;
}

export const BLOCKS: Record<Theme["block"], string> = {
  A: "Fundamentos",
  B: "Desejos e autodomínio",
  C: "Poupança com sentido",
  D: "Consumo consciente",
  E: "Valor e iniciativa",
  F: "Relação e gratidão",
  G: "Gestão real",
};

export const THEMES: Theme[] = [
  { number: 1, block: "A", title: "Dinheiro como ferramenta e chave", primary: "CP", skills: ["CP", "GP1"], idea: "O dinheiro é uma chave que abre portas, primeiro as das necessidades; ganham-se chaves ajudando pessoas.", status: "parcial" },
  { number: 2, block: "A", title: "Gerir a semanada", primary: "GP1", skills: ["GP1", "GP5", "GP3", "RH2"], idea: "A semanada é dela: cada moeda tem uma casa nos quatro mealheiros, e o chão do 🐷 fica sempre.", status: "coberto" },
  { number: 3, block: "B", title: "Desejo vs necessidade", primary: "DC2", skills: ["DC2"], idea: "Distinguir o que é preciso do que apetece, sem tratar o \"apetece-me\" como coisa má.", status: "coberto" },
  { number: 4, block: "B", title: "Desejo vs sonho", primary: "DC3", skills: ["DC3", "AD2"], idea: "O desejo quer já; o sonho aguenta a espera e sobrevive a ela.", status: "coberto" },
  { number: 5, block: "B", title: "Autocontrolo e impulsos", primary: "AD1", skills: ["AD1", "AD3"], idea: "O impulso não é inimigo: é um aviso a que se responde devagar.", status: "coberto" },
  { number: 6, block: "B", title: "Desejos infetados", primary: "CS3", skills: ["CS3"], idea: "Muitos desejos vêm de fora e, se não lhes ligarmos, desaparecem sozinhos.", status: "coberto" },
  { number: 7, block: "B", title: "Capacidade de fazer escolhas", primary: "DC1", skills: ["DC1", "DC4"], idea: "Toda a escolha fecha portas, e isso não é tragédia: é poder.", status: "coberto" },
  { number: 8, block: "C", title: "Poupar para algo maior", primary: "GP2", skills: ["GP2", "AD2"], idea: "Do sonho faz-se um plano: quanto custa, quanto falta, quanto tempo, em pedaços pequenos.", status: "coberto" },
  { number: 9, block: "C", title: "Poupar para proteção e oportunidade", primary: "GP3", skills: ["GP3"], idea: "Uma folga guardada protege dos imprevistos e deixa aproveitar oportunidades.", status: "coberto" },
  { number: 10, block: "D", title: "Reconhecer o suficiente", primary: "CS1", skills: ["CS1", "CS2"], idea: "Ter mais do mesmo não aumenta a alegria; saber quando chega é liberdade.", status: "coberto" },
  { number: 11, block: "D", title: "Tentação das coleções", primary: "CS2", skills: ["CS2", "CS1"], idea: "As coleções foram feitas para nunca acabar; quem escolhe quando parar é a criança.", status: "coberto" },
  { number: 12, block: "D", title: "Segunda mão e sustentabilidade", primary: "CS4", skills: ["CS4"], idea: "Usar, trocar e dar dá nova vida às coisas e a outras pessoas.", status: "coberto" },
  { number: 13, block: "E", title: "Criar valor", primary: "VL1", skills: ["VL1", "VL2"], idea: "O valor está em tornar a vida de alguém melhor, mais fácil ou mais agradável.", status: "coberto" },
  { number: 14, block: "E", title: "Dinheiro como retorno do valor", primary: "VL5", skills: ["VL5", "VL3"], idea: "O dinheiro é o sinal de que se entregou valor, nunca o ponto de partida.", status: "coberto" },
  { number: 15, block: "E", title: "Persistir na dificuldade", primary: "VL3", skills: ["VL3"], idea: "A primeira tentativa que falha faz parte do caminho.", status: "coberto" },
  { number: 16, block: "E", title: "Resolver problemas dos outros", primary: "VL2", skills: ["VL2", "RH3"], idea: "Olhar para o que os outros precisam é onde nascem as boas ideias.", status: "sem_recurso" },
  { number: 17, block: "E", title: "Trabalho em equipa e \"sociedades\"", primary: "VL4", skills: ["VL4", "VL2"], idea: "Juntos fazem-se coisas que sozinho não se fazem, e cada um traz o seu valor.", status: "sem_recurso" },
  { number: 18, block: "F", title: "Gratidão", primary: "RH1", skills: ["RH1"], idea: "Reparar no que já se tem enche mais do que o que falta.", status: "coberto" },
  { number: 19, block: "F", title: "Generosidade", primary: "RH2", skills: ["RH2", "RH3"], idea: "Dar algo seu, a quem se escolhe, também é uma forma de usar bem o dinheiro.", status: "parcial" },
  { number: 20, block: "F", title: "O que não se compra", primary: "RH4", skills: ["RH4", "RH1"], idea: "O que mais vale (pessoas, momentos, confiança) não tem preço.", status: "coberto" },
  { number: 21, block: "G", title: "Orçamento do dia a dia", primary: "GP4", skills: ["GP4", "DC4"], idea: "Antes de gastar, pesar se vale a pena e o que fica para o resto.", status: "coberto" },
  { number: 22, block: "G", title: "Comprar a bom preço", primary: "GP4", skills: ["GP4", "VL4"], idea: "Comparar e esperar pela altura certa faz o mesmo dinheiro chegar mais longe.", status: "sem_recurso" },
  { number: 23, block: "G", title: "Cálculo e registo", primary: "GP5", skills: ["GP5"], idea: "Contar e registar dá controlo e orgulho; quando as contas batem, celebra-se.", status: "coberto" },
];
export const themeByNumber = (n: number) => THEMES.find((t) => t.number === n);

// ─── Trilho de Iniciação (12 sessões, versão 6) ─────────────────────────────

export interface TrackSession {
  number: number;
  phase: string;
  title: string;
  themes: number[];
  skills: string[];
  mode: string;
  idea: string;
  /** Veículo / exemplo por escalão (o universo continua a ser o interesse da criança). */
  byTier: Record<Tier, string>;
  activity: string;
  /** Notas obrigatórias da sessão (vão para o gerador e para o guia do adulto). */
  notes?: string[];
}

export const TRACK_SESSIONS: TrackSession[] = [
  {
    number: 1, phase: "I · Fundação", title: "O dinheiro é uma chave", themes: [1], skills: ["CP"], mode: "MD7",
    idea: "O dinheiro é ferramenta, não tesouro: vale pelas portas que abre, e as primeiras são as das necessidades (comida, casa, saúde). Ganham-se chaves ajudando pessoas. História base: o molho de chaves (uma chave bonita que não abre nada, uma simples que abre o que é preciso, lado a lado).",
    byTier: {
      "5-6": "Um conceito só: a chave boa é a que abre o que precisamos.",
      "7-8": "Arco completo e o salto para \"o dinheiro da minha casa abre que portas?\".",
      "9-12": "Ficha de caso: o dinheiro compra tempo e opções, e o que ele não resolve.",
    },
    activity: "As três portas: caça às portas pela casa com o molho de chaves verdadeiro (🍽️ comida · 🏠 casa · 🩺 saúde) e desenhá-las numa folha afixada. Não nomear desejos.",
    notes: [
      "Frase obrigatória: \"As portas grandes — comida, casa, médico — são os pais que abrem. Estas moedas são tuas, para aprenderes a usar chaves.\"",
      "Se a família já der dinheiro nesta semana, é semana de observação: pouco, numa só caixinha, sem regras nem correções.",
      "Antes da sessão: fotografia inicial (6 perguntas, 3 minutos, só o adulto).",
    ],
  },
  {
    number: 2, phase: "I · Fundação", title: "A semanada é tua", themes: [2], skills: ["GP1", "GP5", "GP3", "RH2"], mode: "MD1",
    idea: "Nascem os quatro mealheiros (🐷 Gastar · 🎯 Poupar · ❤️ Dar · 🚀 Investir), o chão do 🐷 e o caderninho. As quatro portas: gastar agora · guardar para o sonho · dar a alguém · fazer uma coisa acontecer.",
    byTier: {
      "5-6": "Quatro frascos, quatro moedinhas, uma linha pintada no 🐷. O 🚀 chama-se \"Inventar\". Caderninho = Mapa de Moedas.",
      "7-8": "Os quatro nomes verdadeiros; o chão são 50 cêntimos que ficam. Caderninho = Página da Semana.",
      "9-12": "Mesada; a criança decide a divisão (ex.: 50/30/10/10) e calcula o próprio fundo. Caderninho = Livro.",
    },
    activity: "Montar tudo e fazer o ritual da semanada pela primeira vez. A partir daqui não pára.",
    notes: [
      "Se houve semana de observação, abrir com \"o que aconteceu às tuas moedas?\".",
      "A semanada nunca é prémio nem castigo.",
    ],
  },
  {
    number: 3, phase: "II · Desejo e autodomínio", title: "Preciso ou apetece-me?", themes: [3], skills: ["DC2"], mode: "MD4",
    idea: "Separar o que é preciso do que apetece, sem que \"apetece-me\" seja coisa má. Distinguir não é negar. As três portas da S1 são o cesto do \"preciso\".",
    byTier: {
      "5-6": "Dois cestos: arrumar objetos reais.",
      "7-8": "Classificar 10 pedidos da semana passada.",
      "9-12": "As zonas cinzentas: ténis novos são necessidade ou desejo? E porquê.",
    },
    activity: "Durante a semana, antes de cada pedido, dizer em voz alta a qual dos dois pertence.",
  },
  {
    number: 4, phase: "II · Desejo e autodomínio", title: "Desejo ou sonho?", themes: [4], skills: ["DC3", "AD2"], mode: "MD3",
    idea: "O desejo quer já; o sonho aguenta a espera.",
    byTier: {
      "5-6": "\"Quero já\" vs \"quero há muito tempo e ainda quero\".",
      "7-8": "A corrida: o sonho aguenta as voltas todas.",
      "9-12": "Escrever o sonho com prazo e preço; rever daqui a 3 semanas.",
    },
    activity: "Teste das 3 Semanas: anotar hoje um desejo, com data, e guardá-lo numa gaveta (abre-se na S7).",
    notes: ["Arranca o Teste das 3 Semanas (fecha na S7)."],
  },
  {
    number: 5, phase: "II · Desejo e autodomínio", title: "A vontade que aparece de repente", themes: [5], skills: ["AD1", "AD3"], mode: "MD2",
    idea: "O impulso é um aviso a que se responde devagar. A personagem decide mal e sente a consequência; termina em \"para a próxima já sei\", nunca em culpa.",
    byTier: {
      "5-6": "O balão que esvazia.",
      "7-8": "Comprou na hora e ficou sem para o que queria mesmo.",
      "9-12": "Compras online, carrinho, \"só faltam 2 unidades\": a urgência fabricada.",
    },
    activity: "O truque da pausa: dormir uma noite sobre a vontade.",
  },
  {
    number: 6, phase: "II · Desejo e autodomínio", title: "Este desejo é mesmo meu?", themes: [6], skills: ["CS3"], mode: "MD5",
    idea: "Muitos desejos vêm de fora. As três perguntas: se não o tivesse visto, fazia-me falta? · o que faço se não o puder ter? · prefiro isto ou o meu sonho?",
    byTier: {
      "5-6": "\"Vi na loja e agora quero\", e no dia seguinte já não.",
      "7-8": "Os cromos que toda a gente tem.",
      "9-12": "Desmontar um anúncio: quem ganha com o meu desejo?",
    },
    activity: "Caçar 3 desejos infetados durante a semana.",
  },
  {
    number: 7, phase: "III · Escolher e poupar", title: "Escolher é ganhar e perder", themes: [7], skills: ["DC1", "DC4"], mode: "MD6",
    idea: "Toda a escolha fecha portas, e isso não é tragédia, é poder.",
    byTier: {
      "5-6": "Só se pode levar um: qual?",
      "7-8": "Os dois caminhos, com contas lado a lado.",
      "9-12": "Custo de oportunidade sem lhe chamar isso: \"o que é que isto me tira?\".",
    },
    activity: "O semáforo das decisões.",
    notes: ["Fecha o Teste das 3 Semanas: abrir o papel da S4 e ver se a vontade sobreviveu."],
  },
  {
    number: 8, phase: "III · Escolher e poupar", title: "Poupar para algo maior", themes: [8], skills: ["GP2", "AD2"], mode: "MD1",
    idea: "Do sonho confirmado na S7 faz-se um plano: quanto custa, quanto falta, quanto tempo. Dividir a meta em pedaços.",
    byTier: {
      "5-6": "Encher uma barra de 10 quadradinhos.",
      "7-8": "Mapa do sonho com etapas e datas.",
      "9-12": "Calendário até à meta e o que muda se poupar mais por semana.",
    },
    activity: "Mapa do Sonho afixado à vista.",
  },
  {
    number: 9, phase: "III · Escolher e poupar", title: "Já tenho que chegue", themes: [10], skills: ["CS1", "CS2"], mode: "MD7",
    idea: "Reconhecer o suficiente. Ter mais do mesmo não aumenta a alegria, e as coleções foram desenhadas para nunca acabarem.",
    byTier: {
      "5-6": "Juntar todos os brinquedos iguais num monte.",
      "7-8": "Contar quantos já tem antes de pedir mais um.",
      "9-12": "Passes de batalha, skins, edições limitadas: o negócio do inacabável.",
    },
    activity: "Escolher 3 coisas para dar ou vender.",
  },
  {
    number: 10, phase: "IV · Valor e relação", title: "Eu sei criar", themes: [13], skills: ["VL1", "VL2"], mode: "MD8",
    idea: "O valor está em tornar a vida de alguém melhor, mais fácil ou mais agradável. A solução aparece ao olhar para quem precisa.",
    byTier: {
      "5-6": "Fazer uma prenda com as próprias mãos.",
      "7-8": "Descobrir um problema em casa e resolvê-lo.",
      "9-12": "Um mini-serviço real para alguém de fora da família.",
    },
    activity: "\"Que problema é que eu consigo resolver esta semana?\"",
  },
  {
    number: 11, phase: "IV · Valor e relação", title: "O dinheiro vem depois do valor", themes: [14], skills: ["VL5", "VL3"], mode: "MD2",
    idea: "O dinheiro é o sinal de que se entregou valor, nunca o ponto de partida. A primeira tentativa que falha é parte do caminho.",
    byTier: {
      "5-6": "Ajudou e recebeu um obrigado: o obrigado também é pagamento.",
      "7-8": "Fez, não correu bem, melhorou, funcionou.",
      "9-12": "Porque é que algumas coisas valem mais: raridade, esforço, utilidade.",
    },
    activity: "Repetir a S10 com uma melhoria a partir do que correu mal.",
  },
  {
    number: 12, phase: "IV · Valor e relação", title: "O que o dinheiro não compra", themes: [18, 20], skills: ["RH1", "RH4"], mode: "MD4",
    idea: "Fecho do trilho. Gratidão pelo que se tem e nome ao que não tem preço: pessoas, momentos, amizades, confiança.",
    byTier: {
      "5-6": "Três coisas boas de hoje.",
      "7-8": "O melhor do dia foi uma coisa ou um momento?",
      "9-12": "O que é que eu não venderia por nenhum dinheiro, e porquê.",
    },
    activity: "Ritual das três gratidões, todos os dias, para ficar.",
    notes: ["Depois da sessão: fotografia de saída (as mesmas 6 perguntas) e critérios de saída do trilho."],
  },
];
export const trackSession = (n: number) => TRACK_SESSIONS.find((s) => s.number === n);

// ─── Protagonistas ──────────────────────────────────────────────────────────
// Fictícios e rotativos. Nunca o nome real da criança.

export const PROTAGONISTS = ["Dinis", "Sofia", "Miguel", "Inês", "Leonor", "Tomé", "Mariana", "Vicente"];
export const PROTAGONISTS_RESERVE = ["Vasco", "Íris", "Tomás", "Frederico", "Constança", "Xavier", "Mafalda", "Diogo", "Teresa", "Nuno", "Bárbara", "Salvador"];
export const ALL_PROTAGONISTS = [...PROTAGONISTS, ...PROTAGONISTS_RESERVE];

// ─── Fotografia inicial e de saída (trilho §7) ─────────────────────────────

export interface SnapshotQuestion {
  id: string;
  text: string;
  options: string[];
  /** Skill mais ligada à pergunta (para a leitura do antes/depois). */
  skill: string;
  key?: boolean;
}

export const SNAPSHOT_QUESTIONS: SnapshotQuestion[] = [
  { id: "q1", text: "Quando quer uma coisa, consegue esperar alguns dias?", options: ["nunca", "às vezes", "sim"], skill: "AD2" },
  { id: "q2", text: "Sabe dizer se algo é \"preciso\" ou \"apetece-me\"?", options: ["ainda não", "às vezes", "sim"], skill: "DC2" },
  { id: "q3", text: "Consegue nomear um sonho seu, com mais de um mês?", options: ["ainda não", "às vezes", "sim"], skill: "DC3" },
  { id: "q4", text: "Recebe dinheiro com regularidade? Sabe quanto tem?", options: ["não", "recebe, mas não sabe quanto tem", "sim, e sabe quanto tem"], skill: "GP1" },
  { id: "q5", text: "Já fez alguma coisa por alguém sem ser para receber algo?", options: ["ainda não", "às vezes", "sim"], skill: "RH2" },
  { id: "q6", text: "Fala de dinheiro à vontade, ou com ansiedade ou culpa?", options: ["com ansiedade ou culpa", "depende", "à vontade"], skill: "CP", key: true },
];

// ─── Ritual da semanada (5 minutos) ─────────────────────────────────────────

export const RITUAL_STEPS = [
  "Entregar a semanada em moedas pequenas.",
  "Distribuir pela regra das cartas: uma moeda de cada vez, sempre pela ordem 🐷 🎯 ❤️ 🚀. O que sobrar vai para onde ela escolher, e diz porquê.",
  "Contar cada mealheiro.",
  "Escrever a página do caderninho (o adulto está presente e calado; nunca escreve nem corrige).",
  "Uma pergunta só, do adulto. Por exemplo: \"o que é que quase compraste e não compraste?\"",
];

export const PIGGY_BANKS = [
  { emoji: "🐷", name: "Gastar", nameYoung: "Gastar", what: "Necessidades e desejos do agora, sem descer do chão." },
  { emoji: "🎯", name: "Poupar", nameYoung: "Poupar", what: "O sonho, com alvo e prazo. Abre quando a meta é atingida." },
  { emoji: "❤️", name: "Dar", nameYoung: "Dar", what: "Oferecer, ajudar, contribuir. Abre uma vez por mês ou na ocasião; ela escolhe a quem." },
  { emoji: "🚀", name: "Investir", nameYoung: "Inventar", what: "Os meios para criar valor (materiais, sementes, ingredientes). Abre quando ela tem uma ideia." },
];

/** O chão do 🐷 por escalão (FIN_CUR_04 §9.3). */
export const FLOOR_BY_TIER: Record<Tier, string> = {
  "5-6": "O mealheiro nunca fica vazio: uma moeda fica sempre.",
  "7-8": "O chão: uma moeda normal de 50 cêntimos que fica sempre no 🐷 (nunca marcada).",
  "9-12": "O meu fundo: uma semanada, e mais tarde um mês.",
};

export const NOTEBOOK_BY_TIER: Record<Tier, string> = {
  "5-6": "Mapa de Moedas (A4 por mês, sem escrita).",
  "7-8": "Página da Semana (A5): recebi, o que pus em cada mealheiro, o que gastei, \"escolhi ___ em vez de ___\", barra do sonho.",
  "9-12": "Livro: abertura do mês, registo corrente e fecho do mês.",
};
