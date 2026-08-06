-- AlterTable
ALTER TABLE "PodcastEpisode" ADD COLUMN     "speakerId" TEXT;

-- CreateIndex
CREATE INDEX "PodcastEpisode_speakerId_idx" ON "PodcastEpisode"("speakerId");

-- AddForeignKey
ALTER TABLE "PodcastEpisode" ADD CONSTRAINT "PodcastEpisode_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
