-- CreateIndex
CREATE INDEX "Defect_status_priority_idx" ON "Defect"("status", "priority");

-- CreateIndex
CREATE INDEX "Defect_status_createdAt_idx" ON "Defect"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TestCase_status_isAutomated_idx" ON "TestCase"("status", "isAutomated");

-- CreateIndex
CREATE INDEX "TestCase_suiteId_status_idx" ON "TestCase"("suiteId", "status");

-- CreateIndex
CREATE INDEX "TestResult_testCaseId_status_idx" ON "TestResult"("testCaseId", "status");

-- CreateIndex
CREATE INDEX "TestResult_status_createdAt_idx" ON "TestResult"("status", "createdAt");
