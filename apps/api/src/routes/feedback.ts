import { Hono } from "hono";
import { z } from "zod";
import { db } from "@repo/db/client";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getRequestIp } from "@/lib/ip";
import { persistentRateLimit } from "@/lib/rate-limit";

const feedbackSchema = z.object({
  category: z.enum(["product", "bug", "feature", "other"]),
  message: z.string().trim().min(10).max(2000),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  pagePath: z.string().trim().startsWith("/").max(256).optional(),
  website: z.string().max(0).optional(),
});

export const feedbackRoutes = new Hono().post("/", async (context) => {
  let body: unknown;

  try {
    body = await context.req.json();
  } catch {
    return context.json({ error: "Invalid JSON body" }, 400);
  }

  const parsedBody = feedbackSchema.safeParse(body);

  if (!parsedBody.success) {
    return context.json(
      {
        error:
          parsedBody.error.issues[0]?.message ?? "Invalid feedback submission",
      },
      400,
    );
  }

  const ip = getRequestIp(context.req.raw);
  const limit = await persistentRateLimit({
    key: `feedback:${ip}`,
    limit: 5,
    windowMs: 24 * 60 * 60 * 1000,
  });

  if (!limit.success) {
    return context.json(
      { error: "Feedback limit reached. Please try again tomorrow." },
      429,
      {
        "Retry-After": Math.ceil(
          (limit.resetAt.getTime() - Date.now()) / 1000,
        ).toString(),
      },
    );
  }

  const userId = await getAuthenticatedUserId(context.req.raw);

  await db.feedback.create({
    data: {
      userId,
      category: parsedBody.data.category,
      message: parsedBody.data.message,
      email: parsedBody.data.email || null,
      pagePath: parsedBody.data.pagePath ?? null,
    },
  });

  return context.json({ ok: true }, 201);
});
