import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/adapter-libsql', '@prisma/client', 'better-sqlite3'],
};

export default nextConfig;
