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