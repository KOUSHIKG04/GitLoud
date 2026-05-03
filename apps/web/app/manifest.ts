import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GitLoud",
    short_name: "GitLoud",
    description:
      "Generate GitHub PR summaries, commit summaries, changelog entries, and share-ready developer posts.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    categories: ["developer", "productivity"],
    icons: [
      {
        src: "/app-logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/app-logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
