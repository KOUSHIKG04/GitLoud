"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteGenerationButton({
  generationId,
}: {
  generationId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteGeneration() {
    const confirmed = window.confirm(
      "Delete this generated content? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/generations/${generationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not delete generated content");
      }

      toast.success("Deleted");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete generated content";
      toast.error(message, {
        duration: 7000,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon-sm"
      onClick={deleteGeneration}
      disabled={isDeleting}
      aria-label="Delete generated content"
      title="Delete generated content"
    >
      {isDeleting ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  );
}
