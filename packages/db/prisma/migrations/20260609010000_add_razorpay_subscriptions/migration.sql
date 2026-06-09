ALTER TABLE "User"
ADD COLUMN "razorpaySubscriptionId" TEXT,
ADD COLUMN "subscriptionStatus" TEXT,
ADD COLUMN "subscriptionCancelAtEnd" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "User_razorpaySubscriptionId_key"
ON "User"("razorpaySubscriptionId");
