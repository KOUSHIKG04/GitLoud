-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('DISCORD');

-- CreateEnum
CREATE TYPE "SocialPublicationStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "SocialConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "displayName" TEXT NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "secretEnc" TEXT NOT NULL,
    "secretIv" TEXT NOT NULL,
    "secretTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPublication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT,
    "generatedContentId" TEXT,
    "provider" "SocialProvider" NOT NULL,
    "status" "SocialPublicationStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "externalPostId" TEXT,
    "externalPostUrl" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPublication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialConnection_userId_provider_externalAccountId_key" ON "SocialConnection"("userId", "provider", "externalAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialConnection_id_userId_key" ON "SocialConnection"("id", "userId");

-- CreateIndex
CREATE INDEX "SocialConnection_userId_updatedAt_idx" ON "SocialConnection"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPublication_userId_idempotencyKey_key" ON "SocialPublication"("userId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "SocialPublication_userId_createdAt_idx" ON "SocialPublication"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SocialPublication_connectionId_userId_idx" ON "SocialPublication"("connectionId", "userId");

-- CreateIndex
CREATE INDEX "SocialPublication_generatedContentId_userId_idx" ON "SocialPublication"("generatedContentId", "userId");

-- AddForeignKey
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPublication" ADD CONSTRAINT "SocialPublication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPublication" ADD CONSTRAINT "SocialPublication_connectionId_userId_fkey" FOREIGN KEY ("connectionId", "userId") REFERENCES "SocialConnection"("id", "userId") ON DELETE SET NULL ("connectionId") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPublication" ADD CONSTRAINT "SocialPublication_generatedContentId_userId_fkey" FOREIGN KEY ("generatedContentId", "userId") REFERENCES "GeneratedContent"("id", "userId") ON DELETE SET NULL ("generatedContentId") ON UPDATE CASCADE;
