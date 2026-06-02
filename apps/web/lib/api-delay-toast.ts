"use client";

import { toast } from "sonner";

const backendWakeDelayMs = 8_000;
const backendWakeMessage =
  "Preparing the generation service. This can take a little longer on the first request.";

export function startBackendDelayToast(toastId: string | number) {
  const timeoutId = window.setTimeout(() => {
    toast.loading(backendWakeMessage, { id: toastId });
  }, backendWakeDelayMs);

  return () => {
    window.clearTimeout(timeoutId);
  };
}
