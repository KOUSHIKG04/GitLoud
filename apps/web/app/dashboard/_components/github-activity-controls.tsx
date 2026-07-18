"use client";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Check, ChevronDown, RefreshCw, SquarePen } from "lucide-react";
import type {
  ActivityType,
  GenerationStep,
  GitHubActivityItem,
  GitHubRepositoryOption,
} from "./github-activity-types";
import { dropdownContentClass, dropdownItemClass } from "./github-activity-ui";

type GitHubActivityControlsProps = {
  activityType: ActivityType;
  activityTypeLabel: string;
  generating: boolean;
  loadingInstallations: boolean;
  loadInstallations: () => Promise<void>;
  repositories: GitHubRepositoryOption[];
  repositoryMenuOpen: boolean;
  selectedRepository: GitHubRepositoryOption | undefined;
  selectedRepositoryId: string;
  setActivityType: (type: ActivityType) => void;
  setRepositoryMenuOpen: (open: boolean) => void;
  setSelectedRepositoryId: (id: string) => void;
  generationStep: GenerationStep;
  selectedItem: GitHubActivityItem | undefined;
  setGenerationStep: (step: GenerationStep) => void;
};

export function GitHubActivityControls({
  activityType,
  activityTypeLabel,
  generating,
  loadingInstallations,
  loadInstallations,
  repositories,
  repositoryMenuOpen,
  selectedRepository,
  selectedRepositoryId,
  setActivityType,
  setRepositoryMenuOpen,
  setSelectedRepositoryId,
  generationStep,
  setGenerationStep,
}: GitHubActivityControlsProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 md:grid md:grid-cols-[1.3fr_0.7fr_auto] md:items-end">
      <div className="min-w-0 w-full space-y-1.5 text-sm">
        <span className="text-xs text-muted-foreground sm:text-sm">
          REPOSITORY
        </span>
        <DropdownMenu
          modal={false}
          open={repositoryMenuOpen}
          onOpenChange={setRepositoryMenuOpen}
        >
          <DropdownMenuTrigger asChild className="mt-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-0 w-full justify-between rounded-sm border-input bg-background px-3 text-sm font-normal focus-visible:ring-1"
              disabled={generating}
            >
              <span className="min-w-0 truncate">
                {selectedRepository
                  ? `${selectedRepository.owner}/${selectedRepository.repo}`
                  : "Select repository"}
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className={`${dropdownContentClass} max-w-[calc(100vw-1.5rem)] p-0 shadow-xl`}
          >
            <DropdownMenuLabel className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Synced repositories
              </span>
              <span className="rounded-sm bg-foreground/8 px-2 py-0.5 font-mono text-[10px] text-foreground/70">
                {repositories.length}
              </span>
            </DropdownMenuLabel>
            <ScrollArea className="h-[min(14rem,var(--radix-dropdown-menu-content-available-height))]">
              <div className="space-y-0.5 p-1.5 pr-4">
                {repositories.map((repository) => (
                  <DropdownMenuItem
                    key={repository.id}
                    className={[
                      "flex min-h-9 w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-[13px] outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring",
                      repository.id === selectedRepositoryId
                        ? "bg-primary/10 text-foreground"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      setSelectedRepositoryId(repository.id);
                      setRepositoryMenuOpen(false);
                    }}
                  >
                    <span className="flex min-w-0 flex-1 items-baseline font-mono">
                      <span className="shrink-0 text-muted-foreground">
                        {repository.owner}/
                      </span>
                      <span className="truncate font-medium text-foreground">
                        {repository.repo}
                      </span>
                    </span>
                    {repository.id === selectedRepositoryId ? (
                      <Check className="size-4 shrink-0 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {generationStep === "customize" ? (
        <div className="col-span-2 w-full md:col-span-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-sm border-input bg-background px-4 text-sm font-normal focus-visible:ring-1 uppercase tracking-wider shrink-0"
            disabled={generating}
            onClick={() => setGenerationStep("select")}
          >
            <SquarePen className="size-4 mr-2 text-muted-foreground" />
            Change selection
          </Button>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_3.25rem] items-end gap-2 sm:gap-3 md:contents">
          <div className="min-w-0 w-full space-y-1.5 text-sm">
            <span className="text-xs text-muted-foreground sm:text-sm">
              SOURCE TYPE
            </span>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 min-w-0 w-full justify-between rounded-sm border-input bg-background px-3 text-sm font-normal focus-visible:ring-1"
                  disabled={generating}
                >
                  <span className="truncate">{activityTypeLabel}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className={dropdownContentClass}
              >
                <DropdownMenuItem
                  className={dropdownItemClass}
                  onSelect={() => setActivityType("pull-requests")}
                >
                  Pull requests
                  {activityType === "pull-requests" ? (
                    <Check className="ml-auto size-4" />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={dropdownItemClass}
                  onSelect={() => setActivityType("commits")}
                >
                  Commits
                  {activityType === "commits" ? (
                    <Check className="ml-auto size-4" />
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="w-full space-y-1.5 text-sm">
            <span className="block text-[10px] text-muted-foreground sm:text-sm">
              REFRESH
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 w-full rounded-sm"
              onClick={() => void loadInstallations()}
              disabled={loadingInstallations || generating}
            >
              <RefreshCw
                className={[
                  "size-4",
                  loadingInstallations ? "animate-spin" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
