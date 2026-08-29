-- CreateEnum
CREATE TYPE "DigestDeliveryStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED_NO_TOPICS');

-- CreateTable
CREATE TABLE "DigestTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigestTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigestTopicBrief" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigestTopicBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigestTopicSelection" (
    "id" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigestTopicSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigestDelivery" (
    "id" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT,
    "status" "DigestDeliveryStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigestDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DigestTopic_slug_key" ON "DigestTopic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DigestTopicBrief_topicId_date_key" ON "DigestTopicBrief"("topicId", "date");

-- CreateIndex
CREATE INDEX "DigestTopicSelection_customerEmail_idx" ON "DigestTopicSelection"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "DigestTopicSelection_customerEmail_topicId_key" ON "DigestTopicSelection"("customerEmail", "topicId");

-- CreateIndex
CREATE INDEX "DigestDelivery_date_idx" ON "DigestDelivery"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DigestDelivery_customerEmail_date_key" ON "DigestDelivery"("customerEmail", "date");

-- AddForeignKey
ALTER TABLE "DigestTopicBrief" ADD CONSTRAINT "DigestTopicBrief_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "DigestTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigestTopicSelection" ADD CONSTRAINT "DigestTopicSelection_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "DigestTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
