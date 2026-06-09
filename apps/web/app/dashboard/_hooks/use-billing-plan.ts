"use client";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import type { BillingStatusResponse } from "@repo/shared/billing";

export function useBillingPlan() {
  const { getToken } = useAuth();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      try {
        const response = await apiFetch("/billing/status", {}, getToken);

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as BillingStatusResponse;

        if (active) {
          setIsPro(data.plan === "PRO");
        }
      } catch {
        // Locked navigation is the safe fallback when billing is unavailable.
      }
    }

    void loadPlan();

    return () => {
      active = false;
    };
  }, [getToken]);

  return isPro;
}
