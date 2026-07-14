-- CreateEnum
CREATE TYPE "TestimonialGroup" AS ENUM ('SERVICE', 'COMMUNITY');

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "group" "TestimonialGroup" NOT NULL DEFAULT 'SERVICE';
