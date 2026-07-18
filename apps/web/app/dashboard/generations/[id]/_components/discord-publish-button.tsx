"use client";

import { useAuth } from "@clerk/nextjs";
import type {
  SocialConnection,
  SocialConnectionsResponse,
  SocialPublishResponse,
} from "@repo/shared/social";
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
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { getApiError } from "@/lib/api-response";

export function DiscordPublishButton({
  generationId,
  preview,
  className,
}: {
  generationId: string;
  preview: string;
  className: string;
}) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const loadConnections = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/social/connections", {}, getToken);
      const value = (await response.json()) as
        | SocialConnectionsResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          getApiError(value, "Could not load Discord connections"),
        );
      }

      const nextConnections = (
        value as SocialConnectionsResponse
      ).connections;
      setConnections(nextConnections);
      setSelectedConnectionId((current) =>
        nextConnections.some((connection) => connection.id === current)
          ? current
          : (nextConnections[0]?.id ?? ""),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load Discord connections",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setIdempotencyKey(crypto.randomUUID());
      void loadConnections();
    }
  }

  async function publish() {
    if (!selectedConnectionId || !idempotencyKey) {
      return;
    }

    setPublishing(true);

    try {
      const response = await apiFetch(
        "/social/publish/discord",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            connectionId: selectedConnectionId,
            generationId,
            idempotencyKey,
          }),
        },
        getToken,
      );
      const value = (await response.json()) as
        | SocialPublishResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(getApiError(value, "Could not publish to Discord"));
      }

      toast.success("Published to Discord");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not publish to Discord",
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className}
          aria-label="Publish to a connected Discord channel"
          title="Publish to a connected Discord channel"
        >
          <Send className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-sm sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish to Discord</DialogTitle>
          <DialogDescription>
            Choose a connected channel, review the generated post, then
            confirm. This sends a real Discord message.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-24 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : connections.length === 0 ? (
          <div className="space-y-3 rounded-sm border border-border bg-muted/20 p-4 text-sm">
            <p>No Discord channel is connected yet.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/settings/social">Connect Discord</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Destination
              </div>
              {connections.map((connection) => (
                <button
                  key={connection.id}
                  type="button"
                  aria-pressed={selectedConnectionId === connection.id}
                  className={`w-full rounded-sm border p-3 text-left transition-colors ${
                    selectedConnectionId === connection.id
                      ? "border-foreground bg-muted"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedConnectionId(connection.id)}
                >
                  <span className="block font-medium">
                    {connection.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Discord · ending {connection.externalAccountId.slice(-6)}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Post preview
              </div>
              <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-sm border border-border bg-muted/20 p-3 text-sm leading-6">
                {preview}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={publishing}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={
              loading ||
              publishing ||
              connections.length === 0 ||
              !selectedConnectionId
            }
            onClick={() => void publish()}
          >
            {publishing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
