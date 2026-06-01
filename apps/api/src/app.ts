import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { getAllowedOrigins } from "@/env";
import { scheduleLazyCleanup } from "@/lib/lazy-cleanup";
import { generationRoutes } from "@/routes/generations";
import { healthRoutes } from "@/routes/health";
import { jobRoutes } from "@/routes/jobs";
import { mediaRoutes } from "@/routes/media";
import { prRoutes } from "@/routes/pr";
import { profileRoutes } from "@/routes/profile";

export function createApp(options?: { allowedOrigins?: string[] }) {
  const allowedOrigins =
    options?.allowedOrigins ??
    getAllowedOrigins(process.env.API_ALLOWED_ORIGINS);

  const app = new Hono();

  app.use("*", logger());
  app.use("*", async (_context, next) => {
    scheduleLazyCleanup();
    await next();
  });
  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (!origin) {
          return undefined;
        }

        return allowedOrigins.includes(origin) ? origin : undefined;
      },
      credentials: true,
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  app.get("/", (context) => {
    return context.json({
      ok: true,
      name: "GitLoud API",
      health: "/health",
    });
  });

  app.route("/health", healthRoutes);
  app.route("/v1/health", healthRoutes);
  app.route("/jobs", jobRoutes);
  app.route("/v1/jobs", jobRoutes);
  app.route("/profile", profileRoutes);
  app.route("/v1/profile", profileRoutes);
  app.route("/pr", prRoutes);
  app.route("/v1/pr", prRoutes);
  app.route("/media", mediaRoutes);
  app.route("/v1/media", mediaRoutes);
  app.route("/generations", generationRoutes);
  app.route("/v1/generations", generationRoutes);

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
