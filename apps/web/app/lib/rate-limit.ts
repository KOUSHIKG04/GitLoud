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

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
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