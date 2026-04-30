"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { subscribeToasts, type ToastType } from "@/app/utils/toast";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  durationMs: number;
};

const TYPE_STYLES: Record<
  ToastType,
  { bar: string; icon: typeof Info; IconClass: string }
> = {
  success: {
    bar: "border-emerald-500/50 bg-emerald-950/95 text-emerald-50 shadow-emerald-950/40",
    icon: CheckCircle2,
    IconClass: "text-emerald-400",
  },
  error: {
    bar: "border-rose-500/50 bg-rose-950/95 text-rose-50 shadow-rose-950/40",
    icon: AlertCircle,
    IconClass: "text-rose-400",
  },
  warning: {
    bar: "border-amber-500/50 bg-amber-950/95 text-amber-50 shadow-amber-950/40",
    icon: TriangleAlert,
    IconClass: "text-amber-400",
  },
  info: {
    bar: "border-sky-500/50 bg-slate-900/95 text-slate-100 shadow-black/50",
    icon: Info,
    IconClass: "text-sky-400",
  },
};

const NotificationContext = createContext<{
  items: ToastItem[];
  remove: (id: string) => void;
} | null>(null);

function ToastRow({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [barFull, setBarFull] = useState(true);
  const [barShrinkMs, setBarShrinkMs] = useState(item.durationMs);
  const dismissed = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const requestDismiss = useCallback((useFastBar: boolean) => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (useFastBar) setBarShrinkMs(160);
    setBarFull(false);
    setExiting(true);
  }, []);

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  useEffect(() => {
    dismissed.current = false;
    setBarFull(true);
    setBarShrinkMs(item.durationMs);

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setBarFull(false));
    });

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      requestDismiss(false);
    }, item.durationMs);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [item.id, item.durationMs, requestDismiss]);

  const { bar, icon: Icon, IconClass } = TYPE_STYLES[item.type];
  const seconds = Math.max(1, Math.round(item.durationMs / 1000));

  return (
    <div
      role="status"
      aria-live="polite"
      onTransitionEnd={(e) => {
        if (e.propertyName === "opacity" && exiting) {
          onRemove(item.id);
        }
      }}
      className={[
        "flex max-w-md min-w-[min(100%,18rem)] flex-col gap-2 rounded-xl border px-3 py-2.5 shadow-xl backdrop-blur-md transition-all duration-300 ease-out",
        bar,
        entered && !exiting ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={["mt-0.5 h-5 w-5 shrink-0", IconClass].join(" ")} strokeWidth={2} aria-hidden />
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug break-words">{item.message}</p>
        <button
          type="button"
          onClick={() => requestDismiss(true)}
          className="-m-1 shrink-0 rounded-lg p-1 text-current opacity-70 transition hover:bg-white/10 hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
      <div
        className="h-0.5 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/10"
        aria-label={`Auto-dismisses in about ${seconds} second${seconds === 1 ? "" : "s"}`}
      >
        <div
          className="h-full rounded-full bg-current opacity-40 transition-[width] ease-linear"
          style={{
            width: barFull ? "100%" : "0%",
            transitionDuration: `${barShrinkMs}ms`,
          }}
        />
      </div>
    </div>
  );
}

/** Preset anchor for the toast stack. `centerAbove` is relative to a positioned parent (e.g. above {@link BottomBlock}). */
export type ToastStackPlacement =
  | "centerAbove"
  | "bottomLeft"
  | "bottomRight"
  | "topLeft"
  | "topRight"
  | "bottomCenter"
  | "topCenter";

export type ToastStackProps = {
  placement?: ToastStackPlacement;
  /**
   * Viewport inset in px for fixed placements; uses `max(inset, env(safe-area-inset-*))` per edge.
   * Ignored for `centerAbove`. Default 16.
   */
  edgeInset?: number;
  /** CSS `max-width` for the stack column (e.g. `"24rem"` or `"min(calc(100vw - 32px), 28rem)"`). */
  maxWidth?: string;
  /** Tailwind gap between stacked toasts (default `gap-2`). */
  gapClass?: string;
  /** Extra classes on the outer stack wrapper (positioning tweaks, z-index overrides, etc.). */
  className?: string;
};

function toastStackOuterLayout(
  placement: ToastStackPlacement,
  edgeInset: number,
  maxWidth: string | undefined,
  gapClass: string,
  extraClassName: string | undefined,
): { className: string; style: CSSProperties; rowJustify: string } {
  const inset = Math.max(0, edgeInset);
  const b = `max(${inset}px, env(safe-area-inset-bottom, 0px))`;
  const l = `max(${inset}px, env(safe-area-inset-left, 0px))`;
  const r = `max(${inset}px, env(safe-area-inset-right, 0px))`;
  const t = `max(${inset}px, env(safe-area-inset-top, 0px))`;
  const defaultMax = `min(calc(100vw - ${inset * 2}px), 28rem)`;
  const mw = maxWidth ?? defaultMax;

  const base = ["pointer-events-none z-[500] flex flex-col items-stretch", gapClass, extraClassName]
    .filter(Boolean)
    .join(" ");

  switch (placement) {
    case "centerAbove":
      return {
        className: `${base} absolute bottom-full left-1/2 mb-1 w-[min(100%,28rem)] -translate-x-1/2 px-2`,
        style: {},
        rowJustify: "justify-center",
      };
    case "bottomLeft":
      return {
        className: `${base} fixed`,
        style: { bottom: b, left: l, maxWidth: mw, width: "100%" },
        rowJustify: "justify-start",
      };
    case "bottomRight":
      return {
        className: `${base} fixed`,
        style: { bottom: b, right: r, maxWidth: mw, width: "100%" },
        rowJustify: "justify-end",
      };
    case "topLeft":
      return {
        className: `${base} fixed`,
        style: { top: t, left: l, maxWidth: mw, width: "100%" },
        rowJustify: "justify-start",
      };
    case "topRight":
      return {
        className: `${base} fixed`,
        style: { top: t, right: r, maxWidth: mw, width: "100%" },
        rowJustify: "justify-end",
      };
    case "bottomCenter":
      return {
        className: `${base} fixed left-1/2 -translate-x-1/2`,
        style: { bottom: b, maxWidth: mw, width: "100%" },
        rowJustify: "justify-center",
      };
    case "topCenter":
      return {
        className: `${base} fixed left-1/2 -translate-x-1/2`,
        style: { top: t, maxWidth: mw, width: "100%" },
        rowJustify: "justify-center",
      };
    default: {
      const _x: never = placement;
      return _x;
    }
  }
}

/**
 * Default (`centerAbove`): place inside a `relative` container directly above the bottom deck so toasts
 * stack centered over that column.
 */
export function ToastStack({
  placement = "centerAbove",
  edgeInset = 16,
  maxWidth,
  gapClass = "gap-2",
  className,
}: ToastStackProps) {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("ToastStack must be used within NotificationProvider");
  }
  const { items, remove } = ctx;

  if (items.length === 0) return null;

  const { className: outerClass, style, rowJustify } = toastStackOuterLayout(
    placement,
    edgeInset,
    maxWidth,
    gapClass,
    className,
  );

  return (
    <div className={outerClass} style={style} aria-label="Notifications">
      {items.map((item) => (
        <div key={item.id} className={`pointer-events-auto flex ${rowJustify}`}>
          <ToastRow item={item} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((payload: { message: string; type: ToastType; durationMs: number }) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { id, ...payload }]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    subscribeToasts(push);
    return () => subscribeToasts(null);
  }, [push]);

  return (
    <NotificationContext.Provider value={{ items, remove }}>{children}</NotificationContext.Provider>
  );
}
