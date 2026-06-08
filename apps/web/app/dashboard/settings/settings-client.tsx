"use client";

import { ApiKeySettings } from "./_components/api-key-settings";
import { GitHubAppSettings } from "./_components/github-app-settings";

export function SettingsClient({
  view,
}: {
  view: "github-app" | "api-key";
}) {
  return view === "github-app" ? <GitHubAppSettings /> : <ApiKeySettings />;
}
