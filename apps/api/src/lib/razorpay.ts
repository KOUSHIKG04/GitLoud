import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

export type RazorpaySubscriptionEntity = {
  id: string;
  status: string;
  current_start?: number | null;
  current_end?: number | null;
  charge_at?: number | null;
  has_scheduled_changes?: boolean;
  paid_count?: number;
  remaining_count?: string | number;
  plan_id?: string;
};

export function getRazorpay() {
  return new Razorpay({
    key_id: getRequiredEnv("RAZORPAY_KEY_ID"),
    key_secret: getRequiredEnv("RAZORPAY_KEY_SECRET"),
  });
}

export function getRazorpayAmount() {
  const amount = Number.parseInt(
    process.env.RAZORPAY_PRO_AMOUNT_MINOR ?? "1400",
    10,
  );

  if (!Number.isInteger(amount) || amount < 100) {
    throw new Error(
      "RAZORPAY_PRO_AMOUNT_MINOR must be an integer of at least 100 minor currency units",
    );
  }

  return amount;
}

export function getSubscriptionTotalCount() {
  const totalCount = Number.parseInt(
    process.env.RAZORPAY_SUBSCRIPTION_TOTAL_COUNT ?? "120",
    10,
  );

  if (!Number.isInteger(totalCount) || totalCount < 1 || totalCount > 1200) {
    throw new Error(
      "RAZORPAY_SUBSCRIPTION_TOTAL_COUNT must be between 1 and 1200",
    );
  }

  return totalCount;
}

export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = createHmac("sha256", getRequiredEnv("RAZORPAY_KEY_SECRET"))
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeCompare(expected, signature);
}

export function verifyRazorpaySubscriptionSignature({
  paymentId,
  subscriptionId,
  signature,
}: {
  paymentId: string;
  subscriptionId: string;
  signature: string;
}) {
  const expected = createHmac("sha256", getRequiredEnv("RAZORPAY_KEY_SECRET"))
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");

  return safeCompare(expected, signature);
}

export function verifyRazorpayWebhookSignature({
  payload,
  signature,
}: {
  payload: string;
  signature: string;
}) {
  const expected = createHmac(
    "sha256",
    getRequiredEnv("RAZORPAY_WEBHOOK_SECRET"),
  )
    .update(payload)
    .digest("hex");

  return safeCompare(expected, signature);
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing`);
  }

  return value;
}

export function getRazorpayError(error: unknown): {
  message: string;
  status: 401 | 500;
} {
  const value = error as {
    statusCode?: number;
    error?: {
      description?: string;
    };
    message?: string;
  };

  if (value?.statusCode === 401) {
    return {
      message:
        "Razorpay rejected the API credentials. Create a new Test Mode key pair and update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      status: 401,
    };
  }

  return {
    message:
      value?.error?.description ??
      value?.message ??
      "Razorpay could not create the order.",
    status: 500,
  };
}

export function unixDate(value?: number | null) {
  return unixDateValue(value)?.toISOString() ?? null;
}

export function unixDateValue(value?: number | null) {
  return value ? new Date(value * 1000) : null;
}

function safeCompare(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}
