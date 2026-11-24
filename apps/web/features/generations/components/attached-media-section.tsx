"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Button } from "@repo/ui/components/button";
import {
  Clipboard,
  Download,
  ExternalLink,
  ImagePlus,
  Share2,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import {
  attachMediaToGeneration,
  getMediaValidationError,
  uploadMedia,
} from "@/features/generations/lib/media";
import Image from "next/image";
import { toast } from "sonner";
import type { ShareMediaAttachment } from "@/features/generations/components/generated-content-types";
import { formatBytes } from "@/features/generations/components/generated-content-share";

export function AttachedMediaSection({
  generationId,
  mediaAttachments,
}: {
  generationId: string;
  mediaAttachments: ShareMediaAttachment[];
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Media is added here, at publish time, instead of before generating.
  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = getMediaValidationError(file);

    if (validationError) {
      toast.error(validationError, { duration: 7000 });
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading media...");

    try {
      const media = await uploadMedia(file, getToken);
      await attachMediaToGeneration(generationId, media.id, getToken);
      toast.success("Media attached", { id: toastId });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not attach media",
        { id: toastId, duration: 7000 },
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-3 rounded-sm border bg-card p-3 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold px-1.5">Attached media</h2>
          <p className="px-1.5 text-sm text-muted-foreground">
            Native share includes media. Direct app sharing (e.g., X) falls back
            to a link instead.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="sr-only"
          onChange={(event) => void onFileSelected(event)}
          aria-label="Choose an image or video to attach"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {uploading ? "Uploading…" : "Add media"}
        </Button>
      </div>

      {mediaAttachments.length > 0 ? (
        <Accordion type="multiple" className="grid gap-3">
          {mediaAttachments.map((media) => (
            <MediaAttachmentItem key={media.id} media={media} />
          ))}
        </Accordion>
      ) : (
        <div className="flex min-h-25 items-center justify-center rounded-sm border bg-background p-4 text-center text-sm text-muted-foreground">
          No media yet. Add an image or video to include it when sharing.
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
      className="rounded-sm border bg-background px-4 text-card-foreground shadow-sm"
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
          <div className="relative flex aspect-video items-center justify-center rounded-sm border bg-muted">
            {isVideo ? (
              <video
                src={media.secureUrl}
                aria-label={`Preview ${media.fileName}`}
                controls
                className="h-full w-full object-contain"
              >
                <track kind="captions" label="Captions unavailable" />
              </video>
            ) : (
              <Image
                src={media.secureUrl}
                alt={media.fileName}
                fill
                sizes="(min-width: 1024px) 36rem, calc(100vw - 4rem)"
                className="object-contain"
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
