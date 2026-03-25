export type MissionType = "interior" | "exterior";
export type MissionMode = "individual" | "equipa";
export type AgeGroup = "4-6" | "7-10" | "10+";
export type MissionBenefit =
  | "responsabilidade"
  | "autonomia"
  | "resiliência"
  | "cooperação"
  | "organização"
  | "cuidado"
  | "liderança"
  | "criatividade";

export interface Mission {
  id: string;
  name: string;
  description: string;
  ageGroup: AgeGroup;
  type: MissionType;
  mode: MissionMode;
  estimatedTime: string;
  benefits: MissionBenefit[];
  icon: string;
}

export const benefitLabels: Record<MissionBenefit, string> = {
  responsabilidade: "Responsabilidade",
  autonomia: "Autonomia",
  resiliência: "Resiliência",
  cooperação: "Cooperação",
  organização: "Organização",
  cuidado: "Cuidado",
  liderança: "Liderança",
  criatividade: "Criatividade",
};

export const benefitColors: Record<MissionBenefit, string> = {
  responsabilidade: "bg-amber-100 text-amber-700",
  autonomia: "bg-sky-100 text-sky-700",
  resiliência: "bg-rose-100 text-rose-700",
  cooperação: "bg-violet-100 text-violet-700",
  organização: "bg-teal-100 text-teal-700",
  cuidado: "bg-green-100 text-green-700",
  liderança: "bg-orange-100 text-orange-700",
  criatividade: "bg-pink-100 text-pink-700",
};

export const missions: Mission[] = [
  // 4–6 anos
  {
    id: "m01",
    name: "Guardar os Tesouros",
    description:
      "Arrumar os brinquedos no lugar certo depois de brincar. Cada objeto tem a sua casa!",
    ageGroup: "4-6",
    type: "interior",
    mode: "individual",
    estimatedTime: "10 min",
    benefits: ["responsabilidade", "organização"],
    icon: "🧸",
  },
  {
    id: "m02",
    name: "Regar com Carinho",
    description:
      "Com ajuda de um adulto, regar as plantas e observar como elas crescem.",
    ageGroup: "4-6",
    type: "exterior",
    mode: "equipa",
    estimatedTime: "15 min",
    benefits: ["cuidado", "resiliência"],
    icon: "🌱",
  },
  {
    id: "m03",
    name: "Preparar a Mesa",
    description:
      "Ajudar a pôr a mesa para a refeição: pratos, talheres e copos no lugar certo.",
    ageGroup: "4-6",
    type: "interior",
    mode: "equipa",
    estimatedTime: "10 min",
    benefits: ["responsabilidade", "cooperação"],
    icon: "🍽️",
  },
  {
    id: "m04",
    name: "Biblioteca Organizada",
    description:
      "Organizar os livros por tamanho ou cor e criar o próprio sistema de arrumação.",
    ageGroup: "4-6",
    type: "interior",
    mode: "individual",
    estimatedTime: "20 min",
    benefits: ["organização", "criatividade"],
    icon: "📚",
  },

  // 7–10 anos
  {
    id: "m05",
    name: "Chef do Lanche",
    description:
      "Preparar um lanche simples para a família: cortar fruta, fazer sumo ou montar tostas.",
    ageGroup: "7-10",
    type: "interior",
    mode: "individual",
    estimatedTime: "20 min",
    benefits: ["autonomia", "responsabilidade"],
    icon: "🥪",
  },
  {
    id: "m06",
    name: "Guardião das Plantas",
    description:
      "Cuidar das plantas de forma autónoma: regar, verificar o solo e remover folhas secas.",
    ageGroup: "7-10",
    type: "exterior",
    mode: "individual",
    estimatedTime: "15 min",
    benefits: ["autonomia", "cuidado", "resiliência"],
    icon: "🌿",
  },
  {
    id: "m07",
    name: "Base de Operações",
    description:
      "Organizar o espaço de estudo: arrumar materiais, limpar a mesa e preparar o dia seguinte.",
    ageGroup: "7-10",
    type: "interior",
    mode: "individual",
    estimatedTime: "15 min",
    benefits: ["organização", "autonomia"],
    icon: "✏️",
  },
  {
    id: "m08",
    name: "Equipa de Limpeza",
    description:
      "Trabalhar em equipa para limpar e organizar um espaço comum da casa.",
    ageGroup: "7-10",
    type: "interior",
    mode: "equipa",
    estimatedTime: "30 min",
    benefits: ["cooperação", "responsabilidade"],
    icon: "🧹",
  },
  {
    id: "m09",
    name: "Jardim Vivo",
    description:
      "Plantar sementes, preparar terra e cuidar de um canteiro exterior ao longo de semanas.",
    ageGroup: "7-10",
    type: "exterior",
    mode: "equipa",
    estimatedTime: "45 min",
    benefits: ["cuidado", "resiliência", "cooperação"],
    icon: "🌻",
  },

  // 10+ anos
  {
    id: "m10",
    name: "Cozinha em Ação",
    description:
      "Preparar uma refeição simples para a família com planeamento e execução autónoma.",
    ageGroup: "10+",
    type: "interior",
    mode: "individual",
    estimatedTime: "45 min",
    benefits: ["autonomia", "responsabilidade", "criatividade"],
    icon: "🍳",
  },
  {
    id: "m11",
    name: "Lista Estratégica",
    description:
      "Organizar a lista de compras semanal com base no que falta e nas refeições planeadas.",
    ageGroup: "10+",
    type: "interior",
    mode: "individual",
    estimatedTime: "20 min",
    benefits: ["organização", "autonomia", "responsabilidade"],
    icon: "📋",
  },
  {
    id: "m12",
    name: "Gestor da Semana",
    description:
      "Gerir pequenas tarefas semanais, criar um plano e verificar o progresso de cada uma.",
    ageGroup: "10+",
    type: "interior",
    mode: "individual",
    estimatedTime: "30 min",
    benefits: ["liderança", "organização", "resiliência"],
    icon: "🗓️",
  },
  {
    id: "m13",
    name: "Operação Exterior",
    description:
      "Coordenar uma tarefa exterior em equipa: limpar terraço, organizar jardim ou lavar carro.",
    ageGroup: "10+",
    type: "exterior",
    mode: "equipa",
    estimatedTime: "60 min",
    benefits: ["liderança", "cooperação", "responsabilidade"],
    icon: "🌳",
  },
  {
    id: "m14",
    name: "Reciclar e Organizar",
    description:
      "Separar e organizar resíduos recicláveis, limpando e categorizando cada tipo.",
    ageGroup: "10+",
    type: "interior",
    mode: "equipa",
    estimatedTime: "25 min",
    benefits: ["responsabilidade", "cuidado", "cooperação"],
    icon: "♻️",
  },
];

export const ageGroupLabels: Record<AgeGroup, string> = {
  "4-6": "4–6 anos",
  "7-10": "7–10 anos",
  "10+": "10+ anos",
};
