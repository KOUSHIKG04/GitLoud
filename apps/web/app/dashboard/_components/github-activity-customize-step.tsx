"use client";

import { CommitBranchIcon } from "@/assets/CommitBranchIcon";
import {
  ChevronRight,
  GitPullRequest,
  UserRound,
  Paperclip,
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
        <div className="border bg-background p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span className="flex size-6 items-center justify-center bg-primary/10 text-primary">
                {selectedItem.sourceType === "pull-request" ? (
                  <GitPullRequest className="size-3.5" />
                ) : (
                  <CommitBranchIcon className="size-3.5" />
                )}
              </span>
              Selected{" "}
              {selectedItem.sourceType === "pull-request" ? "PR" : "commit"}
            </div>

            <div className="relative mt-2 bg-muted/20 py-1.5 pl-4 pr-3">
              <span className="absolute inset-y-0 left-0 w-1 bg-primary" />
              <p className="truncate text-sm font-semibold">
                {selectedItem.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  {selectedItem.subtitle}
                </span>
                {selectedItem.author ? (
                  <span className="flex items-center gap-1">
                    <UserRound className="size-3.5 text-primary" />
                    {selectedItem.author}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {selectedMedia ? (
            <div className="mt-2 border bg-muted/10 p-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 truncate font-medium">
                  <Paperclip className="size-3.5 text-primary" />
                  {selectedMedia.name}
                </span>
                <span className="text-muted-foreground font-mono shrink-0">
                  {(selectedMedia.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          ) : null}
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
