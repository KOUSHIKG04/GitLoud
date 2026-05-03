"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Clipboard, Download, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { ShareMediaAttachment } from "./generated-content-types";
import { formatBytes } from "./generated-content-share";

export function AttachedMediaSection({
  mediaAttachments,
}: {
  mediaAttachments: ShareMediaAttachment[];
}) {
  return (
    <section className="space-y-3 border bg-card p-3 text-card-foreground shadow-sm">
      <div>
        <h2 className="text-lg font-semibold tracking-tight px-1.5">
          Attached media
        </h2>
        <p className="px-1.5 text-sm text-muted-foreground">
          Native share includes media. Direct app sharing (e.g., X) falls back
          to a link instead.
        </p>
      </div>

      {mediaAttachments.length > 0 ? (
        <Accordion type="multiple" className="grid gap-3">
          {mediaAttachments.map((media) => (
            <MediaAttachmentItem key={media.id} media={media} />
          ))}
        </Accordion>
      ) : (
        <div className="flex min-h-25 items-center justify-center border bg-background p-4 text-center text-sm text-muted-foreground">
          No file attached. Add media in dashboard before generation to include it
          when sharing generated posts.
        </div>
      )}
    </section>
  );
}

function MediaAttachmentItem({ media }: { media: ShareMediaAttachment }) {
  async function copyMediaLink() {
    try {
      await navigator.clipboard.writeText(media.secureUrl);
      toast.success("Media link copied");
    } catch {
      toast.error("Could not copy media link", { duration: 7000 });
    }
  }

  async function shareMedia() {
    if (!navigator.share) {
      await copyMediaLink();
      return;
    }

    try {
      await navigator.share({
        title: media.fileName,
        url: media.secureUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error("Could not open share sheet", { duration: 7000 });
    }
  }

  const isVideo =
    media.resourceType === "video" || media.mimeType.startsWith("video/");

  return (
    <AccordionItem
      value={media.id}
      className="border bg-background px-4 text-card-foreground shadow-sm"
    >
      <AccordionTrigger className="gap-3 text-left hover:no-underline">
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {media.fileName}
          </span>
          <p className="text-xs text-muted-foreground">
            {media.mimeType} - {formatBytes(media.bytes)}
          </p>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-3 pb-4">
          <div className="flex aspect-video items-center justify-center border bg-muted">
            {isVideo ? (
              <video
                src={media.secureUrl}
                controls
                className="h-full w-full object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.secureUrl}
                alt={media.fileName}
                className="h-full w-full object-contain"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={copyMediaLink}
              aria-label="Copy media link"
              title="Copy media link"
            >
              <Clipboard className="size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={shareMedia}
              aria-label="Share media"
              title="Share media"
            >
              <Share2 className="size-4" />
            </Button>

            <Button asChild variant="outline" size="icon-sm">
              <a
                href={media.secureUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open media"
                title="Open media"
              >
                <ExternalLink className="size-4" />
              </a>
            </Button>

            <Button asChild variant="outline" size="icon-sm">
              <a
                href={media.secureUrl}
                download={media.fileName}
                aria-label="Download media"
                title="Download media"
              >
                <Download className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
