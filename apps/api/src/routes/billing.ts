import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import Razorpay from "razorpay";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { db } from "@repo/db/client";

const razorpayVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const billingRoutes = new Hono();

billingRoutes.get("/status", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiresAt: true,
      billingProvider: true,
    },
  });

  return context.json({
    plan: user?.plan ?? "FREE",
    planExpiresAt: user?.planExpiresAt?.toISOString() ?? null,
    billingProvider: user?.billingProvider ?? null,
  });
});

billingRoutes.post("/razorpay/order", async (context) => {
  try {
    const userId = await getCurrentUserId(context.req.raw);

    if (!userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return context.json({ error: "User not found" }, 404);
    }

    const razorpay = getRazorpay();
    const amount = getRazorpayAmount();
    const currency = process.env.RAZORPAY_CURRENCY ?? "INR";
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `gitloud_pro_${userId.slice(0, 12)}_${Date.now()}`,
      notes: {
        userId,
        plan: "PRO",
      },
    });

    await db.user.update({
      where: { id: userId },
      data: {
        razorpayOrderId: order.id,
        billingProvider: "RAZORPAY",
      },
    });

    return context.json({
      keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: "GitLoud Pro",
      description: "30 days of GitLoud Pro access",
      prefill: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return context.json(
      {
        error:
          error instanceof Error
            ? `Razorpay order failed: ${error.message}`
            : "Razorpay order failed",
      },
      500,
    );
  }
});

billingRoutes.post("/razorpay/verify", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const body = razorpayVerifySchema.safeParse(await context.req.json());

  if (!body.success) {
    return context.json({ error: "Invalid Razorpay payment payload" }, 400);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { razorpayOrderId: true },
  });

  if (!user?.razorpayOrderId) {
    return context.json({ error: "No pending Razorpay order found" }, 400);
  }

  if (user.razorpayOrderId !== body.data.razorpay_order_id) {
    return context.json({ error: "Razorpay order mismatch" }, 400);
  }

  const isValid = verifyRazorpayPaymentSignature({
    orderId: body.data.razorpay_order_id,
    paymentId: body.data.razorpay_payment_id,
    signature: body.data.razorpay_signature,
  });

  if (!isValid) {
    return context.json({ error: "Invalid Razorpay payment signature" }, 400);
  }

  const expiresAt = await activateRazorpayPlan({
    userId,
    paymentId: body.data.razorpay_payment_id,
  });

  return context.json({
    plan: "PRO",
    planExpiresAt: expiresAt.toISOString(),
  });
});

billingRoutes.post("/razorpay/webhook", async (context) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = context.req.header("x-razorpay-signature");

  if (!webhookSecret) {
    return context.json({ error: "RAZORPAY_WEBHOOK_SECRET is missing" }, 500);
  }

  if (!signature) {
    return context.json({ error: "Missing Razorpay signature" }, 400);
  }

  const payload = await context.req.text();
  const expected = createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  if (!safeCompare(expected, signature)) {
    return context.json({ error: "Invalid Razorpay webhook signature" }, 400);
  }

  const event = JSON.parse(payload) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
        };
      };
    };
  };
  const payment = event.payload?.payment?.entity;

  if (event.event === "payment.captured" && payment?.id && payment.order_id) {
    const user = await db.user.findFirst({
      where: { razorpayOrderId: payment.order_id },
      select: { id: true },
    });

    if (user) {
      await activateRazorpayPlan({
        userId: user.id,
        paymentId: payment.id,
      });
    }
  }

  return context.json({ received: true });
});

function getRazorpay() {
  return new Razorpay({
    key_id: getRequiredEnv("RAZORPAY_KEY_ID"),
    key_secret: getRequiredEnv("RAZORPAY_KEY_SECRET"),
  });
}

function getRazorpayAmount() {
  const amount = Number.parseInt(
    process.env.RAZORPAY_PRO_AMOUNT_INR_PAISE ?? "79900",
    10,
  );

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("RAZORPAY_PRO_AMOUNT_INR_PAISE must be a positive integer");
  }

  return amount;
}

function verifyRazorpayPaymentSignature({
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

function safeCompare(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

async function activateRazorpayPlan({
  userId,
  paymentId,
}: {
  userId: string;
  paymentId: string;
}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.user.update({
    where: { id: userId },
    data: {
      plan: "PRO",
      planExpiresAt: expiresAt,
      billingProvider: "RAZORPAY",
      razorpayPaymentId: paymentId,
    },
  });

  return expiresAt;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing`);
  }

  return value;
}
