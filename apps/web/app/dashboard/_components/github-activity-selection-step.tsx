"use client";

import { CommitBranchIcon } from "@/assets/CommitBranchIcon";
import { Check, GitPullRequest, LoaderCircle } from "lucide-react";
import { type UIEvent, useState } from "react";
import type { ActivityType, GitHubActivityItem } from "./github-activity-types";

const activityListScrollClass =
  "gitloud-activity-scroll h-[17rem] scroll-smooth overflow-y-auto pr-5";
const activityListHeightPx = 272;
const activityScrollTrackHeightPx = activityListHeightPx - 8;
const minimumScrollThumbHeightPx = 28;
const estimatedActivityItemHeightPx = 68;

export function GitHubActivitySelectionStep({
  activityType,
  items,
  loadingActivity,
  selectedItemUrl,
  setSelectedItemUrl,
}: {
  activityType: ActivityType;
  items: GitHubActivityItem[];
  loadingActivity: boolean;
  selectedItemUrl: string;
  setSelectedItemUrl: (url: string) => void;
}) {
  const [scrollThumb, setScrollThumb] = useState({
    height: 0,
    top: 0,
  });
  const estimatedScrollHeight = Math.max(
    activityListHeightPx,
    items.length * estimatedActivityItemHeightPx + 24,
  );
  const estimatedThumbHeight = Math.max(
    minimumScrollThumbHeightPx,
    (activityListHeightPx / estimatedScrollHeight) *
      activityScrollTrackHeightPx,
  );
  const scrollThumbVisible = items.length > 3;

  function handleActivityScroll(event: UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget;
    const trackHeight = viewport.clientHeight - 8;
    const visible = viewport.scrollHeight > viewport.clientHeight;
    const height = visible
      ? Math.max(
          minimumScrollThumbHeightPx,
          (viewport.clientHeight / viewport.scrollHeight) * trackHeight,
        )
      : 0;
    const maxThumbTop = trackHeight - height;
    const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
    const top =
      visible && maxScrollTop > 0
        ? (viewport.scrollTop / maxScrollTop) * maxThumbTop
        : 0;

    setScrollThumb({ height, top });
  }

  return (
    <div className="h-[17rem] border bg-background">
      {loadingActivity ? (
        <output
          className="flex h-full items-center justify-center"
          aria-label="Loading GitHub activity"
        >
          <LoaderCircle
            className="size-9 animate-spin text-primary sm:size-10"
            aria-hidden="true"
          />
        </output>
      ) : items.length === 0 ? (
        <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
          No recent{" "}
          {activityType === "pull-requests" ? "pull requests" : "commits"}{" "}
          found.
        </div>
      ) : (
        <div className="relative h-[17rem]">
          <div
            className={activityListScrollClass}
            onScroll={handleActivityScroll}
          >
            <div className="pl-3 py-3">
              {items.map((item) => {
                const checked = selectedItemUrl === item.url;
                const updatedAt = item.updatedAt
                  ? new Date(item.updatedAt)
                  : null;
                const formattedUpdatedAt =
                  updatedAt && Number.isFinite(updatedAt.valueOf())
                    ? ` - ${updatedAt.toLocaleString()}`
                    : "";

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={checked}
                    className={[
                      "flex w-full cursor-pointer gap-3 border-b p-3 text-left transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      checked ? "bg-muted/50" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedItemUrl(checked ? "" : item.url);
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "mt-1 flex size-4 shrink-0 items-center justify-center border border-primary transition-colors",
                        checked
                          ? "bg-primary text-primary-foreground"
                          : "bg-background",
                      ].join(" ")}
                    >
                      {checked ? <Check className="size-3" /> : null}
                    </span>
                    {item.sourceType === "pull-request" ? (
                      <GitPullRequest className="mt-1 size-4 shrink-0 text-primary" />
                    ) : (
                      <CommitBranchIcon className="mt-1 size-4 shrink-0 text-primary" />
                    )}
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="block truncate text-sm font-medium">
                        {item.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.subtitle}
                        {item.author ? ` by ${item.author}` : ""}
                        {formattedUpdatedAt}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {scrollThumbVisible ? (
            <div className="pointer-events-none absolute inset-y-1 right-1 w-2 border border-border/60 bg-background">
              <div
                className="absolute inset-x-0 bg-border transition-transform duration-100 ease-out"
                style={{
                  height: `${scrollThumb.height || estimatedThumbHeight}px`,
                  transform: `translateY(${scrollThumb.top}px)`,
                }}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
