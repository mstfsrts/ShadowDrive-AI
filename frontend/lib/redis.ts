// ─── ShadowDrive AI — Redis/Valkey Client Singleton ───
// Same pattern as prisma.ts — returns null if not configured.

import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis(): Redis | null {
    const url = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST;

    if (!url && !host) return null;

    if (!globalForRedis.redis) {
        globalForRedis.redis = url
            ? new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true })
            : new Redis({
                host: host!,
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD || undefined,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            });

        globalForRedis.redis.on('error', (err) => {
            console.error('[Redis] Connection error:', err.message);
        });
    }

    return globalForRedis.redis;
}
