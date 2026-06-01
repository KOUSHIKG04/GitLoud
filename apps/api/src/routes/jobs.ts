import { Hono } from "hono";
import { cleanupOldGenerations } from "@/lib/cleanup-old-generations";

export const jobRoutes = new Hono().post(
  "/delete-old-generations",
  async (context) => {
    if (!isAuthorizedJobRequest(context.req.raw)) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const result = await cleanupOldGenerations(7);

    return context.json({
      ok: true,
      cutoff: result.cutoff.toISOString(),
      deletedGenerations: result.deletedGenerations,
      deletedPullRequests: result.deletedPullRequests,
      deletedCommits: result.deletedCommits,
    });
  },
);

function isAuthorizedJobRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const headerSecret = request.headers.get("x-cron-secret");

  return bearerToken === cronSecret || headerSecret === cronSecret;
}
