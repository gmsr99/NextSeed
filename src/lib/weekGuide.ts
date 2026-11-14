// Guia da semana no formato que a F-02 usa (P-22): partes fixas que ajudam a
// mãe a preparar, conduzir e fechar a semana sem ter de as inventar.
// Os textos são deliberadamente genéricos: valem para qualquer tema.

/** Perguntas por dia, seguindo o arco da semana: descobrir, experimentar, comunicar, aplicar. */
export const DAY_QUESTIONS: { day: string; focus: string; questions: string }[] = [
  { day: "Segunda", focus: "Descobrir", questions: "O que achas que já sabes sobre isto? Como é que sabes? O que ainda não sabemos?" },
  { day: "Terça", focus: "Experimentar", questions: "O que achas que vai acontecer? O que aconteceu mesmo? Porque achas que foi assim?" },
  { day: "Quarta", focus: "Comunicar", questions: "Como podes mostrar isto a alguém que não esteve cá? O que é mais importante dizer?" },
  { day: "Quinta", focus: "Aplicar", questions: "O que mudou no que pensavas? Onde vês isto no dia a dia?" },
  { day: "Sexta", focus: "Ver o mundo", questions: "O que descobriste esta semana? Qual foi a parte de que mais gostaste?" },
];

export const QUESTION_TIP =
  "Quando perguntarem alguma coisa, devolve primeiro uma pergunta. Se ninguém souber, procurem juntos no manual ou num livro.";

/** Versão curta para dias difíceis: 45 minutos no total. */
export const SHORT_DAY = {
  intro: "Se alguém estiver doente, se não houver sesta ou se o dia simplesmente correr mal, faz só isto (45 minutos no total):",
  steps: [
    "Leitura em voz alta (15 minutos).",
    "Matemática: uma página do manual ou a atividade de Matemática do dia (15 minutos).",
    "Uma atividade simples do tema da semana, todos juntos (15 minutos).",
  ],
  outro: "As crianças mais novas ouvem a história e desenham. O resto passa para outro dia.",
};

export const DAILY_LOG = {
  intro: "No fim de cada dia, escreve três linhas, no telemóvel ou no Diário da NexSeed:",
  lines: [
    "O que fizemos.",
    "O que ficou por fazer.",
    "Uma coisa que correu bem e uma que mudarias.",
  ],
  outro: "Juntas, estas notas são a base do relatório de cada período: no fim, só tens de as reunir e resumir.",
};

export const WEEK_CLOSE =
  "O que não se fizer passa para a semana seguinte. O plano é uma orientação, não uma dívida.";

/** Linhas do balanço: os conteúdos da semana de uma criança, para assinalar o que ficou feito. */
export function reviewLines(focus: Record<string, { content: string }[]>, labels: Record<string, string>): string[] {
  return Object.entries(focus).map(
    ([discipline, list]) => `${labels[discipline] ?? discipline}: ${list.map((c) => c.content.replace(/\.$/, "")).join("; ")}`,
  );
}
