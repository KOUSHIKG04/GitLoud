"use client";

import { toast } from "sonner";

const backendWakeDelayMs = 8_000;
const backendWakeMessage =
  "Preparing the generation service. This can take a little longer on the first request.";
const subsequentDelayMessage =
  "Generating content...";

let hasWokenBackend = false;

export function markBackendWoken() {
  hasWokenBackend = true;
}

export function startBackendDelayToast(toastId: string | number) {
  const timeoutId = window.setTimeout(() => {
    const message = hasWokenBackend ? subsequentDelayMessage : backendWakeMessage;
    toast.loading(message, { id: toastId });
  }, backendWakeDelayMs);

  return () => {
    window.clearTimeout(timeoutId);
  };
}
