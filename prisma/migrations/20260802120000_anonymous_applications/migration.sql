-- AlterTable: applying no longer requires being signed in, so userId can be null.
ALTER TABLE "Application" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Speaker" ALTER COLUMN "userId" DROP NOT NULL;
