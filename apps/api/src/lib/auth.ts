import { createClerkClient, verifyToken } from "@clerk/backend";
import { db } from "@repo/db/client";
import { logger } from "@/lib/logger";
import { getUserDisplayName } from "@/lib/user-display-name";

const secretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = secretKey ? createClerkClient({ secretKey }) : null;

export async function getAuthenticatedUserId(request: Request) {
  const token = getBearerToken(request);

  if (!token || !secretKey) {
    return null;
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch (error) {
    logger.warn("Clerk token verification failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}

export async function getCurrentUserId(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return null;
  }

  const existingById = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (existingById && !existingById.email.endsWith("@clerk.local")) {
    return existingById.id;
  }

  if (!clerkClient) {
    await createPlaceholderUser(userId);
    return userId;
  }

  const user = await clerkClient.users.getUser(userId);
  const primaryEmail = user.primaryEmailAddress;
  const isPrimaryEmailVerified =
    primaryEmail?.verification?.status === "verified";
  const email = isPrimaryEmailVerified
    ? (primaryEmail?.emailAddress ?? null)
    : null;
  const emailVerified = Boolean(email);
  const name = getUserDisplayName({
    fullName: user.fullName,
    metadata: user.unsafeMetadata,
    username: user.username,
    email: primaryEmail?.emailAddress,
  });

  if (!email) {
    await db.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: getPlaceholderEmail(userId),
        name,
        image: user.imageUrl ?? null,
        emailVerified: false,
      },
      update: {
        name,
        image: user.imageUrl ?? null,
      },
    });

    return userId;
  }

  if (existingById && existingById.email.endsWith("@clerk.local")) {
    await db.user.update({
      where: { id: userId },
      data: {
        email,
        name,
        image: user.imageUrl ?? null,
        emailVerified,
      },
    });

    return userId;
  }

  const existingByEmail = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingByEmail) {
    if (existingByEmail.id !== userId) {
      const oldId = existingByEmail.id;

      await db.$transaction([
        db.user.update({
          where: { id: oldId },
          data: {
            id: userId,
            name,
            image: user.imageUrl ?? null,
            emailVerified,
          },
        }),
        db.generatedContent.updateMany({
          where: { userId: oldId },
          data: { userId },
        }),
        db.pullRequest.updateMany({
          where: { userId: oldId },
          data: { userId },
        }),
        db.commit.updateMany({ where: { userId: oldId }, data: { userId } }),
        db.mediaAttachment.updateMany({
          where: { userId: oldId },
          data: { userId },
        }),
        db.session.updateMany({ where: { userId: oldId }, data: { userId } }),
        db.account.updateMany({ where: { userId: oldId }, data: { userId } }),
      ]);
    } else {
      await db.user.update({
        where: { id: userId },
        data: {
          name,
          image: user.imageUrl ?? null,
          emailVerified,
        },
      });
    }

    return userId;
  }

  await db.user.create({
    data: {
      id: userId,
      email,
      name,
      image: user.imageUrl ?? null,
      emailVerified,
    },
  });

  return userId;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(/\s+/, 2);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

async function createPlaceholderUser(userId: string) {
  await db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: getPlaceholderEmail(userId),
      emailVerified: false,
    },
    update: {},
  });
}

function getPlaceholderEmail(userId: string) {
  return `${userId}@clerk.local`;
}
