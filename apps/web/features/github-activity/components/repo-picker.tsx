"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { GitHubActivityControls } from "@/features/github-activity/components/github-activity-controls";
import { GitHubActivitySelectionStep } from "@/features/github-activity/components/github-activity-selection-step";
import { useRepoPicker } from "@/features/github-activity/hooks/use-repo-picker";

/**
 * Pick 1 to 5 pull requests or commits from a connected repository, then
 * generate directly. One item generates on its own; 2 to 5 are combined.
 */
export function RepoPicker({
  generating,
  onGenerate,
}: {
  generating: boolean;
  onGenerate: (urls: string[]) => void;
}) {
  const picker = useRepoPicker();
  const count = picker.selectedItems.length;

  if (!picker.hasLoadedInstallations) {
    return <SectionSkeleton label="Loading your repositories" rows={4} />;
  }

  if (picker.repositories.length === 0) {
    return (
      <div className="space-y-3 rounded-sm border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Connect the GitLoud GitHub App to pick pull requests and commits from
          your repositories, including private ones.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/settings#github">Connect GitHub</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 rounded-sm border border-border p-3 sm:p-4">
      <GitHubActivityControls
        activityType={picker.activityType}
        activityTypeLabel={picker.activityTypeLabel}
        generating={generating}
        loadingInstallations={picker.loadingInstallations}
        loadInstallations={picker.loadInstallations}
        repositories={picker.repositories}
        repositoryMenuOpen={picker.repositoryMenuOpen}
        selectedRepository={picker.selectedRepository}
        selectedRepositoryId={picker.selectedRepositoryId}
        setActivityType={picker.setActivityType}
        setRepositoryMenuOpen={picker.setRepositoryMenuOpen}
        setSelectedRepositoryId={picker.setSelectedRepositoryId}
      />

      <GitHubActivitySelectionStep
        activityType={picker.activityType}
        items={picker.items}
        loadingActivity={picker.loadingActivity}
        selectedItemUrls={picker.selectedItemUrls}
        setSelectedItemUrl={picker.setSelectedItemUrl}
      />

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          {count === 0
            ? "Select up to 5. Two or more are combined into one update."
            : count === 1
              ? "1 selected"
              : `${count} selected · combined into one update`}
        </p>
        <Button
          type="button"
          className="sm:min-w-40"
          disabled={count === 0 || generating || picker.loadingActivity}
          onClick={() =>
            onGenerate(picker.selectedItems.map((item) => item.url))
          }
        >
          {generating ? "GENERATING…" : "GENERATE"}
        </Button>
      </div>
    </div>
  );
}
