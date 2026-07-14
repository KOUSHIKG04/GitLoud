"use client";

import { useAuth } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { startBackendDelayToast } from "@/lib/api-delay-toast";

export function RegenerateButton({
  generationId,
  onRegeneratingChange,
  onRegenerated,
}: {
  generationId: string;
  onRegeneratingChange?: (isRegenerating: boolean) => void;
  onRegenerated?: (content: GeneratedContent) => void;
}) {
  const { refresh } = useRouter();
  const { getToken } = useAuth();
  const [isRegenerating, updateIsRegenerating] = useState(false);

  async function regenerate() {
    updateIsRegenerating(true);
    onRegeneratingChange?.(true);

    const toastId = toast.loading("Regenerating content...");
    const clearBackendDelayToast = startBackendDelayToast(toastId);

    try {
      const response = await apiFetch(
        `/generations/${generationId}/regenerate`,
        {
          method: "POST",
        },
        getToken,
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

      refresh();
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
      clearBackendDelayToast();
      updateIsRegenerating(false);
      onRegeneratingChange?.(false);
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
