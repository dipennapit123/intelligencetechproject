"use client";

import * as React from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function tone(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        wrap: "border-emerald-500/20 bg-emerald-500/10 text-emerald-950",
        dot: "bg-emerald-600",
        icon: "check_circle",
      };
    case "error":
      return {
        wrap: "border-red-500/20 bg-red-500/10 text-red-950",
        dot: "bg-red-600",
        icon: "error",
      };
    case "warning":
      return {
        wrap: "border-amber-500/25 bg-amber-500/15 text-amber-950",
        dot: "bg-amber-600",
        icon: "warning",
      };
    default:
      return {
        wrap: "border-primary/15 bg-primary/5 text-on-surface",
        dot: "bg-primary",
        icon: "info",
      };
  }
}

function defaultDuration(variant: ToastVariant) {
  if (variant === "error") return 7000;
  if (variant === "warning") return 6000;
  return 4000;
}

function uid() {
  // Stable enough for UI keys; not used for security.
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((input: ToastInput) => {
    const variant = input.variant ?? "info";
    const id = uid();
    const durationMs = input.durationMs ?? defaultDuration(variant);

    const next: ToastItem = { id, variant, title: input.title, message: input.message, durationMs };
    setItems((prev) => [next, ...prev].slice(0, 4));

    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-[84px] z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {items.map((t, idx) => {
          const v = t.variant ?? "info";
          const styles = tone(v);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm ${styles.wrap}`}
              style={{
                transform: `translateY(${idx * 0}px)`,
              }}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/60">
                  <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] opacity-70">{styles.icon}</span>
                    <div className="truncate text-sm font-semibold">
                      {t.title ?? (v === "success" ? "Success" : v === "error" ? "Error" : v === "warning" ? "Warning" : "Info")}
                    </div>
                  </div>
                  <div className="mt-1 text-sm opacity-90">{t.message}</div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-black/5"
                  aria-label="Dismiss"
                  onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                >
                  <span className="material-symbols-outlined text-[18px] opacity-60">close</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

