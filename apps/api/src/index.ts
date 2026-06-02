import { serve } from "@hono/node-server";
import { getPort, loadRuntimeEnv } from "@/env";

loadRuntimeEnv();

const port = getPort(process.env.PORT);
const { app } = await import("@/app");

serve(
  {
    port,
    fetch: app.fetch,
  },
  (info) => {
    console.log(`GitLoud API listening on http://localhost:${info.port}/`);
  },
);
