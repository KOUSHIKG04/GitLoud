import type { Metadata } from "next";
import { ApiKeySettings } from "@/features/settings/components/api-key-settings";
import { GitHubAppSettings } from "@/features/settings/components/github-app-settings";
import { SocialAccountsSettings } from "@/features/settings/components/social-accounts-settings";

export const metadata: Metadata = {
  title: "Settings",
  robots: {
    index: false,
    follow: false,
  },
};

const sections = [
  {
    id: "github",
    title: "GitHub",
    description:
      "Connect the GitHub App to generate from private repositories and pick items from your repos.",
    Component: GitHubAppSettings,
  },
  {
    id: "ai-key",
    title: "AI key",
    description:
      "Optionally use your own AI provider key for generation. Keys are encrypted.",
    Component: ApiKeySettings,
  },
  {
    id: "social",
    title: "Social accounts",
    description: "Connect where generated posts can be published.",
    Component: SocialAccountsSettings,
  },
];

/**
 * All settings on one page, one section each, linkable by #github,
 * #ai-key and #social.
 */
export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-2 sm:px-8">
      <h1 className="text-xl font-semibold sm:text-2xl">Settings</h1>

      <nav aria-label="Settings sections" className="mt-4 flex gap-4 text-sm">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-12">
        {sections.map(({ id, title, description, Component }) => (
          <section key={id} id={id} className="scroll-mt-20 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Component />
          </section>
        ))}
      </div>
    </main>
  );
}
