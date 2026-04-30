type RateLimitOptions = {
    key: string;
    limit: number;
    windowMs: number;
};

type RateLimitResult = {
    success: boolean;
    remaining: number;
    resetAt: Date;
};

const buckets = new Map<string, { count: number; resetAt: number; }>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60 * 1000;

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
    const now = Date.now();

    if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
        for (const [bucketKey, bucket] of buckets) {
            if (bucket.resetAt <= now) {
                buckets.delete(bucketKey);
            }
        }
        lastCleanup = now;
    }

    let existing = buckets.get(key);

    if (existing && existing.resetAt <= now) {
        buckets.delete(key);
        existing = undefined;
    }

    if (!existing) {
        const resetAt = now + windowMs;

        buckets.set(key, { count: 1, resetAt });

        return {
            success: true,
            remaining: limit - 1,
            resetAt: new Date(resetAt),
        };
    }

    if (existing.count >= limit) {
        return {
            success: false,
            remaining: 0,
            resetAt: new Date(existing.resetAt),
        };
    }

    existing.count += 1;

    return {
        success: true,
        remaining: Math.max(limit - existing.count, 0),
        resetAt: new Date(existing.resetAt),
    };
}