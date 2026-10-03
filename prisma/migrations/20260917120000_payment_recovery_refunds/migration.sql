ALTER TABLE "PaymentEvent" ADD COLUMN "leaseToken" TEXT, ADD COLUMN "leaseUntil" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "reconciledAt" TIMESTAMP(3);
CREATE TABLE "Refund" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "providerRefundId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "amount" INTEGER NOT NULL CHECK ("amount" > 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Refund_providerRefundId_key" ON "Refund"("providerRefundId");
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");
