import { db } from "@repo/db/client";
import { auth, currentUser } from "@clerk/nextjs/server";

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

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    `${userId}@clerk.local`;
  const name =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    null;

  const existingById = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (existingById) {
    const localUser = await db.user.update({
      where: { id: existingById.id },
      data: {
        email,
        name,
        image: user?.imageUrl ?? null,
        emailVerified: true,
      },
      select: { id: true },
    });

    return localUser.id;
  }

  const localUser = await db.user.upsert({
    where: { email },
    update: {
      name,
      image: user?.imageUrl ?? null,
      emailVerified: true,
    },
    create: {
      id: userId,
      email,
      name,
      image: user?.imageUrl ?? null,
      emailVerified: true,
    },
    select: { id: true },
  });

  return localUser.id;
}
