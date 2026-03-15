// ─── ShadowDrive AI — Redis/Valkey Client Singleton ───
// Same pattern as prisma.ts — returns null if not configured.

import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis(): Redis | null {
    const host = process.env.REDIS_HOST;
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;

    if (!host) return null;

    if (!globalForRedis.redis) {
        globalForRedis.redis = new Redis({
            host,
            port,
            password: password || undefined,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });

        globalForRedis.redis.on('error', (err) => {
            console.error('[Redis] Connection error:', err.message);
        });
    }

    return globalForRedis.redis;
}
