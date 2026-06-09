UPDATE "User"
SET "plan" = 'PRO'
WHERE "plan" = 'TEAM';

ALTER TYPE "UserPlan" RENAME TO "UserPlan_old";
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PRO');

ALTER TABLE "User"
ALTER COLUMN "plan" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "plan" TYPE "UserPlan"
USING ("plan"::text::"UserPlan");

ALTER TABLE "User"
ALTER COLUMN "plan" SET DEFAULT 'FREE';

DROP TYPE "UserPlan_old";
