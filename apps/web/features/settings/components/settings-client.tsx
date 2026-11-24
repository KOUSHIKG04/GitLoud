"use client";

import { ApiKeySettings } from "@/features/settings/components/api-key-settings";
import { GitHubAppSettings } from "@/features/settings/components/github-app-settings";
import { SocialAccountsSettings } from "@/features/settings/components/social-accounts-settings";

export function SettingsClient({
  view,
}: {
  view: "github-app" | "api-key" | "social";
}) {
  if (view === "github-app") {
    return <GitHubAppSettings />;
  }

  return view === "api-key" ? <ApiKeySettings /> : <SocialAccountsSettings />;
}
