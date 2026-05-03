/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `GeneratedContent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MediaAttachment" DROP CONSTRAINT "MediaAttachment_generatedContentId_fkey";

-- AlterTable
ALTER TABLE "MediaAttachment" ADD COLUMN     "generatedContentUserId" TEXT;

-- Backfill existing media relations before switching to the tenant-scoped FK.
UPDATE "MediaAttachment" ma
SET "generatedContentUserId" = gc."userId"
FROM "GeneratedContent" gc
WHERE ma."generatedContentId" = gc."id"
  AND ma."generatedContentId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedContent_id_userId_key" ON "GeneratedContent"("id", "userId");

-- CreateIndex
CREATE INDEX "MediaAttachment_generatedContentId_generatedContentUserId_idx" ON "MediaAttachment"("generatedContentId", "generatedContentUserId");

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_generatedContentId_generatedContentUserId_fkey" FOREIGN KEY ("generatedContentId", "generatedContentUserId") REFERENCES "GeneratedContent"("id", "userId") ON DELETE SET NULL ON UPDATE CASCADE;
