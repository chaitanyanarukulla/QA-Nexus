-- CreateTable
CREATE TABLE "PerformanceTest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetUrl" TEXT NOT NULL,
    "vus" INTEGER NOT NULL DEFAULT 10,
    "duration" TEXT NOT NULL DEFAULT '30s',
    "thresholds" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceExecution" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "testId" TEXT NOT NULL,
    "metrics" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "executedBy" TEXT NOT NULL,

    CONSTRAINT "PerformanceExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PerformanceTest_createdBy_idx" ON "PerformanceTest"("createdBy");

-- CreateIndex
CREATE INDEX "PerformanceExecution_testId_idx" ON "PerformanceExecution"("testId");

-- CreateIndex
CREATE INDEX "PerformanceExecution_status_idx" ON "PerformanceExecution"("status");

-- CreateIndex
CREATE INDEX "PerformanceExecution_executedBy_idx" ON "PerformanceExecution"("executedBy");

-- AddForeignKey
ALTER TABLE "PerformanceTest" ADD CONSTRAINT "PerformanceTest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceExecution" ADD CONSTRAINT "PerformanceExecution_testId_fkey" FOREIGN KEY ("testId") REFERENCES "PerformanceTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceExecution" ADD CONSTRAINT "PerformanceExecution_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
