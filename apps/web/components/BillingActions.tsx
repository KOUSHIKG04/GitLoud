"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import { IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

type RazorpayOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name?: string | null;
    email?: string | null;
  };
  error?: string;
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export function BillingActions() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function startRazorpayCheckout() {
    setIsLoading(true);

    try {
      await loadRazorpayScript();

      const response = await apiFetch(
        "/billing/razorpay/order",
        { method: "POST" },
        getToken,
      );
      const data = (await response.json()) as RazorpayOrderResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not create Razorpay order");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout script did not load");
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.orderId,
        prefill: data.prefill,
        handler: (payment: RazorpaySuccessResponse) => {
          void verifyRazorpayPayment(payment);
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      });

      checkout.open();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start Razorpay",
      );
      setIsLoading(false);
    }
  }

  async function verifyRazorpayPayment(payment: RazorpaySuccessResponse) {
    try {
      const response = await apiFetch(
        "/billing/razorpay/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payment),
        },
        getToken,
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not verify Razorpay payment");
      }

      toast.success("Pro is active");
      window.location.href = "/dashboard/settings?billing=razorpay-success";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not verify payment",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <Button
        className="w-full"
        disabled={isLoading}
        onClick={startRazorpayCheckout}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <IndianRupee className="size-4" />
        )}
        PAY WITH RAZORPAY
      </Button>
    </div>
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
