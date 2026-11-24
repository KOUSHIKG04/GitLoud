export function getApiUrl(path: string) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const baseUrl =
    configuredBaseUrl ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
