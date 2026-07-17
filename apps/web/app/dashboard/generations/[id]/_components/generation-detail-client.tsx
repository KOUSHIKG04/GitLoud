"use client";

import type { GeneratedContent } from "@repo/shared/generated-content";
import type { GenerationMediaAttachment } from "@repo/shared/generations";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import { GeneratedContentView } from "./generated-content";
import { RegenerateButton } from "./regenerate-button";
import { FileDiff, History } from "lucide-react";
import Link from "next/link";

type MediaAttachment = GenerationMediaAttachment;

export function GenerationDetailClient({
  generationId,
  content,
  sourceUrl,
  sourceDiffUrl,
  mediaAttachments,
}: {
  generationId: string;
  content: GeneratedContent;
  sourceUrl: string;
  sourceDiffUrl: string;
  mediaAttachments: MediaAttachment[];
}) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          asChild
          variant="outline"
          className="size-9 p-0 sm:h-9 sm:w-auto sm:px-2.5"
        >
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open on GitHub"
            title="Open on GitHub"
          >
            <GithubIconIcon className="size-4" />
            <span className="hidden sm:inline">Open on GitHub</span>
          </a>
        </Button>

        <Button
          asChild
          variant="outline"
          className="size-9 p-0 sm:h-9 sm:w-auto sm:px-2.5"
        >
          <a
            href={sourceDiffUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="View diff"
            title="View diff"
          >
            <FileDiff className="size-4" />
            <span className="hidden sm:inline">View diff</span>
          </a>
        </Button>

        <RegenerateButton
          generationId={generationId}
          onRegeneratingChange={setIsRegenerating}
        />

        <Button asChild variant="outline" className="ml-auto h-9 px-2.5">
          <Link href="/dashboard/history" aria-label="History" title="History">
            <History className="size-4" />
            History
          </Link>
        </Button>
      </div>

      <GeneratedContentView
        generationId={generationId}
        content={content}
        isRegenerating={isRegenerating}
        mediaAttachments={mediaAttachments}
      />
    </>
  );
}
