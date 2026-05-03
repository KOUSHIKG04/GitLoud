"use client";

import { Accordion } from "@/components/ui/accordion";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  ContentBlock,
  GeneratedContentSkeleton,
  ImplementationBlock,
  SocialPostCard,
} from "./generated-content-blocks";
import { getShareableFiles, withMediaLinks } from "./generated-content-share";
import type { ShareMediaAttachment } from "./generated-content-types";

type GeneratedContentViewProps = {
  content: GeneratedContent;
  isRegenerating?: boolean;
  mediaAttachments?: ShareMediaAttachment[];
};

export function GeneratedContentView({
  content,
  isRegenerating = false,
  mediaAttachments = [],
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

  async function shareNative(
    title: string,
    value: string,
    attachments: ShareMediaAttachment[] = [],
  ) {
    const shareText = withMediaLinks(value, attachments);

    if (!navigator.share) {
      const copied = await copyText(shareText);
      if (copied) {
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

      if (attachments.length > 0) {
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

  return (
    <section className="space-y-4">
      <div className="border-t pt-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          GENERATED CONTENT <ChevronDown />
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
              mediaAttachments={mediaAttachments}
              onCopy={copyText}
              onShare={shareNative}
            />

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
          </div>

          <Accordion
            type="multiple"
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
        </div>
      )}
    </section>
  );
}
