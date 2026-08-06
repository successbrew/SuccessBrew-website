-- AlterTable
ALTER TABLE "Speaker" ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "achievements" TEXT;

-- CreateTable
CREATE TABLE "SpeakerNote" (
    "id" TEXT NOT NULL,
    "speakerId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakerNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpeakerNote_speakerId_idx" ON "SpeakerNote"("speakerId");

-- AddForeignKey
ALTER TABLE "SpeakerNote" ADD CONSTRAINT "SpeakerNote_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
