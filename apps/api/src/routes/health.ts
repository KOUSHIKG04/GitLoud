import { Hono } from "hono";

export const healthRoutes = new Hono().get("/", (context) => {
  return context.json({
    ok: true,
    service: "gitloud-api",
    runtime: "node",
    timestamp: new Date().toISOString(),
  });
});
