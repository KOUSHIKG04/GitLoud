import { logger } from "@/lib/logger";

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


let lastPersistentCleanupMs = 0; const PERSISTENT_CLEANUP_INTERVAL_MS = 60_000;

export async function persistentRateLimit({
    key,
    limit,
    windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
    try {
        const { db } = await import("@repo/db/client");
        const now = new Date();
        const nowMs = now.getTime();
        const resetAt = new Date(now.getTime() + windowMs);

        const rows = await db.$queryRaw<
            Array<{ count: number; resetAt: Date }>
        >`
            INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
            VALUES (${key}, 1, ${resetAt}, ${now})
            ON CONFLICT ("key")
            DO UPDATE SET
                "count" = CASE
                    WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
                    ELSE "RateLimitBucket"."count" + 1
                END,
                "resetAt" = CASE
                    WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${resetAt}
                    ELSE "RateLimitBucket"."resetAt"
                END,
                "updatedAt" = ${now}
            RETURNING "count", "resetAt"
        `;

        if (nowMs - lastPersistentCleanupMs >= PERSISTENT_CLEANUP_INTERVAL_MS) {
            await db.$executeRaw`
        DELETE FROM "RateLimitBucket"
        WHERE "resetAt" <= ${now}
      `;
            lastPersistentCleanupMs = nowMs;
        }

        const bucket = rows[0];

        if (!bucket) {
            return rateLimit({ key, limit, windowMs });
        }

        return {
            success: bucket.count <= limit,
            remaining: Math.max(limit - bucket.count, 0),
            resetAt: bucket.resetAt,
        };
    } catch (error) {
        logger.warn("Persistent rate limiter failed, falling back to memory", {
            error,
        });

        return {
            success: false,
            remaining: 0,
            resetAt: new Date(Date.now() + windowMs),
        };
    }
}
