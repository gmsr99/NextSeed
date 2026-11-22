// Financinhas · gerador da aula (camada 3)
//
// O Gemini devolve a aula em JSON estruturado; é a APP que monta o prompt da
// apresentação (uma linha por slide, PT-PT, ≤ 5000 caracteres) e os textos de
// quiz, atividades, guia do adulto e tracking. O formato e o limite ficam
// garantidos por código, não pelo modelo.
//
// Minimização (doc 04): o pedido leva só o escalão etário, o interesse, a
// situação escrita pelo adulto e o plano do motor. Nunca o nome da criança,
// a data de nascimento nem o histórico.

import {
  BLOCKS, DISCOVERY_MODES, FLOOR_BY_TIER, NOTEBOOK_BY_TIER, PIGGY_BANKS, VICTORIES,
  modeByCode, skillByCode, themeByNumber, trackSession, type Tier,
} from "./catalog.ts";
import type { LessonPlan } from "./engine.ts";

export const NOTEBOOK_PROMPT_LIMIT = 5000;
export type CharacterMode = "generico" | "original";

export const SLIDES_BY_TIER: Record<Tier, number> = { "5-6": 7, "7-8": 13, "9-12": 0 };
const AGE_LABEL: Record<Tier, string> = { "5-6": "5–6 anos", "7-8": "7–8 anos", "9-12": "9–12 anos" };

export interface GenerationContext {
  plan: LessonPlan;
  /** Interesse atual da criança (o universo da história). */
  interest: string;
  /** Situação real da semana, escrita pelo adulto (opcional). */
  situation?: string;
  /** Pedido extra do adulto (opcional). */
  extra?: string;
  /** Incluir o Desafio da Semana. */
  withChallenge?: boolean;
  characterMode: CharacterMode;
}

// ─── Resposta do modelo ─────────────────────────────────────────────────────

export interface GenSlide { title: string; text: string; visual: string }
export interface GenQuiz { question: string; options: string[]; answer: string }
export interface GenActivity { title: string; how: string }
export interface GenObserve { skill_code: string; description: string }
export interface GenCase { situation: string; questions: string[]; counter_example: string; open_question: string }

export interface GeneratedLesson {
  title: string;
  protagonist_look: string;
  universe: string;
  victory: string;
  slides: GenSlide[];
  quiz: GenQuiz[];
  activities: GenActivity[];
  younger_version: string;
  challenge: string;
  adult_before: string;
  adult_opening: string;
  adult_tips: string[];
  case_study: GenCase;
  observe: GenObserve[];
  next_suggestion: string;
}

const S = { type: "STRING" };
const SA = { type: "ARRAY", items: S };

export const LESSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: S,
    protagonist_look: S,
    universe: S,
    victory: S,
    slides: { type: "ARRAY", items: { type: "OBJECT", properties: { title: S, text: S, visual: S }, required: ["title", "text", "visual"] } },
    quiz: { type: "ARRAY", items: { type: "OBJECT", properties: { question: S, options: SA, answer: S }, required: ["question", "options", "answer"] } },
    activities: { type: "ARRAY", items: { type: "OBJECT", properties: { title: S, how: S }, required: ["title", "how"] } },
    younger_version: S,
    challenge: S,
    adult_before: S,
    adult_opening: S,
    adult_tips: SA,
    case_study: {
      type: "OBJECT",
      properties: { situation: S, questions: SA, counter_example: S, open_question: S },
      required: ["situation", "questions", "counter_example", "open_question"],
    },
    observe: { type: "ARRAY", items: { type: "OBJECT", properties: { skill_code: S, description: S }, required: ["skill_code", "description"] } },
    next_suggestion: S,
  },
  required: ["title", "protagonist_look", "universe", "victory", "slides", "quiz", "activities", "younger_version", "challenge", "adult_before", "adult_opening", "adult_tips", "case_study", "observe", "next_suggestion"],
};

// ─── Pedido ao modelo ───────────────────────────────────────────────────────

function lessonTopic(plan: LessonPlan): { title: string; idea: string } {
  if (plan.trackSession) {
    const s = trackSession(plan.trackSession)!;
    return { title: s.title, idea: s.idea };
  }
  const t = themeByNumber(plan.themeNumbers[0]);
  return { title: t?.title ?? "", idea: t?.idea ?? "" };
}

/** Texto do pedido ao Gemini. Exportado para testes e para depuração. */
export function buildGenerationPrompt(ctx: GenerationContext, correction?: string): string {
  const { plan } = ctx;
  const tier = plan.tier;
  const topic = lessonTopic(plan);
  const session = plan.trackSession ? trackSession(plan.trackSession) : null;
  const theme = themeByNumber(plan.themeNumbers[0]);
  const mode = modeByCode(plan.mode) ?? DISCOVERY_MODES[3];
  const prev = plan.previousMode ? modeByCode(plan.previousMode) : null;
  const skillLines = [...plan.skills, ...plan.reinforce]
    .map((c) => skillByCode(c))
    .filter(Boolean)
    .map((s) => `- ${s!.code} · ${s!.name}: ${s!.observable}`)
    .join("\n");
  const allowed = [...plan.skills, ...plan.reinforce].join(", ");
  const nSlides = SLIDES_BY_TIER[tier];
  const young = tier === "5-6";

  const characters = ctx.characterMode === "original"
    ? `Se o interesse for uma personagem ou marca conhecida, usa-a pelo nome verdadeiro e descreve o aspeto com detalhe (cores, formas, atitude), fiel ao original. Proibido "a lembrar", "parecido com", "inspirado em".`
    : `Não uses nomes de marcas, filmes, séries, jogos nem personagens conhecidas, nem no texto nem nos visuais. Transforma o interesse num universo original e genérico (ex.: "carros de corrida" em vez de um carro com nome de filme) e descreve-o com detalhe.`;

  const format = tier === "9-12"
    ? `ESCALÃO 9–12: NÃO há apresentação nem desenhos animados. "slides" vem vazio. Escreve uma FICHA DE CASO em "case_study": situação real com números realistas e aritmética certa; 4 a 6 perguntas por ordem (do facto ao dilema); um contra-exemplo obrigatório (alguém que fez diferente e porquê também pode fazer sentido); e uma pergunta que fica sem resposta. Tom de respeito entre pares, nunca condescendente. A vitória é a sensação de competência e controlo. "quiz" vem vazio (o caso discute-se em conversa).`
    : `APRESENTAÇÃO: exatamente ${nSlides} slides. Arco: Desejo → Conflito → Descoberta → Compreensão → Libertação → Vitória interna. ${young ? "Versão curta: 1 título, 1–2 contexto, 1–2 conflito, 1–2 descoberta, 1 resolução, 1 mensagem." : "Slide 1 título; 2–4 contexto; 5–7 conflito; 8–10 descoberta; 11–12 resolução; 13 mensagem para lembrar (é a grelha típica, a descoberta pode chegar mais cedo ou mais tarde)."} Cada slide: título que descreve a CENA (nunca o método), texto para a criança com 2–4 frases curtas (no máximo 300 caracteres), visual detalhado (no máximo 260 caracteres). "case_study" vem com campos vazios.`;

  const quiz = tier === "5-6"
    ? `QUIZ (5–6): 5 perguntas FALADAS, sem opções ("options" vazio): 3 sobre a história (o que aconteceu, por que ordem, o que a personagem escolheu) e 2 de ligação à vida dela. Em "answer" a resposta esperada, só para o adulto (nas de ligação à vida: "resposta livre").`
    : tier === "7-8"
      ? `QUIZ (7–8): 5 perguntas: 3 de escolha múltipla com 3 opções e 1 certa ("answer" = o texto exato da opção certa) e 2 de reflexão sem resposta certa ("options" vazio, "answer" = "resposta livre").`
      : "";

  const challenge = ctx.withChallenge
    ? `DESAFIO DA SEMANA: inclui em "challenge" um pequeno projeto que vive fora da apresentação e atravessa a semana (pode ligar-se à semanada seguinte).`
    : `DESAFIO DA SEMANA: "challenge" vem vazio, a não ser que o tema peça mesmo um projeto.`;

  const parts = [
    `És o motor pedagógico do Financinhas, um programa de literacia financeira e mentalidade empreendedora para crianças. Escreve uma aula em português de Portugal (nunca do Brasil).`,
    ``,
    `## PRINCÍPIOS (inegociáveis)`,
    `- Ensinar decisões, não finanças. Nunca produtos financeiros, investimentos, juros, bancos, crédito, bolsa nem termos técnicos.`,
    `- O dinheiro é ferramenta, chave, escolha e consequência do valor criado. Nunca medo, culpa, castigo, escassez ou "quem tem mais vale mais".`,
    `- Valor antes do dinheiro. A vitória é sempre interna (compreensão, calma, orgulho, alívio, riso, gratidão, laço), nunca só o objeto comprado. Final sempre positivo.`,
    `- Usamos o dinheiro para coisas boas; nunca compramos o que faz mal a nós ou aos outros.`,
    `- Os quatro mealheiros da criança: ${PIGGY_BANKS.map((p) => `${p.emoji} ${young ? p.nameYoung : p.name}`).join(" · ")}. O 🚀 é comprar os meios para criar valor (materiais, sementes, ingredientes), nunca aplicar dinheiro. ${FLOOR_BY_TIER[tier]} Caderninho em papel: ${NOTEBOOK_BY_TIER[tier]}`,
    `- A semanada nunca é prémio nem castigo.`,
    `- Contas: explícitas e visuais (moedas grandes, somas passo a passo, balança, caderninho). Verifica a aritmética duas vezes, por dois caminhos.${young ? " Aos 5–6 só se contam moedas." : ""}`,
    ``,
    `## ESTA AULA`,
    `- Escalão: ${AGE_LABEL[tier]}.`,
    session
      ? `- Trilho de Iniciação, sessão ${session.number} de 12 · ${session.phase}: "${session.title}". ${session.idea}\n- Para este escalão: ${session.byTier[tier]}\n- Atividade de referência da sessão (usa-a como primeira atividade): ${session.activity}${session.notes?.length ? `\n- Notas obrigatórias: ${session.notes.join(" ")}` : ""}`
      : `- Tema ${theme?.number} (${theme ? BLOCKS[theme.block] : ""}): "${topic.title}". ${topic.idea}${plan.moduleWeek > 1 ? `\n- Módulo: semana ${plan.moduleWeek} de 3, com o mesmo protagonista; a história continua a anterior e a personagem cresce.` : ""}`,
    `- Skills a trabalhar (a primeira é a principal):\n${skillLines}`,
    `- Protagonista (fictício): ${plan.protagonist}. Descreve-lhe um aspeto fixo e simples em "protagonist_look" (cabelo, roupa, um objeto) para ficar igual em todos os slides.`,
    `- Universo (interesse atual da criança): ${ctx.interest.trim() || "livre: escolhe algo do quotidiano de uma criança desta idade"}.`,
    ctx.situation?.trim() ? `- Situação real desta semana (a história é o espelho; nunca copies nomes de pessoas): ${ctx.situation.trim()}` : "",
    ctx.extra?.trim() ? `- Pedido do adulto: ${ctx.extra.trim()}` : "",
    `- Personagens: ${characters}`,
    ``,
    `## DESCOBERTA`,
    `A personagem passa do conflito à compreensão através de: ${mode.how}`,
    prev ? `(Na aula anterior a descoberta foi por "${prev.name}": esta tem de ser claramente diferente.)` : "",
    `Varia também onde cai no arco e quem descobre. NUNCA dês nome ao momento de descoberta dentro da história (nada de "a pausa da campeã", "o truque mágico"): mostra-o por ação e imagem. As ferramentas com nome (o truque da pausa, o semáforo das decisões, as três perguntas) só aparecem nas atividades. Escolhe a vitória entre: ${VICTORIES.join(", ")}; escreve-a em "victory".`,
    ``,
    `## FORMATO`,
    format,
    quiz,
    `ATIVIDADES: 2 atividades curtas para fazer logo a seguir, com materiais que há em casa ("how" com 2–4 frases). "younger_version": ${tier === "5-6" ? "vazio" : "1 versão mais simples para um irmão de 5–6 anos"}.`,
    challenge,
    `GUIA DO ADULTO: "adult_before" (o que preparar, 1–3 frases), "adult_opening" (como abrir a sessão em 1–2 minutos), "adult_tips" (3 a 5 dicas: fazer UMA boa pergunta em vez de dar a conclusão, não comparar em voz alta a personagem com a criança, celebrar a decisão e não a poupança).`,
    `O QUE OBSERVAR: 2 a 3 sinais em "observe": "skill_code" só entre ${allowed}, e "description" com um comportamento concreto que o adulto pode ver nos próximos dias (ex.: "antes de pedir, diz sozinha se é preciso ou apetece").`,
    `"next_suggestion": uma frase com a skill ou o tema candidato para a próxima aula.`,
    ``,
    `Nunca escrevas códigos internos (MD1, MD2…) em nenhum texto.`,
    correction ? `\n## CORREÇÃO PEDIDA\n${correction}` : "",
    ``,
    `Devolve APENAS o objeto JSON pedido.`,
  ];
  return parts.filter((p) => p !== "").join("\n");
}

// ─── Leitura e validação ────────────────────────────────────────────────────

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const arr = <T>(v: unknown, map: (x: unknown) => T): T[] => (Array.isArray(v) ? v.map(map) : []);

export function parseGenerated(text: string): GeneratedLesson {
  const raw = JSON.parse(text) as Record<string, unknown>;
  const cs = (raw.case_study ?? {}) as Record<string, unknown>;
  return {
    title: str(raw.title),
    protagonist_look: str(raw.protagonist_look),
    universe: str(raw.universe),
    victory: str(raw.victory),
    slides: arr(raw.slides, (s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      return { title: str(o.title), text: str(o.text), visual: str(o.visual) };
    }).filter((s) => s.title || s.text),
    quiz: arr(raw.quiz, (q) => {
      const o = (q ?? {}) as Record<string, unknown>;
      return { question: str(o.question), options: arr(o.options, str).filter(Boolean), answer: str(o.answer) };
    }).filter((q) => q.question),
    activities: arr(raw.activities, (a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      return { title: str(o.title), how: str(o.how) };
    }).filter((a) => a.title || a.how),
    younger_version: str(raw.younger_version),
    challenge: str(raw.challenge),
    adult_before: str(raw.adult_before),
    adult_opening: str(raw.adult_opening),
    adult_tips: arr(raw.adult_tips, str).filter(Boolean),
    case_study: {
      situation: str(cs.situation),
      questions: arr(cs.questions, str).filter(Boolean),
      counter_example: str(cs.counter_example),
      open_question: str(cs.open_question),
    },
    observe: arr(raw.observe, (o) => {
      const x = (o ?? {}) as Record<string, unknown>;
      return { skill_code: str(x.skill_code).toUpperCase(), description: str(x.description) };
    }).filter((o) => o.description),
    next_suggestion: str(raw.next_suggestion),
  };
}

/** Palavras que não podem aparecer no que a criança vê (FIN_SIS_01). */
const FORBIDDEN = /\b(juros?|empr[ée]stimos?|cr[ée]dito|bolsa de valores|a[cç][õo]es da|criptomoedas?|investimentos?|d[íi]vidas?)\b/i;

/** Problemas que obrigam a pedir outra vez ao modelo (vazio = está bem). */
export function validateGenerated(g: GeneratedLesson, plan: LessonPlan, strict = true): string[] {
  const problems: string[] = [];
  const n = SLIDES_BY_TIER[plan.tier];
  if (!g.title) problems.push("Falta o título.");
  if (plan.tier === "9-12") {
    if (!g.case_study.situation || g.case_study.questions.length < 3) problems.push("A ficha de caso tem de ter a situação e pelo menos 3 perguntas.");
    if (!g.case_study.counter_example) problems.push("Falta o contra-exemplo obrigatório da ficha de caso.");
  } else {
    const ok = strict ? g.slides.length === n : Math.abs(g.slides.length - n) <= 2;
    if (!ok) problems.push(`A apresentação tem de ter exatamente ${n} slides (veio com ${g.slides.length}).`);
    if (g.quiz.length < 5 && strict) problems.push(`O quiz tem de ter 5 perguntas (veio com ${g.quiz.length}).`);
  }
  if (!g.activities.length) problems.push("Faltam as atividades.");
  const childText = [g.title, ...g.slides.flatMap((s) => [s.title, s.text]), ...g.quiz.map((q) => q.question), g.case_study.situation].join(" ");
  const bad = childText.match(FORBIDDEN);
  if (bad) problems.push(`Aparece um termo proibido ("${bad[0]}"): reescreve sem produtos financeiros nem termos técnicos.`);
  if (/\bMD\s?[1-8]\b/.test(childText)) problems.push("Aparece um código interno (MD…) no texto.");
  return problems;
}

// ─── Prompt da apresentação (montado pela app) ──────────────────────────────

function cut(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const sentence = slice.lastIndexOf(". ");
  if (sentence > max * 0.6) return slice.slice(0, sentence + 1);
  const space = slice.lastIndexOf(" ");
  return (space > 0 ? slice.slice(0, space) : slice).replace(/[,;:]$/, "") + ".";
}

const clean = (s: string) => s.replace(/\|/g, "/").replace(/\bMD\s?[1-8]\b/g, "").replace(/\s+/g, " ").trim();

function notebookHeader(g: GeneratedLesson, plan: LessonPlan, topic: string, mode: CharacterMode, n: number): string {
  const characters = mode === "original"
    ? "Quando aparecer uma personagem conhecida, desenha-a fiel ao original: usa o nome real e reproduz o aspeto exato (cores, formas, proporções, atitude). Não uses versões alternativas nem genéricas."
    : "Usa só personagens e cenários originais: sem marcas, sem personagens conhecidas e sem logótipos.";
  return [
    "Escreve TODA a apresentação em português de Portugal.",
    `Cria uma apresentação de ${n} slides para crianças de ${AGE_LABEL[plan.tier]} sobre "${topic}".`,
    "Linguagem simples, calorosa e positiva; sem termos financeiros técnicos. O dinheiro é sempre oportunidade, escolha e propósito, nunca medo ou culpa. Se houver contas, mostra-as com moedas grandes, somas passo a passo, balança e caderninho. Termina com vitória interna e mensagem positiva.",
    characters,
    g.protagonist_look ? `Protagonista: ${plan.protagonist}, ${clean(g.protagonist_look)}. Mantém o mesmo aspeto em todos os slides.` : `Protagonista: ${plan.protagonist}. Mantém o mesmo aspeto em todos os slides.`,
    "Cada slide tem: Título, Texto para a criança (2–4 frases) e Sugestão visual detalhada.",
  ].join("\n");
}

const FOOTER = "LEMBRETE FINAL: escreve tudo em português de Portugal.";

export interface NotebookPrompt { text: string; length: number; trimmed: boolean }

/**
 * Monta o prompt para o Gemini Notebook / NotebookLM. Se passar dos 5000
 * caracteres, encurta primeiro as sugestões visuais e depois os textos, sem
 * nunca tirar slides. Devolve null se nem assim couber.
 */
export function buildNotebookPrompt(g: GeneratedLesson, plan: LessonPlan, mode: CharacterMode): NotebookPrompt | null {
  if (!g.slides.length) return null;
  const topic = g.title || lessonTopic(plan).title;
  const header = notebookHeader(g, plan, topic, mode, g.slides.length);
  const render = (maxText: number, maxVisual: number) =>
    [
      header,
      "",
      ...g.slides.map((s, i) =>
        `${i + 1}. Título: "${clean(s.title).replace(/"/g, "'")}" | Texto: ${cut(clean(s.text), maxText)} | Visual: ${cut(clean(s.visual), maxVisual)}`),
      "",
      FOOTER,
    ].join("\n");

  let text = render(10_000, 10_000);
  if (text.length <= NOTEBOOK_PROMPT_LIMIT) return { text, length: text.length, trimmed: false };
  for (let v = 300; v >= 60; v -= 20) {
    text = render(10_000, v);
    if (text.length <= NOTEBOOK_PROMPT_LIMIT) return { text, length: text.length, trimmed: true };
  }
  for (let t = 320; t >= 100; t -= 20) {
    text = render(t, 60);
    if (text.length <= NOTEBOOK_PROMPT_LIMIT) return { text, length: text.length, trimmed: true };
  }
  return null;
}

// ─── Textos da aula (o que o adulto lê) ─────────────────────────────────────

export function quizMarkdown(g: GeneratedLesson, tier: Tier): string {
  if (tier === "9-12") return "";
  if (tier === "5-6") {
    return [
      "Perguntas faladas, em voz alta. Se não souber, conta outra vez essa parte e volta a perguntar: não é avaliação.",
      "",
      ...g.quiz.map((q, i) => `${i + 1}. ${q.question}${q.answer ? ` _(${q.answer})_` : ""}`),
    ].join("\n");
  }
  return g.quiz
    .map((q, i) => {
      if (!q.options.length) return `${i + 1}. ${q.question} _(reflexão, sem resposta certa)_`;
      const opts = q.options.map((o, j) => `   ${"abc"[j] ?? "-"}) ${o}${o === q.answer ? " ✓" : ""}`).join("\n");
      return `${i + 1}. ${q.question}\n${opts}`;
    })
    .join("\n");
}

export function activitiesMarkdown(g: GeneratedLesson): string {
  const out = g.activities.map((a, i) => `**${i + 1}. ${a.title}**\n${a.how}`);
  if (g.younger_version) out.push(`**Versão para os mais novos (5–6)**\n${g.younger_version}`);
  return out.join("\n\n");
}

export function caseMarkdown(g: GeneratedLesson): string {
  const c = g.case_study;
  if (!c.situation) return "";
  return [
    `**A situação**\n${c.situation}`,
    `**Perguntas, por esta ordem**\n${c.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`,
    `**Contra-exemplo**\n${c.counter_example}`,
    c.open_question ? `**A pergunta que fica sem resposta**\n${c.open_question}` : "",
  ].filter(Boolean).join("\n\n");
}

export const ADULT_ALWAYS = [
  "Deixa-a chegar lá sozinha, mesmo que demore e mesmo que erre.",
  "Faz uma boa pergunta em vez de dar a conclusão.",
  "Celebra a decisão, não a poupança (\"gostei de te ver pensar nisso\").",
  "Nunca uses a semanada como prémio ou castigo, nem a espera como punição.",
];

export function adultGuideMarkdown(g: GeneratedLesson, plan: LessonPlan): string {
  const session = plan.trackSession ? trackSession(plan.trackSession) : null;
  return [
    g.adult_before ? `**Antes da sessão**\n${g.adult_before}` : "",
    session?.notes?.length ? `**Desta sessão do trilho**\n${session.notes.map((n) => `- ${n}`).join("\n")}` : "",
    g.adult_opening ? `**Abertura (1–2 min)**\n${g.adult_opening}` : "",
    `**Durante e depois**\n${[...g.adult_tips, ...ADULT_ALWAYS].map((t) => `- ${t}`).join("\n")}`,
  ].filter(Boolean).join("\n\n");
}

export function trackingMarkdown(g: GeneratedLesson, plan: LessonPlan, date: string, interest: string): string {
  const mode = modeByCode(plan.mode);
  const prev = plan.previousMode ? modeByCode(plan.previousMode) : null;
  return [
    `DATA: ${date}`,
    `TEMA / INTERESSE: ${plan.trackSession ? `Trilho S${plan.trackSession}` : `Tema ${plan.themeNumbers.join(" + ")}`} · ${interest || g.universe || "—"}`,
    `MODO DE DESCOBERTA: ${plan.mode} ${mode?.name ?? ""} (anterior: ${prev ? `${prev.code} ${prev.name}` : "—"})`,
    `SKILLS TRABALHADAS: ${[...plan.skills, ...plan.reinforce].join(", ")}`,
    `VITÓRIA: ${g.victory || "—"}`,
    `O QUE OBSERVAR NA CRIANÇA: ${g.observe.map((o) => `${o.skill_code} — ${o.description}`).join(" · ") || "—"}`,
    `SUGESTÃO PARA A PRÓXIMA: ${g.next_suggestion || "—"}`,
  ].join("\n");
}

/** O que observar, só com skills desta aula (o resto descarta-se). */
export function observeSignals(g: GeneratedLesson, plan: LessonPlan): GenObserve[] {
  const allowed = new Set([...plan.skills, ...plan.reinforce]);
  const seen = new Set<string>();
  return g.observe
    .filter((o) => allowed.has(o.skill_code))
    .filter((o) => {
      const k = `${o.skill_code}|${o.description}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 4);
}

export interface AssembledLesson {
  title: string;
  universe: string;
  notebook_prompt: string | null;
  notebook_prompt_length: number;
  quiz_md: string;
  activities_md: string;
  challenge_md: string;
  adult_guide_md: string;
  tracking_md: string;
  content_md: string;
  signals: GenObserve[];
  trimmed: boolean;
}

export function assembleLesson(g: GeneratedLesson, ctx: GenerationContext, date: string): AssembledLesson {
  const { plan } = ctx;
  const nb = buildNotebookPrompt(g, plan, ctx.characterMode);
  const quiz = quizMarkdown(g, plan.tier);
  const acts = activitiesMarkdown(g);
  const guide = adultGuideMarkdown(g, plan);
  const tracking = trackingMarkdown(g, plan, date, ctx.interest);
  const caseMd = caseMarkdown(g);
  const signals = observeSignals(g, plan);
  const topic = plan.trackSession ? `Trilho S${plan.trackSession} · ${trackSession(plan.trackSession)?.title}` : `Tema ${plan.themeNumbers.join(" + ")} · ${themeByNumber(plan.themeNumbers[0])?.title ?? ""}`;
  const mode = modeByCode(plan.mode);

  const content = [
    `# ${g.title}`,
    "",
    `> ${topic}`,
    `> Protagonista: ${plan.protagonist}${plan.moduleWeek > 1 ? ` (módulo, semana ${plan.moduleWeek} de 3)` : ""}`,
    `> Skills-alvo: ${plan.skills.join(" + ")}${plan.reinforce.length ? ` · reforço: ${plan.reinforce.join(", ")}` : ""}`,
    `> Modo de descoberta: ${plan.mode} ${mode?.name ?? ""} (anterior: ${plan.previousMode ?? "—"})`,
    `> Vitória: ${g.victory || "—"}`,
    "",
    nb ? `## A · Prompt da apresentação (${nb.length} caracteres)\n\n${nb.text}` : "",
    caseMd ? `## A · Ficha de caso\n\n${caseMd}` : "",
    quiz ? `## B · Quiz\n\n${quiz}` : "",
    `## C · Atividades\n\n${acts}`,
    g.challenge ? `## D · Desafio da Semana\n\n${g.challenge}` : "",
    `## E · Guia do adulto\n\n${guide}`,
    `## F · Tracking\n\n${tracking}`,
  ].filter(Boolean).join("\n\n");

  return {
    title: g.title,
    universe: g.universe,
    notebook_prompt: nb?.text ?? null,
    notebook_prompt_length: nb?.length ?? 0,
    quiz_md: plan.tier === "9-12" ? caseMd : quiz,
    activities_md: acts,
    challenge_md: g.challenge,
    adult_guide_md: guide,
    tracking_md: tracking,
    content_md: content,
    signals,
    trimmed: nb?.trimmed ?? false,
  };
}

// ─── Ciclo completo: pedir, validar, repetir uma vez ───────────────────────

/** Função que envia o pedido ao proxy do Gemini e devolve o texto da resposta. */
export type InvokeModel = (prompt: string, schema: object) => Promise<string>;

export async function generateLesson(ctx: GenerationContext, invoke: InvokeModel, date: string): Promise<AssembledLesson> {
  let correction: string | undefined;
  let lastProblem = "erro desconhecido";
  for (let attempt = 0; attempt < 3; attempt++) {
    const strict = attempt < 2;
    let g: GeneratedLesson;
    try {
      g = parseGenerated(await invoke(buildGenerationPrompt(ctx, correction), LESSON_SCHEMA));
    } catch (e) {
      lastProblem = e instanceof SyntaxError ? "a resposta não veio em JSON válido" : String((e as Error)?.message ?? e);
      correction = undefined;
      continue;
    }
    const problems = validateGenerated(g, ctx.plan, strict);
    const assembled = problems.length ? null : assembleLesson(g, ctx, date);
    if (assembled && (ctx.plan.tier === "9-12" || assembled.notebook_prompt)) return assembled;
    if (assembled && !assembled.notebook_prompt) problems.push(`O prompt da apresentação passa dos ${NOTEBOOK_PROMPT_LIMIT} caracteres mesmo encurtado: escreve textos e visuais mais curtos, sem tirar slides.`);
    lastProblem = problems.join(" ");
    correction = problems.join("\n");
  }
  throw new Error(`Não foi possível gerar a aula: ${lastProblem}`);
}
