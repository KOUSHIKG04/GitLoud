"use client";

import { toast } from "sonner";

const backendWakeDelayMs = 8_000;
const backendWakeMessage =
  "The backend may be waking from free hosting. This can take up to a minute.";

export function startBackendDelayToast(toastId: string | number) {
  const timeoutId = window.setTimeout(() => {
    toast.loading(backendWakeMessage, { id: toastId });
  }, backendWakeDelayMs);

  return () => {
    window.clearTimeout(timeoutId);
  };
}
