import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> }

// @ts-ignore
export const prisma = globalForPrisma.prisma || new PrismaClient({})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
