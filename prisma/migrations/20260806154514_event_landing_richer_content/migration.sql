-- AlterTable
ALTER TABLE "CommunityEvent" ADD COLUMN     "audienceNote" TEXT,
ADD COLUMN     "highlightStatLabel" TEXT,
ADD COLUMN     "highlightStatValue" TEXT,
ADD COLUMN     "hostBio" TEXT,
ADD COLUMN     "hostRole" TEXT,
ADD COLUMN     "priceNote" TEXT,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "timeRange" TEXT,
ADD COLUMN     "totalSeats" INTEGER,
ADD COLUMN     "venuePhotoUrl" TEXT;

-- AlterTable
ALTER TABLE "EventSpeaker" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "role" TEXT;

-- AlterTable
ALTER TABLE "_EventPartners" ADD CONSTRAINT "_EventPartners_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventPartners_AB_unique";
