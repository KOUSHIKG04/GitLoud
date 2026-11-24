"use client";

import { getApiUrl } from "@/lib/api/url";
import { DotmSquare4 } from "@repo/ui/components/dotm-square-4";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useSyncExternalStore } from "react";

// Covers the dashboard while a cold API boots. Mounted by the dashboard
// layout only; shown at most once per browser session.

const STORAGE_KEY = "gitloud:backend-wake-screen:v1";
const SLOW_AFTER_MS = 7_500;
const GIVE_UP_AFTER_MS = 15_000;
const RETRY_MS = 900;
const REQUEST_TIMEOUT_MS = 4_000;

export function BackendWakeScreen() {
  const firstVisit = useSyncExternalStore(subscribe, isFirstVisit, () => false);
  const [done, setDone] = useState(false);
  const [slow, setSlow] = useState(false);
  const active = firstVisit && !done;

  const { data: healthy } = useQuery({
    queryKey: ["backend-health"],
    queryFn: ({ signal }) => pingBackendHealth(signal),
    enabled: active,
    refetchInterval: (query) => (query.state.data === true ? false : RETRY_MS),
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!active) return;
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    const giveUpTimer = window.setTimeout(() => finish(setDone), GIVE_UP_AFTER_MS);
    return () => {
      window.clearTimeout(slowTimer);
      window.clearTimeout(giveUpTimer);
    };
  }, [active]);

  useEffect(() => {
    if (active && healthy === true) finish(setDone);
  }, [active, healthy]);

  if (!active) return null;

  return (
    <output
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-6">
        <DotmSquare4 />
        <p className="text-sm text-muted-foreground">
          {slow ? "Still warming up" : "Starting services"}
        </p>
      </div>
    </output>
  );
}

function finish(setDone: (done: boolean) => void) {
  try {
    sessionStorage.setItem(STORAGE_KEY, "done");
  } catch {
    /* ignore session storage errors */
  }
  setDone(true);
}

function subscribe() {
  return () => {};
}

function isFirstVisit() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== "done";
  } catch {
    return true;
  }
}

async function pingBackendHealth(signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getApiUrl("/health"), {
      cache: "no-store",
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    return response.ok;
  } catch {
    return false;
  }
}
