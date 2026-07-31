const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitloud-web.vercel.app";

export const siteUrl = configuredSiteUrl.trim().replace(/\/+$/, "");

export function getAbsoluteSiteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
