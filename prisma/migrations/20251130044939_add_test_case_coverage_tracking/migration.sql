-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN "coversGaps" JSONB;
ALTER TABLE "TestCase" ADD COLUMN "coversRequirements" JSONB;
ALTER TABLE "TestCase" ADD COLUMN "coversRisks" JSONB;
