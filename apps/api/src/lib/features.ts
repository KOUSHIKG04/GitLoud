import { db } from "@repo/db/client";

export async function getUserFeatures(userId: string): Promise<{
  plan: string;
  canUsePrivateRepos: boolean;
  canUseOwnAiKey: boolean;
}> {
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
    canUsePrivateRepos: plan === "PRO",
    canUseOwnAiKey: plan === "PRO",
  };
}
