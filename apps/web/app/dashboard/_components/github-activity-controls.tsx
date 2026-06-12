"use client";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Check, ChevronDown, RefreshCw } from "lucide-react";
import type {
  ActivityType,
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
}: GitHubActivityControlsProps) {
  return (
    <div className="grid items-end gap-3 sm:grid-cols-[1.3fr_0.7fr_auto]">
      <div className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">REPOSITORY</span>
        <DropdownMenu
          modal={false}
          open={repositoryMenuOpen}
          onOpenChange={setRepositoryMenuOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-between rounded-none border-input bg-background px-3 text-sm font-normal focus-visible:ring-1"
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
          <DropdownMenuContent align="start" className={dropdownContentClass}>
            <DropdownMenuLabel>Synced repositories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[min(16rem,var(--radix-dropdown-menu-content-available-height))]">
              <div className="p-1 pr-5">
                {repositories.map((repository) => (
                  <DropdownMenuItem
                    key={repository.id}
                    className={[
                      "flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-left text-sm outline-hidden transition-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring",
                      repository.id === selectedRepositoryId
                        ? "bg-accent/70"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      setSelectedRepositoryId(repository.id);
                      setRepositoryMenuOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {repository.owner}/{repository.repo}
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

      <div className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">SOURCE TYPE</span>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-between rounded-none border-input bg-background px-3 text-sm font-normal focus-visible:ring-1"
              disabled={generating}
            >
              <span>{activityTypeLabel}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={dropdownContentClass}>
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

      <div className="space-y-1.5 text-sm">
        <span className="block text-muted-foreground">REFRESH</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 w-full rounded-none"
          onClick={() => void loadInstallations()}
          disabled={loadingInstallations || generating}
        >
          <RefreshCw
            className={["size-4", loadingInstallations ? "animate-spin" : ""]
              .filter(Boolean)
              .join(" ")}
          />
        </Button>
      </div>
    </div>
  );
}
