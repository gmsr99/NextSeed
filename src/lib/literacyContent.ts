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

// A antiga Literacia Financeira (missões, histórias e desafios estáticos, com
// juros e investimento) foi substituída pelo Financinhas (src/lib/financinhas).

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
