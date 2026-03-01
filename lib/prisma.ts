// ─── ShadowDrive AI — Prisma Client Singleton ───
// Uses a global singleton to avoid connection exhaustion in Next.js dev
// (module hot-reload creates new PrismaClient instances on each refresh).
//
// Returns null if DATABASE_URL is not configured — the app runs in guest-only mode.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Get the Prisma client instance.
 * Returns null if DATABASE_URL is not configured.
 * All DB-dependent features should check for null and degrade gracefully.
 */
export function getPrisma(): PrismaClient | null {
    if (!process.env.DATABASE_URL) return null;

    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        });
    }

    return globalForPrisma.prisma;
}
