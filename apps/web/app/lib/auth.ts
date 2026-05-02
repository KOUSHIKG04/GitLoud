import { db } from "@repo/db/client";
import { sendVerificationEmail } from "@/lib/email";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const githubClientId = process.env.GITHUB_CLIENT_ID; const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if ((githubClientId && !githubClientSecret) || (!githubClientId && githubClientSecret)) {
  throw new Error("Both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set if you want to use the GitHub provider, or both must be unset to disable it.");
}

export const auth = betterAuth({
  appName: "GitLoud",
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  account: {
    encryptOAuthTokens: true,
  },
  emailAndPassword: {
    autoSignIn: true,
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60,
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        to: user.email,
        url,
      });
    },
  },
  socialProviders: {
    ...(githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          },
        }
      : {}),
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.BETTER_AUTH_URL,
  ].filter((origin): origin is string => Boolean(origin)),
});
