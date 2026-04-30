"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

      {isRegenerating ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <GeneratedContentSkeleton />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SocialPostCard
              title="X/Twitter post"
              value={content.tweet}
              platform="twitter"
              onCopy={copyText}
              onShare={shareNative}
            />

            <SocialPostCard
              title="LinkedIn post"
              value={content.linkedInPost}
              platform="linkedIn"
              onCopy={copyText}
              onShare={shareNative}
            />

            <SocialPostCard
              title="Reddit post"
              value={content.redditPost}
              platform="reddit"
              onCopy={copyText}
              onShare={shareNative}
            />

            <SocialPostCard
              title="Discord post"
              value={content.discordPost}
              platform="discord"
              onCopy={copyText}
              onShare={shareNative}
            />
          </div>

          <Accordion
            type="multiple"
            className="grid items-start gap-4 md:grid-cols-2"
          >
            <ContentBlock
              valueKey="short-summary"
              title="Short summary"
              value={content.shortSummary}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              valueKey="beginner-friendly-explanation"
              title="Beginner-friendly explanation"
              value={content.beginnerSummary}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              valueKey="technical-summary"
              title="Technical summary"
              value={content.technicalSummary}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              valueKey="portfolio-bullet"
              title="Portfolio bullet"
              value={content.portfolioBullet}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ContentBlock
              valueKey="changelog-entry"
              title="Changelog entry"
              value={content.changelogEntry}
              onCopy={copyText}
              onShare={shareNative}
            />

            <ImplementationBlock
              features={content.features}
              techUsed={content.techUsed}
              onCopy={copyText}
              onShare={shareNative}
            />
          </Accordion>
        </div>
      )}
    </section>
  );
}

export function GeneratedContentSkeleton() {
  return Array.from({ length: 6 }).map((_, index) => (
    <section key={index} className="border bg-card p-4 shadow-sm">
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

function SocialPostCard({
  title,
  value,
  platform,
  onCopy,
  onShare,
}: {
  title: string;
  value: string;
  platform: SharePlatform;
  onCopy: (value: string) => Promise<boolean>;
  onShare: (title: string, value: string) => Promise<void>;
}) {
  return (
    <section className="flex h-full flex-col gap-4 border bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>

      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
        {value}
      </p>

      <div className="mt-auto">
        <ContentActions
          title={title}
          text={value}
          platform={platform}
          onCopy={onCopy}
          onShare={onShare}
        />
      </div>
    </section>
  );
}

function ContentBlock({
  valueKey,
  title,
  value,
  onCopy,
  onShare,
}: {
  valueKey: string;
  title: string;
  value: string;
  onCopy: (value: string) => Promise<boolean>;
  onShare: (title: string, value: string) => Promise<void>;
}) {
  return (
    <AccordionItem
      value={valueKey}
      className="border border-border/50 bg-card px-4 text-card-foreground shadow-sm"
    >
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
            {value}
          </p>

          <ContentActions
            title={title}
            text={value}
            onCopy={onCopy}
            onShare={onShare}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function ImplementationBlock({
  features,
  techUsed,
  onCopy,
  onShare,
}: {
  features: string[];
  techUsed: string[];
  onCopy: (value: string) => Promise<boolean>;
  onShare: (title: string, value: string) => Promise<void>;
}) {
  const techText = techUsed.join(", ");
  const featuresText = features.map((value) => `- ${value}`).join("\n");
  const text = ["Tech used", techText, "", "Features", featuresText].join("\n");

  return (
    <AccordionItem
      value="tech-used-and-features"
      className="border border-border/50 bg-card px-4 text-card-foreground shadow-sm"
    >
      <AccordionTrigger>Tech used and features</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="space-y-4 text-sm leading-6 text-muted-foreground">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-card-foreground">
                Tech used
              </h4>
              <p className="break-words">{techText}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-card-foreground">
                Features
              </h4>
              <ul className="list-disc space-y-1 pl-5">
                {features.map((value, index) => (
                  <li key={index} className="break-words">
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ContentActions
            title="Tech used and features"
            text={text}
            onCopy={onCopy}
            onShare={onShare}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function ContentActions({
  title,
  text,
  platform,
  onCopy,
  onShare,
}: {
  title: string;
  text: string;
  platform?: SharePlatform;
  onCopy: (value: string) => Promise<boolean>;
  onShare: (title: string, value: string) => Promise<void>;
}) {
  const shareUrls = createShareUrls({ title, text });
  const iconButtonClass =
    "size-9 border-0 bg-transparent p-0 shadow-sm hover:bg-muted rounded-[3px]";
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

  const platforms: SharePlatform[] = platform
    ? [platform]
    : ["twitter", "linkedIn", "reddit", "discord"];

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={loadingAction !== null}
        className={iconButtonClass}
        aria-label="Copy content"
        title="Copy content"
      >
        {loadingAction === "copy" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Clipboard className="size-4" />
        )}
      </Button>

      {platforms.map((platformName) => (
        <PlatformShareButton
          key={platformName}
          platform={platformName}
          shareUrls={shareUrls}
          className={iconButtonClass}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={loadingAction !== null}
        className={iconButtonClass}
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

type SharePlatform = "twitter" | "linkedIn" | "reddit" | "discord";

function PlatformShareButton({
  platform,
  shareUrls,
  className,
}: {
  platform: SharePlatform;
  shareUrls: ReturnType<typeof createShareUrls>;
  className: string;
}) {
  const config = {
    twitter: {
      href: shareUrls.twitter,
      label: "Share on X",
      icon: <XIcon />,
    },
    linkedIn: {
      href: shareUrls.linkedIn,
      label: "Share on LinkedIn",
      icon: <LinkedInIcon />,
    },
    reddit: {
      href: shareUrls.reddit,
      label: "Share on Reddit",
      icon: <RedditIcon />,
    },
    discord: {
      href: shareUrls.discord,
      label: "Open Discord",
      icon: <DiscordIcon />,
    },
  }[platform];

  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <a
        href={config.href}
        target="_blank"
        rel="noreferrer"
        aria-label={config.label}
        title={config.label}
      >
        {config.icon}
      </a>
    </Button>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-black dark:text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.9 2h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.3L6.4 20H3.3l7.3-8.4L3 2h6.5l4.4 5.7L18.9 2Zm-1.1 16.2h1.7L8.6 3.7H6.8l11 14.5Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-[#5865F2]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19.54 5.34A16.2 16.2 0 0 0 15.6 4.1l-.19.38a14.8 14.8 0 0 1 3.47 1.74 11.3 11.3 0 0 0-4.21-1.32 12 12 0 0 0-5.35 0 11.4 11.4 0 0 0-4.22 1.32A14.8 14.8 0 0 1 8.58 4.5l-.18-.4a16.2 16.2 0 0 0-3.95 1.24C1.95 9.1 1.27 12.75 1.6 16.35a16 16 0 0 0 4.85 2.46l.97-1.58a10.4 10.4 0 0 1-1.53-.73l.36-.28c2.95 1.38 6.13 1.38 9.04 0l.36.28c-.49.29-1 .53-1.53.73l.97 1.58a16 16 0 0 0 4.86-2.46c.4-4.18-.68-7.8-2.4-11.01ZM8.25 14.13c-.94 0-1.7-.86-1.7-1.92s.74-1.92 1.7-1.92c.95 0 1.72.87 1.7 1.92 0 1.06-.75 1.92-1.7 1.92Zm7.5 0c-.94 0-1.7-.86-1.7-1.92s.75-1.92 1.7-1.92c.96 0 1.72.87 1.7 1.92 0 1.06-.74 1.92-1.7 1.92Z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-[#FF4500]"
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
      className="size-4 text-[#0A66C2]"
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
    discord: "https://discord.com/app",
  };
}
