-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('LEAD', 'ENGAGED', 'CHECKOUT_STARTED', 'PAID', 'REFUNDED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('INITIATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ResourceAccessLevel" AS ENUM ('PUBLIC', 'PAID');

-- CreateEnum
CREATE TYPE "BrevoSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentEventStatus" AS ENUM ('PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "leadMagnet" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'LEAD',
    "consentAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "userId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "providerCheckoutUrl" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "OrderStatus" NOT NULL DEFAULT 'INITIATED',
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "PaymentEventStatus" NOT NULL DEFAULT 'PROCESSING',
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" TEXT NOT NULL,
    "url" TEXT,
    "storageKey" TEXT,
    "accessLevel" "ResourceAccessLevel" NOT NULL DEFAULT 'PAID',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "ResourceAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrevoSync" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "brevoContactId" TEXT,
    "syncStatus" "BrevoSyncStatus" NOT NULL DEFAULT 'PENDING',
    "lastSyncedAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BrevoSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");
CREATE UNIQUE INDEX "Order_provider_providerOrderId_key" ON "Order"("provider", "providerOrderId");
CREATE INDEX "Order_customerEmail_status_idx" ON "Order"("customerEmail", "status");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE UNIQUE INDEX "Payment_provider_providerPaymentId_key" ON "Payment"("provider", "providerPaymentId");
CREATE INDEX "Payment_orderId_status_idx" ON "Payment"("orderId", "status");
CREATE UNIQUE INDEX "PaymentEvent_eventId_key" ON "PaymentEvent"("eventId");
CREATE INDEX "PaymentEvent_orderId_createdAt_idx" ON "PaymentEvent"("orderId", "createdAt");
CREATE INDEX "PaymentEvent_status_createdAt_idx" ON "PaymentEvent"("status", "createdAt");
CREATE UNIQUE INDEX "Entitlement_customerEmail_productKey_key" ON "Entitlement"("customerEmail", "productKey");
CREATE INDEX "Entitlement_userId_status_idx" ON "Entitlement"("userId", "status");
CREATE INDEX "Entitlement_status_expiresAt_idx" ON "Entitlement"("status", "expiresAt");
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");
CREATE INDEX "Resource_isPublished_accessLevel_order_idx" ON "Resource"("isPublished", "accessLevel", "order");
CREATE UNIQUE INDEX "ResourceAccess_customerEmail_resourceId_key" ON "ResourceAccess"("customerEmail", "resourceId");
CREATE INDEX "ResourceAccess_userId_revokedAt_idx" ON "ResourceAccess"("userId", "revokedAt");
CREATE UNIQUE INDEX "BrevoSync_leadId_key" ON "BrevoSync"("leadId");
CREATE INDEX "BrevoSync_syncStatus_lastAttemptAt_idx" ON "BrevoSync"("syncStatus", "lastAttemptAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResourceAccess" ADD CONSTRAINT "ResourceAccess_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrevoSync" ADD CONSTRAINT "BrevoSync_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
