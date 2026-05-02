-- Step 1: Backfill NULL emails with a unique placeholder based on the user's ID
UPDATE "User"
SET "email" = "id" || '@placeholder.gitloud.dev',
    "emailVerified" = false
WHERE "email" IS NULL;

-- Step 2: Make the email column NOT NULL
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
