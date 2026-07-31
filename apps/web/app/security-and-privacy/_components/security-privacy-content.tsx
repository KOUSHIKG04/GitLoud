"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type LegalTab = "security" | "privacy";

const securityControls = [
  "Private repository access is optional and available only through the GitLoud GitHub App.",
  "GitHub App access can be limited to selected repositories during installation.",
  "GitLoud requests read-only repository permissions for contents, metadata, and pull requests.",
  "Disconnecting GitHub uninstalls the GitHub App and immediately deletes the local installation record.",
  "GitLoud does not request and never receives repository write access.",
  "Private repository reads use short-lived, server-side GitHub App installation tokens generated only when needed.",
] as const;

export function SecurityPrivacyContent({
  initialTab,
}: {
  initialTab: LegalTab;
}) {
  const hashTab = usePrivacyHashTab();
  const [selectedTab, setSelectedTab] = useState<LegalTab | null>(null);
  const activeTab = selectedTab ?? hashTab ?? initialTab;
  const securityTabRef = useRef<HTMLButtonElement>(null);
  const privacyTabRef = useRef<HTMLButtonElement>(null);

  const handleSecurityKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setSelectedTab("privacy");
      setTimeout(() => {
        privacyTabRef.current?.focus();
      }, 0);
    }
  };

  const handlePrivacyKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setSelectedTab("security");
      setTimeout(() => {
        securityTabRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div>
      <section className="px-4 py-10 sm:px-6 lg:px-20 lg:pt-20 lg:pb-8">
        <div className="mx-auto max-w-5xl text-left space-y-3">
          <p className="text-md font-semibold uppercase tracking-wider text-primary">
            LEGAL & TRUST
          </p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tighter">
            Security & Privacy
          </h1>
          <p className="mt-3 max-w-3xl text-md leading-6 text-muted-foreground tracking-tighter">
            GitLoud limits private repository access through selected GitHub App
            installations, read-only permissions, and short-lived server-side
            tokens. We collect only the account and project information needed
            to provide authentication, generation history, and related product
            features.
          </p>
        </div>
      </section>

  

      <div className="border-t border-b border-border w-full">
        <div
          className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-20 flex gap-8"
          role="tablist"
          aria-label="Legal and Trust Tabs"
        >
          <button
            ref={securityTabRef}
            id="tab-security"
            type="button"
            role="tab"
            aria-selected={activeTab === "security"}
            aria-controls="panel-security"
            tabIndex={activeTab === "security" ? 0 : -1}
            onClick={() => setSelectedTab("security")}
            onKeyDown={handleSecurityKeyDown}
            className={`py-4 text-sm font-semibold tracking-tight transition-colors relative ${
              activeTab === "security"
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Security
            {activeTab === "security" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            ref={privacyTabRef}
            id="tab-privacy"
            type="button"
            role="tab"
            aria-selected={activeTab === "privacy"}
            aria-controls="panel-privacy"
            tabIndex={activeTab === "privacy" ? 0 : -1}
            onClick={() => setSelectedTab("privacy")}
            onKeyDown={handlePrivacyKeyDown}
            className={`py-4 text-sm font-semibold tracking-tight transition-colors relative ${
              activeTab === "privacy"
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Privacy Policy
            {activeTab === "privacy" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>
      </div>

      <div className="divide-y divide-border w-full">
        {activeTab === "security" ? (
          <div
            id="panel-security"
            role="tabpanel"
            aria-labelledby="tab-security"
            tabIndex={0}
          >
            <section className="px-4 py-10 sm:px-6 lg:px-20 lg:py-10">
              <div className="mx-auto max-w-5xl text-left space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Private Repository Access
                </h2>
                <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                  <p className="tracking-tight">
                    GitLoud uses a GitHub App instead of asking users for broad
                    personal access tokens. The app can be installed for
                    selected repositories, and GitLoud uses the installation to
                    read only the PR or commit data needed for generation.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 mt-4">
                    {securityControls.map((control) => (
                      <div
                        key={control}
                        className="flex items-start gap-3 p-4 border border-border/50 bg-muted/10"
                      >
                        <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm leading-normal text-muted-foreground">
                          {control}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="px-4  sm:px-6 lg:px-20">
              <div className="mx-auto max-w-5xl text-left space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Data Handling
                </h2>
                <div className="tracking-tight space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>
                    For public links, GitLoud fetches the submitted GitHub PR or
                    commit. For private repositories, GitLoud fetches the
                    selected PR or commit through the connected GitHub App
                    installation.
                  </p>
                  <p>
                    Generation may send relevant metadata and code diff context
                    to the configured AI provider. Do not connect repositories
                    that contain secrets, regulated data, customer data, or code
                    your organization does not allow to be processed by
                    third-party AI or infrastructure services.
                  </p>
                  <p>
                    See the{" "}
                    <Link href="/terms" className="text-primary underline">
                      Terms of Service
                    </Link>{" "}
                    for the broader product data terms.
                  </p>
                </div>
              </div>
            </section>

            <section className="px-4 py-10 sm:px-6 lg:px-20 lg:py-10">
              <div className="mx-auto max-w-5xl text-left space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Compliance Status
                </h2>
                <div className="tracking-wider space-y-4 text-sm leading-6 text-muted-foreground">
                  <p>
                    GitLoud is not currently SOC 2 or ISO/IEC 27001 certified.
                    If your team requires those certifications, treat private
                    repository access as an internal policy decision and connect
                    only repositories approved for processing through GitLoud
                    and its service providers.
                  </p>
                  <div className="border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                    If your organization requires vendor security review,
                    complete that review before connecting private repositories.
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div
            id="panel-privacy"
            role="tabpanel"
            aria-labelledby="tab-privacy"
            tabIndex={0}
          >
            <section className="px-4 py-10 sm:px-6 lg:px-20 lg:py-10">
              <div className="mx-auto max-w-5xl text-left space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Information We Use
                </h2>
                <div className="text-sm leading-6 text-muted-foreground">
                  <p>
                    We may use your email address, display name, authentication
                    identifier, GitHub App installation metadata, selected
                    repository names, pull request or commit details, media
                    attachment metadata, generated content history, and feedback
                    messages with an optional contact email to operate and
                    improve GitLoud.
                  </p>
                </div>
              </div>
            </section>

            <section className="px-4 sm:px-6 lg:px-20 ">
              <div className="mx-auto max-w-5xl text-left space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  How It Is Used
                </h2>
                <div className="text-sm leading-6 text-muted-foreground">
                  <p>
                    Your information is used to sign you in, fetch GitHub PR or
                    commit data you submit, generate content, save your
                    generation history, improve reliability, and show the
                    correct profile details in the app. For private
                    repositories, GitLoud reads the selected PR or commit
                    through a GitHub App installation token and sends the
                    relevant metadata and code diff context to the configured AI
                    provider for generation.
                  </p>
                </div>
              </div>
            </section>

            <section className="px-4 py-10 sm:px-6 lg:px-20 lg:py-10">
              <div className="mx-auto max-w-5xl text-left space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Third-Party Services
                </h2>
                <div className="text-sm leading-6 text-muted-foreground">
                  <p>
                    GitLoud uses infrastructure, authentication, database, media
                    storage, GitHub, payment, and AI provider services to
                    deliver the product. These providers process data only as
                    needed for the requested feature. Do not connect
                    repositories that contain data you are not allowed to
                    process through these services.
                  </p>
                </div>
              </div>
            </section>

            <section className="pb-10 px-4 sm:px-6 lg:px-20">
              <div className="mx-auto max-w-5xl text-left space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Data Control
                </h2>
                <div className="text-sm leading-6 text-muted-foreground">
                  <p>
                    You can request deletion or correction of account-related
                    data. Saved generations are also removed by retention
                    cleanup after the configured retention period. Disconnecting
                    GitHub from the settings page uninstalls the GitHub App for
                    that installation and removes the local installation record.
                    Some records may be retained when required for security,
                    compliance, or abuse prevention.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function usePrivacyHashTab() {
  return useSyncExternalStore(subscribeToHashChanges, getHashTab, () => null);
}

function subscribeToHashChanges(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);

  return () => {
    window.removeEventListener("hashchange", onStoreChange);
  };
}

function getHashTab(): LegalTab | null {
  return window.location.hash === "#privacy" ? "privacy" : null;
}
