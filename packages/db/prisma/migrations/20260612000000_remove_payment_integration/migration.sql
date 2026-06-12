DROP INDEX IF EXISTS "User_razorpaySubscriptionId_key";

ALTER TABLE "User"
DROP COLUMN IF EXISTS "billingProvider",
DROP COLUMN IF EXISTS "razorpayOrderId",
DROP COLUMN IF EXISTS "razorpayPaymentId",
DROP COLUMN IF EXISTS "razorpaySubscriptionId",
DROP COLUMN IF EXISTS "subscriptionStatus",
DROP COLUMN IF EXISTS "subscriptionCancelAtEnd";

DROP TYPE IF EXISTS "BillingProvider";
