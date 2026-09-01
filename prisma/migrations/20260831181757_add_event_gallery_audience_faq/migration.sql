-- AlterTable
ALTER TABLE "CommunityEvent" ADD COLUMN     "audienceTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "faq" TEXT,
ADD COLUMN     "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
