-- ═══════════════════════════════════════════════════════════════════════════
-- Module 1: Foundational schema + RBAC extension for the Speaker Management
-- Platform. Extends AdminProfile from a single tier to a role array, and adds
-- the Category/SubCategory/Application/Document/StatusHistory/Review/Speaker/
-- ActivityLog/AuditLog tables that every later module builds on.
-- ═══════════════════════════════════════════════════════════════════════════

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'REVIEWER', 'COMMUNITY_MANAGER', 'PODCAST_MANAGER', 'CONTENT_MANAGER');

-- AlterTable: AdminProfile.tier (single AdminTier) -> AdminProfile.roles (AdminRole[])
ALTER TABLE "AdminProfile" ADD COLUMN     "roles" "AdminRole"[] NOT NULL DEFAULT ARRAY['CONTENT_MANAGER']::"AdminRole"[];

UPDATE "AdminProfile" SET "roles" = CASE
  WHEN "tier" = 'SUPER_ADMIN' THEN ARRAY['SUPER_ADMIN']::"AdminRole"[]
  ELSE ARRAY['CONTENT_MANAGER']::"AdminRole"[]
END;

ALTER TABLE "AdminProfile" DROP COLUMN "tier";

DROP TYPE "AdminTier";

-- CreateEnum
CREATE TYPE "MajorCategory" AS ENUM ('ENABLER', 'D2C_CONSUMER', 'TECH_FOUNDER', 'INVESTOR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'APPROVED', 'REJECTED', 'SPEAKER_CREATED', 'PODCAST_SCHEDULED', 'RECORDING_COMPLETED', 'EDITING', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "key" "MajorCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "applicationCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "personal" JSONB,
    "professional" JSONB,
    "answers" JSONB,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "ApplicationStatus",
    "toStatus" "ApplicationStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "score" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Speaker" (
    "id" TEXT NOT NULL,
    "speakerCode" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_key_key" ON "Category"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_categoryId_label_key" ON "SubCategory"("categoryId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicationCode_key" ON "Application"("applicationCode");

-- CreateIndex
CREATE INDEX "Application_status_submittedAt_idx" ON "Application"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Document_applicationId_idx" ON "Document"("applicationId");

-- CreateIndex
CREATE INDEX "StatusHistory_applicationId_idx" ON "StatusHistory"("applicationId");

-- CreateIndex
CREATE INDEX "Review_applicationId_idx" ON "Review"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Speaker_speakerCode_key" ON "Speaker"("speakerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Speaker_applicationId_key" ON "Speaker"("applicationId");

-- CreateIndex
CREATE INDEX "ActivityLog_applicationId_idx" ON "ActivityLog"("applicationId");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed: fixed top-level categories
INSERT INTO "Category" ("id", "key", "label", "order") VALUES
  ('cat_enabler', 'ENABLER', 'Enabler', 0),
  ('cat_d2c', 'D2C_CONSUMER', 'D2C / Consumer Brand', 1),
  ('cat_tech_founder', 'TECH_FOUNDER', 'Tech Founder', 2),
  ('cat_investor', 'INVESTOR', 'Investor (Angel / VC)', 3);

-- Seed: category-dependent sub-categories (admin-editable afterwards)
INSERT INTO "SubCategory" ("id", "categoryId", "label", "order") VALUES
  ('subcat_enabler_marketing', 'cat_enabler', 'Marketing', 0),
  ('subcat_enabler_finance', 'cat_enabler', 'Finance', 1),
  ('subcat_enabler_legal', 'cat_enabler', 'Legal', 2),
  ('subcat_enabler_community', 'cat_enabler', 'Community', 3),
  ('subcat_enabler_hr', 'cat_enabler', 'HR', 4),
  ('subcat_enabler_ai', 'cat_enabler', 'AI', 5),
  ('subcat_enabler_operations', 'cat_enabler', 'Operations', 6),
  ('subcat_enabler_growth', 'cat_enabler', 'Growth', 7),
  ('subcat_enabler_branding', 'cat_enabler', 'Branding', 8),
  ('subcat_enabler_sales', 'cat_enabler', 'Sales', 9),

  ('subcat_tech_ai', 'cat_tech_founder', 'AI', 0),
  ('subcat_tech_saas', 'cat_tech_founder', 'SaaS', 1),
  ('subcat_tech_fintech', 'cat_tech_founder', 'FinTech', 2),
  ('subcat_tech_healthtech', 'cat_tech_founder', 'HealthTech', 3),
  ('subcat_tech_climatetech', 'cat_tech_founder', 'ClimateTech', 4),
  ('subcat_tech_edtech', 'cat_tech_founder', 'EdTech', 5),
  ('subcat_tech_deeptech', 'cat_tech_founder', 'DeepTech', 6),
  ('subcat_tech_marketplace', 'cat_tech_founder', 'Marketplace', 7),

  ('subcat_investor_angel', 'cat_investor', 'Angel', 0),
  ('subcat_investor_vc_partner', 'cat_investor', 'VC Partner', 1),
  ('subcat_investor_micro_vc', 'cat_investor', 'Micro VC', 2),
  ('subcat_investor_accelerator', 'cat_investor', 'Accelerator', 3),
  ('subcat_investor_family_office', 'cat_investor', 'Family Office', 4),
  ('subcat_investor_incubator', 'cat_investor', 'Incubator', 5),

  ('subcat_d2c_beauty', 'cat_d2c', 'Beauty', 0),
  ('subcat_d2c_fashion', 'cat_d2c', 'Fashion', 1),
  ('subcat_d2c_food', 'cat_d2c', 'Food', 2),
  ('subcat_d2c_consumer_goods', 'cat_d2c', 'Consumer Goods', 3),
  ('subcat_d2c_lifestyle', 'cat_d2c', 'Lifestyle', 4),
  ('subcat_d2c_fmcg', 'cat_d2c', 'FMCG', 5),
  ('subcat_d2c_jewellery', 'cat_d2c', 'Jewellery', 6),
  ('subcat_d2c_home', 'cat_d2c', 'Home', 7),
  ('subcat_d2c_pet', 'cat_d2c', 'Pet', 8),
  ('subcat_d2c_sports', 'cat_d2c', 'Sports', 9);
