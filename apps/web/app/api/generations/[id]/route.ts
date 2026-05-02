import { db } from "@repo/db/client";
import { logger } from "@/lib/logger";
import { getAuthenticatedUserId } from "@/lib/session";
import { NextResponse } from "next/server";

class NotFoundError extends Error { }

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.$transaction(async (tx) => {
      const generation = await tx.generatedContent.findFirst({
        where: { id, userId },
        select: {
          id: true,
          sourceType: true,
          pullRequestId: true,
          commitId: true,
        },
      });

      if (!generation) {
        throw new NotFoundError("Generated content was not found");
      }

      await tx.generatedContent.delete({
        where: { id: generation.id },
      });

      if (generation.pullRequestId) {
        await tx.$executeRaw`
          DELETE FROM "PullRequest"
          WHERE "id" = ${generation.pullRequestId}
            AND "userId" = ${userId}
            AND NOT EXISTS (
              SELECT 1
              FROM "GeneratedContent"
              WHERE "pullRequestId" = ${generation.pullRequestId}
            )
        `;
      }

      if (generation.commitId) {
        await tx.$executeRaw`
          DELETE FROM "Commit"
          WHERE "id" = ${generation.commitId}
            AND "userId" = ${userId}
            AND NOT EXISTS (
              SELECT 1
              FROM "GeneratedContent"
              WHERE "commitId" = ${generation.commitId}
            )
        `;
      }

      logger.info("Deleted generated content", {
        generationId: id,
        sourceType: generation.sourceType,
        pullRequestId: generation.pullRequestId,
        commitId: generation.commitId,
      });
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete generated content";
    const isNotFound = error instanceof NotFoundError;

    logger.error("Generated content deletion failed", {
      generationId: id,
      error: message,
    });

    return NextResponse.json(
      {
        error: isNotFound
          ? message
          : "Could not delete generated content",
      },
      { status: isNotFound ? 404 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
