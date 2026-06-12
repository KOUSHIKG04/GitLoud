"use client";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import type { BillingStatusResponse } from "@repo/shared/billing";

export function useBillingPlan() {
  const { getToken, isSignedIn, userId } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const getTokenRef = useRef(getToken);

  getTokenRef.current = getToken;

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch(
          "/billing/status",
          {},
          getTokenRef.current,
        );

        if (!response.ok) {
          throw new Error("Could not load billing status");
        }

        const data = (await response.json()) as BillingStatusResponse;

        if (active) {
          setIsPro(data.plan === "PRO");
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError
              : new Error("Could not load billing status"),
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (isSignedIn && userId) {
      void loadPlan();
    } else {
      setIsPro(false);
      setIsLoading(false);
    }

    return () => {
      active = false;
    };
  }, [isSignedIn, userId]);

  return { error, isLoading, isPro };
}
