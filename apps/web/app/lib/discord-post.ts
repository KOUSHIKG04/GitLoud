import { db } from "@repo/db/client";

function isMissingDiscordPostColumn(error: unknown) {
  const candidate = error as { code?: unknown; message?: unknown };

  return (
    candidate.code === "42703" ||
    (typeof candidate.message === "string" &&
      candidate.message.includes("discordPost"))
  );
}

export async function saveDiscordPost(generationId: string, discordPost: string) {
  try {
    await db.$executeRaw`
      UPDATE "GeneratedContent"
      SET "discordPost" = ${discordPost}
      WHERE "id" = ${generationId}
    `;
  } catch (error) {
    if (isMissingDiscordPostColumn(error)) {
      return;
    }

    throw error;
  }
}

export async function getDiscordPost(generationId: string) {
  try {
    const [discordContent] = await db.$queryRaw<{ discordPost: string }[]>`
      SELECT "discordPost"
      FROM "GeneratedContent"
      WHERE "id" = ${generationId}
    `;

    return discordContent?.discordPost ?? "";
  } catch (error) {
    if (isMissingDiscordPostColumn(error)) {
      return "";
    }

    throw error;
  }
}
