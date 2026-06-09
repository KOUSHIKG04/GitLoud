import { Hono } from "hono";
import { getCurrentUserId } from "@/lib/auth";
import { db } from "@repo/db/client";
import {
  razorpayPaymentVerificationSchema,
  razorpaySubscriptionVerificationSchema,
} from "@repo/shared/billing";
import {
  getRazorpay,
  getRazorpayAmount,
  getRazorpayError,
  getRequiredEnv,
  getSubscriptionTotalCount,
  type RazorpaySubscriptionEntity,
  unixDate,
  unixDateValue,
  verifyRazorpayPaymentSignature,
  verifyRazorpaySubscriptionSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";

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
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
      subscriptionCancelAtEnd: true,
    },
  });

  const plan =
    user?.planExpiresAt && user.planExpiresAt <= new Date()
      ? "FREE"
      : (user?.plan ?? "FREE");

  return context.json({
    plan,
    planExpiresAt: user?.planExpiresAt?.toISOString() ?? null,
    billingProvider: user?.billingProvider ?? null,
    subscription: {
      id: user?.razorpaySubscriptionId ?? null,
      status: user?.subscriptionStatus ?? null,
      cancelAtPeriodEnd: user?.subscriptionCancelAtEnd ?? false,
    },
  });
});

billingRoutes.get("/details", async (context) => {
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
      razorpayPaymentId: true,
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
      subscriptionCancelAtEnd: true,
    },
  });
  const plan =
    user?.planExpiresAt && user.planExpiresAt <= new Date()
      ? "FREE"
      : (user?.plan ?? "FREE");
  const payment = await getLatestPayment(user?.razorpayPaymentId);
  const subscription = await getSubscriptionDetails({
    subscriptionId: user?.razorpaySubscriptionId,
    storedStatus: user?.subscriptionStatus,
    cancelAtPeriodEnd: user?.subscriptionCancelAtEnd ?? false,
  });

  return context.json({
    plan,
    planExpiresAt: user?.planExpiresAt?.toISOString() ?? null,
    billingProvider: user?.billingProvider ?? null,
    payment,
    subscription,
  });
});

billingRoutes.post("/razorpay/subscription", async (context) => {
  try {
    const userId = await getCurrentUserId(context.req.raw);

    if (!userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        planExpiresAt: true,
        razorpaySubscriptionId: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return context.json({ error: "User not found" }, 404);
    }

    if (user.razorpaySubscriptionId && user.subscriptionStatus === "created") {
      return context.json(
        createSubscriptionCheckoutResponse({
          subscriptionId: user.razorpaySubscriptionId,
          name: user.name,
          email: user.email,
        }),
      );
    }

    if (
      user.razorpaySubscriptionId &&
      isManagedSubscriptionStatus(user.subscriptionStatus)
    ) {
      return context.json(
        { error: "An auto-renewing subscription already exists." },
        409,
      );
    }

    const now = new Date();
    const startAt =
      user.planExpiresAt && user.planExpiresAt > now
        ? Math.floor(user.planExpiresAt.getTime() / 1000)
        : undefined;
    const subscription = await getRazorpay().subscriptions.create({
      plan_id: getRequiredEnv("RAZORPAY_PRO_PLAN_ID"),
      total_count: getSubscriptionTotalCount(),
      quantity: 1,
      customer_notify: true,
      ...(startAt ? { start_at: startAt } : {}),
      notes: {
        userId,
        plan: "PRO",
      },
    });

    await db.user.update({
      where: { id: userId },
      data: {
        razorpaySubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionCancelAtEnd: false,
        billingProvider: "RAZORPAY",
      },
    });

    return context.json(
      createSubscriptionCheckoutResponse({
        subscriptionId: subscription.id,
        name: user.name,
        email: user.email,
      }),
    );
  } catch (error) {
    return context.json(
      {
        error:
          error instanceof Error
            ? `Razorpay subscription failed: ${error.message}`
            : "Razorpay subscription failed",
      },
      500,
    );
  }
});

billingRoutes.post("/razorpay/subscription/verify", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const body = razorpaySubscriptionVerificationSchema.safeParse(
    await context.req.json(),
  );

  if (!body.success) {
    return context.json({ error: "Invalid subscription payload" }, 400);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  if (
    !user?.razorpaySubscriptionId ||
    user.razorpaySubscriptionId !== body.data.razorpay_subscription_id
  ) {
    return context.json({ error: "Razorpay subscription mismatch" }, 400);
  }

  if (
    !verifyRazorpaySubscriptionSignature({
      paymentId: body.data.razorpay_payment_id,
      subscriptionId: user.razorpaySubscriptionId,
      signature: body.data.razorpay_signature,
    })
  ) {
    return context.json({ error: "Invalid subscription signature" }, 400);
  }

  const subscription = await getRazorpay().subscriptions.fetch(
    user.razorpaySubscriptionId,
  );
  await syncSubscription({
    subscription,
    paymentId: body.data.razorpay_payment_id,
  });

  return context.json({
    subscription: serializeSubscription(subscription, false),
  });
});

billingRoutes.post("/razorpay/subscription/cancel", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  if (!user?.razorpaySubscriptionId) {
    return context.json({ error: "No subscription found" }, 404);
  }

  const cancelAtPeriodEnd =
    user.subscriptionStatus === "active" ||
    user.subscriptionStatus === "pending" ||
    user.subscriptionStatus === "halted";
  const subscription = await getRazorpay().subscriptions.cancel(
    user.razorpaySubscriptionId,
    cancelAtPeriodEnd,
  );
  await db.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: subscription.status,
      subscriptionCancelAtEnd: cancelAtPeriodEnd,
    },
  });

  return context.json({
    subscription: serializeSubscription(subscription, cancelAtPeriodEnd),
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
    const currency = process.env.RAZORPAY_CURRENCY ?? "USD";
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
      description: "$14 for 30 days of GitLoud Pro access",
      prefill: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    const razorpayError = getRazorpayError(error);

    return context.json(
      {
        error: `Razorpay order failed: ${razorpayError.message}`,
      },
      razorpayError.status,
    );
  }
});

billingRoutes.post("/razorpay/verify", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const body = razorpayPaymentVerificationSchema.safeParse(
    await context.req.json(),
  );

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
  const signature = context.req.header("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return context.json({ error: "RAZORPAY_WEBHOOK_SECRET is missing" }, 500);
  }

  if (!signature) {
    return context.json({ error: "Missing Razorpay signature" }, 400);
  }

  const payload = await context.req.text();

  if (!verifyRazorpayWebhookSignature({ payload, signature })) {
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
      subscription?: {
        entity?: RazorpaySubscriptionEntity;
      };
    };
  };
  const payment = event.payload?.payment?.entity;
  const subscription = event.payload?.subscription?.entity;

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

  if (event.event?.startsWith("subscription.") && subscription?.id) {
    await syncSubscription({
      subscription,
      paymentId: payment?.id,
      cancelAtPeriodEnd:
        event.event === "subscription.cancelled" ? false : undefined,
    });
  }

  return context.json({ received: true });
});

async function activateRazorpayPlan({
  userId,
  paymentId,
}: {
  userId: string;
  paymentId: string;
}) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { planExpiresAt: true },
  });
  const now = new Date();
  const expiresAt =
    user?.planExpiresAt && user.planExpiresAt > now
      ? new Date(user.planExpiresAt)
      : now;
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

async function getLatestPayment(paymentId?: string | null) {
  if (
    !paymentId ||
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    return null;
  }

  try {
    const payment = await getRazorpay().payments.fetch(paymentId);

    return {
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      createdAt: new Date(payment.created_at * 1000).toISOString(),
    };
  } catch {
    return {
      id: paymentId,
      status: "verified",
      amount: null,
      currency: null,
      method: null,
      createdAt: null,
    };
  }
}

async function getSubscriptionDetails({
  subscriptionId,
  storedStatus,
  cancelAtPeriodEnd,
}: {
  subscriptionId?: string | null;
  storedStatus?: string | null;
  cancelAtPeriodEnd: boolean;
}) {
  if (!subscriptionId) {
    return {
      configured: Boolean(process.env.RAZORPAY_PRO_PLAN_ID),
      id: null,
      status: null,
      currentPeriodEnd: null,
      nextChargeAt: null,
      cancelAtPeriodEnd: false,
    };
  }

  try {
    const subscription =
      await getRazorpay().subscriptions.fetch(subscriptionId);

    return {
      configured: Boolean(process.env.RAZORPAY_PRO_PLAN_ID),
      ...serializeSubscription(subscription, cancelAtPeriodEnd),
    };
  } catch {
    return {
      configured: Boolean(process.env.RAZORPAY_PRO_PLAN_ID),
      id: subscriptionId,
      status: storedStatus ?? "unknown",
      currentPeriodEnd: null,
      nextChargeAt: null,
      cancelAtPeriodEnd,
    };
  }
}

function serializeSubscription(
  subscription: RazorpaySubscriptionEntity,
  cancelAtPeriodEnd: boolean,
) {
  return {
    id: subscription.id,
    status: subscription.status,
    currentPeriodEnd: unixDate(subscription.current_end),
    nextChargeAt: unixDate(subscription.charge_at),
    cancelAtPeriodEnd,
  };
}

async function syncSubscription({
  subscription,
  paymentId,
  cancelAtPeriodEnd,
}: {
  subscription: RazorpaySubscriptionEntity;
  paymentId?: string;
  cancelAtPeriodEnd?: boolean;
}) {
  const user = await db.user.findUnique({
    where: { razorpaySubscriptionId: subscription.id },
    select: {
      id: true,
      planExpiresAt: true,
      subscriptionCancelAtEnd: true,
    },
  });

  if (!user) {
    return;
  }

  const currentEnd = unixDateValue(subscription.current_end);
  const grantsAccess =
    subscription.status === "authenticated" ||
    subscription.status === "active" ||
    subscription.status === "pending" ||
    subscription.status === "halted" ||
    (subscription.status === "cancelled" &&
      Boolean(currentEnd && currentEnd > new Date()));

  await db.user.update({
    where: { id: user.id },
    data: {
      plan: grantsAccess ? "PRO" : "FREE",
      planExpiresAt: currentEnd ?? user.planExpiresAt,
      subscriptionStatus: subscription.status,
      subscriptionCancelAtEnd:
        cancelAtPeriodEnd ?? user.subscriptionCancelAtEnd,
      ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
    },
  });
}

function isManagedSubscriptionStatus(status?: string | null) {
  return (
    status === "created" ||
    status === "authenticated" ||
    status === "active" ||
    status === "pending" ||
    status === "halted"
  );
}

function createSubscriptionCheckoutResponse({
  subscriptionId,
  name,
  email,
}: {
  subscriptionId: string;
  name?: string | null;
  email: string;
}) {
  return {
    keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
    subscriptionId,
    name: "GitLoud Pro",
    description: "GitLoud Pro monthly auto-renewal at $14 per month",
    prefill: {
      name,
      email,
    },
  };
}
