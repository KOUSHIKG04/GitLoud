"use client";

import { useGitHubActivityDashboard } from "../_hooks/use-github-activity-dashboard";
import { Button } from "@repo/ui/components/button";
import { DotMatrixLoader } from "@/components/DotMatrixLoader";
import { GitHubActivityControls } from "./github-activity-controls";
import { GitHubActivityCustomizeStep } from "./github-activity-customize-step";
import { GitHubActivityFooter } from "./github-activity-footer";
import { GitHubActivitySelectionStep } from "./github-activity-selection-step";
import Link from "next/link";

export function GitHubActivityPanel() {
  const {
    activityType,
    activityTypeLabel,
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
    selectedItemUrls,
    selectedItems,
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
      <DotMatrixLoader
        className="min-h-[calc(100dvh-12rem)]"
        label="Loading GitHub activity dashboard"
      />
    );
  }

  if (repositories.length === 0) {
    return (
      <section className="space-y-3 rounded-sm border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
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
    <section className="min-w-0 overflow-hidden rounded-sm border bg-card text-card-foreground shadow-sm">
      <div className="flex min-h-0 min-w-0 flex-col sm:min-h-105">
        <div className="min-w-0 space-y-5 p-3 sm:space-y-6 sm:p-4">
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
            generationStep={generationStep}
            selectedItem={selectedItem}
            setGenerationStep={setGenerationStep}
          />

          {generationStep === "select" ? (
            <GitHubActivitySelectionStep
              activityType={activityType}
              items={items}
              loadingActivity={loadingActivity}
              selectedItemUrls={selectedItemUrls}
              setSelectedItemUrl={setSelectedItemUrl}
            />
          ) : (
            <GitHubActivityCustomizeStep
              context={context}
              generating={generating}
              selectedItems={selectedItems}
              selectedMedia={selectedMedia}
              setContext={setContext}
            />
          )}
        </div>

        {generationStep === "select" ? (
          <div className="flex justify-end border-t bg-muted/20 px-3 py-3 sm:px-6">
            <Button
              type="button"
              className="w-full sm:w-auto sm:min-w-32"
              disabled={selectedItems.length === 0 || loadingActivity}
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
            onSubmit={generateFromSelectedItem}
            selectedMedia={selectedMedia}
            setXPostLength={setXPostLength}
            submitDisabled={selectedItems.length === 0 || generating}
          />
        )}
      </div>
    </section>
  );
}
