export function getRequestIp(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() ?? "unknown";
    }

    return realIp ?? "unknown";
}