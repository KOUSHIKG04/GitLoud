"use client";

import { Button } from "@/components/ui/button";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RegenerateButton({
  generationId,
  onRegeneratingChange,
  onRegenerated,
}: {
  generationId: string;
  onRegeneratingChange?: (isRegenerating: boolean) => void;
  onRegenerated?: (content: GeneratedContent) => void;
}) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);

  function setRegenerating(value: boolean) {
    setIsRegenerating(value);
    onRegeneratingChange?.(value);
  }

  async function regenerate() {
    setRegenerating(true);

    const toastId = toast.loading("Regenerating content...");

    try {
      const response = await fetch(
        `/api/generations/${generationId}/regenerate`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not regenerate content");
      }

      const body = (await response.json()) as {
        generatedContent: GeneratedContent;
      };

      onRegenerated?.(body.generatedContent);

      toast.success("Content regenerated", {
        id: toastId,
      });

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not regenerate content";

      toast.error(message, {
        id: toastId,
        duration: 7000,
        action: {
          label: "Retry",
          onClick: () => {
            void regenerate();
          },
        },
      });
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={regenerate}
      disabled={isRegenerating}
      className="size-9 p-0 sm:h-9 sm:w-auto sm:px-2.5"
      aria-label="Regenerate"
      title="Regenerate"
    >
      {isRegenerating ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw className="size-4" />
      )}
      <span className="hidden sm:inline">Regenerate</span>
    </Button>
  );
}
