-- CreateTable
CREATE TABLE "DocumentAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "sourceContent" TEXT NOT NULL,
    "risks" JSONB NOT NULL,
    "gaps" JSONB NOT NULL,
    "missedRequirements" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "testSuiteId" TEXT,
    CONSTRAINT "DocumentAnalysis_testSuiteId_fkey" FOREIGN KEY ("testSuiteId") REFERENCES "TestSuite" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAnalysis_testSuiteId_key" ON "DocumentAnalysis"("testSuiteId");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_sourceType_idx" ON "DocumentAnalysis"("sourceType");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_analyzedAt_idx" ON "DocumentAnalysis"("analyzedAt");
