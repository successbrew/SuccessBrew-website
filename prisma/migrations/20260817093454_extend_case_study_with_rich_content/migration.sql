-- AlterTable
ALTER TABLE "CaseStudy" ADD COLUMN     "beforeAfter" JSONB,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "heroMetrics" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "resultMetrics" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "solutionContent" TEXT,
ADD COLUMN     "strategySteps" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "timelineSteps" JSONB NOT NULL DEFAULT '[]';
