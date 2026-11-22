import { describe, it, expect } from "vitest";
import { MODE_CODES, SKILLS, THEMES, TRACK_SESSIONS, SKILL_CODES } from "../financinhas/catalog.ts";
import {
  ageOn, nextTrackSessionNumber, normalizeMode, pickMode, pickProtagonist, planNextLesson,
  prioritizeSkills, suggestedAllowanceCents, themeForSkill, tierForAge, type EngineLesson,
} from "../financinhas/engine.ts";
import { currentLevels, levelAfterConfirm, nextTarget } from "../financinhas/levels.ts";
import {
  assembleLesson, buildGenerationPrompt, buildNotebookPrompt, generateLesson, NOTEBOOK_PROMPT_LIMIT,
  parseGenerated, validateGenerated, type GeneratedLesson, type GenerationContext,
} from "../financinhas/generator.ts";
import { ritualSignals, weekStart } from "../financinhas/ritual.ts";
import { parseImport, planImport, toSession, toSkills, toThemes } from "../financinhas/importer.ts";

let seq = 0;
function lesson(p: Partial<EngineLesson> = {}): EngineLesson {
  seq++;
  return {
    id: `l${seq}`, status: "dada", given_on: "2026-10-01", created_at: `2026-10-01T10:00:${String(seq % 60).padStart(2, "0")}Z`,
    track_session: null, theme_numbers: [], skill_codes: [], discovery_mode: null, protagonist: null, module_week: 1, ...p,
  };
}

function fakeGenerated(nSlides: number, p: Partial<GeneratedLesson> = {}): GeneratedLesson {
  return {
    title: "A Grande Banca da Inês", protagonist_look: "cabelo castanho apanhado, camisola amarela", universe: "dinossauros", victory: "orgulho",
    slides: Array.from({ length: nSlides }, (_, i) => ({ title: `Cena ${i + 1}`, text: "A Inês olha para as moedas. Conta uma a uma. Sorri.", visual: "Menina de camisola amarela junto a quatro frascos transparentes, luz da manhã." })),
    quiz: Array.from({ length: 5 }, (_, i) => ({ question: `Pergunta ${i + 1}?`, options: i < 3 ? ["um", "dois", "três"] : [], answer: i < 3 ? "dois" : "resposta livre" })),
    activities: [{ title: "Dois cestos", how: "Arrumar objetos." }, { title: "Em voz alta", how: "Dizer antes de pedir." }],
    younger_version: "", challenge: "", adult_before: "Preparar os frascos.", adult_opening: "Perguntar pelas moedas.", adult_tips: ["Uma pergunta só."],
    case_study: { situation: "", questions: [], counter_example: "", open_question: "" },
    observe: [{ skill_code: "DC2", description: "Diz sozinha se é preciso ou apetece." }, { skill_code: "XX9", description: "inválido" }],
    next_suggestion: "DC3", ...p,
  };
}

describe("catálogo", () => {
  it("tem 26 competências, 23 temas, 12 sessões e 8 modos", () => {
    expect(SKILLS.length).toBe(26);
    expect(THEMES.length).toBe(23);
    expect(TRACK_SESSIONS.length).toBe(12);
    expect(MODE_CODES.length).toBe(8);
  });
  it("todas as skills dos temas e do trilho existem", () => {
    for (const t of THEMES) for (const s of t.skills) expect(SKILL_CODES).toContain(s);
    for (const s of TRACK_SESSIONS) for (const k of s.skills) expect(SKILL_CODES).toContain(k);
  });
  it("todas as skills têm pelo menos um tema (o ciclo consegue escolher qualquer uma)", () => {
    for (const s of SKILL_CODES) expect(THEMES.some((t) => t.skills.includes(s))).toBe(true);
  });
  it("rotação do trilho: nunca o mesmo modo duas sessões seguidas e os 8 aparecem", () => {
    const modes = TRACK_SESSIONS.map((s) => s.mode);
    for (let i = 1; i < modes.length; i++) expect(modes[i]).not.toBe(modes[i - 1]);
    expect(new Set(modes).size).toBe(8);
  });
  it("trilho v6: S2 semanada, S3 preciso ou apetece-me", () => {
    expect(TRACK_SESSIONS[1].themes).toEqual([2]);
    expect(TRACK_SESSIONS[2].skills).toEqual(["DC2"]);
  });
});

describe("idade, escalão e semanada", () => {
  it("calcula a idade no dia", () => {
    expect(ageOn("2019-11-23", "2026-11-22")).toBe(6);
    expect(ageOn("2019-11-22", "2026-11-22")).toBe(7);
  });
  it("três escalões, fora dos 5–12 não há", () => {
    expect(tierForAge(4)).toBeNull();
    expect(tierForAge(5)).toBe("5-6");
    expect(tierForAge(8)).toBe("7-8");
    expect(tierForAge(12)).toBe("9-12");
    expect(tierForAge(13)).toBeNull();
  });
  it("semanada de referência = metade da idade", () => {
    expect(suggestedAllowanceCents(7)).toBe(350);
    expect(suggestedAllowanceCents(10)).toBe(500);
  });
});

describe("níveis: só sobem por observação", () => {
  it("uma observação abaixo do nível atual não o faz descer", () => {
    const lv = currentLevels([
      { skill_code: "DC1", level: 3, origin: "fotografia", observed_on: "2026-06-21" },
      { skill_code: "DC1", level: 2, origin: "observacao", observed_on: "2026-07-01" },
    ]);
    expect(lv.DC1).toBe(3);
  });
  it("uma observação acima sobe", () => {
    const lv = currentLevels([
      { skill_code: "GP5", level: 2, origin: "fotografia", observed_on: "2026-06-21" },
      { skill_code: "GP5", level: 3, origin: "observacao", observed_on: "2026-07-01" },
    ]);
    expect(lv.GP5).toBe(3);
  });
  it("o ajuste manual do adulto pode corrigir para baixo", () => {
    const lv = currentLevels([
      { skill_code: "AD1", level: 3, origin: "observacao", observed_on: "2026-07-01" },
      { skill_code: "AD1", level: 2, origin: "ajuste", observed_on: "2026-08-01" },
    ]);
    expect(lv.AD1).toBe(2);
  });
  it("alvo do sinal e confirmação", () => {
    expect(nextTarget(undefined)).toBe(2);
    expect(nextTarget(4)).toBe(4);
    expect(levelAfterConfirm(3, 2)).toBe(3);
  });
});

describe("modo de descoberta", () => {
  it("lê o código de campos livres", () => {
    expect(normalizeMode("MD1 (+MD3 no remate)")).toBe("MD1");
    expect(normalizeMode("md 6 imprevisto")).toBe("MD6");
    expect(normalizeMode("—")).toBeNull();
  });
  it("nunca repete o da aula anterior e evita os das últimas 3", () => {
    const lessons = [
      lesson({ given_on: "2026-10-11", discovery_mode: "MD6" }),
      lesson({ given_on: "2026-10-05", discovery_mode: "MD2" }),
      lesson({ given_on: "2026-09-20", discovery_mode: "MD4" }),
    ];
    const { mode, previous } = pickMode({ lessons, skills: ["CS1"] });
    expect(previous).toBe("MD6");
    expect(["MD6", "MD2", "MD4", "MD1"]).not.toContain(mode);
  });
  it("MD1 só quando a aula é de contas", () => {
    expect(pickMode({ lessons: [], skills: ["RH1"] }).mode).not.toBe("MD1");
    expect(pickMode({ lessons: [], skills: ["GP5"] }).mode).toBe("MD1");
  });
  it("o modo previsto do trilho cede se for igual ao anterior", () => {
    const lessons = [lesson({ discovery_mode: "MD4" })];
    expect(pickMode({ lessons, skills: ["DC2"], preferred: "MD4" }).mode).not.toBe("MD4");
  });
});

describe("protagonista", () => {
  it("não repete os recentes nem os dos irmãos", () => {
    const lessons = [lesson({ protagonist: "Dinis" }), lesson({ protagonist: "Sofia" })];
    const siblingLessons = [lesson({ protagonist: "Miguel", given_on: "2026-11-20" })];
    const p = pickProtagonist({ today: "2026-11-22", lessons, siblingLessons });
    expect(["Dinis", "Sofia", "Miguel"]).not.toContain(p);
  });
  it("irmão com aula por dar também bloqueia", () => {
    const p = pickProtagonist({ today: "2026-11-22", lessons: [], siblingLessons: [lesson({ status: "por_dar", protagonist: "Dinis" })] });
    expect(p).not.toBe("Dinis");
  });
});

describe("trilho", () => {
  it("começa na S1 e nunca salta sessões", () => {
    expect(nextTrackSessionNumber([])).toBe(1);
    expect(nextTrackSessionNumber([lesson({ track_session: 1 }), lesson({ track_session: 3 })])).toBe(2);
  });
  it("propõe a sessão seguinte com o modo pré-atribuído", () => {
    const plan = planNextLesson({ today: "2026-11-22", tier: "5-6", stage: "trilho", levels: {}, lessons: [lesson({ track_session: 1, discovery_mode: "MD7" })] });
    expect(plan.trackSession).toBe(2);
    expect(plan.mode).toBe("MD1");
    expect(plan.skills).toEqual(["GP1", "GP5"]);
  });
  it("aula por dar do trilho é reaproveitada em vez de gerar outra", () => {
    const pending = lesson({ status: "por_dar", track_session: 3, discovery_mode: "MD4", protagonist: "Inês" });
    const plan = planNextLesson({ today: "2026-11-22", tier: "5-6", stage: "trilho", levels: {}, lessons: [lesson({ track_session: 1 }), lesson({ track_session: 2 }), pending] });
    expect(plan.existingLessonId).toBe(pending.id);
    expect(plan.protagonist).toBe("Inês");
  });
  it("com várias por dar (importadas), propõe a de sessão mais baixa", () => {
    const s4 = lesson({ status: "por_dar", given_on: null, track_session: 4 });
    const s2 = lesson({ status: "por_dar", given_on: null, track_session: 2 });
    const plan = planNextLesson({ today: "2026-11-22", tier: "5-6", stage: "trilho", levels: {}, lessons: [lesson({ track_session: 1 }), s4, s2] });
    expect(plan.existingLessonId).toBe(s2.id);
    expect(plan.trackSession).toBe(2);
  });
  it("trilho completo propõe o ciclo e assinala a saída", () => {
    const lessons = TRACK_SESSIONS.map((s) => lesson({ track_session: s.number, discovery_mode: s.mode }));
    const plan = planNextLesson({ today: "2026-11-22", tier: "7-8", stage: "trilho", levels: {}, lessons });
    expect(plan.trackComplete).toBe(true);
    expect(plan.kind).toBe("ciclo");
  });
});

describe("ciclo adaptativo", () => {
  it("escolhe a skill de nível mais baixo e o tema onde é principal", () => {
    const levels = Object.fromEntries(SKILL_CODES.map((c) => [c, 3]));
    levels.CS1 = 1;
    const plan = planNextLesson({ today: "2026-11-22", tier: "7-8", stage: "ciclo", levels, lessons: [] });
    expect(plan.skills[0]).toBe("CS1");
    expect(plan.themeNumbers).toEqual([10]);
  });
  it("aceita forçar uma skill", () => {
    const plan = planNextLesson({ today: "2026-11-22", tier: "7-8", stage: "ciclo", levels: {}, lessons: [], focusSkill: "VL4" });
    expect(plan.skills[0]).toBe("VL4");
    expect(plan.themeNumbers).toEqual([17]);
  });
  it("continua o módulo até 3 semanas com o mesmo protagonista e outro modo", () => {
    const last = lesson({ theme_numbers: [13], skill_codes: ["VL1", "VL2"], protagonist: "Tomé", discovery_mode: "MD8", module_week: 2 });
    const plan = planNextLesson({ today: "2026-11-22", tier: "7-8", stage: "ciclo", levels: {}, lessons: [last], continueModule: true });
    expect(plan.moduleWeek).toBe(3);
    expect(plan.protagonist).toBe("Tomé");
    expect(plan.mode).not.toBe("MD8");
    const after = planNextLesson({ today: "2026-11-22", tier: "7-8", stage: "ciclo", levels: {}, lessons: [{ ...last, module_week: 3 }], continueModule: true });
    expect(after.moduleWeek).toBe(1);
  });
  it("prioridade: sem avaliação fica entre o 1 e o 3", () => {
    const levels = Object.fromEntries(SKILL_CODES.map((c) => [c, 3]));
    levels.AD1 = 1;
    delete levels.RH3;
    const order = prioritizeSkills(levels, []);
    expect(order[0]).toBe("AD1");
    expect(order[1]).toBe("RH3");
  });
  it("o tema menos usado ganha quando a skill aparece em vários", () => {
    const t = themeForSkill("GP4", [lesson({ theme_numbers: [21] })]);
    expect(t?.number).toBe(22);
  });
});

const baseCtx = (tier: "5-6" | "7-8" | "9-12" = "7-8", characterMode: "generico" | "original" = "generico"): GenerationContext => ({
  plan: planNextLesson({ today: "2026-11-22", tier, stage: "trilho", levels: {}, lessons: [lesson({ track_session: 1 }), lesson({ track_session: 2 })] }),
  interest: "dinossauros", situation: "Pediu um brinquedo no supermercado.", characterMode,
});

describe("gerador: pedido ao modelo", () => {
  it("não leva nomes reais nem códigos de modo como instrução para a criança e respeita o escalão", () => {
    const p = buildGenerationPrompt(baseCtx("5-6"));
    expect(p).toContain("5–6 anos");
    expect(p).toContain("exatamente 7 slides");
    expect(p).toContain("FALADAS");
    expect(p).toContain("Inventar");
    expect(p).toMatch(/Não uses nomes de marcas/);
  });
  it("modo original pede fidelidade às personagens", () => {
    expect(buildGenerationPrompt(baseCtx("7-8", "original"))).toMatch(/fiel ao original/);
  });
  it("9–12 pede ficha de caso, sem slides", () => {
    const p = buildGenerationPrompt(baseCtx("9-12"));
    expect(p).toContain("FICHA DE CASO");
    expect(p).toContain("contra-exemplo");
  });
});

describe("gerador: prompt da apresentação montado pela app", () => {
  it("uma linha por slide, PT-PT no início e no fim, sem códigos MD", () => {
    const ctx = baseCtx("7-8");
    const g = fakeGenerated(13, { slides: fakeGenerated(13).slides.map((s, i) => (i === 0 ? { ...s, text: "Texto com MD4 e | barra." } : s)) });
    const nb = buildNotebookPrompt(g, ctx.plan, "generico")!;
    expect(nb.text.startsWith("Escreve TODA a apresentação em português de Portugal.")).toBe(true);
    expect(nb.text.trim().endsWith("português de Portugal.")).toBe(true);
    const lines = nb.text.split("\n").filter((l) => /^\d+\. Título:/.test(l));
    expect(lines.length).toBe(13);
    expect(nb.text).not.toMatch(/MD\d/);
    expect(lines[0].split("|").length).toBe(3);
  });
  it("encurta para caber nos 5000 caracteres sem tirar slides", () => {
    const long = "Uma frase comprida sobre o que a personagem sente e vê à sua volta. ".repeat(8);
    const g = fakeGenerated(13, { slides: Array.from({ length: 13 }, (_, i) => ({ title: `Cena ${i}`, text: long, visual: long })) });
    const nb = buildNotebookPrompt(g, baseCtx("7-8").plan, "generico")!;
    expect(nb.length).toBeLessThanOrEqual(NOTEBOOK_PROMPT_LIMIT);
    expect(nb.trimmed).toBe(true);
    expect(nb.text.split("\n").filter((l) => /^\d+\. Título:/.test(l)).length).toBe(13);
  });
});

describe("gerador: validação e montagem", () => {
  it("rejeita número de slides errado e termos proibidos", () => {
    const plan = baseCtx("7-8").plan;
    expect(validateGenerated(fakeGenerated(10), plan).join(" ")).toMatch(/13 slides/);
    const bad = fakeGenerated(13, { slides: fakeGenerated(13).slides.map((s, i) => (i === 2 ? { ...s, text: "O banco paga juros." } : s)) });
    expect(validateGenerated(bad, plan).join(" ")).toMatch(/termo proibido/);
    expect(validateGenerated(fakeGenerated(13), plan)).toEqual([]);
  });
  it("o mealheiro Investir não é termo proibido", () => {
    const plan = baseCtx("7-8").plan;
    const ok = fakeGenerated(13, { slides: fakeGenerated(13).slides.map((s, i) => (i === 2 ? { ...s, text: "Pôs uma moeda no 🚀 Investir para comprar sementes." } : s)) });
    expect(validateGenerated(ok, plan)).toEqual([]);
  });
  it("monta quiz com ✓ e só aceita sinais das skills da aula", () => {
    const ctx = baseCtx("7-8");
    const a = assembleLesson(fakeGenerated(13, { observe: [{ skill_code: "DC2", description: "Diz se é preciso." }, { skill_code: "GP1", description: "não é desta aula" }] }), ctx, "2026-11-22");
    expect(a.quiz_md).toContain("✓");
    expect(a.signals.map((s) => s.skill_code)).toEqual(["DC2"]);
    expect(a.content_md).toContain("## F · Tracking");
    expect(a.tracking_md).toContain("MODO DE DESCOBERTA: MD");
  });
  it("parseGenerated tolera campos em falta", () => {
    const g = parseGenerated(JSON.stringify({ title: "X", slides: [{ title: "a", text: "b" }] }));
    expect(g.slides.length).toBe(1);
    expect(g.quiz).toEqual([]);
  });
  it("generateLesson repete com correção quando a primeira resposta falha", async () => {
    const ctx = baseCtx("7-8");
    const prompts: string[] = [];
    const answers = [JSON.stringify(fakeGenerated(9)), JSON.stringify(fakeGenerated(13))];
    const res = await generateLesson(ctx, async (p) => { prompts.push(p); return answers.shift()!; }, "2026-11-22");
    expect(prompts.length).toBe(2);
    expect(prompts[1]).toContain("CORREÇÃO PEDIDA");
    expect(res.notebook_prompt).toBeTruthy();
  });
});

describe("ritual", () => {
  it("segunda-feira da semana", () => {
    expect(weekStart("2026-11-22")).toBe("2026-11-16"); // domingo
    expect(weekStart("2026-11-16")).toBe("2026-11-16");
  });
  it("propõe sinais DC1 e GP3 sem subir níveis", () => {
    const sig = ritualSignals({ done: true, amount_cents: 350, choice_text: "escolhi o livro em vez dos cromos", floor_used: true, floor_restored: true, question: null }, { GP3: 2 });
    expect(sig.map((s) => [s.skill_code, s.target_level])).toEqual([["DC1", 2], ["GP3", 3]]);
    expect(ritualSignals({ done: false, amount_cents: null, choice_text: "x", floor_used: false, floor_restored: false, question: null }, {})).toEqual([]);
  });
});

describe("importação do histórico", () => {
  it("lê códigos, temas e sessões em formatos livres", () => {
    expect(toSkills("DC3, AD2 (+AD3)")).toEqual(["DC3", "AD2", "AD3"]);
    expect(toThemes(["Tema_10", "Tema 11"])).toEqual([10, 11]);
    expect(toSession("S4")).toBe(4);
  });
  it("lê aulas e níveis e não duplica", () => {
    const json = JSON.stringify({
      aulas: [
        { crianca: "C1", titulo: "A Loja do Miguel", data_dada: "2026-10-05", modo_descoberta: "MD2", skills_alvo: ["VL4", "GP5"], protagonista: "Miguel" },
        { crianca: "C2", titulo: "A Mochila da Inês", data_dada: null, sessao_trilho: "S3", modo_descoberta: "MD4" },
        { crianca: "C1", data_dada: "2026-10-06" },
      ],
      niveis: { C1: { data: "2026-06-21", GP5: 2, RH2: { nivel: 3, nota: "deu à irmã" } } },
    });
    const b = parseImport(json);
    expect(b.lessons.length).toBe(2);
    expect(b.keys.sort()).toEqual(["C1", "C2"]);
    expect(b.levels.map((l) => [l.skill_code, l.level, l.observed_on])).toEqual([["GP5", 2, "2026-06-21"], ["RH2", 3, "2026-06-21"]]);
    expect(b.warnings.length).toBe(1);
    const plan = planImport(b, { C1: "child-1", C2: null }, [{ child_id: "child-1", title: "a loja do miguel", given_on: "2026-10-05" }]);
    expect(plan.lessons.length).toBe(0);
    expect(plan.skipped).toBe(1);
    expect(plan.levels.length).toBe(2);
  });
  it("recusa texto que não é JSON", () => {
    expect(() => parseImport("olá")).toThrow(/JSON/);
  });
});
