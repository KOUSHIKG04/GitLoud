"use client";

import { Button } from "@repo/ui/components/button";
import { Loader2, Upload, X } from "lucide-react";
import { type ChangeEvent, type RefObject } from "react";
import { toast } from "sonner";
import type { XPostLength } from "./github-activity-types";

export function GitHubActivityFooter({
  clearSelectedMedia,
  fileInputRef,
  isPremiumXPost,
  isSubmitting,
  onMediaChange,
  selectedMedia,
  setXPostLength,
  submitDisabled,
}: {
  clearSelectedMedia: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isPremiumXPost: boolean;
  isSubmitting: boolean;
  onMediaChange: (event: ChangeEvent<HTMLInputElement>) => void;
  selectedMedia: File | null;
  setXPostLength: (value: XPostLength) => void;
  submitDisabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <input
          type="hidden"
          name="xPostLength"
          value={isPremiumXPost ? "premium" : "standard"}
          readOnly
        />
        <input
          ref={fileInputRef}
          type="file"
          aria-label="Upload media attachment"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="hidden"
          disabled={isSubmitting}
          onChange={onMediaChange}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isSubmitting}
          onClick={() => fileInputRef.current?.click()}
          className="border-border border bg-background text-foreground hover:bg-background/90 hover:text-foreground dark:bg-background dark:text-foreground"
          aria-label="Upload media here to include it when sharing generated posts."
          title="Upload media here to include it when sharing generated posts."
        >
          <Upload className="size-4" />
        </Button>
        {selectedMedia ? (
          <div className="flex min-w-0 items-center text-xs text-muted-foreground">
            <span className="max-w-44 truncate">{selectedMedia.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-7 rounded-none"
              disabled={isSubmitting}
              onClick={clearSelectedMedia}
              aria-label="Remove selected media"
              title="Remove selected media"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}
        <XPostLengthToggle
          isPremiumXPost={isPremiumXPost}
          isSubmitting={isSubmitting}
          setXPostLength={setXPostLength}
        />
      </div>
      <Button
        type="submit"
        disabled={submitDisabled}
        className="flex min-w-32 items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        GENERATE
      </Button>
    </div>
  );
}

function XPostLengthToggle({
  isPremiumXPost,
  isSubmitting,
  setXPostLength,
}: {
  isPremiumXPost: boolean;
  isSubmitting: boolean;
  setXPostLength: (value: XPostLength) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 border-l border-border pl-2">
      <button
        type="button"
        role="switch"
        aria-checked={isPremiumXPost}
        disabled={isSubmitting}
        onClick={() => {
          const nextXPostLength = isPremiumXPost ? "standard" : "premium";
          setXPostLength(nextXPostLength);

          toast.info(
            nextXPostLength === "premium"
              ? "Content will be written for X Premium long posts."
              : "Content will be written for Standard X short posts.",
          );
        }}
        className={[
          "relative flex h-5 w-9 shrink-0 items-center rounded-full border  p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isPremiumXPost
            ? "border-foreground bg-foreground border-2"
            : "bg-muted border border-gray-400",
        ].join(" ")}
        aria-label="Use X Premium long post length"
        title="Use X Premium long post length"
      >
        <span
          className={[
            "block size-3.5 rounded-none shadow-sm transition-transform",
            isPremiumXPost
              ? "translate-x-4 bg-background"
              : "translate-x-0 bg-foreground/70",
          ].join(" ")}
        />
      </button>
      <span className="text-[11px] leading-none text-muted-foreground">
        {isPremiumXPost ? "Premium X" : "Standard X"}
      </span>
    </div>
  );
}
