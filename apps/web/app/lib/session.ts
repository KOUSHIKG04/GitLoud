import { db } from "@repo/db/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserDisplayName } from "@/lib/userDisplayName";

export async function getCurrentSession() {
  const userId = await getAuthenticatedUserId();
  return userId ? { user: { id: userId } } : null;
}

export async function getAuthenticatedUserId() {
  const { userId } = await auth();
  return userId;
}

export async function getCurrentUserId() {
  const userId = await getAuthenticatedUserId();

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

  const user = await currentUser();

  if (!user) {
    await createPlaceholderUser(userId);
    return userId;
  }

  let email: string | null = null;
  let emailVerified = false;

  if (
    user.primaryEmailAddress &&
    user.primaryEmailAddress.verification?.status === "verified"
  ) {
    email = user.primaryEmailAddress.emailAddress;
    emailVerified = true;
  }

  const name = getUserDisplayName({
    fullName: user.fullName,
    metadata: user.unsafeMetadata,
    username: user.username,
    email: user.primaryEmailAddress?.emailAddress,
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

  const existingByEmail = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

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

  if (existingByEmail) {
    if (existingByEmail.id !== userId) {
      const oldId = existingByEmail.id;
      // Migrate ownership by updating dependent FKs to the Clerk userId.
      // Updating the user ID first leverages PostgreSQL ON UPDATE CASCADE to
      // safely handle composite FKs (e.g. GeneratedContent -> PullRequest).
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
        db.generatedContent.updateMany({ where: { userId: oldId }, data: { userId } }),
        db.pullRequest.updateMany({ where: { userId: oldId }, data: { userId } }),
        db.commit.updateMany({ where: { userId: oldId }, data: { userId } }),
        db.mediaAttachment.updateMany({ where: { userId: oldId }, data: { userId } }),
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
