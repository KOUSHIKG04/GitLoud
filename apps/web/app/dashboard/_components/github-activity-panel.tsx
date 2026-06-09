"use client";

import { useGitHubActivityDashboard } from "../_hooks/use-github-activity-dashboard";
import { Button } from "@repo/ui/components/button";
import { LoaderCircle } from "lucide-react";
import { GitHubActivityControls } from "./github-activity-controls";
import { GitHubActivityCustomizeStep } from "./github-activity-customize-step";
import { GitHubActivityFooter } from "./github-activity-footer";
import { GitHubActivitySelectionStep } from "./github-activity-selection-step";
import { ProAccessLock } from "./pro-access-lock";
import Link from "next/link";

export function GitHubActivityPanel() {
  const {
    activityType,
    activityTypeLabel,
    canUsePrivateRepos,
    clearSelectedMedia,
    context,
    fileInputRef,
    generateFromSelectedItem,
    generating,
    generationStep,
    goToCustomizeStep,
    hasLoadedInstallations,
    isPremiumXPost,
    items,
    loadInstallations,
    loadingActivity,
    loadingInstallations,
    onMediaChange,
    repositories,
    repositoryMenuOpen,
    selectedItem,
    selectedItemUrl,
    selectedMedia,
    selectedRepository,
    selectedRepositoryId,
    setActivityType,
    setContext,
    setGenerationStep,
    setRepositoryMenuOpen,
    setSelectedItemUrl,
    setSelectedRepositoryId,
    setXPostLength,
  } = useGitHubActivityDashboard();

  if (!hasLoadedInstallations) {
    return (
      <section
        className="flex min-h-[calc(100dvh-12rem)] items-center justify-center"
        role="status"
        aria-label="Loading GitHub activity dashboard"
      >
        <LoaderCircle
          className="size-9 animate-spin text-primary sm:size-10"
          aria-hidden="true"
        />
      </section>
    );
  }

  if (!canUsePrivateRepos) {
    return <ProAccessLock />;
  }

  if (repositories.length === 0) {
    return (
      <section className="space-y-3 border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <h2 className="text-base font-semibold">GitHub activity</h2>
        <p className="text-sm text-muted-foreground">
          Connect and sync the GitLoud GitHub App in settings to generate
          directly from selected repositories.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/settings">Open settings</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="border bg-card text-card-foreground shadow-sm">
      <form
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          void generateFromSelectedItem();
        }}
      >
        <div className="space-y-6 p-4 sm:p-6">
          <GitHubActivityControls
            activityType={activityType}
            activityTypeLabel={activityTypeLabel}
            generating={generating}
            loadingInstallations={loadingInstallations}
            loadInstallations={loadInstallations}
            repositories={repositories}
            repositoryMenuOpen={repositoryMenuOpen}
            selectedRepository={selectedRepository}
            selectedRepositoryId={selectedRepositoryId}
            setActivityType={setActivityType}
            setRepositoryMenuOpen={setRepositoryMenuOpen}
            setSelectedRepositoryId={setSelectedRepositoryId}
          />

          {generationStep === "select" ? (
            <GitHubActivitySelectionStep
              activityType={activityType}
              items={items}
              loadingActivity={loadingActivity}
              selectedItemUrl={selectedItemUrl}
              setSelectedItemUrl={setSelectedItemUrl}
            />
          ) : (
            <GitHubActivityCustomizeStep
              context={context}
              generating={generating}
              selectedItem={selectedItem}
              setContext={setContext}
              setGenerationStep={setGenerationStep}
            />
          )}
        </div>

        {generationStep === "select" ? (
          <div className="flex justify-end border-t bg-muted/20 px-4 py-3 sm:px-6">
            <Button
              type="button"
              className="min-w-32"
              disabled={!selectedItem || loadingActivity}
              onClick={goToCustomizeStep}
            >
              NEXT
            </Button>
          </div>
        ) : (
          <GitHubActivityFooter
            clearSelectedMedia={clearSelectedMedia}
            fileInputRef={fileInputRef}
            isPremiumXPost={isPremiumXPost}
            isSubmitting={generating}
            onMediaChange={onMediaChange}
            selectedMedia={selectedMedia}
            setXPostLength={setXPostLength}
            submitDisabled={!selectedItem || generating}
          />
        )}
      </form>
    </section>
  );
}
