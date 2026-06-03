import { db } from "@repo/db/client";

export async function getUserFeatures(userId: string): Promise<{
  plan: string;
  canUsePrivateRepos: boolean;
  canUseOwnAiKey: boolean;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const plan = user?.plan ?? "FREE";

  return {
    plan,
    canUsePrivateRepos: plan === "PRO" || plan === "TEAM",
    canUseOwnAiKey: plan === "PRO" || plan === "TEAM",
  };
}
