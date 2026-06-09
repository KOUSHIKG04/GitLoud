"use client";

import { type ComponentProps, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import { CircleDollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@repo/ui/lib/utils";
import { PaymentsComingSoon } from "@/components/PaymentsComingSoon";
import type {
  RazorpayOrderResponse,
  RazorpayPaymentVerification,
} from "@repo/shared/billing";

export function BillingActions({
  buttonLabel = "PAY WITH RAZORPAY",
  buttonVariant = "default",
  className,
  showPaymentIcon = true,
  redirectTo = "/dashboard/billing?payment=success",
}: {
  buttonLabel?: string;
  buttonVariant?: ComponentProps<typeof Button>["variant"];
  className?: string;
  showPaymentIcon?: boolean;
  redirectTo?: string;
}) {
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
      const data = (await response.json()) as RazorpayOrderResponse & {
        error?: string;
      };

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
        handler: (payment: RazorpayPaymentVerification) => {
          void verifyRazorpayPayment(payment);
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.info("Payment cancelled");
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        setIsLoading(false);
        toast.error(
          response.error?.description ??
            response.error?.reason ??
            "Payment failed. Please try another payment method.",
        );
      });
      checkout.open();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start Razorpay",
      );
      setIsLoading(false);
    }
  }

  async function verifyRazorpayPayment(payment: RazorpayPaymentVerification) {
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
      window.location.href = redirectTo;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not verify payment",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("mt-6", className)}>
      <PaymentsComingSoon>
        <Button
          className="w-full"
          variant={buttonVariant}
          disabled
          onClick={startRazorpayCheckout}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : showPaymentIcon ? (
            <CircleDollarSign className="size-4" />
          ) : null}
          {buttonLabel}
        </Button>
      </PaymentsComingSoon>
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
