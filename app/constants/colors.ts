// Effect and stat type definitions
export type EffectType = 
  | 'weak' 
  | 'vulnerable' 
  | 'frail' 
  | 'damage' 
  | 'block' 
  | 'wound' 
  | 'strength' 
  | 'entangle' 
  | 'takedamage' 
  | 'energygain' 
  | 'draw'
  | 'intangible'
  | 'strength_buff';

// Color scheme constants
export const EFFECT_COLORS = {
  // Negative effects
  weak: 'text-purple-400',
  vulnerable: 'text-red-500',
  frail: 'text-gray-400',
  wound: 'text-red-600',
  entangle: 'text-yellow-500',
  takedamage: 'text-red-500',
  
  // Positive effects
  strength: 'text-orange-400',
  strength_buff: 'text-green-500',
  intangible: 'text-teal-400',
  energygain: 'text-yellow-400',
  draw: 'text-indigo-500',
  
  // Neutral effects
  damage: 'text-red-400',
  block: 'text-blue-400',
} as const;

export const EFFECT_COLORS_BG = {
  weak: 'bg-purple-500/20',
  vulnerable: 'bg-red-500/20',
  frail: 'bg-gray-500/20',
  wound: 'bg-red-600/20',
  entangle: 'bg-yellow-500/20',
  takedamage: 'bg-red-500/20',
  strength: 'bg-orange-400/20',
  strength_buff: 'bg-green-500/20',
  intangible: 'bg-teal-400/20',
  energygain: 'bg-yellow-400/20',
  draw: 'bg-indigo-500/20',
  damage: 'bg-red-400/20',
  block: 'bg-blue-400/20',
} as const;

export const EFFECT_BORDER = {
  weak: 'border-purple-400',
  vulnerable: 'border-red-500',
  frail: 'border-gray-400',
  wound: 'border-red-600',
  entangle: 'border-yellow-500',
  takedamage: 'border-red-500',
  strength: 'border-orange-400',
  strength_buff: 'border-green-500',
  intangible: 'border-teal-400',
  energygain: 'border-yellow-400',
  draw: 'border-indigo-500',
  damage: 'border-red-400',
  block: 'border-blue-400',
} as const;

// Stat type color schemes
export const STAT_COLORS = {
  health: 'text-red-500',
  hp: 'text-rec-500',
  maxHp: 'text-red-400',
  attack: 'text-red-500',
  damage: 'text-red-500',
  block: 'text-blue-500',
  energy: 'text-yellow-500',
  strength: 'text-orange-500',
  weakness: 'text-purple-500',
  vulnerable: 'text-red-600',
  draw: 'text-indigo-500',
  intangible: 'text-teal-500',
} as const;

export const STAT_COLORS_BG = {
  health: 'bg-red-500/20',
  hp: 'bg-red-500/20',
  maxHp: 'bg-red-400/20',
  attack: 'bg-red-500/20',
  damage: 'bg-red-500/20',
  block: 'bg-blue-500/20',
  energy: 'bg-yellow-500/20',
  strength: 'bg-orange-500/20',
  weakness: 'bg-purple-500/20',
  vulnerable: 'bg-red-600/20',
  draw: 'bg-indigo-500/20',
  intangible: 'bg-teal-500/20',
} as const;

// Card type colors
export const CARD_TYPE_COLORS = {
  'Attack': 'text-red-500',
  'Skill': 'text-blue-500',
  'Power': 'text-purple-500',
  'Status': 'text-gray-500',
  'Curse': 'text-red-700',
} as const;

export const CARD_TYPE_BG = {
  'Attack': 'bg-red-500/20',
  'Skill': 'bg-blue-500/20',
  'Power': 'bg-purple-500/20',
  'Status': 'bg-gray-500/20',
  'Curse': 'bg-red-700/20',
} as const;
