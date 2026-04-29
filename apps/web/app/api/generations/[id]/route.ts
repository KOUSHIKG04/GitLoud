import { db } from "@repo/db/client";
import { generatedContentSchema } from "@repo/shared/generated-content";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

class NotFoundError extends Error {}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generatedContentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid generated content" },
      { status: 400 },
    );
  }

  const updated = await db.generatedContent.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ generatedContent: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  try {
    await db.$transaction(async (tx) => {
      const generation = await tx.generatedContent.findUnique({
        where: { id },
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
        where: { id },
      });

      if (generation.pullRequestId) {
        const remainingPullRequestReferences =
          await tx.generatedContent.count({
            where: { pullRequestId: generation.pullRequestId },
          });

        if (remainingPullRequestReferences === 0) {
          await tx.pullRequest.delete({
            where: { id: generation.pullRequestId },
          });
        }
      }

      if (generation.commitId) {
        const remainingCommitReferences = await tx.generatedContent.count({
          where: { commitId: generation.commitId },
        });

        if (remainingCommitReferences === 0) {
          await tx.commit.delete({
            where: { id: generation.commitId },
          });
        }
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
