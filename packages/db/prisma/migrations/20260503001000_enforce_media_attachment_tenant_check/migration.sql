-- Apply the media tenant invariant to databases that already ran the earlier
-- migration before the check constraint was added there.
UPDATE "MediaAttachment" ma
SET "generatedContentUserId" = gc."userId"
FROM "GeneratedContent" gc
WHERE ma."generatedContentId" = gc."id"
  AND ma."generatedContentId" IS NOT NULL;

UPDATE "MediaAttachment"
SET "generatedContentUserId" = NULL
WHERE "generatedContentId" IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'MediaAttachment_generatedContent_tenant_check'
      AND conrelid = to_regclass(format('%I.%I', current_schema(), 'MediaAttachment'))
  ) THEN
    ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_generatedContent_tenant_check"
    CHECK (
      (
        "generatedContentId" IS NULL
        AND "generatedContentUserId" IS NULL
      )
      OR (
        "generatedContentId" IS NOT NULL
        AND "generatedContentUserId" IS NOT NULL
        AND "userId" = "generatedContentUserId"
      )
    );
  END IF;
END $$;
