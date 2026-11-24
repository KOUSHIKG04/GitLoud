import { Hono } from "hono";
import { getCurrentUserId } from "@/lib/auth";

export const profileRoutes = new Hono().post("/sync", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  return context.json({ ok: true });
});
