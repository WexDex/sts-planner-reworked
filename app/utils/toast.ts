export type ToastType = "success" | "error" | "info" | "warning";

export type ToastOptions = {
  /** How long the toast stays fully visible before fading (default 4000). */
  durationMs?: number;
};

type ToastPayload = {
  message: string;
  type: ToastType;
  durationMs: number;
};

type Subscriber = (payload: ToastPayload) => void;

let subscriber: Subscriber | null = null;

/** Called by {@link NotificationProvider} — do not use directly. */
export function subscribeToasts(fn: Subscriber | null) {
  subscriber = fn;
}

/**
 * Show a stacked toast at the bottom center. Safe to call from anywhere
 * (handlers, utilities) once {@link NotificationProvider} is mounted.
 */
export function toast(message: string, type: ToastType = "info", options?: ToastOptions) {
  const durationMs = options?.durationMs ?? 4000;
  subscriber?.({ message, type, durationMs });
}
