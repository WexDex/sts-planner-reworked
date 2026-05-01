import { spiderWeb } from '@lucide/lab';
import {
  AlertCircle,
  ArrowDown,
  BarChart3,
  createLucideIcon,
  Dumbbell,
  Droplets,
  FileText,
  Ghost,
  Heart,
  HeartCrack,
  Shield,
  ShieldOff,
  Skull,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideIcon,
  Orbit,
} from 'lucide-react';
import { EFFECT_COLORS, STAT_COLORS } from '@/app/constants/colors';

const EntangleIcon = createLucideIcon('spider-web', spiderWeb);

export type EffectType =
  | 'weak'
  | 'vulnerable'
  | 'frail'
  | 'damage'
  | 'block'
  | 'wound'
  | 'strength'
  | 'strength_buff'
  | 'entangle'
  | 'takedamage'
  | 'energygain'
  | 'draw'
  | 'intangible'
  | 'hp'
  | 'maxHp'
  | 'health'
  | 'attack'
  | 'energy'
  | 'heal'
  | 'focus'
  | 'poison'
  | 'hpcost';

interface EffectDisplay {
  label: string;
  color: string;
  fullLabel: string;
  icon: LucideIcon;
}

const ICONS: Record<EffectType, LucideIcon> = {
  weak: ArrowDown,
  vulnerable: AlertCircle,
  frail: ShieldOff,
  damage: Zap,
  block: Shield,
  wound: HeartCrack,
  strength: Dumbbell,
  strength_buff: TrendingUp,
  entangle: EntangleIcon,
  takedamage: HeartCrack,
  energygain: Orbit,
  draw: FileText,
  intangible: Ghost,
  hp: Heart,
  maxHp: BarChart3,
  health: Heart,
  attack: BarChart3,
  energy: Zap,
  heal: Heart,
  focus: Sparkles,
  poison: Skull,
  hpcost: Droplets,
};

/** Exhaustive list of planner effect/stat keys; keep in sync with `ICONS` / `getEffectDisplay` switch. */
export const EFFECT_TYPES_ALL = Object.keys(ICONS) as EffectType[];

export function getEffectDisplay(type: EffectType, value?: number): EffectDisplay {
  switch (type) {
    case 'weak':
      return {
        label: `W${value ?? ''}`,
        color: EFFECT_COLORS.weak,
        fullLabel: 'Weak',
        icon: ICONS.weak,
      };
    case 'vulnerable':
      return {
        label: `V${value ?? ''}`,
        color: EFFECT_COLORS.vulnerable,
        fullLabel: 'Vulnerable',
        icon: ICONS.vulnerable,
      };
    case 'frail':
      return {
        label: `F${value ?? ''}`,
        color: 'text-gray-400',
        fullLabel: 'Frail',
        icon: ICONS.frail,
      };
    case 'damage':
      return {
        label: `D${value ?? ''}`,
        color: EFFECT_COLORS.damage,
        fullLabel: 'Damage',
        icon: ICONS.damage,
      };
    case 'block':
      return {
        label: `B${value ?? ''}`,
        color: EFFECT_COLORS.block,
        fullLabel: value ? `Gain ${value} Block` : 'Block',
        icon: ICONS.block,
      };
    case 'wound':
      return {
        label: `W${value ?? ''}`,
        color: EFFECT_COLORS.wound,
        fullLabel: 'Wound',
        icon: ICONS.wound,
      };
    case 'strength':
      return {
        label: `+${value ?? ''}`,
        color: EFFECT_COLORS.strength,
        fullLabel: 'Strength',
        icon: ICONS.strength,
      };
    case 'strength_buff':
      return {
        label: `+${value ?? ''}`,
        color: EFFECT_COLORS.strength,
        fullLabel: 'Strength Buff',
        icon: ICONS.strength_buff,
      };
    case 'entangle':
      return {
        label: 'Entangle',
        color: EFFECT_COLORS.entangle,
        fullLabel: 'Entangle',
        icon: ICONS.entangle,
      };
    case 'takedamage':
      return {
        label: `-${value ?? ''} HP`,
        color: EFFECT_COLORS.takedamage,
        fullLabel: `Take ${value ?? ''} Damage`,
        icon: ICONS.takedamage,
      };
    case 'energygain':
      return {
        label: `+${value ?? ''}`,
        color: EFFECT_COLORS.energygain,
        fullLabel: `Gain ${value ?? ''} Energy`,
        icon: ICONS.energygain,
      };
    case 'draw':
      return {
        label: `+${value ?? ''}`,
        color: EFFECT_COLORS.draw,
        fullLabel: `Draw ${value ?? ''} Card${value === 1 ? '' : 's'}`,
        icon: ICONS.draw,
      };
    case 'intangible':
      return {
        label: `${value ?? 1}`,
        color: EFFECT_COLORS.intangible,
        fullLabel: `Gain ${value ?? 1} Intangible`,
        icon: ICONS.intangible,
      };
    case 'hp':
      return {
        label: `HP ${value ?? ''}`,
        color: STAT_COLORS.hp,
        fullLabel: 'HP',
        icon: ICONS.hp,
      };
    case 'maxHp':
      return {
        label: `Max HP ${value ?? ''}`,
        color: STAT_COLORS.maxHp,
        fullLabel: 'Max HP',
        icon: ICONS.maxHp,
      };
    case 'health':
      return {
        label: `Health ${value ?? ''}`,
        color: STAT_COLORS.health,
        fullLabel: 'Health',
        icon: ICONS.health,
      };
    case 'attack':
      return {
        label: `Attack ${value ?? ''}`,
        color: STAT_COLORS.attack,
        fullLabel: 'Attack',
        icon: ICONS.attack,
      };
    case 'energy':
      return {
        label: `Energy ${value ?? ''}`,
        color: STAT_COLORS.energy,
        fullLabel: 'Energy',
        icon: ICONS.energy,
      };
    case 'heal':
      return {
        label: `+${value ?? ''}`,
        color: EFFECT_COLORS.heal,
        fullLabel: 'Heal',
        icon: ICONS.heal,
      };
    case 'focus':
      return {
        label: `${value ?? ''}`,
        color: EFFECT_COLORS.focus,
        fullLabel: 'Focus',
        icon: ICONS.focus,
      };
    case 'poison':
      return {
        label: `P${value ?? ''}`,
        color: EFFECT_COLORS.poison,
        fullLabel: 'Poison',
        icon: ICONS.poison,
      };
    case 'hpcost':
      return {
        label: `-${value ?? ''} HP`,
        color: EFFECT_COLORS.hpcost,
        fullLabel: `Lose ${value ?? ''} HP`,
        icon: ICONS.hpcost,
      };
    default:
      return {
        label: `?${value ?? ''}`,
        color: 'text-gray-400',
        fullLabel: 'Unknown',
        icon: ArrowDown,
      };
  }
}
