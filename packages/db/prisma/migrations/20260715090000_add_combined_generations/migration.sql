ALTER TYPE "GeneratedSourceType" ADD VALUE 'COMBINED';

ALTER TABLE "GeneratedContent"
ADD COLUMN "combinedSources" JSONB;
