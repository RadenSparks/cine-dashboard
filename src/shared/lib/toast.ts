import type { RefObject } from "react";
import type { ToastNotification } from "@/shared/components/ui/SatelliteToast";

export type ToastRef = RefObject<{
  showNotification: (options: Omit<ToastNotification, "id">) => void;
} | null>;

const toastColor = {
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
  info: "#2563eb",
} as const;

type ToastKind = keyof typeof toastColor;

type NotifyOptions = {
  title: string;
  content: string;
  kind?: ToastKind;
  longevity?: number;
};

export function notify(toastRef: ToastRef | undefined, options: NotifyOptions) {
  toastRef?.current?.showNotification({
    title: options.title,
    content: options.content,
    accentColor: toastColor[options.kind ?? "info"],
    position: "bottom-right",
    longevity: options.longevity ?? 3000,
  });
}

export function notifyError(toastRef: ToastRef | undefined, title: string, content: string) {
  notify(toastRef, { title, content, kind: "error", longevity: 3000 });
}

export function notifySuccess(toastRef: ToastRef | undefined, title: string, content: string) {
  notify(toastRef, { title, content, kind: "success", longevity: 2500 });
}
