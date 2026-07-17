"use client";

import { ApiKeySettings } from "./_components/api-key-settings";
import { GitHubAppSettings } from "./_components/github-app-settings";
import { SocialAccountsSettings } from "./_components/social-accounts-settings";

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
