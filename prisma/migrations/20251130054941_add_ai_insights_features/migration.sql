-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN "executionTime" INTEGER;
ALTER TABLE "TestCase" ADD COLUMN "failurePrediction" REAL DEFAULT 0.0;
ALTER TABLE "TestCase" ADD COLUMN "flakyScore" REAL DEFAULT 0.0;
ALTER TABLE "TestCase" ADD COLUMN "lastAnalyzedAt" DATETIME;

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "testCaseId" TEXT,
    "testSuiteId" TEXT,
    "metadata" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIInsight_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIInsight_testSuiteId_fkey" FOREIGN KEY ("testSuiteId") REFERENCES "TestSuite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AIInsight_type_idx" ON "AIInsight"("type");

-- CreateIndex
CREATE INDEX "AIInsight_severity_idx" ON "AIInsight"("severity");

-- CreateIndex
CREATE INDEX "AIInsight_testCaseId_idx" ON "AIInsight"("testCaseId");

-- CreateIndex
CREATE INDEX "AIInsight_testSuiteId_idx" ON "AIInsight"("testSuiteId");

-- CreateIndex
CREATE INDEX "AIInsight_isResolved_idx" ON "AIInsight"("isResolved");

-- CreateIndex
CREATE INDEX "AIInsight_createdAt_idx" ON "AIInsight"("createdAt");

-- CreateIndex
CREATE INDEX "TestCase_flakyScore_idx" ON "TestCase"("flakyScore");

-- CreateIndex
CREATE INDEX "TestCase_failurePrediction_idx" ON "TestCase"("failurePrediction");
