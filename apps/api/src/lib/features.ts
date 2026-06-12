import { db } from "@repo/db/client";

export type UserFeatures = {
  plan: string;
  canUsePrivateRepos: boolean;
  canUseOwnAiKey: boolean;
};

export async function getUserFeatures(userId: string): Promise<UserFeatures> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  });

  const plan =
    user?.planExpiresAt && user.planExpiresAt <= new Date()
      ? "FREE"
      : (user?.plan ?? "FREE");

  return {
    plan,
    canUsePrivateRepos: true,
    canUseOwnAiKey: true,
  };
}
