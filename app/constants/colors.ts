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
  | 'strength_buff'
  | 'heal'
  | 'focus'
  | 'poison'
  | 'hpcost';

// Color scheme constants
export const EFFECT_COLORS = {
  // Negative effects
  weak: 'text-purple-400',
  vulnerable: 'text-red-500',
  frail: 'text-gray-400',
  wound: 'text-red-600',
  entangle: 'text-yellow-500',
  takedamage: 'text-red-500',
  poison: 'text-emerald-400',
  
  // Positive effects
  strength: 'text-orange-400',
  strength_buff: 'text-green-500',
  intangible: 'text-teal-400',
  energygain: 'text-yellow-400',
  draw: 'text-indigo-500',
  
  // Neutral effects
  damage: 'text-red-400',
  block: 'text-blue-400',
  heal: 'text-emerald-400',
  focus: 'text-sky-400',
  hpcost: 'text-rose-400',
} as const;

export const EFFECT_COLORS_BG = {
  weak: 'bg-purple-500/20',
  vulnerable: 'bg-red-500/20',
  frail: 'bg-gray-500/20',
  wound: 'bg-red-600/20',
  entangle: 'bg-yellow-500/20',
  takedamage: 'bg-red-500/20',
  poison: 'bg-emerald-500/20',
  strength: 'bg-orange-400/20',
  strength_buff: 'bg-green-500/20',
  intangible: 'bg-teal-400/20',
  energygain: 'bg-yellow-400/20',
  draw: 'bg-indigo-500/20',
  damage: 'bg-red-400/20',
  block: 'bg-blue-400/20',
  heal: 'bg-emerald-400/20',
  focus: 'bg-sky-400/20',
  hpcost: 'bg-rose-500/20',
} as const;

export const EFFECT_BORDER = {
  weak: 'border-purple-400',
  vulnerable: 'border-red-500',
  frail: 'border-gray-400',
  wound: 'border-red-600',
  entangle: 'border-yellow-500',
  takedamage: 'border-red-500',
  poison: 'border-emerald-400',
  strength: 'border-orange-400',
  strength_buff: 'border-green-500',
  intangible: 'border-teal-400',
  energygain: 'border-yellow-400',
  draw: 'border-indigo-500',
  damage: 'border-red-400',
  block: 'border-blue-400',
  heal: 'border-emerald-400',
  focus: 'border-sky-400',
  hpcost: 'border-rose-400',
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

// Activity Log Type Colors
export const ACTIVITY_LOG_COLORS = {
  damage: {
    text: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    badge: 'bg-red-600/40',
  },
  heal: {
    text: 'text-green-400',
    bg: 'bg-green-500/15',
    border: 'border-green-500/30',
    badge: 'bg-green-600/40',
  },
  block: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    badge: 'bg-blue-600/40',
  },
  'block-lost': {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-600/40',
  },
  energy: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/30',
    badge: 'bg-yellow-600/40',
  },
  buff: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-600/40',
  },
  debuff: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
    badge: 'bg-orange-600/40',
  },
  'card-action': {
    text: 'text-purple-400',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30',
    badge: 'bg-purple-600/40',
  },
  action: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-600/40',
  },
  'state-change': {
    text: 'text-violet-400',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/30',
    badge: 'bg-violet-600/40',
  },
  system: {
    text: 'text-slate-400',
    bg: 'bg-slate-500/15',
    border: 'border-slate-500/30',
    badge: 'bg-slate-600/40',
  },
  'turn-start': {
    text: 'text-amber-100',
    bg: 'bg-gradient-to-r from-amber-500/20 via-amber-400/12 to-cyan-500/15',
    border: 'border-amber-400/45',
    badge: 'bg-amber-500/50',
  },
  info: {
    text: 'text-slate-300',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    badge: 'bg-slate-600/30',
  },
} as const;

export const ACTIVITY_LOG_ICONS: Record<string, string> = {
  damage: '⚔️',
  heal: '❤️',
  block: '🛡️',
  'block-lost': '💔',
  energy: '⚡',
  buff: '✨',
  debuff: '💀',
  'card-action': '🎴',
  action: '➡️',
  'state-change': '📊',
  system: '⚙️',
  'turn-start': '🚩',
  info: 'ℹ️',
} as const;

// Card type colors
export const CARD_TYPE_COLORS = {
  'Attack': 'text-red-500',
  'Skill': 'text-blue-500',
  'Power': 'text-purple-500',
  'Potion': 'text-amber-400',
  'Status': 'text-gray-500',
  'Curse': 'text-red-700',
} as const;

export const CARD_TYPE_BG = {
  'Attack': 'bg-red-500/20',
  'Skill': 'bg-blue-500/20',
  'Power': 'bg-purple-500/20',
  'Potion': 'bg-amber-500/20',
  'Status': 'bg-gray-500/20',
  'Curse': 'bg-red-700/20',
} as const;
