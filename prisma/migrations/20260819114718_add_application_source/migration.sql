-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('SPEAKER', 'COMMUNITY');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "source" "ApplicationSource" NOT NULL DEFAULT 'SPEAKER';
