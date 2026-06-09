"use client";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import { Loader2, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentsComingSoon } from "@/components/PaymentsComingSoon";
import type {
  RazorpaySubscriptionCheckoutResponse,
  RazorpaySubscriptionVerification,
} from "@repo/shared/billing";

export function SubscriptionActions({
  configured,
  hasSubscription,
  cancelAtPeriodEnd,
  onChanged,
}: {
  configured: boolean;
  hasSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  onChanged: () => Promise<void>;
}) {
  const { getToken } = useAuth();
  const [action, setAction] = useState<"enable" | "cancel" | null>(null);

  async function enableAutoRenewal() {
    setAction("enable");

    try {
      await loadRazorpayScript();
      const response = await apiFetch(
        "/billing/razorpay/subscription",
        { method: "POST" },
        getToken,
      );
      const data =
        (await response.json()) as RazorpaySubscriptionCheckoutResponse & {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not create subscription");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout script did not load");
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: data.name,
        description: data.description,
        prefill: data.prefill,
        handler: (payment: RazorpaySubscriptionVerification) => {
          void verifySubscription(payment);
        },
        modal: {
          ondismiss: () => setAction(null),
        },
      });

      checkout.open();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not enable auto renewal",
      );
      setAction(null);
    }
  }

  async function verifySubscription(payment: RazorpaySubscriptionVerification) {
    try {
      const response = await apiFetch(
        "/billing/razorpay/subscription/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payment),
        },
        getToken,
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not verify subscription");
      }

      toast.success("Auto renewal is active");
      await onChanged();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not verify subscription",
      );
    } finally {
      setAction(null);
    }
  }

  async function cancelSubscription() {
    setAction("cancel");

    try {
      const response = await apiFetch(
        "/billing/razorpay/subscription/cancel",
        { method: "POST" },
        getToken,
      );
      const data = (await response.json()) as {
        error?: string;
        subscription?: {
          cancelAtPeriodEnd?: boolean;
        };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update subscription");
      }

      toast.success(
        data.subscription?.cancelAtPeriodEnd
          ? "Auto renewal will stop after the current period"
          : "Auto renewal is cancelled",
      );
      await onChanged();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update subscription",
      );
    } finally {
      setAction(null);
    }
  }

  if (!configured) {
    return (
      <PaymentsComingSoon>
        <Button type="button" className="w-full" disabled>
          ENABLE AUTO RENEWAL
        </Button>
      </PaymentsComingSoon>
    );
  }

  if (!hasSubscription) {
    return (
      <PaymentsComingSoon>
        <Button
          type="button"
          className="w-full"
          disabled
          onClick={() => void enableAutoRenewal()}
        >
          {action === "enable" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          ENABLE AUTO RENEWAL
        </Button>
      </PaymentsComingSoon>
    );
  }

  if (cancelAtPeriodEnd) {
    return (
      <Button type="button" variant="outline" className="w-full" disabled>
        CANCELLATION SCHEDULED
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="destructive"
      className="w-full"
      disabled={action !== null}
      onClick={() => void cancelSubscription()}
    >
      {action === "cancel" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <XCircle className="size-4" />
      )}
      CANCEL AUTO RENEWAL
    </Button>
  );
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });
}
