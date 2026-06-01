import { cleanupOldGenerations } from "@/lib/cleanup-old-generations";
import { logger } from "@/lib/logger";

const cleanupIntervalMs = 24 * 60 * 60 * 1000;

let lastCleanupAttemptMs = 0;
let cleanupPromise: Promise<void> | null = null;

export function scheduleLazyCleanup() {
  const now = Date.now();

  if (cleanupPromise || now - lastCleanupAttemptMs < cleanupIntervalMs) {
    return;
  }

  lastCleanupAttemptMs = now;
  cleanupPromise = cleanupOldGenerations(7)
    .then((result) => {
      logger.info("Lazy cleanup completed", {
        cutoff: result.cutoff.toISOString(),
        deletedGenerations: result.deletedGenerations,
      });
    })
    .catch((error: unknown) => {
      logger.error("Lazy cleanup failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    })
    .finally(() => {
      cleanupPromise = null;
    });
}
