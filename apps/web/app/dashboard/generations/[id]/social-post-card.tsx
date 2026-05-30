"use client";

import { ContentActions } from "./content-actions";
import type {
  CopyContentHandler,
  ShareContentHandler,
  ShareMediaAttachment,
  SharePlatform,
} from "./generated-content-types";

export function SocialPostCard({
  title,
  value,
  platform,
  mediaAttachments,
  onCopy,
  onShare,
}: {
  title: string;
  value: string;
  platform: SharePlatform;
  mediaAttachments: ShareMediaAttachment[];
  onCopy: CopyContentHandler;
  onShare: ShareContentHandler;
}) {
  return (
    <section className="flex h-full flex-col gap-4 bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>

      <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-muted-foreground">
        {value}
      </p>

      <div className="mt-auto">
        <ContentActions
          title={title}
          text={value}
          platform={platform}
          mediaAttachments={mediaAttachments}
          onCopy={onCopy}
          onShare={onShare}
        />
      </div>
    </section>
  );
}
