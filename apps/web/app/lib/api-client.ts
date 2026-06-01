"use client";

type GetToken = () => Promise<string | null>;

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

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  getToken?: GetToken,
) {
  const headers = new Headers(options.headers);
  const token = getToken ? await getToken() : null;

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers,
  });
}
