import { PrismaClient } from '@prisma/client'

// @ts-ignore
const prisma = new PrismaClient({})

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'demo@qanexus.com' },
        update: {},
        create: {
            id: 'demo-user',
            email: 'demo@qanexus.com',
            name: 'Demo User',
            role: 'TESTER',
        },
    })

    console.log('✅ Seeded user:', user)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
