"use client";

import { getApiUrl } from "@/lib/api-url";
import { useEffect, useMemo, useRef, useState } from "react";
import { DotmSquare4 } from "@repo/ui/components/dotm-square-4";

const STORAGE_KEY = "gitloud:backend-wake-screen:v1";

const SHOW_DELAY_MS = 400;
const MIN_VISIBLE_MS = 2_500;
const MAX_VISIBLE_MS = 15_000;

const INITIAL_RETRY_DELAY_MS = 900;
const MAX_RETRY_DELAY_MS = 4_000;
const REQUEST_TIMEOUT_MS = 4_000;

type WakeStatus = "idle" | "starting" | "ready" | "slow";
type WakeResult = "skipped" | "ready" | "timeout";

export function BackendWakeScreen() {
  const { visible, status } = useBackendWakeScreen();

  const message = useMemo(() => {
    switch (status) {
      case "ready":
        return "Workspace ready…";
      case "slow":
        return "Still warming up…";
      case "starting":
        return "Starting services…";
      default:
        return "";
    }
  }, [status]);

  if (!visible) return null;

  return (
    <output
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-6">
        <DotmSquare4 />
        <p className="text-sm text-muted-foreground motion-safe:animate-pulse lg:text-lg">
          {message}
        </p>
        <span className="sr-only">Loading workspace</span>
      </div>
    </output>
  );
}

function getForcedWakeMode(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.has("wake")) return params.get("wake") || "normal";
  if (params.has("awake")) return params.get("awake") || "normal";
  return null;
}

function useBackendWakeScreen() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<WakeStatus>("idle");

  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;

    if (!shouldShowWakeScreen()) return;

    const forcedMode = getForcedWakeMode();
    const isForced = forcedMode !== null;

    const controller = new AbortController();

    let showTimer: number | null = null;
    let slowTimer: number | null = null;
    let maxTimer: number | null = null;
    let visibleAt = 0;
    const startedAt = performance.now();

    const clearTimers = () => {
      if (showTimer) window.clearTimeout(showTimer);
      if (slowTimer) window.clearTimeout(slowTimer);
      if (maxTimer) window.clearTimeout(maxTimer);
    };

    const complete = async (result: WakeResult) => {
      if (doneRef.current) return;
      doneRef.current = true;

      clearTimers();

      if (result === "ready" && visibleAt > 0) {
        const shownFor = performance.now() - visibleAt;
        const remaining = Math.max(MIN_VISIBLE_MS - shownFor, 0);

        try {
          await sleep(remaining, controller.signal);
        } catch {
          return;
        }
      }

      try {
        if (!isForced && (result === "ready" || result === "timeout")) {
          sessionStorage.setItem(STORAGE_KEY, "done");
        }
      } catch {
        /* ignore session storage errors */
      }

      setVisible(false);
    };

    showTimer = window.setTimeout(() => {
      if (doneRef.current) return;
      visibleAt = performance.now();
      setVisible(true);
      setStatus("starting");
    }, SHOW_DELAY_MS);

    slowTimer = window.setTimeout(() => {
      if (doneRef.current) return;
      setStatus("slow");
    }, MAX_VISIBLE_MS / 2);

    maxTimer = window.setTimeout(() => {
      if (doneRef.current) return;
      void complete("timeout");
    }, MAX_VISIBLE_MS);

    const run = async () => {
      let retryDelay = INITIAL_RETRY_DELAY_MS;

      while (!doneRef.current) {
        const elapsed = performance.now() - startedAt;
        if (elapsed >= MAX_VISIBLE_MS) return;

        const isReady = await pingBackendHealth(controller.signal);
        if (doneRef.current) return;

        // If forced with 'slow' or 'timeout', simulate that the backend is never ready
        // If forced normally, simulate that the backend takes 3 seconds to wake up so you can see the UI transition
        let simulatedReady = isReady;
        if (isForced) {
          if (forcedMode === "slow" || forcedMode === "timeout") {
            simulatedReady = false;
          } else {
            simulatedReady = isReady && elapsed >= 3000;
          }
        }

        if (simulatedReady) {
          if (!isForced && performance.now() - startedAt < SHOW_DELAY_MS) {
            await complete("skipped");
            return;
          }

          if (visibleAt === 0) {
            visibleAt = performance.now();
            setVisible(true);
          }
          setStatus("ready");
          await complete("ready");
          return;
        }

        try {
          await sleep(retryDelay, controller.signal);
        } catch {
          return;
        }

        retryDelay = Math.min(Math.round(retryDelay * 1.6), MAX_RETRY_DELAY_MS);
      }
    };

    void run();

    return () => {
      doneRef.current = true;
      controller.abort();
      clearTimers();
    };
  }, [setVisible, setStatus]);

  return { visible, status };
}

function shouldShowWakeScreen() {
  if (getForcedWakeMode() !== null) return true;
  if (typeof window === "undefined") return false;

  try {
    return sessionStorage.getItem(STORAGE_KEY) !== "done";
  } catch {
    return true;
  }
}

async function pingBackendHealth(parentSignal?: AbortSignal) {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  const onAbort = () => controller.abort();
  parentSignal?.addEventListener("abort", onAbort, { once: true });

  try {
    const response = await fetch(getApiUrl("/health"), {
      cache: "no-store",
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
    parentSignal?.removeEventListener("abort", onAbort);
  }
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timer);
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort);
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
