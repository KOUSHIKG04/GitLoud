import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const { composeDiscordContent, normalizeDiscordWebhookUrl } =
  await import("../src/lib/social-publishing");

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
