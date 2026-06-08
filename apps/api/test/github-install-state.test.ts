import assert from "node:assert/strict";
import test from "node:test";
import {
  createGitHubInstallState,
  verifyGitHubInstallState,
} from "../src/lib/github-install-state";

const secret = "0123456789abcdef0123456789abcdef";

test("GitHub install state round trips the user id", () => {
  process.env.GITHUB_APP_STATE_SECRET = secret;

  const state = createGitHubInstallState("user_123", 1_000);
  const payload = verifyGitHubInstallState(state, 2_000);

  assert.equal(payload.userId, "user_123");
  assert.equal(typeof payload.nonce, "string");
});

test("GitHub install state rejects tampered payloads", () => {
  process.env.GITHUB_APP_STATE_SECRET = secret;

  const state = createGitHubInstallState("user_123", 1_000);
  const [payload, signature] = state.split(".");
  const tamperedPayload = Buffer.from(
    JSON.stringify({
      expiresAt: 600_000,
      nonce: "tampered-nonce-value",
      userId: "attacker",
    }),
  ).toString("base64url");

  assert.throws(
    () => verifyGitHubInstallState(`${tamperedPayload}.${signature}`, 2_000),
    /Invalid GitHub installation state/,
  );

  assert.ok(payload);
});

test("GitHub install state rejects expired payloads", () => {
  process.env.GITHUB_APP_STATE_SECRET = secret;

  const state = createGitHubInstallState("user_123", 1_000);

  assert.throws(
    () => verifyGitHubInstallState(state, 1_000 + 10 * 60 * 1000),
    /Expired or invalid GitHub installation state/,
  );
});
