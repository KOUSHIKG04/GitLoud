-- Preflight check: Deduplicate existing Account rows to prevent UNIQUE INDEX creation failure
DELETE FROM "Account"
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY "providerId", "accountId" ORDER BY id) as row_num
        FROM "Account"
    ) duplicates
    WHERE row_num > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");
