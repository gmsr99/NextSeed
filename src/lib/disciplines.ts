export type AgeGroup = "early" | "primary" | "secondary";

export interface Discipline {
  id: string;
  icon: string;
  names: Record<AgeGroup, string>;
  descriptions: Record<AgeGroup, string>;
  color: string;
  contentCount: number;
  projectCount: number;
}

export function getAgeGroup(age: number): AgeGroup {
  if (age <= 6) return "early";
  if (age <= 10) return "primary";
  return "secondary";
}

export function getAgeGroupLabel(group: AgeGroup): string {
  const labels: Record<AgeGroup, string> = {
    early: "4–6 anos",
    primary: "7–10 anos",
    secondary: "10+ anos",
  };
  return labels[group];
}

export const disciplines: Discipline[] = [
  {
    id: "language",
    icon: "📖",
    names: { early: "Linguagem", primary: "Português", secondary: "Língua Portuguesa" },
    descriptions: {
      early: "Histórias, rimas e primeiras palavras para despertar a comunicação.",
      primary: "Leitura, escrita e interpretação de textos.",
      secondary: "Análise literária, gramática e produção textual.",
    },
    color: "hsl(45 75% 62%)",
    contentCount: 24,
    projectCount: 6,
  },
  {
    id: "math",
    icon: "🔢",
    names: { early: "Números", primary: "Matemática", secondary: "Matemática" },
    descriptions: {
      early: "Contar, agrupar e brincar com formas e padrões.",
      primary: "Operações, resolução de problemas e geometria.",
      secondary: "Álgebra, estatística e raciocínio lógico.",
    },
    color: "hsl(100 38% 65%)",
    contentCount: 31,
    projectCount: 8,
  },
  {
    id: "world",
    icon: "🌿",
    names: { early: "Descoberta", primary: "Estudo do Meio", secondary: "Ciências Naturais" },
    descriptions: {
      early: "Explorar a natureza, os sentidos e o mundo à volta.",
      primary: "Seres vivos, ambiente, corpo humano e sociedade.",
      secondary: "Biologia, geologia e ecossistemas.",
    },
    color: "hsl(105 30% 52%)",
    contentCount: 18,
    projectCount: 5,
  },
  {
    id: "expression",
    icon: "🎨",
    names: { early: "Expressão", primary: "Artes e Expressões", secondary: "Educação Artística" },
    descriptions: {
      early: "Pintar, modelar, dançar e criar livremente.",
      primary: "Artes visuais, música, teatro e movimento.",
      secondary: "História da arte, técnicas e projetos criativos.",
    },
    color: "hsl(35 70% 65%)",
    contentCount: 15,
    projectCount: 4,
  },
  {
    id: "social",
    icon: "🤝",
    names: { early: "Eu e os Outros", primary: "Cidadania", secondary: "Cidadania e Desenvolvimento" },
    descriptions: {
      early: "Emoções, partilha e regras de convivência.",
      primary: "Valores, direitos, deveres e vida em comunidade.",
      secondary: "Ética, participação cívica e responsabilidade social.",
    },
    color: "hsl(15 55% 60%)",
    contentCount: 12,
    projectCount: 3,
  },
  {
    id: "technology",
    icon: "💡",
    names: { early: "Curiosidade Digital", primary: "Tecnologia", secondary: "TIC e Programação" },
    descriptions: {
      early: "Primeiros passos com ferramentas digitais e lógica simples.",
      primary: "Ferramentas digitais, pensamento computacional.",
      secondary: "Programação, robótica e literacia digital avançada.",
    },
    color: "hsl(200 45% 55%)",
    contentCount: 10,
    projectCount: 4,
  },
];
