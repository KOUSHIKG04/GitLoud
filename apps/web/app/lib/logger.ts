type LogContext = Record<string, unknown>;

/**
 * Writes a structured log payload to console stderr/warn/info.
 *
 * @param level - The log severity level.
 * @param message - The main log message.
 * @param context - Additional structured context variables to log.
 */
function writeLog(
    level: "info" | "warn" | "error",
    message: string,
    context?: LogContext,
) {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...context,
    };

    if (level === "error") {
        console.error(JSON.stringify(payload));
        return;
    }

    if (level === "warn") {
        console.warn(JSON.stringify(payload));
        return;
    }

    console.info(JSON.stringify(payload));
}

/**
 * Structured logger utility supporting structured context parameters.
 */
export const logger = {
    /**
     * Logs informational messages.
     *
     * @param message - The message to log.
     * @param context - Optional structured context data.
     */
    info(message: string, context?: LogContext) {
        writeLog("info", message, context);
    },

    /**
     * Logs warning messages.
     *
     * @param message - The message to log.
     * @param context - Optional structured context data.
     */
    warn(message: string, context?: LogContext) {
        writeLog("warn", message, context);
    },

    /**
     * Logs error messages.
     *
     * @param message - The message to log.
     * @param context - Optional structured context data.
     */
    error(message: string, context?: LogContext) {
        writeLog("error", message, context);
    },
};