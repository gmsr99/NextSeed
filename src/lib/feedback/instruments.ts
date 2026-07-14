// Definições tipadas dos instrumentos de feedback (FASE 5).
// A copy PT-PT é EXATAMENTE a da spec do cliente — não alterar o texto.
// Regra RGPD (Secção 0.6): campos de texto livre mostram sempre RGPD_NOTE.

import type { InstrumentId } from "@/lib/feedback/submit";

export type QuestionType = "free_text" | "single_choice" | "multi_choice" | "number_eur";

export interface SurveyOption {
  value: string;
  label: string;
}

export interface SurveyQuestion {
  key: string;
  type: QuestionType;
  text: string;
  options?: SurveyOption[];
  /** multi_choice / single_choice: permite uma opção "Outra" com texto livre. */
  allowOther?: boolean;
  otherLabel?: string;
  /** Só mostra a pergunta se a resposta de `questionKey` estiver em `equalsAny`. */
  showIf?: { questionKey: string; equalsAny: string[] };
  /** Instrumento A: dispara alerta à equipa quando esta resposta tem `whenValue`. */
  triggersTeamAlert?: { whenValue: string };
  /** number_eur: só mostra quando a flag de config estiver ativa. */
  gatedByConfig?: string;
  placeholder?: string;
}

export interface Instrument {
  id: Extract<InstrumentId, "A" | "B1" | "B2" | "B3" | "B4" | "B5" | "C">;
  /** Título curto mostrado no topo do survey. */
  title: string;
  /**
   * "corner": cartão leve e não-bloqueante num canto do ecrã, sem tapar o
   * conteúdo por trás — é o que a spec pede para o Instrumento B ("sobreposição
   * leve"). "dialog": modal centrado a ecrã inteiro, para os pulsos A e C, que
   * são mais substanciais e deliberados.
   */
  presentation: "dialog" | "corner";
  questions: SurveyQuestion[];
}

export const RGPD_NOTE = "Evita incluir dados pessoais dos teus filhos nas respostas.";

// Opção sentinela para "Outra" (texto livre) em escolhas.
export const OTHER_VALUE = "__outra__";

// ─── Instrumento A — Pulso de boas-vindas ─────────────────────────────────────
const INSTRUMENT_A: Instrument = {
  id: "A",
  title: "Como correu a tua primeira semana?",
  presentation: "dialog",
  questions: [
    {
      key: "A_Q1",
      type: "free_text",
      text: "O que foi mais confuso ou difícil na primeira semana?",
    },
    {
      key: "A_Q2",
      type: "single_choice",
      text: "Já conseguiste gerar o teu primeiro plano semanal?",
      options: [
        { value: "sim", label: "Sim" },
        { value: "tentei_nao_consegui", label: "Tentei mas não consegui" },
        { value: "ainda_nao_tentei", label: "Ainda não tentei" },
      ],
      triggersTeamAlert: { whenValue: "tentei_nao_consegui" },
    },
    {
      key: "A_Q2_detalhe",
      type: "free_text",
      text: "O que correu mal?",
      showIf: { questionKey: "A_Q2", equalsAny: ["tentei_nao_consegui"] },
    },
    {
      key: "A_Q3",
      type: "free_text",
      text: "Numa palavra ou frase: o que vieste procurar no NexSeed?",
    },
  ],
};

// ─── Instrumento B1 — Após gerar um plano semanal ─────────────────────────────
const INSTRUMENT_B1: Instrument = {
  id: "B1",
  title: "Sobre o plano que acabaste de gerar",
  presentation: "corner",
  questions: [
    {
      key: "B1_Q1",
      type: "single_choice",
      text: "Este plano serve-te tal como está?",
      options: [
        { value: "sim", label: "Sim, uso assim" },
        { value: "ajustar", label: "Vou ajustar algumas coisas" },
        { value: "mudar_tudo", label: "Preciso de mudar quase tudo" },
      ],
    },
    {
      key: "B1_Q2",
      type: "multi_choice",
      text: "O que tens de mudar?",
      showIf: { questionKey: "B1_Q1", equalsAny: ["ajustar", "mudar_tudo"] },
      options: [
        { value: "idade", label: "Atividades não encaixam na idade" },
        { value: "quantidade", label: "Demasiado/pouco para uma semana" },
        { value: "curriculo", label: "Não bate certo com o currículo" },
        { value: "interesses", label: "Não reflete os interesses do meu filho" },
      ],
      allowOther: true,
      otherLabel: "Outra",
    },
    {
      key: "B1_Q3",
      type: "single_choice",
      text: "Quanto tempo achas que este plano te poupou esta semana?",
      options: [
        { value: "nada", label: "Nada" },
        { value: "lt30", label: "<30 min" },
        { value: "30_60", label: "30 min–1h" },
        { value: "1_3h", label: "1–3h" },
        { value: "gt3h", label: "+3h" },
      ],
    },
  ],
};

// ─── Instrumento B2 — Fim da semana do plano ──────────────────────────────────
const INSTRUMENT_B2: Instrument = {
  id: "B2",
  title: "A semana do plano terminou",
  presentation: "corner",
  questions: [
    {
      key: "B2_Q1",
      type: "single_choice",
      text: "A semana passada: quanto do plano chegou a acontecer?",
      options: [
        { value: "quase_tudo", label: "Quase tudo" },
        { value: "metade", label: "Cerca de metade" },
        { value: "pouco", label: "Pouco" },
        { value: "nada", label: "Nada" },
      ],
    },
    {
      key: "B2_Q2",
      type: "single_choice",
      text: "O que aconteceu?",
      showIf: { questionKey: "B2_Q1", equalsAny: ["pouco", "nada"] },
      options: [
        { value: "vida", label: "A vida atravessou-se (normal!)" },
        { value: "irrealista", label: "O plano não era realista" },
        { value: "esqueci", label: "Esqueci-me de o consultar" },
      ],
      allowOther: true,
      otherLabel: "Outra",
    },
  ],
};

// ─── Instrumento B3 — Após gerar portefólio ou relatório ──────────────────────
const INSTRUMENT_B3: Instrument = {
  id: "B3",
  title: "Sobre o documento que geraste",
  presentation: "corner",
  questions: [
    {
      key: "B3_Q1",
      type: "single_choice",
      text: "Este documento serve para entregar à escola de matrícula tal como está?",
      options: [
        { value: "sim", label: "Sim" },
        { value: "pequenos_ajustes", label: "Com pequenos ajustes" },
        { value: "muito_trabalho", label: "Precisa de muito trabalho meu" },
      ],
    },
    {
      key: "B3_Q2",
      type: "free_text",
      text: "Falta-lhe alguma coisa que a tua escola costuma pedir?",
    },
  ],
};

// ─── Instrumento B4 — Após usar ideias IA ─────────────────────────────────────
const INSTRUMENT_B4: Instrument = {
  id: "B4",
  title: "Sobre as ideias que geraste",
  presentation: "corner",
  questions: [
    {
      key: "B4_Q1",
      type: "single_choice",
      text: "As ideias parecem feitas para o teu filho, ou podiam ser para qualquer criança?",
      options: [
        { value: "mesmo", label: "Mesmo para ele(a)" },
        { value: "mais_ou_menos", label: "Mais ou menos" },
        { value: "genericas", label: "Genéricas" },
      ],
    },
    {
      key: "B4_Q2",
      type: "single_choice",
      text: "Usaste (ou vais usar) alguma?",
      options: [
        { value: "sim", label: "Sim" },
        { value: "talvez", label: "Talvez" },
        { value: "nao", label: "Não" },
      ],
    },
  ],
};

// ─── Instrumento B5 — Após publicar na comunidade (DORMENTE) ──────────────────
// A comunidade não está ativa na app; definido para ativação futura.
const INSTRUMENT_B5: Instrument = {
  id: "B5",
  title: "Sobre a tua primeira partilha",
  presentation: "corner",
  questions: [
    {
      key: "B5_Q1",
      type: "single_choice",
      text: "Foi fácil partilhar?",
      options: [
        { value: "sim", label: "Sim" },
        { value: "duvidas", label: "Tive dúvidas pelo caminho" },
      ],
    },
    {
      key: "B5_Q1_detalhe",
      type: "free_text",
      text: "Quais?",
      showIf: { questionKey: "B5_Q1", equalsAny: ["duvidas"] },
    },
  ],
};

// ─── Instrumento C — Pulso mensal ─────────────────────────────────────────────
const INSTRUMENT_C: Instrument = {
  id: "C",
  title: "Um minuto para nos ajudares a melhorar",
  presentation: "dialog",
  questions: [
    {
      key: "C_Q1",
      type: "single_choice",
      text: "Como te sentirias se deixasses de poder usar o NexSeed?",
      options: [
        { value: "muito", label: "Muito desiludida" },
        { value: "pouco", label: "Um pouco desiludida" },
        { value: "indiferente", label: "Indiferente" },
      ],
    },
    {
      key: "C_Q2",
      type: "free_text",
      text: "O que é que o NexSeed faz que mais valorizas hoje?",
    },
    {
      key: "C_Q3",
      type: "free_text",
      text: "Se pudesses acrescentar UMA coisa à app, qual era?",
    },
    {
      key: "C_Q4",
      type: "free_text",
      text: "O que funciona mal ou te irrita?",
    },
    {
      key: "C_Q5",
      type: "single_choice",
      text: "No último mês, o NexSeed tornou a organização do ensino em casa…",
      options: [
        { value: "muito_mais_leve", label: "Muito mais leve" },
        { value: "pouco_mais_leve", label: "Um pouco mais leve" },
        { value: "igual", label: "Igual" },
        { value: "mais_pesada", label: "Mais pesada" },
      ],
    },
    {
      key: "C_Q6",
      type: "single_choice",
      text: "Já recomendaste o NexSeed a outra família?",
      options: [
        { value: "sim", label: "Sim" },
        { value: "ainda_vou", label: "Ainda não, mas vou" },
        { value: "nao", label: "Não" },
      ],
    },
    {
      key: "C_Q6_detalhe",
      type: "free_text",
      text: "O que teria de mudar para recomendares?",
      showIf: { questionKey: "C_Q6", equalsAny: ["nao"] },
    },
    {
      key: "C_Q7",
      type: "number_eur",
      text: "Quando o NexSeed passar a pago, que valor mensal te pareceria justo pelo que ele te dá hoje?",
      gatedByConfig: "pricing_question_active",
    },
  ],
};

export const INSTRUMENTS: Record<Instrument["id"], Instrument> = {
  A: INSTRUMENT_A,
  B1: INSTRUMENT_B1,
  B2: INSTRUMENT_B2,
  B3: INSTRUMENT_B3,
  B4: INSTRUMENT_B4,
  B5: INSTRUMENT_B5,
  C: INSTRUMENT_C,
};

// ─── Instrumento D — Tipos do botão «Conta-nos» ───────────────────────────────
export const FEEDBACK_D_TYPES: SurveyOption[] = [
  { value: "sugestao", label: "Sugestão" },
  { value: "nao_funciona", label: "Algo não funciona" },
  { value: "duvida", label: "Tenho uma dúvida" },
];

export const FEEDBACK_CONFIRMATION =
  "Recebido. É com isto que construímos o NexSeed — obrigado.";
