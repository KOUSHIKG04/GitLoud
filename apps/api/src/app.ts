import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { getAllowedOrigins, isAllowedOrigin, normalizeOrigin } from "@/env";
import { scheduleLazyCleanup } from "@/lib/lazy-cleanup";
import { aiCredentialRoutes } from "@/routes/ai-credentials";
import { billingRoutes } from "@/routes/billing";
import { generationRoutes } from "@/routes/generations";
import { githubRoutes } from "@/routes/github";
import { healthRoutes } from "@/routes/health";
import { mediaRoutes } from "@/routes/media";
import { prRoutes } from "@/routes/pr";
import { profileRoutes } from "@/routes/profile";

/**
 * Creates the Hono API app with shared middleware and route registration.
 */
export function createApp(options?: { allowedOrigins?: string[] }) {
  const allowedOrigins =
    options?.allowedOrigins ??
    getAllowedOrigins(process.env.API_ALLOWED_ORIGINS);

  const app = new Hono();

  app.use("*", async (context, next) => {
    setCorsHeaders(context, allowedOrigins);

    if (context.req.method === "OPTIONS") {
      return context.body(null, 204);
    }

    await next();
    setCorsHeaders(context, allowedOrigins);
  });

  app.use("*", logger());
  app.use("*", async (_context, next) => {
    scheduleLazyCleanup();
    await next();
  });

  app.get("/", (context) => {
    return context.json({
      ok: true,
      name: "GitLoud API",
      health: "/health",
    });
  });

  app.route("/health", healthRoutes);
  app.route("/profile", profileRoutes);
  app.route("/media", mediaRoutes);
  app.route("/generations", generationRoutes);
  app.route("/pr", prRoutes);
  app.route("/github", githubRoutes);
  app.route("/ai-credentials", aiCredentialRoutes);
  app.route("/billing", billingRoutes);

  app.notFound((context) => {
    return context.json({ error: "Not found" }, 404);
  });

  app.onError((error, context) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }

    console.error(error);

    return context.json({ error: "Internal server error" }, 500);
  });

  return app;
}

export const app = createApp();

/**
 * Applies CORS headers when the request origin is explicitly allowed.
 */
function setCorsHeaders(
  context: Parameters<Parameters<Hono["use"]>[1]>[0],
  allowedOrigins: string[],
) {
  const origin = context.req.header("origin");

  if (!origin || !isAllowedOrigin(origin, allowedOrigins)) {
    return;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  context.header("Access-Control-Allow-Origin", normalizedOrigin);
  context.header("Vary", "Origin", { append: true });
  context.header("Access-Control-Allow-Credentials", "true");
  context.header("Access-Control-Allow-Headers", "Authorization,Content-Type");
  context.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
}
