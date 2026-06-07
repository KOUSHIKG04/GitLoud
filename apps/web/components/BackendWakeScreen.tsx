"use client";

import { AppLogo } from "@/assets/AppLogo";
import { getApiUrl } from "@/lib/api-url";
import { LiquidEther } from "@repo/ui/components/liquid-ether";
import { useEffect, useState } from "react";

const storageKey = "gitloud:backend-wake-screen:v1";
const minVisibleMs = 10_000;
const maxVisibleMs = 15_000;
const retryDelayMs = 1_500;
const requestTimeoutMs = 4_000;

type WakeStatus = "starting" | "ready" | "slow";

export function BackendWakeScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<WakeStatus>("starting");

  useEffect(() => {
    if (!shouldShowWakeScreen()) {
      return;
    }

    let isCancelled = false;
    const startedAt = Date.now();
    setIsVisible(true);

    const finish = () => {
      if (isCancelled) {
        return;
      }

      sessionStorage.setItem(storageKey, "done");
      setIsVisible(false);
    };

    const maxTimer = window.setTimeout(() => {
      setStatus("slow");
      finish();
    }, maxVisibleMs);

    async function waitForMinimumThenFinish() {
      const remainingMs = Math.max(minVisibleMs - (Date.now() - startedAt), 0);

      window.setTimeout(() => {
        window.clearTimeout(maxTimer);
        finish();
      }, remainingMs);
    }

    async function wakeBackend() {
      while (!isCancelled && Date.now() - startedAt < maxVisibleMs) {
        const isReady = await pingBackendHealth();

        if (isReady) {
          setStatus("ready");
          await waitForMinimumThenFinish();
          return;
        }

        await wait(retryDelayMs);
      }
    }

    void wakeBackend();

    return () => {
      isCancelled = true;
      window.clearTimeout(maxTimer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const message =
    status === "ready"
      ? "is being ready, Opening your workspace"
      : status === "slow"
        ? "is still warming up, Opening your workspace"
        : "is being ready, Opening your workspace";

  return (
    <div
      className="fixed inset-0 z-1000 flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 text-foreground sm:px-8"
      role="status"
      aria-live="polite"
    >
      <LiquidEther className="bg-[#101010]" />

      <div className="relative flex w-full max-w-6xl flex-col items-center justify-center gap-6 text-center">
        <div className="flex w-full min-w-0 items-center justify-center gap-2 sm:gap-3">
          <AppLogo className="size-7 shrink-0 animate-pulse sm:size-9 md:size-10" />

          <div className="flex min-w-0 items-center justify-center gap-x-1.5 whitespace-nowrap font-mono text-[clamp(0.7rem,2.45vw,2rem)] leading-tight tracking-normal sm:gap-x-2.5">
            <span>Git</span>
            <span className="text-primary">loud</span>
            <span>{message}</span>
          </div>
        </div>

        <div className="relative mt-3 flex h-14 w-full max-w-72 items-center justify-center overflow-hidden font-mono text-[clamp(1.35rem,8vw,2.25rem)] font-semibold text-foreground sm:h-20 sm:max-w-88 sm:text-4xl">
          <span className="gitloud-status-word">Frontend ...</span>
          <span className="gitloud-status-word">API ...</span>
          <span className="gitloud-status-word">Backend ...</span>
        </div>
      </div>
    </div>
  );
}

function shouldShowWakeScreen() {
  if (typeof window === "undefined") {
    return false;
  }

  const forceWakeScreen = new URLSearchParams(window.location.search).has(
    "wake",
  );

  return forceWakeScreen || sessionStorage.getItem(storageKey) !== "done";
}

async function pingBackendHealth() {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
    }, requestTimeoutMs);

    try {
      const response = await fetch(getApiUrl("/health"), {
        cache: "no-store",
        signal: controller.signal,
      });

      return response.ok;
    } finally {
      window.clearTimeout(timeout);
    }
  } catch {
    return false;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
