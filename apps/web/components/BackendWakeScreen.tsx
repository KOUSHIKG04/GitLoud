"use client";

import { getApiUrl } from "@/lib/api-url";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { DotmSquare4 } from "@repo/ui/components/dotm-square-4";

const STORAGE_KEY = "gitloud:backend-wake-screen:v1";

const MIN_VISIBLE_MS = 2_500;
const MAX_VISIBLE_MS = 15_000;

const INITIAL_RETRY_DELAY_MS = 900;
const REQUEST_TIMEOUT_MS = 4_000;

type WakeStatus = "idle" | "starting" | "ready" | "slow";
type WakeResult = "skipped" | "ready" | "timeout";

export function BackendWakeScreen() {
  const { visible, status } = useBackendWakeScreen();

  const message = useMemo(() => {
    switch (status) {
      case "ready":
        return "Workspace ready...";
      case "slow":
        return "Still warming up...";
      case "starting":
        return "Starting services...";
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
  const shouldWake = useShouldShowWakeScreen();
  const forcedMode = getForcedWakeMode();
  const isForced = forcedMode !== null;
  const [visible, setVisible] = useState(true);
  const [status, setStatus] = useState<WakeStatus>("starting");

  const doneRef = useRef(false);
  const startedAtRef = useRef(0);
  const visibleAtRef = useRef(0);

  const healthQuery = useQuery({
    queryKey: ["backend-health"],
    queryFn: ({ signal }) => pingBackendHealth(signal),
    enabled: shouldWake && visible && !doneRef.current,
    refetchInterval: (query) =>
      query.state.data === true ? false : INITIAL_RETRY_DELAY_MS,
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    doneRef.current = false;
    startedAtRef.current = performance.now();
    visibleAtRef.current = performance.now();

    if (!shouldWake) return;

    const controller = new AbortController();

    let slowTimer: number | null = null;
    let maxTimer: number | null = null;

    const clearTimers = () => {
      if (slowTimer) window.clearTimeout(slowTimer);
      if (maxTimer) window.clearTimeout(maxTimer);
    };

    const complete = async (result: WakeResult) => {
      if (doneRef.current) return;
      doneRef.current = true;

      clearTimers();

      if (result === "ready") {
        const shownFor = performance.now() - visibleAtRef.current;
        const remaining = Math.max(MIN_VISIBLE_MS - shownFor, 0);

        try {
          await sleep(remaining, controller.signal);
        } catch {
          return;
        }
      }

      try {
        if (
          !isForced &&
          (result === "skipped" || result === "ready" || result === "timeout")
        ) {
          sessionStorage.setItem(STORAGE_KEY, "done");
        }
      } catch {
        /* ignore session storage errors */
      }

      setVisible(false);
    };

    slowTimer = window.setTimeout(() => {
      if (doneRef.current) return;
      setStatus("slow");
    }, MAX_VISIBLE_MS / 2);

    maxTimer = window.setTimeout(() => {
      if (doneRef.current) return;
      void complete("timeout");
    }, MAX_VISIBLE_MS);

    return () => {
      doneRef.current = true;
      controller.abort();
      clearTimers();
    };
  }, [isForced, setVisible, setStatus, shouldWake]);

  useEffect(() => {
    if (!shouldWake || doneRef.current || healthQuery.data !== true) return;

    const elapsed = performance.now() - startedAtRef.current;
    let simulatedReady = true;

    if (isForced) {
      simulatedReady =
        forcedMode !== "slow" && forcedMode !== "timeout" && elapsed >= 3000;
    }

    if (!simulatedReady) return;

    doneRef.current = true;
    setStatus("ready");

    const remaining = Math.max(
      MIN_VISIBLE_MS - (performance.now() - visibleAtRef.current),
      0,
    );

    const timer = window.setTimeout(() => {
      try {
        if (!isForced) {
          sessionStorage.setItem(STORAGE_KEY, "done");
        }
      } catch {
        /* ignore session storage errors */
      }

      setVisible(false);
    }, remaining);

    return () => {
      window.clearTimeout(timer);
    };
  }, [forcedMode, healthQuery.data, isForced, setStatus, setVisible, shouldWake]);

  return { visible: shouldWake && visible, status };
}

function useShouldShowWakeScreen() {
  return useSyncExternalStore(
    subscribeToWakeScreenStore,
    shouldShowWakeScreen,
    () => true,
  );
}

function subscribeToWakeScreenStore() {
  return () => {};
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

async function pingBackendHealth(signal?: AbortSignal) {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const requestSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await fetch(getApiUrl("/health"), {
      cache: "no-store",
      signal: requestSignal,
    });

    return response.ok;
  } catch {
    return false;
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
