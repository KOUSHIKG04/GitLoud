import { auth } from "@clerk/nextjs/server";
import { getApiUrl } from "@/lib/api-url";

/**
 * Fetches the backend API from server components with Clerk auth and no caching.
 */
export async function serverApiFetch(path: string, options: RequestInit = {}) {
  const { getToken } = await auth();
  const token = await getToken();
  const headers = new Headers(options.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(getApiUrl(path), {
    cache: "no-store",
    ...options,
    headers,
  });
}
