"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
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

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setExiting(true), item.durationMs);
    return () => window.clearTimeout(t);
  }, [item.durationMs]);

  const { bar, icon: Icon, IconClass } = TYPE_STYLES[item.type];

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
        "flex max-w-md min-w-[min(100%,18rem)] items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 ease-out",
        bar,
        entered && !exiting ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      ].join(" ")}
    >
      <Icon className={["mt-0.5 h-5 w-5 shrink-0", IconClass].join(" ")} strokeWidth={2} aria-hidden />
      <p className="text-sm font-medium leading-snug break-words">{item.message}</p>
    </div>
  );
}

/**
 * Place inside a `relative` container (e.g. directly above {@link BottomBlock}) so toasts stack
 * centered over that column.
 */
export function ToastStack() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("ToastStack must be used within NotificationProvider");
  }
  const { items, remove } = ctx;

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-full left-1/2 z-[500] mb-1 flex w-[min(100%,28rem)] -translate-x-1/2 flex-col items-stretch gap-2 px-2"
      aria-label="Notifications"
    >
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto flex justify-center">
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
