"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { Clipboard, Loader2, Share2 } from "lucide-react";

type GeneratedContentViewProps = {
  content: GeneratedContent;
  isRegenerating?: boolean;
};

export function GeneratedContentView({
  content,
  isRegenerating = false,
}: GeneratedContentViewProps) {
  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
      return true;
    } catch {
      toast.error("Could not copy text", {
        duration: 7000,
      });
      return false;
    }
  }

  async function shareNative(title: string, value: string) {
    if (!navigator.share) {
      const copied = await copyText(value);
      if (copied) {
        toast.info("Copied text. Share it from any app.");
      }
      return;
    }

    try {
      await navigator.share({ title, text: value });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error("Could not open share sheet", { duration: 7000 });
    }
  }

  return (
    <section className="space-y-4">
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Generated Content
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isRegenerating ? (
          <GeneratedContentSkeleton />
        ) : (
          <>
            <ContentBlock
              title="Short summary"
              value={content.shortSummary}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              title="Technical summary"
              value={content.technicalSummary}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentListBlock
              title="Features"
              values={content.features}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentListBlock
              title="Technologies used"
              values={content.techUsed}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              title="X/Twitter post"
              value={content.tweet}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              title="LinkedIn post"
              value={content.linkedInPost}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              title="Reddit post"
              value={content.redditPost}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              title="Portfolio bullet"
              value={content.portfolioBullet}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              title="Changelog entry"
              value={content.changelogEntry}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              title="Beginner-friendly explanation"
              value={content.beginnerSummary}
              onCopy={copyText}
              onShare={shareNative}
            />
          </>
        )}
      </div>
    </section>
  );
}

export function GeneratedContentSkeleton() {
  return Array.from({ length: 6 }).map((_, index) => (
    <section key={index} className="rounded-xl border bg-card p-4">
      <Skeleton className="h-4 w-36" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-full sm:size-9" />
        <Skeleton className="h-8 w-full sm:size-9" />
        <Skeleton className="h-8 w-full sm:size-9" />
      </div>
    </section>
  ));
}

function ContentBlock({
  title,
  value,
  onCopy,
  onShare,
}: {
  title: string;
  value: string;
  onCopy: (value: string) => Promise<boolean>;
  onShare: (title: string, value: string) => Promise<void>;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <h3 className="text-sm font-semibold">{title}</h3>

      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
        {value}
      </p>

      <ContentActions
        title={title}
        text={value}
        onCopy={onCopy}
        onShare={onShare}
      />
    </section>
  );
}

function ContentListBlock({
  title,
  values,
  onCopy,
  onShare,
}: {
  title: string;
  values: string[];
  onCopy: (value: string) => Promise<boolean>;
  onShare: (title: string, value: string) => Promise<void>;
}) {
  const text = values.map((value) => `- ${value}`).join("\n");

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <h3 className="text-sm font-semibold">{title}</h3>

      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
        {values.map((value) => (
          <li key={value} className="break-words">
            {value}
          </li>
        ))}
      </ul>

      <ContentActions
        title={title}
        text={text}
        onCopy={onCopy}
        onShare={onShare}
      />
    </section>
  );
}

function ContentActions({
  title,
  text,
  onCopy,
  onShare,
}: {
  title: string;
  text: string;
  onCopy: (value: string) => Promise<boolean>;
  onShare: (title: string, value: string) => Promise<void>;
}) {
  const shareUrls = createShareUrls({ title, text });
  const [loadingAction, setLoadingAction] = useState<"copy" | "share" | null>(
    null,
  );

  async function handleCopy() {
    setLoadingAction("copy");

    try {
      await onCopy(text);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleShare() {
    setLoadingAction("share");

    try {
      await onShare(title, text);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={loadingAction !== null}
        className="w-full sm:size-9 sm:p-0"
        aria-label="Copy content"
        title="Copy content"
      >
        {loadingAction === "copy" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Clipboard className="size-4" />
        )}
      </Button>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full sm:size-9 sm:p-0"
      >
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on X"
          title="Share on X"
        >
          <span className="text-sm font-bold leading-none">X</span>
        </a>
      </Button>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full sm:size-9 sm:p-0"
      >
        <a
          href={shareUrls.linkedIn}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          <LinkedInIcon />
        </a>
      </Button>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full sm:size-9 sm:p-0"
      >
        <a
          href={shareUrls.reddit}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on Reddit"
          title="Share on Reddit"
        >
          <RedditIcon />
        </a>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={loadingAction !== null}
        className="w-full sm:size-9 sm:p-0"
        aria-label="Share with another app"
        title="Share with another app"
      >
        {loadingAction === "share" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" />
        )}
      </Button>
    </div>
  );
}

function RedditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21 11.5a2.5 2.5 0 0 0-4.23-1.8 10.4 10.4 0 0 0-4.1-1.02l.7-3.3 2.32.5a1.9 1.9 0 1 0 .17-.8l-2.77-.59a.43.43 0 0 0-.5.33l-.82 3.85a10.5 10.5 0 0 0-4.54 1.03A2.5 2.5 0 1 0 4.5 13.8c-.03.18-.05.37-.05.56 0 3.13 3.4 5.67 7.55 5.67s7.55-2.54 7.55-5.67c0-.19-.02-.38-.05-.56A2.5 2.5 0 0 0 21 11.5ZM8.75 13.45a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm6.16 3.43c-.82.82-2.37.88-2.91.88s-2.09-.06-2.91-.88a.45.45 0 0 1 .64-.64c.52.52 1.66.62 2.27.62s1.75-.1 2.27-.62a.45.45 0 1 1 .64.64Zm.34-3.43a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6.94 8.98H3.72V20h3.22V8.98ZM5.33 7.48a1.86 1.86 0 1 0 0-3.72 1.86 1.86 0 0 0 0 3.72ZM20.28 20h-3.21v-5.36c0-1.28-.03-2.93-1.78-2.93-1.79 0-2.06 1.4-2.06 2.84V20h-3.21V8.98h3.08v1.5h.04c.43-.81 1.48-1.67 3.04-1.67 3.25 0 3.86 2.14 3.86 4.93V20h.24Z" />
    </svg>
  );
}

function createShareUrls({ title, text }: { title: string; text: string }) {
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    linkedIn: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
    reddit: `https://www.reddit.com/submit?title=${encodedTitle}&text=${encodedText}`,
  };
}
