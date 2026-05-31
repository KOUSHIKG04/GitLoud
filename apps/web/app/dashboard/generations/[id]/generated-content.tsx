"use client";

import { Accordion } from "@/components/ui/accordion";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { toast } from "sonner";
import {
  ContentBlock,
  GeneratedContentSkeleton,
  ImplementationBlock,
  SocialPostCard,
} from "./generated-content-blocks";
import { ContentActions } from "./content-actions";
import { getShareableFiles, withMediaLinks } from "./generated-content-share";
import type { ShareMediaAttachment } from "./generated-content-types";

type GeneratedContentViewProps = {
  content: GeneratedContent;
  isRegenerating?: boolean;
  mediaAttachments?: ShareMediaAttachment[];
};

const EMPTY_MEDIA_ATTACHMENTS: ShareMediaAttachment[] = [];
const FALLBACK_REDUCED_CONTENT_NOTICE =
  "Reduced due to fallback generation. Try regenerating later for full content.";

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

async function shareNative(
  title: string,
  value: string,
  attachments: ShareMediaAttachment[] = [],
) {
  const shareText = withMediaLinks(value, attachments);

  if (!navigator.share) {
    const copied = await copyText(shareText);
    if (copied && attachments.length > 0) {
      toast.info("Copied text with media link.");
    }
    return;
  }

  try {
    const { files, failed } = await getShareableFiles(attachments);

    if (failed.length > 0) {
      toast.warning(
        `${failed.length} media ${failed.length === 1 ? "file" : "files"} could not be loaded`,
        { duration: 5000 },
      );
    }

    if (
      files.length > 0 &&
      "canShare" in navigator &&
      navigator.canShare({ files })
    ) {
      await navigator.share({ title, text: shareText, files });
      return;
    }

    if (
      attachments.length > 0 &&
      files.length > 0 &&
      (!("canShare" in navigator) || !navigator.canShare({ files }))
    ) {
      toast.warning("This browser cannot attach media to this share.", {
        duration: 5000,
      });
    }

    await navigator.share({
      title,
      text: shareText,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    toast.error("Could not open share sheet", { duration: 7000 });
  }
}

export function GeneratedContentView({
  content,
  isRegenerating = false,
  mediaAttachments = EMPTY_MEDIA_ATTACHMENTS,
}: GeneratedContentViewProps) {
  const isReducedFallbackContent =
    content.technicalSummary === FALLBACK_REDUCED_CONTENT_NOTICE ||
    content.linkedInPost === FALLBACK_REDUCED_CONTENT_NOTICE;

  return (
    <section className="space-y-4">
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold tracking-tight">
          GENERATED CONTENT
        </h2>
      </div>

      {isRegenerating ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <GeneratedContentSkeleton />
        </div>
      ) : (
        <div className="space-y-4">
          {isReducedFallbackContent ? (
            <div className="border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100">
              Free fallback AI generated a shorter result with only the X post,
              short summary, and beginner-friendly explanation. Regenerate
              later for the full content set.
            </div>
          ) : null}

          <div
            className={
              isReducedFallbackContent
                ? "grid gap-4 lg:grid-cols-2"
                : "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            }
          >
            <SocialPostCard
              title="X/Twitter post"
              value={content.tweet}
              platform="twitter"
              mediaAttachments={mediaAttachments}
              onCopy={copyText}
              onShare={shareNative}
            />

            {isReducedFallbackContent ? (
              <ContentCard
                title="Short summary"
                value={content.shortSummary}
                mediaAttachments={mediaAttachments}
                onCopy={copyText}
                onShare={shareNative}
              />
            ) : null}

            {!isReducedFallbackContent ? (
              <>
                <SocialPostCard
                  title="LinkedIn post"
                  value={content.linkedInPost}
                  platform="linkedIn"
                  mediaAttachments={mediaAttachments}
                  onCopy={copyText}
                  onShare={shareNative}
                />

                <SocialPostCard
                  title="Reddit post"
                  value={content.redditPost}
                  platform="reddit"
                  mediaAttachments={mediaAttachments}
                  onCopy={copyText}
                  onShare={shareNative}
                />

                <SocialPostCard
                  title="Discord post"
                  value={content.discordPost}
                  platform="discord"
                  mediaAttachments={mediaAttachments}
                  onCopy={copyText}
                  onShare={shareNative}
                />
              </>
            ) : null}
          </div>

          {isReducedFallbackContent ? (
            <ContentCard
              title="Beginner-friendly explanation"
              value={content.beginnerSummary}
              mediaAttachments={mediaAttachments}
              onCopy={copyText}
              onShare={shareNative}
            />
          ) : (
            <Accordion
              type="multiple"
              defaultValue={[
                "short-summary",
                "beginner-friendly-explanation",
                "technical-summary",
                "portfolio-bullet",
                "changelog-entry",
                "tech-used-and-features",
              ]}
              className="grid items-start gap-4 md:grid-cols-2"
            >
              <ContentBlock
                valueKey="short-summary"
                title="Short summary"
                value={content.shortSummary}
                mediaAttachments={mediaAttachments}
                onCopy={copyText}
                onShare={shareNative}
              />

              <ContentBlock
                valueKey="beginner-friendly-explanation"
                title="Beginner-friendly explanation"
                value={content.beginnerSummary}
                mediaAttachments={mediaAttachments}
                onCopy={copyText}
                onShare={shareNative}
              />

              <ContentBlock
                valueKey="technical-summary"
                title="Technical summary"
                value={content.technicalSummary}
                mediaAttachments={mediaAttachments}
                onCopy={copyText}
                onShare={shareNative}
              />

              <ContentBlock
                valueKey="portfolio-bullet"
                title="Portfolio bullet"
                value={content.portfolioBullet}
                mediaAttachments={mediaAttachments}
                onCopy={copyText}
                onShare={shareNative}
              />

              <ContentBlock
                valueKey="changelog-entry"
                title="Changelog entry"
                value={content.changelogEntry}
                mediaAttachments={mediaAttachments}
                onCopy={copyText}
                onShare={shareNative}
              />

              <ImplementationBlock
                features={content.features}
                techUsed={content.techUsed}
                mediaAttachments={mediaAttachments}
                onCopy={copyText}
                onShare={shareNative}
              />
            </Accordion>
          )}
        </div>
      )}
    </section>
  );
}

function ContentCard({
  title,
  value,
  mediaAttachments,
  onCopy,
  onShare,
}: {
  title: string;
  value: string;
  mediaAttachments: ShareMediaAttachment[];
  onCopy: (value: string) => Promise<boolean>;
  onShare: (
    title: string,
    value: string,
    attachments?: ShareMediaAttachment[],
  ) => Promise<void>;
}) {
  return (
    <section className="space-y-4 bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-muted-foreground">
        {value}
      </p>
      <ContentActions
        title={title}
        text={value}
        mediaAttachments={mediaAttachments}
        onCopy={onCopy}
        onShare={onShare}
      />
    </section>
  );
}
