import type { RazorpayPaymentFailureResponse } from "@repo/shared/billing";

declare global {
  interface RazorpayCheckout {
    open: () => void;
    on: (
      event: "payment.failed",
      handler: (response: RazorpayPaymentFailureResponse) => void,
    ) => void;
  }

  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}

export {};
