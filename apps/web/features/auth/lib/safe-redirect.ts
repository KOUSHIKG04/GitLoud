export function getSafeRedirect(
  callbackUrl?: string,
  redirectUrl?: string,
  fallbackUrl: string = "/"
): string {
  const requestedUrl = callbackUrl ?? redirectUrl;
  const isSafeRedirect =
    typeof requestedUrl === "string" &&
    requestedUrl.startsWith("/") &&
    !requestedUrl.startsWith("//") &&
    !requestedUrl.startsWith("/\\");

  return isSafeRedirect ? requestedUrl : fallbackUrl;
}
