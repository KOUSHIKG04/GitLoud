/**
 * Extracts the IP address from the request headers.
 * It first checks "x-real-ip", then parses "x-forwarded-for" list,
 * and defaults to "unknown".
 *
 * @param request - The incoming HTTP Request.
 * @returns The resolved IP address or "unknown".
 */
export function getRequestIp(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip")?.trim();

    if (realIp) {
        return realIp;
    }

    if (forwardedFor) {
        const parts = forwardedFor
            .split(",")
            .flatMap((part) => {
                const trimmed = part.trim();
                return trimmed ? [trimmed] : [];
            });
        return parts[0] ?? "unknown";
    }

    return "unknown";
}