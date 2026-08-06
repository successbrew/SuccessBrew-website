-- ═══════════════════════════════════════════════════════════════════════════
-- Adds dedicated event landing-page fields to CommunityEvent (agenda, host,
-- venue address, benefits, become-a-partner link) and a new EventSpeaker
-- table for the repeatable guest-speaker list, so each event edition
-- (e.g. "Revenue Room 1.0") can have its own landing page.
-- ═══════════════════════════════════════════════════════════════════════════

-- AlterTable
ALTER TABLE "CommunityEvent" ADD COLUMN     "agenda" TEXT,
ADD COLUMN     "hostName" TEXT,
ADD COLUMN     "hostPhotoUrl" TEXT,
ADD COLUMN     "venueAddress" TEXT,
ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "becomePartnerUrl" TEXT;

-- CreateTable
CREATE TABLE "EventSpeaker" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventSpeaker_eventId_idx" ON "EventSpeaker"("eventId");

-- AddForeignKey
ALTER TABLE "EventSpeaker" ADD CONSTRAINT "EventSpeaker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CommunityEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
