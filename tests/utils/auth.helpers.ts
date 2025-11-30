import { Page, BrowserContext } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({});

/**
 * Authentication Helpers for Playwright Tests
 * 
 * Provides utilities for logging in users and managing authentication state
 */

export interface TestUser {
    email: string;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'TESTER' | 'DEVELOPER';
}

/**
 * Get or create a test user
 */
export async function getTestUser(role: 'ADMIN' | 'MANAGER' | 'TESTER' | 'DEVELOPER' = 'TESTER'): Promise<TestUser> {
    const email = `${role.toLowerCase()}-test@qanexus.test`;

    // Check if user exists
    let user = await prisma.user.findUnique({
        where: { email },
    });

    // Create if doesn't exist
    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                name: `Test ${role}`,
                role,
            },
        });
    }

    return {
        email: user.email,
        name: user.name || 'User',
        role: user.role as TestUser['role'],
    };
}

/**
 * Login as a test user
 * 
 * Note: Since QA Nexus doesn't have a traditional login page (no auth shown),
 * we'll simulate being logged in by setting the user in localStorage/session
 * or by directly navigating with the user context
 */
export async function loginAsUser(page: Page, role: 'ADMIN' | 'MANAGER' | 'TESTER' | 'DEVELOPER' = 'TESTER'): Promise<TestUser> {
    const user = await getTestUser(role);

    // Navigate to the app
    await page.goto('/');

    // For now, since there's no auth system, we just ensure we're on the page
    // In the future, if auth is added, we'd set cookies/tokens here

    return user;
}

/**
 * Setup authenticated context
 * Returns a browser context that's already authenticated
 */
export async function getAuthenticatedContext(
    context: BrowserContext,
    role: 'ADMIN' | 'MANAGER' | 'TESTER' | 'DEVELOPER' = 'TESTER'
): Promise<{ context: BrowserContext; user: TestUser }> {
    const user = await getTestUser(role);

    // Add authentication state to context if needed
    // For now, since there's no auth, we just return the context

    return { context, user };
}

/**
 * Clear authentication state
 */
export async function logout(page: Page): Promise<void> {
    // Clear any cookies or local storage
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
}
