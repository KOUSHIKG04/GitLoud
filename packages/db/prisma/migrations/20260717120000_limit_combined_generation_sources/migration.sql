ALTER TABLE "GeneratedContent"
DROP CONSTRAINT IF EXISTS "GeneratedContent_source_link_check";

ALTER TABLE "GeneratedContent"
ADD CONSTRAINT "GeneratedContent_source_link_check" CHECK (
  (
    "sourceType" = 'PULL_REQUEST'
    AND "pullRequestId" IS NOT NULL
    AND "commitId" IS NULL
    AND "combinedSources" IS NULL
  )
  OR
  (
    "sourceType" = 'COMMIT'
    AND "commitId" IS NOT NULL
    AND "pullRequestId" IS NULL
    AND "combinedSources" IS NULL
  )
  OR
  (
    "sourceType" = 'COMBINED'
    AND "pullRequestId" IS NULL
    AND "commitId" IS NULL
    AND "combinedSources" IS NOT NULL
    AND jsonb_typeof("combinedSources") = 'array'
    AND jsonb_array_length("combinedSources") BETWEEN 2 AND 5
  )
) NOT VALID;
