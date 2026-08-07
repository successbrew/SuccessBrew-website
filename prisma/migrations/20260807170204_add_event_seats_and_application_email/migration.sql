-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "CommunityEvent" ADD COLUMN     "remainingSeats" INTEGER,
ADD COLUMN     "showRemainingSeats" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Application_email_key" ON "Application"("email");
