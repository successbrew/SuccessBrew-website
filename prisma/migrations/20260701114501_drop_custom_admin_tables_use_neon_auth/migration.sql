/*
  Warnings:

  - You are about to drop the `AdminProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PendingInvite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_authorId_fkey";

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "authorName" TEXT;

-- DropTable
DROP TABLE "AdminProfile";

-- DropTable
DROP TABLE "PendingInvite";

-- DropEnum
DROP TYPE "AdminRole";
