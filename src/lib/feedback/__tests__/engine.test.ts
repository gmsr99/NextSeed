import { describe, it, expect } from "vitest";
import {
  shouldShowB1,
  shouldShowB3,
  shouldShowB4,
  isWelcomePulseDue,
  isMonthlyPulseDue,
  isB2Due,
  pickAppOpenSurvey,
  isQuestionVisible,
  nextQuestion,
} from "@/lib/feedback/engine";
import { INSTRUMENTS } from "@/lib/feedback/instruments";

const NOW = new Date("2026-07-14T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (n: number) => new Date(NOW.getTime() - n * 60 * 60 * 1000).toISOString();

describe("cadências B1/B3/B4", () => {
  it("B1 dispara em 1, 3, 8, 13, 18", () => {
    const fire = [1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 18, 23].filter(shouldShowB1);
    expect(fire).toEqual([1, 3, 8, 13, 18, 23]);
  });

  it("B3 dispara em todas as gerações", () => {
    expect([1, 2, 3].every(shouldShowB3)).toBe(true);
    expect(shouldShowB3(0)).toBe(false);
  });

  it("B4 dispara em 3, 13, 23", () => {
    const fire = [1, 2, 3, 4, 12, 13, 14, 22, 23].filter(shouldShowB4);
    expect(fire).toEqual([3, 13, 23]);
  });
});

describe("isWelcomePulseDue (Instrumento A)", () => {
  it("não dispara antes das 168h", () => {
    expect(isWelcomePulseDue(hoursAgo(167), NOW)).toBe(false);
  });
  it("dispara às 169h", () => {
    expect(isWelcomePulseDue(hoursAgo(169), NOW)).toBe(true);
  });
  it("não dispara se já consumido", () => {
    expect(isWelcomePulseDue(hoursAgo(200), NOW, { consumed: true })).toBe(false);
  });
  it("não dispara sem data de registo", () => {
    expect(isWelcomePulseDue(null, NOW)).toBe(false);
  });
});

describe("isMonthlyPulseDue (Instrumento C)", () => {
  it("não dispara no 1.º mês", () => {
    expect(isMonthlyPulseDue(daysAgo(29), NOW)).toBe(false);
  });
  it("dispara a partir do 2.º mês", () => {
    expect(isMonthlyPulseDue(daysAgo(31), NOW)).toBe(true);
  });
  it("não repete dentro de 30 dias do último", () => {
    expect(isMonthlyPulseDue(daysAgo(90), NOW, { last_shown_at: daysAgo(10) })).toBe(false);
  });
  it("repete após 30 dias do último", () => {
    expect(isMonthlyPulseDue(daysAgo(90), NOW, { last_shown_at: daysAgo(31) })).toBe(true);
  });
});

describe("isB2Due", () => {
  it("dispara quando scheduled_for já passou", () => {
    expect(isB2Due({ scheduled_for: hoursAgo(1) }, NOW)).toBe(true);
  });
  it("não dispara no futuro", () => {
    expect(isB2Due({ scheduled_for: hoursAgo(-1) }, NOW)).toBe(false);
  });
  it("não dispara sem agendamento", () => {
    expect(isB2Due(undefined, NOW)).toBe(false);
    expect(isB2Due({ scheduled_for: null }, NOW)).toBe(false);
  });
});

describe("pickAppOpenSurvey (prioridade A > B2 > C)", () => {
  it("A tem prioridade sobre B2", () => {
    const r = pickAppOpenSurvey({
      registeredAt: hoursAgo(200),
      now: NOW,
      states: { B2: { scheduled_for: hoursAgo(1) } },
      monthlyEnabled: true,
    });
    expect(r).toBe("A");
  });

  it("B2 quando A já consumido", () => {
    const r = pickAppOpenSurvey({
      registeredAt: hoursAgo(200),
      now: NOW,
      states: { A: { consumed: true }, B2: { scheduled_for: hoursAgo(1) } },
      monthlyEnabled: true,
    });
    expect(r).toBe("B2");
  });

  it("C só quando ativado e A/B2 fora", () => {
    const base = {
      registeredAt: daysAgo(40),
      now: NOW,
      states: { A: { consumed: true } },
    };
    expect(pickAppOpenSurvey({ ...base, monthlyEnabled: false })).toBeNull();
    expect(pickAppOpenSurvey({ ...base, monthlyEnabled: true })).toBe("C");
  });

  it("nada quando nenhum é devido", () => {
    const r = pickAppOpenSurvey({
      registeredAt: hoursAgo(10),
      now: NOW,
      states: {},
      monthlyEnabled: true,
    });
    expect(r).toBeNull();
  });
});

describe("visibilidade e navegação de perguntas", () => {
  it("esconde follow-up condicional até a condição bater", () => {
    const b1 = INSTRUMENTS.B1;
    const q2 = b1.questions.find((q) => q.key === "B1_Q2")!;
    expect(isQuestionVisible(q2, { B1_Q1: "sim" }, new Set())).toBe(false);
    expect(isQuestionVisible(q2, { B1_Q1: "ajustar" }, new Set())).toBe(true);
  });

  it("nextQuestion salta o follow-up quando não aplicável (B1_Q1=sim)", () => {
    const b1 = INSTRUMENTS.B1;
    const answers = { B1_Q1: "sim" };
    const visited = new Set(["B1_Q1"]);
    expect(nextQuestion(b1, answers, visited)?.key).toBe("B1_Q3");
  });

  it("nextQuestion inclui o follow-up quando aplicável (B1_Q1=ajustar)", () => {
    const b1 = INSTRUMENTS.B1;
    const answers = { B1_Q1: "ajustar" };
    const visited = new Set(["B1_Q1"]);
    expect(nextQuestion(b1, answers, visited)?.key).toBe("B1_Q2");
  });

  it("C_Q7 (pricing) escondido sem a flag ativa", () => {
    const c = INSTRUMENTS.C;
    const q7 = c.questions.find((q) => q.key === "C_Q7")!;
    expect(isQuestionVisible(q7, {}, new Set())).toBe(false);
    expect(isQuestionVisible(q7, {}, new Set(["pricing_question_active"]))).toBe(true);
  });

  it("nextQuestion devolve null no fim", () => {
    const b4 = INSTRUMENTS.B4;
    const visited = new Set(["B4_Q1", "B4_Q2"]);
    expect(nextQuestion(b4, { B4_Q1: "mesmo", B4_Q2: "sim" }, visited)).toBeNull();
  });
});
