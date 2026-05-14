import type { LucideProps } from "lucide-react";
import {
  AlertCircle,
  ArrowRightFromLine,
  Minus,
  Shield,
  Swords,
  TrendingDown,
  TrendingUp,
  WifiOff,
  Zap,
} from "lucide-react";
import type { EnemyIntentAction } from "@/app/types/gameTypes";

type IconComp = React.ComponentType<LucideProps>;

const INTENT_ICON_MAP: Record<EnemyIntentAction["type"], IconComp> = {
  attack: Swords,
  multi_attack: Swords,
  block: Shield,
  debuff: TrendingDown,
  buff: TrendingUp,
  status: AlertCircle,
  cowardly: ArrowRightFromLine,
  stunned: WifiOff,
  no_action: Minus,
};

export function IntentIconGlyph({
  type,
  className = "h-3.5 w-3.5 shrink-0",
  strokeWidth = 2,
}: {
  type: EnemyIntentAction["type"];
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = INTENT_ICON_MAP[type] ?? Zap;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
