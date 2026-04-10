// src/lib/literacyContent.ts

export interface LiteracyModule {
  id: string;       // slug usado na BD
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  icon?: string;
}

export interface LiteracyCategory {
  id: string;
  title: string;
  modules: LiteracyModule[];
}

// ─── Financial Literacy ────────────────────────────────────────────

export const FINANCIAL_MISSIONS: LiteracyModule[] = [
  { id: 'poupar-com-proposito', title: 'Poupar com Propósito', description: 'Aprender a definir objetivos de poupança', icon: '🎯' },
  { id: 'orcamento-familiar', title: 'Orçamento Familiar', description: 'Perceber como a família gere o dinheiro', icon: '📊' },
  { id: 'necessidade-vs-desejo', title: 'Necessidade vs. Desejo', description: 'Distinguir o que precisamos do que queremos', icon: '🤔' },
  { id: 'empreender-com-valor', title: 'Empreender com Valor', description: 'Criar algo e oferecer valor aos outros', icon: '🚀' },
];

export const FINANCIAL_STORIES: LiteracyModule[] = [
  { id: 'historia-do-dinheiro', title: 'A História do Dinheiro', duration: '10 min' },
  { id: 'mercado-e-trocas', title: 'Mercado e Trocas', duration: '8 min' },
  { id: 'decisoes-financeiras', title: 'Decisões Financeiras', duration: '12 min' },
  { id: 'poupar-vs-investir', title: 'Poupar vs. Investir', duration: '15 min' },
];

export const FINANCIAL_CHALLENGES: LiteracyModule[] = [
  { id: 'desafio-mealheiro', title: 'O Mealheiro Inteligente', level: 'Iniciante', duration: '1 semana' },
  { id: 'desafio-mercado', title: 'Mini Mercado em Casa', level: 'Intermédio', duration: '2 semanas' },
  { id: 'desafio-negocio', title: 'O Meu Primeiro Negócio', level: 'Avançado', duration: '1 mês' },
];

export const ALL_FINANCIAL_MODULES: string[] = [
  ...FINANCIAL_MISSIONS.map(m => m.id),
  ...FINANCIAL_STORIES.map(m => m.id),
  ...FINANCIAL_CHALLENGES.map(m => m.id),
];

// ─── Digital Literacy ──────────────────────────────────────────────

export const DIGITAL_CATEGORIES: LiteracyCategory[] = [
  {
    id: 'criacao-conteudo',
    title: 'Criação de Conteúdo',
    modules: [
      { id: 'blog-pessoal', title: 'Blog Pessoal', level: 'Iniciante' },
      { id: 'podcast-episodio', title: 'Podcast', level: 'Iniciante' },
      { id: 'infografia', title: 'Infografia', level: 'Intermédio' },
      { id: 'newsletter', title: 'Newsletter', level: 'Intermédio' },
    ],
  },
  {
    id: 'storyboard',
    title: 'Storyboard',
    modules: [
      { id: 'storyboard-aventura', title: 'Aventura', level: 'Iniciante' },
      { id: 'storyboard-adaptar-conto', title: 'Adaptar um Conto', level: 'Intermédio' },
      { id: 'storyboard-documentario', title: 'Documentário', level: 'Avançado' },
    ],
  },
  {
    id: 'video',
    title: 'Vídeo',
    modules: [
      { id: 'stop-motion', title: 'Stop Motion', level: 'Iniciante' },
      { id: 'vlog', title: 'Vlog', level: 'Iniciante' },
      { id: 'efeitos-especiais', title: 'Efeitos Especiais', level: 'Avançado' },
    ],
  },
  {
    id: 'ia-basica',
    title: 'IA Básica',
    modules: [
      { id: 'o-que-e-ia', title: 'O que é a IA?', level: 'Iniciante' },
      { id: 'chat-com-ia', title: 'Conversar com IA', level: 'Iniciante' },
      { id: 'ia-e-criatividade', title: 'IA e Criatividade', level: 'Intermédio' },
      { id: 'etica-da-ia', title: 'Ética da IA', level: 'Avançado' },
    ],
  },
  {
    id: 'logica-programacao',
    title: 'Lógica e Programação',
    modules: [
      { id: 'sequencias', title: 'Sequências', level: 'Iniciante' },
      { id: 'blocos-de-codigo', title: 'Blocos de Código', level: 'Iniciante' },
      { id: 'algoritmos', title: 'Algoritmos', level: 'Intermédio' },
      { id: 'criar-jogo', title: 'Criar um Jogo', level: 'Avançado' },
    ],
  },
];

export const ALL_DIGITAL_MODULES: string[] = DIGITAL_CATEGORIES.flatMap(c => c.modules.map(m => m.id));
