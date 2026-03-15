// ─── ShadowDrive AI — Sliding Window Rate Limiter ───
// Uses Redis sorted sets for accurate sliding window.
// Falls back to "allow" if Redis is not configured.

import { getRedis } from './redis';

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number; // Unix timestamp (ms)
}

export async function rateLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
): Promise<RateLimitResult> {
    const redis = getRedis();

    // Fail-open if Redis is unavailable
    if (!redis) {
        return { allowed: true, remaining: maxRequests, resetAt: 0 };
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `rl:${key}`;

    try {
        // Step 1: Clean expired entries and check count
        const pipeline = redis.pipeline();
        pipeline.zremrangebyscore(redisKey, 0, windowStart);
        pipeline.zcard(redisKey);
        const results = await pipeline.exec();
        const currentCount = (results?.[1]?.[1] as number) ?? 0;

        if (currentCount >= maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: windowStart + windowMs,
            };
        }

        // Step 2: Under limit — add entry and set TTL
        const addPipeline = redis.pipeline();
        addPipeline.zadd(redisKey, now.toString(), `${now}:${Math.random()}`);
        addPipeline.pexpire(redisKey, windowMs);
        await addPipeline.exec();

        return {
            allowed: true,
            remaining: maxRequests - currentCount - 1,
            resetAt: now + windowMs,
        };
    } catch (err) {
        console.error('[rateLimit] Redis error, failing open:', err);
        return { allowed: true, remaining: maxRequests, resetAt: 0 };
    }
}
