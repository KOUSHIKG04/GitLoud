"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { startBackendDelayToast } from "@/lib/api-delay-toast";

export function DeleteGenerationButton({
  generationId,
}: {
  generationId: string;
}) {
  const { refresh } = useRouter();
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function deleteGeneration() {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting...");
    const clearBackendDelayToast = startBackendDelayToast(toastId);

    try {
      const response = await apiFetch(
        `/generations/${generationId}`,
        {
          method: "DELETE",
        },
        getToken,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not delete generated content");
      }

      toast.success("Deleted", { id: toastId });
      setOpen(false);
      refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete generated content";
      toast.error(message, {
        id: toastId,
        duration: 7000,
      });
    } finally {
      clearBackendDelayToast();
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          disabled={isDeleting}
          aria-label="Delete generated content"
          title="Delete generated content"
        >
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Delete generated content?
          </DialogTitle>
          <DialogDescription className="mt-2">
            This will permanently remove this generated content and cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="destructive"
            onClick={deleteGeneration}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
