-- CreateTable
CREATE TABLE "ApiCollection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "environmentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB,
    CONSTRAINT "ApiCollection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ApiCollection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiCollection_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ApiCollection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "url" TEXT NOT NULL,
    "headers" JSONB,
    "queryParams" JSONB,
    "body" JSONB,
    "bodyType" TEXT NOT NULL DEFAULT 'JSON',
    "authType" TEXT NOT NULL DEFAULT 'NONE',
    "authConfig" JSONB,
    "preRequestScript" TEXT,
    "testScript" TEXT,
    "collectionId" TEXT NOT NULL,
    "environmentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "testCaseId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ApiRequest_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "ApiCollection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiRequest_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ApiRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApiRequest_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTime" INTEGER NOT NULL,
    "responseBody" TEXT,
    "responseHeaders" JSONB,
    "errorMessage" TEXT,
    "stackTrace" TEXT,
    "artifacts" JSONB,
    "assertionsPassed" INTEGER NOT NULL DEFAULT 0,
    "assertionsFailed" INTEGER NOT NULL DEFAULT 0,
    "assertionResults" JSONB,
    "environmentId" TEXT,
    "executedBy" TEXT NOT NULL,
    "executedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiExecution_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ApiRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiExecution_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ApiExecution_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variables" JSONB NOT NULL,
    "authConfig" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Environment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OpenApiSpec" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "specContent" JSONB NOT NULL,
    "sourceUrl" TEXT,
    "collectionId" TEXT,
    "importedBy" TEXT NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OpenApiSpec_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "ApiCollection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OpenApiSpec_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiAssertion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "field" TEXT,
    "operator" TEXT NOT NULL,
    "expectedValue" TEXT,
    "customCode" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ApiAssertion_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ApiRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ApiCollection_createdBy_idx" ON "ApiCollection"("createdBy");

-- CreateIndex
CREATE INDEX "ApiCollection_parentId_idx" ON "ApiCollection"("parentId");

-- CreateIndex
CREATE INDEX "ApiCollection_environmentId_idx" ON "ApiCollection"("environmentId");

-- CreateIndex
CREATE INDEX "ApiRequest_collectionId_idx" ON "ApiRequest"("collectionId");

-- CreateIndex
CREATE INDEX "ApiRequest_createdBy_idx" ON "ApiRequest"("createdBy");

-- CreateIndex
CREATE INDEX "ApiRequest_testCaseId_idx" ON "ApiRequest"("testCaseId");

-- CreateIndex
CREATE INDEX "ApiRequest_environmentId_idx" ON "ApiRequest"("environmentId");

-- CreateIndex
CREATE INDEX "ApiExecution_requestId_idx" ON "ApiExecution"("requestId");

-- CreateIndex
CREATE INDEX "ApiExecution_status_idx" ON "ApiExecution"("status");

-- CreateIndex
CREATE INDEX "ApiExecution_executedAt_idx" ON "ApiExecution"("executedAt");

-- CreateIndex
CREATE INDEX "ApiExecution_environmentId_idx" ON "ApiExecution"("environmentId");

-- CreateIndex
CREATE INDEX "Environment_createdBy_idx" ON "Environment"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "OpenApiSpec_collectionId_key" ON "OpenApiSpec"("collectionId");

-- CreateIndex
CREATE INDEX "OpenApiSpec_importedBy_idx" ON "OpenApiSpec"("importedBy");

-- CreateIndex
CREATE INDEX "ApiAssertion_requestId_idx" ON "ApiAssertion"("requestId");
