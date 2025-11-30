/*
  Warnings:

  - You are about to drop the column `ollamaModel` on the `AIProviderSettings` table. All the data in the column will be lost.
  - You are about to drop the column `ollamaUrl` on the `AIProviderSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIProviderSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'OPENAI',
    "openaiApiKey" TEXT,
    "openaiModel" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "foundryUrl" TEXT,
    "foundryModel" TEXT NOT NULL DEFAULT 'llama2',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AIProviderSettings" ("createdAt", "id", "isActive", "openaiApiKey", "openaiModel", "provider", "updatedAt") SELECT "createdAt", "id", "isActive", "openaiApiKey", "openaiModel", "provider", "updatedAt" FROM "AIProviderSettings";
DROP TABLE "AIProviderSettings";
ALTER TABLE "new_AIProviderSettings" RENAME TO "AIProviderSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
