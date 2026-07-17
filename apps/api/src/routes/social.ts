import { db } from "@repo/db/client";
import { Hono, type Context } from "hono";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { logger } from "@/lib/logger";
import {
  composeDiscordContent,
  DiscordDeliveryUnknownError,
  publishDiscordMessage,
  saveDiscordConnection,
} from "@/lib/social-publishing";

const connectDiscordSchema = z.object({
  webhookUrl: z.string().trim().min(1),
  displayName: z.string().trim().max(80).optional(),
});

const publishSchema = z.object({
  connectionId: z.string().trim().min(1),
  generationId: z.string().trim().min(1),
  idempotencyKey: z.string().trim().min(16).max(100),
});

const publicationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().min(1).optional(),
});

export const socialRoutes = new Hono();

type SocialPublishDependencies = {
  db: typeof db;
  getCurrentUserId: typeof getCurrentUserId;
  publishDiscordMessage: typeof publishDiscordMessage;
};

export function createSocialPublishHandler(
  overrides: Partial<SocialPublishDependencies> = {},
) {
  const dependencies: SocialPublishDependencies = {
    db,
    getCurrentUserId,
    publishDiscordMessage,
    ...overrides,
  };

  return (context: Context) => publish(context, dependencies);
}

socialRoutes.get("/connections", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  return context.json({ connections: await listConnections(userId) });
});

socialRoutes.post("/discord/connect", connectDiscord);
socialRoutes.post("/connections/discord", connectDiscord);

socialRoutes.delete("/connections/:connectionId", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const result = await db.socialConnection.deleteMany({
    where: { id: context.req.param("connectionId"), userId },
  });

  if (result.count === 0) {
    return context.json({ error: "Social connection not found." }, 404);
  }

  return context.json({ connections: await listConnections(userId) });
});

const socialPublishHandler = createSocialPublishHandler();

socialRoutes.post("/publish", socialPublishHandler);
socialRoutes.post("/publish/discord", socialPublishHandler);

socialRoutes.get("/publications", async (context) => {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const query = publicationQuerySchema.safeParse(context.req.query());

  if (!query.success) {
    return context.json({ error: "Invalid publication query." }, 400);
  }

  if (query.data.cursor) {
    const cursor = await db.socialPublication.findFirst({
      where: { id: query.data.cursor, userId },
      select: { id: true },
    });

    if (!cursor) {
      return context.json({ error: "Publication cursor not found." }, 400);
    }
  }

  const publications = await db.socialPublication.findMany({
    where: { userId, provider: "DISCORD" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: query.data.limit + 1,
    ...(query.data.cursor
      ? { cursor: { id: query.data.cursor }, skip: 1 }
      : {}),
    include: { connection: { select: { displayName: true } } },
  });
  const hasNextPage = publications.length > query.data.limit;
  const page = hasNextPage
    ? publications.slice(0, query.data.limit)
    : publications;

  return context.json({
    publications: page.map((publication) => serializePublication(publication)),
    nextCursor: hasNextPage ? (page.at(-1)?.id ?? null) : null,
  });
});

async function connectDiscord(context: Context) {
  const userId = await getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const body = connectDiscordSchema.safeParse(
    await context.req.json().catch(() => null),
  );

  if (!body.success) {
    return context.json({ error: "Enter a valid Discord webhook URL." }, 400);
  }

  try {
    await saveDiscordConnection({ userId, ...body.data });
    return context.json({ connections: await listConnections(userId) }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not connect Discord.";
    logger.warn("Discord connection failed", { userId, error: message });
    return context.json({ error: message }, 400);
  }
}

async function publish(
  context: Context,
  dependencies: SocialPublishDependencies,
) {
  const userId = await dependencies.getCurrentUserId(context.req.raw);

  if (!userId) {
    return context.json({ error: "Unauthorized" }, 401);
  }

  const body = publishSchema.safeParse(
    await context.req.json().catch(() => null),
  );

  if (!body.success) {
    return context.json({ error: "Invalid Discord publish request." }, 400);
  }

  const existing = await dependencies.db.socialPublication.findUnique({
    where: {
      userId_idempotencyKey: {
        userId,
        idempotencyKey: body.data.idempotencyKey,
      },
    },
  });

  if (existing && !hasMatchingPublishPayload(existing, body.data)) {
    return context.json(
      { error: "This idempotency key belongs to a different publish request." },
      409,
    );
  }

  if (existing?.status === "PUBLISHED") {
    return context.json({
      publication: serializePublication(existing),
      reused: true,
    });
  }

  if (existing?.status === "PENDING") {
    return context.json(
      { error: "This post is already being published." },
      409,
    );
  }

  if (existing?.status === "UNKNOWN") {
    return context.json(
      {
        error:
          "Discord may already have published this post. Check the channel before trying again with a new idempotency key.",
      },
      409,
    );
  }

  const [connection, generation] = await Promise.all([
    dependencies.db.socialConnection.findFirst({
      where: {
        id: body.data.connectionId,
        userId,
        provider: "DISCORD",
      },
    }),
    dependencies.db.generatedContent.findFirst({
      where: { id: body.data.generationId, userId },
      select: {
        id: true,
        discordPost: true,
        mediaAttachments: { select: { secureUrl: true } },
      },
    }),
  ]);

  if (!connection) {
    return context.json({ error: "Discord connection not found." }, 404);
  }

  if (!generation) {
    return context.json({ error: "Generation not found." }, 404);
  }

  let publication: { id: string; attemptVersion: number };

  if (existing) {
    const claim = await dependencies.db.socialPublication.updateMany({
      where: {
        id: existing.id,
        userId,
        connectionId: connection.id,
        generatedContentId: generation.id,
        provider: "DISCORD",
        status: "FAILED",
        attemptVersion: existing.attemptVersion,
      },
      data: {
        status: "PENDING",
        attemptVersion: { increment: 1 },
        errorMessage: null,
      },
    });

    if (claim.count === 0) {
      const current = await dependencies.db.socialPublication.findUnique({
        where: {
          userId_idempotencyKey: {
            userId,
            idempotencyKey: body.data.idempotencyKey,
          },
        },
      });

      return respondToConcurrentPublication(context, current, body.data);
    }

    publication = {
      id: existing.id,
      attemptVersion: existing.attemptVersion + 1,
    };
  } else {
    try {
      publication = await dependencies.db.socialPublication.create({
        data: {
          userId,
          connectionId: connection.id,
          generatedContentId: generation.id,
          provider: "DISCORD",
          idempotencyKey: body.data.idempotencyKey,
        },
      });
    } catch (error) {
      if (!isPrismaUniqueConstraintError(error)) {
        throw error;
      }

      const current = await dependencies.db.socialPublication.findUnique({
        where: {
          userId_idempotencyKey: {
            userId,
            idempotencyKey: body.data.idempotencyKey,
          },
        },
      });

      return respondToConcurrentPublication(context, current, body.data);
    }
  }

  let result: Awaited<ReturnType<typeof publishDiscordMessage>>;

  try {
    result = await dependencies.publishDiscordMessage({
      connection,
      content: composeDiscordContent(
        generation.discordPost,
        generation.mediaAttachments.map((attachment) => attachment.secureUrl),
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not publish to Discord.";

    const status =
      error instanceof DiscordDeliveryUnknownError ? "UNKNOWN" : "FAILED";

    await dependencies.db.socialPublication.update({
      where: { id: publication.id },
      data: { status, errorMessage: message.slice(0, 500) },
    });

    logger.warn("Discord publication failed", {
      userId,
      generationId: generation.id,
      connectionId: connection.id,
      publicationId: publication.id,
      error: message,
    });

    return context.json({ error: message }, 502);
  }

  const publishedData = {
    status: "PUBLISHED" as const,
    externalPostId: result.externalPostId,
    externalPostUrl: result.externalPostUrl,
    errorMessage: null,
  };
  let published;

  try {
    published = await dependencies.db.socialPublication.update({
      where: { id: publication.id },
      data: publishedData,
    });
  } catch (error) {
    logger.warn("Discord delivery confirmed but persistence failed", {
      userId,
      generationId: generation.id,
      connectionId: connection.id,
      publicationId: publication.id,
      externalPostId: result.externalPostId,
      error: error instanceof Error ? error.message : String(error),
    });

    try {
      published = await dependencies.db.socialPublication.update({
        where: { id: publication.id },
        data: publishedData,
      });
    } catch (reconciliationError) {
      logger.error("Could not reconcile confirmed Discord publication", {
        userId,
        generationId: generation.id,
        connectionId: connection.id,
        publicationId: publication.id,
        externalPostId: result.externalPostId,
        error:
          reconciliationError instanceof Error
            ? reconciliationError.message
            : String(reconciliationError),
      });

      return context.json(
        {
          error:
            "Discord published this post, but GitLoud could not save the confirmation. This request will not be retried automatically.",
        },
        500,
      );
    }
  }

  logger.info("Published generated content to Discord", {
    userId,
    generationId: generation.id,
    connectionId: connection.id,
    publicationId: published.id,
  });

  return context.json({
    publication: serializePublication(published, connection.displayName),
    reused: false,
  });
}

function hasMatchingPublishPayload(
  publication: {
    connectionId: string | null;
    generatedContentId: string | null;
    provider: "DISCORD";
  },
  request: z.infer<typeof publishSchema>,
) {
  return (
    publication.provider === "DISCORD" &&
    publication.connectionId === request.connectionId &&
    publication.generatedContentId === request.generationId
  );
}

function respondToConcurrentPublication(
  context: Context,
  publication: {
    connectionId: string | null;
    generatedContentId: string | null;
    provider: "DISCORD";
    status: "PENDING" | "PUBLISHED" | "FAILED" | "UNKNOWN";
    id: string;
    externalPostUrl: string | null;
    errorMessage: string | null;
    createdAt: Date;
  } | null,
  request: z.infer<typeof publishSchema>,
) {
  if (!publication || !hasMatchingPublishPayload(publication, request)) {
    return context.json(
      { error: "This idempotency key belongs to a different publish request." },
      409,
    );
  }

  if (publication.status === "PUBLISHED") {
    return context.json({
      publication: serializePublication(publication),
      reused: true,
    });
  }

  if (publication.status === "UNKNOWN") {
    return context.json(
      {
        error:
          "Discord may already have published this post. Check the channel before trying again with a new idempotency key.",
      },
      409,
    );
  }

  return context.json({ error: "This post is already being published." }, 409);
}

function isPrismaUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

async function listConnections(userId: string) {
  const connections = await db.socialConnection.findMany({
    where: { userId, provider: "DISCORD" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      displayName: true,
      externalAccountId: true,
      updatedAt: true,
    },
  });

  return connections.map((connection) => ({
    id: connection.id,
    provider: "discord" as const,
    displayName: connection.displayName,
    externalAccountId: connection.externalAccountId,
    updatedAt: connection.updatedAt.toISOString(),
  }));
}

function serializePublication(
  publication: {
    id: string;
    status: "PENDING" | "PUBLISHED" | "FAILED" | "UNKNOWN";
    externalPostUrl: string | null;
    errorMessage: string | null;
    createdAt: Date;
    connection?: { displayName: string } | null;
  },
  connectionName?: string,
) {
  return {
    id: publication.id,
    provider: "discord" as const,
    status: publication.status.toLowerCase() as
      | "pending"
      | "published"
      | "failed"
      | "unknown",
    externalPostUrl: publication.externalPostUrl,
    errorMessage: publication.errorMessage,
    connectionName:
      connectionName ?? publication.connection?.displayName ?? null,
    createdAt: publication.createdAt.toISOString(),
  };
}
