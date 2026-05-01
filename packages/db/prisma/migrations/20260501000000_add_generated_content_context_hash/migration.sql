ALTER TABLE "GeneratedContent"
ADD COLUMN "contextHash" TEXT;

UPDATE "GeneratedContent"
SET "contextHash" = 'legacy-before-context-hash'
WHERE "contextHash" IS NULL;

CREATE INDEX "GeneratedContent_userId_sourceType_contextHash_idx"
ON "GeneratedContent"("userId", "sourceType", "contextHash");
