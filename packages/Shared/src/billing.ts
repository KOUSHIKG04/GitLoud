import { z } from "zod";

export const USER_PLANS = ["FREE", "PRO"] as const;
export type UserPlan = (typeof USER_PLANS)[number];

export type BillingProvider = "RAZORPAY" | "MANUAL";

export type BillingSubscription = {
  configured: boolean;
  id: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  nextChargeAt: string | null;
  cancelAtPeriodEnd: boolean;
};

export type BillingPayment = {
  id: string;
  status: string;
  amount: number | null;
  currency: string | null;
  method: string | null;
  createdAt: string | null;
};

export type BillingStatusResponse = {
  plan: UserPlan;
  planExpiresAt: string | null;
  billingProvider: BillingProvider | null;
  subscription: Pick<
    BillingSubscription,
    "id" | "status" | "cancelAtPeriodEnd"
  >;
};

export type BillingDetailsResponse = BillingStatusResponse & {
  payment: BillingPayment | null;
  subscription: BillingSubscription;
};

export type RazorpayCheckoutPrefill = {
  name?: string | null;
  email?: string | null;
};

export type RazorpayOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: RazorpayCheckoutPrefill;
};

export type RazorpaySubscriptionCheckoutResponse = {
  keyId: string;
  subscriptionId: string;
  name: string;
  description: string;
  prefill: RazorpayCheckoutPrefill;
};

export const razorpayPaymentVerificationSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type RazorpayPaymentVerification = z.infer<
  typeof razorpayPaymentVerificationSchema
>;

export const razorpaySubscriptionVerificationSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type RazorpaySubscriptionVerification = z.infer<
  typeof razorpaySubscriptionVerificationSchema
>;

export type RazorpayPaymentFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
};
