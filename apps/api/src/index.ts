import { serve } from "@hono/node-server";
import { app } from "@/app";
import { getPort } from "@/env";

const port = getPort(process.env.PORT);

serve(
  {
    port,
    fetch: app.fetch,
  },
  (info) => {
    console.log(`GitLoud API listening on http://localhost:${info.port}/`);
  },
);
