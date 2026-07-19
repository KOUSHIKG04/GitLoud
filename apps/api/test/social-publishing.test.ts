import assert from "node:assert/strict";
import test from "node:test";
import { Hono } from "hono";

process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const {
  composeDiscordContent,
  DiscordDeliveryUnknownError,
  normalizeDiscordWebhookUrl,
  verifyDiscordWebhook,
} = await import("../src/lib/social-publishing");
const { createSocialPublishHandler } = await import("../src/routes/social");

const USER_ID = "user-1";
const CONNECTION_ID = "connection-1";
const GENERATION_ID = "generation-1";
const IDEMPOTENCY_KEY = "publish-request-0001";

type PublicationStatus = "PENDING" | "PUBLISHED" | "FAILED" | "UNKNOWN";

type TestPublication = {
  id: string;
  userId: string;
  connectionId: string | null;
  generatedContentId: string | null;
  provider: "DISCORD";
  status: PublicationStatus;
  attemptVersion: number;
  idempotencyKey: string;
  externalPostId: string | null;
  externalPostUrl: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

test("normalizes official Discord webhook URLs", () => {
  const result = normalizeDiscordWebhookUrl(
    "https://discord.com/api/webhooks/123456789/secret-token?wait=true",
  );

  assert.deepEqual(result, {
    webhookUrl: "https://discord.com/api/webhooks/123456789/secret-token",
    webhookId: "123456789",
  });
});

test("rejects Discord lookalike hosts and insecure webhook URLs", () => {
  assert.throws(
    () =>
      normalizeDiscordWebhookUrl(
        "https://discord.com.attacker.example/api/webhooks/123/token",
      ),
    /official Discord webhook URL/,
  );
  assert.throws(
    () =>
      normalizeDiscordWebhookUrl("http://discord.com/api/webhooks/123/token"),
    /official Discord webhook URL/,
  );
});

test("identifies GitLoud with the required Discord API user agent", async () => {
  const originalFetch = globalThis.fetch;
  let requestHeaders: Headers | undefined;

  globalThis.fetch = async (_input, init) => {
    requestHeaders = new Headers(init?.headers);

    return Response.json({
      id: "123456789",
      name: "GitLoud Server",
      channel_id: "987654321",
    });
  };

  try {
    await verifyDiscordWebhook(
      "https://discord.com/api/webhooks/123456789/secret-token",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(requestHeaders?.get("Accept"), "application/json");
  assert.match(
    requestHeaders?.get("User-Agent") ?? "",
    /^DiscordBot \(https:\/\/gitloud-web\.vercel\.app, 0\.1\.0\)$/,
  );
});

test("reports when Discord says a webhook was deleted", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    Response.json({ message: "Unknown Webhook", code: 10015 }, { status: 404 });

  try {
    await assert.rejects(
      verifyDiscordWebhook(
        "https://discord.com/api/webhooks/123456789/deleted-token",
      ),
      /does not exist or was deleted.*Discord code 10015/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("reports when Discord or Cloudflare blocks verification", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response("Access denied", {
      status: 403,
      headers: { "Content-Type": "text/html" },
    });

  try {
    await assert.rejects(
      verifyDiscordWebhook(
        "https://discord.com/api/webhooks/123456789/blocked-token",
      ),
      /Discord or Cloudflare denied.*HTTP 403/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("reports Discord's exact webhook verification retry delay", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    Response.json(
      {
        message: "You are being rate limited.",
        retry_after: 64.57,
        global: false,
      },
      { status: 429 },
    );

  try {
    await assert.rejects(
      verifyDiscordWebhook(
        "https://discord.com/api/webhooks/123456789/rate-limited-token",
      ),
      /Retry after 65 seconds/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("automatically retries a short Discord verification limit once", async () => {
  const originalFetch = globalThis.fetch;
  let requestCount = 0;

  globalThis.fetch = async () => {
    requestCount += 1;

    if (requestCount === 1) {
      return Response.json(
        { message: "You are being rate limited.", retry_after: 0.001 },
        { status: 429 },
      );
    }

    return Response.json({
      id: "123456789",
      name: "GitLoud Server",
      channel_id: "987654321",
    });
  };

  try {
    const webhook = await verifyDiscordWebhook(
      "https://discord.com/api/webhooks/123456789/short-limit-token",
    );

    assert.equal(webhook.id, "123456789");
    assert.equal(requestCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("adds unique media links when the Discord message fits", () => {
  assert.equal(
    composeDiscordContent("Generated post", [
      "https://example.com/image.png",
      "https://example.com/image.png",
    ]),
    "Generated post\n\nMedia:\nhttps://example.com/image.png",
  );
});

test("keeps the generated post when media links would exceed Discord's limit", () => {
  const content = "a".repeat(1_990);

  assert.equal(
    composeDiscordContent(content, ["https://example.com/image.png"]),
    content,
  );
});

test("atomically claims concurrent retries for a failed publication", async () => {
  let releaseInitialReads: (() => void) | undefined;
  const initialReadsReady = new Promise<void>((resolve) => {
    releaseInitialReads = resolve;
  });
  let initialReadCount = 0;
  let notifyFailureRecorded: (() => void) | undefined;
  const failureRecorded = new Promise<void>((resolve) => {
    notifyFailureRecorded = resolve;
  });
  const harness = createPublishRouteHarness({
    initialPublication: createPublication("FAILED"),
    beforeInitialReadReturns: async () => {
      initialReadCount += 1;
      if (initialReadCount === 2) {
        releaseInitialReads?.();
      }
      await initialReadsReady;
    },
    beforeUpdateMany: async (callNumber) => {
      if (callNumber === 2) {
        await failureRecorded;
      }
    },
    afterUpdate: (_publication, data) => {
      if (data.status === "FAILED") {
        notifyFailureRecorded?.();
      }
    },
    publish: async () => {
      throw new Error("Discord rejected the post.");
    },
  });

  const responses = await Promise.all([harness.publish(), harness.publish()]);

  assert.equal(harness.publishCount, 1);
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [409, 502],
  );
  assert.equal(harness.publication?.status, "FAILED");
  assert.equal(harness.publication?.attemptVersion, 1);
});

test("does not retry an accepted Discord request whose response timed out", async () => {
  const harness = createPublishRouteHarness({
    publish: async () => {
      throw new DiscordDeliveryUnknownError();
    },
  });

  const first = await harness.publish();
  const firstBody = (await first.json()) as { error?: string };
  const retry = await harness.publish();
  const retryBody = (await retry.json()) as { error?: string };

  assert.equal(first.status, 502);
  assert.match(firstBody.error ?? "", /may have accepted/i);
  assert.equal(retry.status, 409);
  assert.match(retryBody.error ?? "", /may already have published/i);
  assert.equal(harness.publishCount, 1);
  assert.equal(harness.publication?.status, "UNKNOWN");
});

test("rejects a changed payload for an existing idempotency key", async () => {
  const harness = createPublishRouteHarness({
    initialPublication: createPublication("PUBLISHED"),
    publish: async () => ({
      externalPostId: "unused",
      externalPostUrl: null,
    }),
  });

  const response = await harness.publish({ generationId: "generation-2" });
  const body = (await response.json()) as { error?: string };

  assert.equal(response.status, 409);
  assert.match(body.error ?? "", /different publish request/i);
  assert.equal(harness.publishCount, 0);
});

test("reconciles a confirmed Discord delivery after persistence fails", async () => {
  let publishedUpdateAttempts = 0;
  const harness = createPublishRouteHarness({
    beforeUpdate: (_callNumber, data) => {
      if (data.status === "PUBLISHED") {
        publishedUpdateAttempts += 1;
        if (publishedUpdateAttempts === 1) {
          throw new Error("Temporary database failure");
        }
      }
    },
    publish: async () => ({
      externalPostId: "discord-message-1",
      externalPostUrl: "https://discord.com/channels/1/2/discord-message-1",
    }),
  });

  const response = await harness.publish();

  assert.equal(response.status, 200);
  assert.equal(harness.publishCount, 1);
  assert.equal(publishedUpdateAttempts, 2);
  assert.equal(harness.publication?.status, "PUBLISHED");
  assert.equal(harness.publication?.externalPostId, "discord-message-1");
});

function createPublication(status: PublicationStatus): TestPublication {
  const now = new Date("2026-07-17T00:00:00.000Z");

  return {
    id: "publication-1",
    userId: USER_ID,
    connectionId: CONNECTION_ID,
    generatedContentId: GENERATION_ID,
    provider: "DISCORD",
    status,
    attemptVersion: 0,
    idempotencyKey: IDEMPOTENCY_KEY,
    externalPostId: null,
    externalPostUrl: null,
    errorMessage: status === "FAILED" ? "Discord rejected the post." : null,
    createdAt: now,
    updatedAt: now,
  };
}

function createPublishRouteHarness({
  initialPublication = null,
  beforeInitialReadReturns,
  beforeUpdateMany,
  beforeUpdate,
  afterUpdate,
  publish,
}: {
  initialPublication?: TestPublication | null;
  beforeInitialReadReturns?: () => Promise<void>;
  beforeUpdateMany?: (callNumber: number) => Promise<void>;
  beforeUpdate?: (
    callNumber: number,
    data: TestPublicationData,
  ) => Promise<void> | void;
  afterUpdate?: (
    publication: TestPublication,
    data: TestPublicationData,
  ) => void;
  publish: () => Promise<{
    externalPostId: string;
    externalPostUrl: string | null;
  }>;
}) {
  let publication: TestPublication | null = initialPublication
    ? { ...initialPublication }
    : null;
  let initialReads = 0;
  let updateManyCalls = 0;
  let updateCalls = 0;
  let publishCount = 0;

  const database = {
    socialPublication: {
      findUnique: async () => {
        const snapshot = publication ? { ...publication } : null;

        if (beforeInitialReadReturns && initialReads < 2) {
          initialReads += 1;
          await beforeInitialReadReturns();
        }

        return snapshot;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: Partial<TestPublication>;
        data: TestPublicationData;
      }) => {
        updateManyCalls += 1;
        await beforeUpdateMany?.(updateManyCalls);

        if (
          !publication ||
          publication.id !== where.id ||
          publication.status !== where.status ||
          publication.attemptVersion !== where.attemptVersion ||
          publication.connectionId !== where.connectionId ||
          publication.generatedContentId !== where.generatedContentId
        ) {
          return { count: 0 };
        }

        publication = applyPublicationData(publication, data);
        return { count: 1 };
      },
      create: async ({ data }: { data: Partial<TestPublication> }) => {
        if (publication) {
          throw Object.assign(new Error("Unique constraint failed"), {
            code: "P2002",
          });
        }

        publication = {
          ...createPublication("PENDING"),
          ...data,
        };
        return { ...publication };
      },
      update: async ({
        where,
        data,
      }: {
        where: Partial<TestPublication>;
        data: TestPublicationData;
      }) => {
        updateCalls += 1;
        await beforeUpdate?.(updateCalls, data);
        assert.equal(publication?.id, where.id);
        publication = applyPublicationData(publication!, data);
        afterUpdate?.(publication, data);
        return { ...publication };
      },
    },
    socialConnection: {
      findFirst: async () => ({
        id: CONNECTION_ID,
        userId: USER_ID,
        provider: "DISCORD",
        displayName: "Product updates",
        externalAccountId: "123456789",
        secretEnc: "encrypted",
        secretIv: "iv",
        secretTag: "tag",
      }),
    },
    generatedContent: {
      findFirst: async () => ({
        id: GENERATION_ID,
        discordPost: "Generated Discord post",
        mediaAttachments: [],
      }),
    },
  };

  const app = new Hono();
  app.post(
    "/social/publish/discord",
    createSocialPublishHandler({
      db: database as never,
      getCurrentUserId: async () => USER_ID,
      publishDiscordMessage: async () => {
        publishCount += 1;
        return publish();
      },
    }),
  );

  return {
    get publication() {
      return publication;
    },
    get publishCount() {
      return publishCount;
    },
    publish: (
      overrides: Partial<{
        connectionId: string;
        generationId: string;
        idempotencyKey: string;
      }> = {},
    ) =>
      app.request("http://localhost/social/publish/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: CONNECTION_ID,
          generationId: GENERATION_ID,
          idempotencyKey: IDEMPOTENCY_KEY,
          ...overrides,
        }),
      }),
  };
}

type TestPublicationData = Partial<Omit<TestPublication, "attemptVersion">> & {
  attemptVersion?: number | { increment: number };
};

function applyPublicationData(
  publication: TestPublication,
  data: TestPublicationData,
): TestPublication {
  const { attemptVersion, ...values } = data;
  const nextAttemptVersion =
    typeof attemptVersion === "object"
      ? publication.attemptVersion + attemptVersion.increment
      : (attemptVersion ?? publication.attemptVersion);

  return {
    ...publication,
    ...values,
    attemptVersion: nextAttemptVersion,
    updatedAt: new Date(),
  };
}
