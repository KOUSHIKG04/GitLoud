export function getRequestIp(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip")?.trim();

    if (realIp) {
        return realIp;
    }

    if (forwardedFor) {
        const parts = forwardedFor.split(",").map((part) => part.trim()).filter(Boolean);
        return parts[parts.length - 1] ?? "unknown";
    }

    return "unknown";
}