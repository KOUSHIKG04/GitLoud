import { db } from "@repo/db/client";
import { logger } from "@/lib/logger";

const defaultRetentionDays = 7;

export type CleanupOldGenerationsResult = {
  cutoff: Date;
  deletedGenerations: number;
  deletedPullRequests: number;
  deletedCommits: number;
};

export async function cleanupOldGenerations(
  retentionDays = defaultRetentionDays,
): Promise<CleanupOldGenerationsResult> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const result = await db.$transaction(async (tx) => {
    const deletedGenerations = await tx.$queryRaw<Array<{ count: bigint }>>`
      WITH deleted AS (
        DELETE FROM "GeneratedContent"
        WHERE "createdAt" < ${cutoff}
        RETURNING "id"
      )
      SELECT COUNT(*)::bigint AS count
      FROM deleted
    `;

    const deletedPullRequests = await tx.$queryRaw<Array<{ count: bigint }>>`
      WITH deleted AS (
        DELETE FROM "PullRequest" pr
        WHERE NOT EXISTS (
          SELECT 1
          FROM "GeneratedContent" gc
          WHERE gc."pullRequestId" = pr."id"
        )
        RETURNING "id"
      )
      SELECT COUNT(*)::bigint AS count
      FROM deleted
    `;

    const deletedCommits = await tx.$queryRaw<Array<{ count: bigint }>>`
      WITH deleted AS (
        DELETE FROM "Commit" c
        WHERE NOT EXISTS (
          SELECT 1
          FROM "GeneratedContent" gc
          WHERE gc."commitId" = c."id"
        )
        RETURNING "id"
      )
      SELECT COUNT(*)::bigint AS count
      FROM deleted
    `;

    return {
      cutoff,
      deletedGenerations: toCount(deletedGenerations[0]?.count),
      deletedPullRequests: toCount(deletedPullRequests[0]?.count),
      deletedCommits: toCount(deletedCommits[0]?.count),
    };
  });

  logger.info("Cleaned up old generated content", {
    cutoff: result.cutoff.toISOString(),
    deletedGenerations: result.deletedGenerations,
    deletedPullRequests: result.deletedPullRequests,
    deletedCommits: result.deletedCommits,
  });

  return result;
}

function toCount(value: bigint | undefined) {
  return Number(value ?? 0n);
}
