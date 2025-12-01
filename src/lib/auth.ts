import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncUser() {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
        return null;
    }

    // Upsert user in database
    const dbUser = await prisma.user.upsert({
        where: {
            email: email,
        },
        update: {
            clerkId: user.id,
            name: `${user.firstName} ${user.lastName}`.trim(),
        },
        create: {
            email: email,
            clerkId: user.id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            role: "TESTER", // Default role
        },
    });

    return dbUser;
}
