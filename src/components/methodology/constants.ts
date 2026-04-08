import type { MethodologyCategory, MethodologyIntensity, MethodologyMaterialsCost } from "@/lib/types";

export const CATEGORY_LABELS: Record<MethodologyCategory, string> = {
  'pedagogias-classicas':  'Pedagogias Clássicas',
  'natureza-experiencia':  'Natureza & Experiência',
  'alta-autonomia':        'Alta Autonomia',
  'aprendizagem-ativa':    'Aprendizagem Ativa',
  'contemporaneo':         'Contemporâneo',
};

export const CATEGORY_COLORS: Record<MethodologyCategory, { badge: string; card: string }> = {
  'pedagogias-classicas': {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    card:  'border-blue-200',
  },
  'natureza-experiencia': {
    badge: 'bg-green-100 text-green-700 border-green-200',
    card:  'border-green-200',
  },
  'alta-autonomia': {
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    card:  'border-purple-200',
  },
  'aprendizagem-ativa': {
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    card:  'border-orange-200',
  },
  'contemporaneo': {
    badge: 'bg-pink-100 text-pink-700 border-pink-200',
    card:  'border-pink-200',
  },
};

export const INTENSITY_LABELS: Record<MethodologyIntensity, string> = {
  baixa: 'Intensidade baixa',
  media: 'Intensidade média',
  alta:  'Intensidade alta',
};

export const COST_LABELS: Record<MethodologyMaterialsCost, string> = {
  baixo: 'Materiais baixo custo',
  medio: 'Materiais custo médio',
  alto:  'Materiais custo elevado',
};

export const PRIORITY_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Principal',
  2: 'Secundária',
  3: 'Complementar',
};

export const COMPATIBILITY_LABELS: Record<string, { label: string; color: string }> = {
  alta:  { label: 'Muito compatível',  color: 'text-green-600 bg-green-50 border-green-200' },
  media: { label: 'Compatível',        color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  baixa: { label: 'Pouco compatível',  color: 'text-red-500 bg-red-50 border-red-200' },
};
