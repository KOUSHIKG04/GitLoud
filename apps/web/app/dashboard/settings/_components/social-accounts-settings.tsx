"use client";

import { DiscordIcon } from "@/assets/social-icons";
import { DotMatrixLoader } from "@/components/DotMatrixLoader";
import type { SocialConnection } from "@repo/shared/social";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { ExternalLink, History, Loader2, Send, Trash2 } from "lucide-react";
import {
  socialProviderLabels,
  useSocialSettings,
} from "../_hooks/use-social-settings";

export function SocialAccountsSettings() {
  const {
    connectDiscord,
    connections,
    deletingId,
    disconnect,
    displayName,
    loading,
    publications,
    savingProvider,
    setDisplayName,
    setWebhookUrl,
    webhookUrl,
  } = useSocialSettings();
  const discordConnections = connections.filter(
    (connection) => connection.provider === "discord",
  );

  if (loading) {
    return <DotMatrixLoader className="min-h-64" label="Loading accounts" />;
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4 border border-border bg-background p-4 shadow-xs sm:p-5">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <span className="size-4">
              <DiscordIcon />
            </span>
            Discord webhook
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Connect a Discord channel for direct publishing. In Discord, open
            Server Settings &gt; Integrations &gt; Webhooks, create a webhook,
            then copy its URL here.
          </p>
        </div>

        <ConnectionList
          connections={discordConnections}
          deletingId={deletingId}
          onDisconnect={disconnect}
        />

        <div className="space-y-3">
          <Input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Channel label (optional)"
            maxLength={80}
            disabled={savingProvider !== null}
            className="rounded-none"
          />
          <Input
            type="password"
            value={webhookUrl}
            onChange={(event) => setWebhookUrl(event.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            autoComplete="off"
            disabled={savingProvider !== null}
            className="rounded-none"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Treat the webhook URL like a password. GitLoud encrypts it before
            storage and never includes it in AI prompts.
          </p>
          <Button
            type="button"
            className="w-full"
            disabled={savingProvider !== null || !webhookUrl.trim()}
            onClick={() => void connectDiscord()}
          >
            {savingProvider === "discord" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            CONNECT DISCORD
          </Button>
        </div>
      </section>

      <section className="space-y-4 border border-border bg-background p-4 shadow-xs sm:p-5">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <History className="size-4" />
            Recent publications
          </h2>
          <p className="text-sm text-muted-foreground">
            The latest direct publishing attempts from your account.
          </p>
        </div>

        {publications.length === 0 ? (
          <div className="border border-dashed border-border p-4 text-sm text-muted-foreground">
            No direct publications yet.
          </div>
        ) : (
          <div className="space-y-2">
            {publications.map((publication) => (
              <div
                key={publication.id}
                className="flex items-center justify-between gap-3 border border-border bg-muted/20 p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {socialProviderLabels[publication.provider]}
                    {publication.connectionName
                      ? ` / ${publication.connectionName}`
                      : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {publication.status.toUpperCase()} ·{" "}
                    {new Date(publication.createdAt).toLocaleString()}
                  </div>
                  {publication.errorMessage ? (
                    <div className="mt-1 line-clamp-2 text-xs text-destructive">
                      {publication.errorMessage}
                    </div>
                  ) : null}
                </div>
                {publication.externalPostUrl ? (
                  <Button asChild variant="outline" size="icon-sm">
                    <a
                      href={publication.externalPostUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open published post"
                      title="Open published post"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-border bg-muted/15 p-4 text-sm leading-6 text-muted-foreground sm:p-5">
        <h2 className="mb-1 font-semibold text-foreground">X and Reddit</h2>
        GitLoud opens each platform&apos;s composer with generated text. Use the
        native share button for installed apps and media. Their direct APIs are
        not connected.
      </section>
    </div>
  );
}

function ConnectionList({
  connections,
  deletingId,
  onDisconnect,
}: {
  connections: SocialConnection[];
  deletingId: string | null;
  onDisconnect: (connection: SocialConnection) => Promise<void>;
}) {
  if (connections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {connections.map((connection) => (
        <div
          key={connection.id}
          className="flex items-center justify-between gap-3 border border-border bg-muted/20 p-3"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{connection.displayName}</div>
            <div className="text-xs text-muted-foreground">
              Discord webhook · ending{" "}
              {connection.externalAccountId.slice(-6)}
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            disabled={deletingId !== null}
            aria-label={`Disconnect ${connection.displayName}`}
            title={`Disconnect ${connection.displayName}`}
            onClick={() => void onDisconnect(connection)}
          >
            {deletingId === connection.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
