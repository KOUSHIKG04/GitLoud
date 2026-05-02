"use client";

import {
  DiscordIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
} from "@/asses/social-icons";
import { Button } from "@/components/ui/button";
import { Clipboard, Loader2, Share2 } from "lucide-react";
import { useState } from "react";
import type {
  CopyContentHandler,
  ShareContentHandler,
  ShareMediaAttachment,
  SharePlatform,
} from "./generated-content-types";
import { createShareUrls, withMediaLinks } from "./generated-content-share";

export function ContentActions({
  title,
  text,
  platform,
  mediaAttachments,
  onCopy,
  onShare,
}: {
  title: string;
  text: string;
  platform?: SharePlatform;
  mediaAttachments: ShareMediaAttachment[];
  onCopy: CopyContentHandler;
  onShare: ShareContentHandler;
}) {
  const shareText = withMediaLinks(text, mediaAttachments);
  const shareUrls = createShareUrls({ title, text: shareText });
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
      await onShare(title, text, mediaAttachments);
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
