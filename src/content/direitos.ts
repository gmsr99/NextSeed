// I-13 · Direitos e deveres no ensino doméstico (Portugal continental).
// Fonte: Decreto-Lei n.º 70/2021, de 3 de agosto (regime jurídico do ensino
// individual e do ensino doméstico), alterado pelo Decreto-Lei n.º 8/2025.
// ⚠️ Rascunho para revisão jurídica: enquanto DIREITOS_REVISTO (lib/direitosAccess)
// for false, a página só aparece à equipa. Revisão mensal (decisão de 16 nov).
// Regras de texto (doc 06): claro, sem alarmismo, nunca pelo medo. Cada ponto
// cita o artigo, para a família poder confirmar e mostrar à escola.

export { DIREITOS_REVISTO, canSeeDireitos } from "@/lib/direitosAccess";
export const DIREITOS_ATUALIZADO = "26 de novembro de 2026";

export const FONTES = [
  {
    label: "Decreto-Lei n.º 70/2021 (Diário da República)",
    url: "https://data.dre.pt/eli/dec-lei/70/2021/08/03/p/dre",
  },
  {
    label: "Decreto-Lei n.º 70/2021 (cópia em PDF, DGE)",
    url: "https://educacaoinclusiva.dge.mec.pt/sites/default/files/recursos/documentos/0000900021.pdf",
  },
];

export interface DireitosPoint { text: string; ref: string }
export interface DireitosSection { id: string; title: string; intro?: string; points: DireitosPoint[] }

export const SECTIONS: DireitosSection[] = [
  {
    id: "matricula",
    title: "Matrícula",
    intro: "A criança fica matriculada numa escola, que acompanha e certifica as aprendizagens. Quem ensina em casa é o responsável educativo.",
    points: [
      { text: "O pedido é um requerimento do encarregado de educação ao diretor da escola da área de residência que tenha o ano pretendido. Diz quem são as partes, o aluno, o ano, o regime e os fundamentos.", ref: "art. 9.º, n.º 2" },
      { text: "Junta-se o certificado de habilitações do responsável educativo. No ensino doméstico não se pede registo criminal (só no ensino individual).", ref: "art. 9.º, n.º 3" },
      { text: "O responsável educativo é um familiar ou alguém que vive com a criança e tem, pelo menos, licenciatura.", ref: "art. 4.º, i); art. 16.º, n.º 1" },
      { text: "Há uma entrevista à criança e ao encarregado de educação.", ref: "art. 9.º, n.º 5" },
      { text: "As comunicações fazem-se, de preferência, por email ou plataforma eletrónica. Guardem sempre o comprovativo de entrada.", ref: "art. 9.º, n.º 7" },
      { text: "O diretor decide em 15 dias úteis a contar da entrada do pedido; o deferimento é notificado em 10 dias úteis.", ref: "art. 11.º, n.º 1, a) e n.º 4, a)" },
      { text: "A matrícula fica condicional até se assinar o protocolo com a escola.", ref: "art. 11.º, n.º 5" },
      { text: "A renovação, de ano para ano, depende de se ter cumprido o protocolo e de o renovar ou fazer um novo.", ref: "art. 10.º" },
    ],
  },
  {
    id: "protocolo",
    title: "O protocolo com a escola",
    intro: "É o acordo que diz como vai ser o ano. Vale a pena lê-lo com calma antes de assinar: quase tudo o que vem depois sai daqui.",
    points: [
      { text: "Dura, em regra, um ano letivo.", ref: "art. 12.º, n.º 1" },
      { text: "Prevê, entre outros pontos, como se gere o currículo, como é o acompanhamento, a língua de escolarização e as provas a fazer.", ref: "art. 12.º, n.º 2" },
      { text: "Tem pelo menos uma sessão presencial na escola no fim do ano letivo, com a criança e o responsável educativo.", ref: "art. 12.º, n.º 2, d)" },
      { text: "Em casos excecionais, justificados e comprovados, essa sessão pode ser por videoconferência, a pedido.", ref: "art. 12.º, n.º 6" },
      { text: "O registo do trabalho e das aprendizagens faz-se, em regra, com o portefólio.", ref: "art. 12.º, n.º 4" },
      { text: "Pode prever o uso de espaços da escola, como a biblioteca ou o centro de recursos. Nas escolas públicas, a criança fica então coberta pelo seguro escolar.", ref: "art. 12.º, n.os 3 e 5" },
    ],
  },
  {
    id: "acompanhamento",
    title: "Professor-tutor e portefólio",
    points: [
      { text: "O diretor da escola designa um professor-tutor, responsável pelo acompanhamento da criança.", ref: "art. 4.º, e); art. 14.º, n.º 3, b)" },
      { text: "O acompanhamento faz-se pela discussão do portefólio, que reúne as evidências das aprendizagens e a sua evolução.", ref: "art. 18.º, n.º 1" },
      { text: "O portefólio inclui a autoavaliação da criança e a apreciação do responsável educativo.", ref: "art. 18.º, n.º 2" },
      { text: "Envia-se à escola com a periodicidade definida no protocolo (a lei não fixa uma), e é apreciado numa reunião com a criança e o encarregado de educação.", ref: "art. 18.º, n.º 3" },
      { text: "Depois da reunião, a escola envia, em 10 dias úteis, uma apreciação-síntese, com eventuais recomendações.", ref: "art. 18.º, n.º 4" },
    ],
  },
  {
    id: "provas",
    title: "Provas e certificação",
    points: [
      { text: "Para concluir um ciclo do ensino básico, a criança faz provas de equivalência à frequência no último ano de cada ciclo (4.º, 6.º e 9.º), na escola de matrícula.", ref: "art. 19.º, n.º 1, a)" },
      { text: "Quando existem, a prova final do ensino básico ou o exame nacional substituem a prova de equivalência.", ref: "art. 19.º, n.º 2" },
      { text: "O protocolo diz que provas se fazem, incluindo as de aferição.", ref: "art. 12.º, n.º 2, g) e h)" },
      { text: "Cabe ao encarregado de educação inscrever a criança nas provas e garantir que está presente.", ref: "art. 15.º, b) e c)" },
      { text: "Desde 2025, as crianças com medidas adicionais de suporte à aprendizagem e à inclusão, com adaptações curriculares significativas, estão dispensadas destas provas, como os colegas na escola.", ref: "Decreto-Lei n.º 8/2025" },
      { text: "No fim do ciclo, a escola emite o certificado e o diploma, em regra digitais.", ref: "art. 21.º" },
    ],
  },
  {
    id: "direitos",
    title: "O que a criança tem direito a ter",
    intro: "O ensino doméstico não tira à criança os apoios que teria na escola. Se a escola de matrícula for pública:",
    points: [
      { text: "Manuais gratuitos: os que a escola de matrícula adotou.", ref: "art. 22.º, n.º 1, a) e n.º 2" },
      { text: "Ação social escolar.", ref: "art. 22.º, n.º 1, b)" },
      { text: "Atividades de enriquecimento curricular (AEC).", ref: "art. 22.º, n.º 1, c)" },
      { text: "Aconselhamento da equipa de apoio à educação inclusiva, quando faz sentido.", ref: "art. 12.º, n.º 2, f)" },
    ],
  },
  {
    id: "desacordo",
    title: "Quando não estão de acordo com a escola",
    intro: "Na maior parte das vezes, uma conversa e um pedido por escrito resolvem. Peçam sempre a resposta por escrito e guardem tudo.",
    points: [
      { text: "Se o pedido de matrícula for indeferido, podem recorrer para o diretor-geral dos Estabelecimentos Escolares, em 10 dias úteis.", ref: "art. 11.º, n.º 11, b)" },
      { text: "A escola só pode cancelar a matrícula, ouvido o encarregado de educação, se o protocolo não for cumprido por razões que lhe sejam imputáveis, ou se a criança não transitar dois anos seguidos no fim de um ciclo.", ref: "art. 14.º, n.º 3, g)" },
      { text: "Do cancelamento cabe recurso para o membro do Governo responsável pela educação, em 10 dias úteis.", ref: "art. 14.º, n.º 5" },
      { text: "Para um recurso, falem antes com um jurista ou com uma associação de famílias em ensino doméstico: os prazos são curtos e cada caso tem os seus pormenores.", ref: "nota da NexSeed" },
    ],
  },
];

export interface DireitosTemplate { id: string; title: string; when: string; body: string }

const HEAD = `Exmo(a). Senhor(a) Diretor(a) do [nome do agrupamento/escola],

Eu, [nome], encarregado(a) de educação de [nome da criança], aluno(a) do [ano] ano em regime de ensino doméstico nesta escola de matrícula,`;
const FOOT = `Peço que a resposta me seja enviada por escrito, de preferência para este endereço de email.

Com os melhores cumprimentos,
[nome]
[data]`;

export const TEMPLATES: DireitosTemplate[] = [
  {
    id: "matricula",
    title: "Pedido de matrícula em ensino doméstico",
    when: "Para o primeiro ano ou para mudar de escola. Juntem o certificado de habilitações do responsável educativo.",
    body: `Exmo(a). Senhor(a) Diretor(a) do [nome do agrupamento/escola],

Eu, [nome], encarregado(a) de educação de [nome da criança], nascido(a) a [data], residente em [morada], venho requerer, nos termos do artigo 9.º do Decreto-Lei n.º 70/2021, de 3 de agosto, a matrícula do meu educando no [ano] ano do ensino básico, em regime de ensino doméstico, no ano letivo [ano letivo].

Responsável educativo: [nome], [relação com a criança], que habita com o aluno.
Fundamentos: [duas ou três frases sobre o porquê desta opção].

Junto o certificado de habilitações académicas do responsável educativo (artigo 9.º, n.º 3).

Fico disponível para a entrevista prevista no artigo 9.º, n.º 5, e para preparar o protocolo de colaboração.

${FOOT}`,
  },
  {
    id: "aec",
    title: "Pedido de acesso às AEC",
    when: "Quando a criança quer participar nas atividades de enriquecimento curricular da escola.",
    body: `${HEAD} venho pedir que o meu educando possa frequentar as atividades de enriquecimento curricular [quais, se souberem] no ano letivo [ano letivo], ao abrigo do artigo 22.º, n.º 1, alínea c), do Decreto-Lei n.º 70/2021, de 3 de agosto.

Agradeço que me indiquem os horários disponíveis e o que é preciso para a inscrição.

${FOOT}`,
  },
  {
    id: "manuais",
    title: "Pedido de manuais gratuitos",
    when: "Para receber os manuais adotados pela escola (escola pública).",
    body: `${HEAD} venho pedir os manuais escolares gratuitos adotados por esta escola para o [ano] ano, ao abrigo do artigo 22.º, n.º 1, alínea a), e n.º 2, do Decreto-Lei n.º 70/2021, de 3 de agosto.

Agradeço que me indiquem como e quando os posso levantar ou receber (vales, plataforma ou outro meio).

${FOOT}`,
  },
  {
    id: "videoconferencia",
    title: "Pedido de sessão por videoconferência",
    when: "Quando há uma razão séria e comprovável para não irem presencialmente à sessão de fim de ano.",
    body: `${HEAD} venho pedir, ao abrigo do artigo 12.º, n.º 6, do Decreto-Lei n.º 70/2021, de 3 de agosto, que a sessão de [data] se realize por videoconferência.

Motivo: [explicar o motivo excecional]. Junto [documento comprovativo].

Fico disponível para combinar a data e a plataforma.

${FOOT}`,
  },
  {
    id: "esclarecimento",
    title: "Pedido de esclarecimento por escrito",
    when: "Quando a escola diz que não a alguma coisa e querem perceber porquê, antes de qualquer outro passo.",
    body: `${HEAD} venho pedir que me seja indicado, por escrito, o fundamento da decisão de [descrever a decisão, ex.: não autorizar a frequência das AEC], comunicada a [data] por [quem/como], incluindo a norma em que se baseia.

Com essa informação, poderemos encontrar em conjunto a melhor solução para o meu educando.

${FOOT}`,
  },
];
