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
  generationId,
}: {
  title: string;
  value: string;
  platform: SharePlatform;
  mediaAttachments: ShareMediaAttachment[];
  onCopy: CopyContentHandler;
  onShare: ShareContentHandler;
  generationId?: string;
}) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-sm bg-card p-5 text-card-foreground shadow-sm">
      <h3 className="text-[17px] font-semibold leading-7">{title}</h3>

      <p className="whitespace-pre-wrap wrap-break-word text-base leading-7 text-muted-foreground">
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
          generationId={generationId}
        />
      </div>
    </section>
  );
}
