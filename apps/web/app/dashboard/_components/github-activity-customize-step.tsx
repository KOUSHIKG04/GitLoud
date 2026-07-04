"use client";

import { Button } from "@repo/ui/components/button";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import {
  Code2,
  GitBranch,
  CalendarDays,
  User,
  GitPullRequest,
  Paperclip,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import type {
  GitHubActivityItem,
} from "./github-activity-types";

export function GitHubActivityCustomizeStep({
  context,
  generating,
  selectedItem,
  selectedMedia,
  setContext,
}: {
  context: string;
  generating: boolean;
  selectedItem: GitHubActivityItem | undefined;
  selectedMedia: File | null;
  setContext: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {selectedItem ? (
        <div className="border bg-card text-card-foreground p-6 shadow-sm rounded-none">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-none">
                {selectedItem.sourceType === "pull-request" ? (
                  <GitPullRequest className="size-5" />
                ) : (
                  <Code2 className="size-5" />
                )}
              </span>
              <span className="text-sm font-medium text-muted-foreground truncate">
                {selectedItem.sourceType === "pull-request" ? "Pull Request" : "Commit"} •{" "}
                <span className="text-primary font-mono font-semibold hover:underline">
                  <a href={selectedItem.url} target="_blank" rel="noreferrer">
                    {(() => {
                      const match = selectedItem.url.match(/github\.com\/([^/]+)\/([^/]+)/);
                      return match ? `${match[1]}/${match[2]}` : "Repository";
                    })()}
                  </a>
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-none border-input"
              >
                <a href={selectedItem.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4 mr-2" />
                  Open
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="icon-sm"
                className="size-9 p-0 rounded-none border-input"
              >
                <a href={selectedItem.url} target="_blank" rel="noreferrer" title="Open on GitHub">
                  <GithubIconIcon className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Title & Divider */}
          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {selectedItem.title}
            </h1>
            <div className="mt-4 border-b border-border/60" />
          </div>

          {/* Description */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground/60 italic">
              No additional description provided.
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-border/80 py-4 my-6 gap-4 divide-y sm:divide-y-0 lg:divide-x divide-border">
            {/* 1st: Author */}
            <div className="flex items-center gap-3 py-2 sm:py-0">
              <span className="flex size-10 shrink-0 items-center justify-center bg-muted text-muted-foreground border rounded-none">
                <User className="size-4 text-primary/80" />
              </span>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Author
                </span>
                <span className="block text-sm font-semibold text-foreground mt-0.5 truncate">
                  {selectedItem.author ?? "Unknown"}
                </span>
              </div>
            </div>

            {/* 2nd: Committed/Created Date */}
            <div className="flex items-center gap-3 pt-4 sm:pt-0 sm:pl-0 lg:pl-4">
              <span className="flex size-10 shrink-0 items-center justify-center bg-muted text-muted-foreground border rounded-none">
                <CalendarDays className="size-4 text-primary/80" />
              </span>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {selectedItem.sourceType === "commit" ? "Committed on" : "Created on"}
                </span>
                <span className="block text-sm font-semibold text-foreground mt-0.5 truncate">
                  {formatSourceDate(selectedItem.updatedAt)}
                </span>
              </div>
            </div>

            {/* 3rd: Branch */}
            <div className="flex items-center gap-3 pt-4 sm:pt-4 lg:pt-0 lg:pl-4">
              <span className="flex size-10 shrink-0 items-center justify-center bg-muted text-muted-foreground border rounded-none">
                <GitBranch className="size-4 text-primary/80" />
              </span>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Branch
                </span>
                <div className="mt-0.5">
                  <span className="inline-flex items-center bg-muted px-2 py-0.5 text-xs font-semibold rounded-none border font-mono">
                    main
                  </span>
                </div>
              </div>
            </div>

            {/* 4th: Identifier (PR # or Commit SHA) */}
            <div className="flex items-center gap-3 pt-4 sm:pt-4 lg:pt-0 lg:pl-4">
              <span className="flex size-10 shrink-0 items-center justify-center bg-muted text-muted-foreground border rounded-none">
                {selectedItem.sourceType === "pull-request" ? (
                  <GitPullRequest className="size-4 text-primary/80" />
                ) : (
                  <Code2 className="size-4 text-primary/80" />
                )}
              </span>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {selectedItem.sourceType === "pull-request" ? "PR Number" : "Commit SHA"}
                </span>
                <span className="block text-sm font-semibold text-foreground mt-0.5 truncate font-mono">
                  {selectedItem.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Attached Media Section */}
          <div className="mt-6 border bg-muted/10 p-3 rounded-none">
            {selectedMedia ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Paperclip className="size-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Attached Media (1)
                  </span>
                </div>
                <div className="flex items-center justify-between border bg-background p-2 rounded-none text-xs mt-2">
                  <span className="truncate font-medium pr-2 max-w-[85%]">{selectedMedia.name}</span>
                  <span className="text-muted-foreground font-mono shrink-0">
                    {(selectedMedia.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Paperclip className="size-4" />
                </span>
                <span>
                  No file attached to this {selectedItem.sourceType === "commit" ? "commit" : "pull request"}.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center">
          <label
            htmlFor="github-activity-context"
            className="flex items-center gap-1 text-[13px] leading-5 text-muted-foreground"
          >
            Extra context: Add tone, audience, or what you learned.
          </label>
        </div>

        <div className="relative">
          <ChevronRight
            className="absolute left-3 top-3 text-muted-foreground"
            size={14}
          />
          <textarea
            id="github-activity-context"
            placeholder='Add tone, audience, or what you learned (e.g., "I learned this today explain it as a learning update")'
            disabled={generating}
            className="custom-scrollbar min-h-24 w-full resize-y border border-input bg-background py-2 pl-8 pr-3 text-sm leading-6 text-foreground placeholder:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={context}
            onChange={(event) => setContext(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function formatSourceDate(value: string | null) {
  if (!value) return "";
  const dateObj = new Date(value);
  if (!Number.isFinite(dateObj.valueOf())) return "";

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${formattedDate} • ${formattedTime}`;
}
