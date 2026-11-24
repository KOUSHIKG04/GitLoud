import { Hono } from "hono";
import { z } from "zod";
import { AI_PROVIDERS } from "@repo/shared/ai-credentials";
import {
  deleteAiCredential,
  getSupportedAiProviders,
  listAiCredentials,
  normalizeProvider,
  saveAiCredential,
} from "@/features/ai-credentials/service";
import { getCurrentUserId } from "@/lib/auth";

const saveCredentialSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  apiKey: z.string().trim().min(16),
  model: z.string().trim().optional(),
});

export const aiCredentialRoutes = new Hono();

aiCredentialRoutes.get("/", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }


  return context.json({
    supportedProviders: getSupportedAiProviders(),
    credentials: await listAiCredentials(userId),
  });
});

aiCredentialRoutes.post("/", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }


  const body = saveCredentialSchema.safeParse(await context.req.json());

  if (!body.success) {
    return context.json(
      { error: "Enter a valid AI provider and API key." },
      400,
    );
  }

  await saveAiCredential({
    userId,
    provider: body.data.provider,
    apiKey: body.data.apiKey,
    model: body.data.model,
  });

  return context.json({
    supportedProviders: getSupportedAiProviders(),
    credentials: await listAiCredentials(userId),
  });
});

aiCredentialRoutes.delete("/:provider", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }


  const provider = context.req.param("provider");

  try {
    await deleteAiCredential(userId, normalizeProvider(provider));
  } catch (error) {
    return context.json(
      { error: error instanceof Error ? error.message : String(error) },
      400,
    );
  }

  return context.json({
    supportedProviders: getSupportedAiProviders(),
    credentials: await listAiCredentials(userId),
  });
});
