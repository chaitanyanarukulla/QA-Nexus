-- CreateTable
CREATE TABLE "JiraIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "instanceUrl" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JiraIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JiraIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jiraKey" TEXT NOT NULL,
    "jiraId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "issueType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT,
    "assignee" TEXT,
    "reporter" TEXT,
    "projectKey" TEXT NOT NULL,
    "testCaseId" TEXT,
    "defectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JiraIssue_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JiraIssue_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "Defect" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "JiraIntegration_userId_key" ON "JiraIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JiraIssue_jiraKey_key" ON "JiraIssue"("jiraKey");
