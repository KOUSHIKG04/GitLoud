"use client";

import { CommitBranchIcon } from "@/assets/CommitBranchIcon";
import { Check, GitPullRequest } from "lucide-react";
import { DotMatrixLoader } from "@/components/DotMatrixLoader";
import { type UIEvent, useState } from "react";
import type { ActivityType, GitHubActivityItem } from "./github-activity-types";

const activityListHeightPx = 320;
const activityScrollTrackHeightPx = activityListHeightPx - 8;
const minimumScrollThumbHeightPx = 28;
const estimatedActivityItemHeightPx = 68;

export function GitHubActivitySelectionStep({
  activityType,
  items,
  loadingActivity,
  selectedItemUrls,
  setSelectedItemUrl,
}: {
  activityType: ActivityType;
  items: GitHubActivityItem[];
  loadingActivity: boolean;
  selectedItemUrls: string[];
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
  const scrollThumbVisible = estimatedScrollHeight > activityListHeightPx;

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
    <div className="h-80 w-full overflow-hidden rounded-sm border bg-background">
      {loadingActivity ? (
        <output
          className="flex h-full items-center justify-center"
          aria-label="Loading GitHub activity"
        >
          <DotMatrixLoader
            className="h-full"
            size={40}
            dotSize={5}
            label="Loading GitHub activity"
          />
        </output>
      ) : items.length === 0 ? (
        <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
          No recent{" "}
          {activityType === "pull-requests" ? "pull requests" : "commits"}{" "}
          found.
        </div>
      ) : (
        <div className="relative h-80 w-full overflow-x-hidden">
          <div
            className={
              "gitloud-activity-scroll h-80 w-full scroll-smooth overflow-y-auto overflow-x-hidden border-none pr-0"
            }
            onScroll={handleActivityScroll}
          >
            <div className="">
              {items.map((item) => {
                const checked = selectedItemUrls.includes(item.url);
                const updatedAt = item.updatedAt
                  ? new Date(item.updatedAt)
                  : null;
                const formattedDate =
                  updatedAt && Number.isFinite(updatedAt.valueOf())
                    ? `${updatedAt.toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })} ${updatedAt.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}`
                    : "";

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={checked}
                    disabled={!checked && selectedItemUrls.length >= 5}
                    title={
                      !checked && selectedItemUrls.length >= 5
                        ? "You can combine up to 5 items"
                        : undefined
                    }
                    className={[
                      "flex w-full cursor-pointer gap-2 rounded-none! border-b px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:gap-3 sm:px-6 sm:py-4",
                      checked ? "bg-muted/50" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedItemUrl(item.url);
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "mt-1 flex size-3 shrink-0 items-center justify-center rounded-sm border border-primary transition-colors",
                        checked
                          ? "bg-primary text-primary-foreground"
                          : "bg-background",
                      ].join(" ")}
                    >
                      {checked ? <Check className="size-3" /> : null}
                    </span>
                    {item.sourceType === "pull-request" ? (
                      <GitPullRequest className="mt-1 size-3 shrink-0 text-primary" />
                    ) : (
                      <CommitBranchIcon className="mt-1 size-3 shrink-0 text-primary" />
                    )}
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="block truncate text-[13px] tracking-tighter sm:text-sm">
                        {item.title}
                      </span>
                      <span className="flex min-w-0 flex-wrap gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground sm:text-xs">
                        <span className="max-w-full truncate font-mono text-primary/80">
                          {item.subtitle}
                        </span>
                        {item.author ? <span>by {item.author}</span> : null}
                        {formattedDate ? (
                          <span className="before:content-['-'] before:mr-1.5 opacity-80 tracking-tighter">
                            {formattedDate}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {scrollThumbVisible ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1  bg-background">
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
