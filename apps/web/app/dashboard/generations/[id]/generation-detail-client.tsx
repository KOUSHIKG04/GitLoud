"use client";

import type { GeneratedContent } from "@repo/shared/generated-content";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GeneratedContentView } from "./generated-content";
import { RegenerateButton } from "./regenerate-button";
import Link from "next/link";

export function GenerationDetailClient({
  generationId,
  content,
  sourceUrl,
}: {
  generationId: string;
  content: GeneratedContent;
  sourceUrl: string;
}) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);

  useEffect(() => {
    setCurrentContent(content);
  }, [content]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <a href={sourceUrl} target="_blank" rel="noreferrer">
            Open on GitHub
          </a>
        </Button>

        <Button asChild variant="outline">
          <Link href="/dashboard/history">History</Link>
        </Button>

        <RegenerateButton
          generationId={generationId}
          onRegeneratingChange={setIsRegenerating}
          onRegenerated={setCurrentContent}
        />
      </div>

      <GeneratedContentView
        content={currentContent}
        isRegenerating={isRegenerating}
      />
    </>
  );
}
