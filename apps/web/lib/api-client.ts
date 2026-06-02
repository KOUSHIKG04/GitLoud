import { getApiUrl } from "@/lib/api-url";

type GetToken = () => Promise<string | null>;

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
