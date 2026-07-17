import assert from "node:assert/strict";
import test from "node:test";
import { Hono } from "hono";

process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const {
  composeDiscordContent,
  DiscordDeliveryUnknownError,
  normalizeDiscordWebhookUrl,
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
  let notifyPublishStarted: (() => void) | undefined;
  const publishStarted = new Promise<void>((resolve) => {
    notifyPublishStarted = resolve;
  });
  let releasePublish: (() => void) | undefined;
  const publishReleased = new Promise<void>((resolve) => {
    releasePublish = resolve;
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
    publish: async () => {
      notifyPublishStarted?.();
      await publishReleased;
      return {
        externalPostId: "discord-message-1",
        externalPostUrl: "https://discord.com/channels/1/2/discord-message-1",
      };
    },
  });

  const pendingResponses = [harness.publish(), harness.publish()];
  await publishStarted;
  const concurrentResponse = await Promise.race(pendingResponses);
  assert.equal(concurrentResponse.status, 409);
  releasePublish?.();
  const responses = await Promise.all(pendingResponses);
  const bodies = await Promise.all(
    responses.map(
      (response) => response.json() as Promise<Record<string, unknown>>,
    ),
  );

  assert.equal(harness.publishCount, 1);
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [200, 409],
  );
  assert.equal(
    bodies.some((body) => body.reused === false),
    true,
  );
  assert.equal(harness.publication?.status, "PUBLISHED");
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

function createPublication(status: PublicationStatus): TestPublication {
  const now = new Date("2026-07-17T00:00:00.000Z");

  return {
    id: "publication-1",
    userId: USER_ID,
    connectionId: CONNECTION_ID,
    generatedContentId: GENERATION_ID,
    provider: "DISCORD",
    status,
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
  publish,
}: {
  initialPublication?: TestPublication | null;
  beforeInitialReadReturns?: () => Promise<void>;
  publish: () => Promise<{
    externalPostId: string;
    externalPostUrl: string | null;
  }>;
}) {
  let publication: TestPublication | null = initialPublication
    ? { ...initialPublication }
    : null;
  let initialReads = 0;
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
        data: Partial<TestPublication>;
      }) => {
        if (
          !publication ||
          publication.id !== where.id ||
          publication.status !== where.status ||
          publication.connectionId !== where.connectionId ||
          publication.generatedContentId !== where.generatedContentId
        ) {
          return { count: 0 };
        }

        publication = { ...publication, ...data, updatedAt: new Date() };
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
        data: Partial<TestPublication>;
      }) => {
        assert.equal(publication?.id, where.id);
        publication = {
          ...publication!,
          ...data,
          updatedAt: new Date(),
        };
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
