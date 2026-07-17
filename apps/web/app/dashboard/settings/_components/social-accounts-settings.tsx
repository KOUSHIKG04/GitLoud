"use client";

import { DiscordIcon } from "@/assets/social-icons";
import { DotMatrixLoader } from "@/components/DotMatrixLoader";
import type { SocialConnection } from "@repo/shared/social";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  CircleHelp,
  ExternalLink,
  Hash,
  History,
  Link2,
  Loader2,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  socialProviderLabels,
  useSocialSettings,
} from "../_hooks/use-social-settings";

const DISCORD_WEBHOOK_DOCS_URL =
  "https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks";

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
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="discord-webhook"
          className="overflow-hidden border border-border bg-background shadow-xs last:border-b"
        >
          <AccordionTrigger className="min-h-20 gap-2 px-3 py-3 text-left hover:bg-muted/20 hover:no-underline data-[state=open]:border-b data-[state=open]:border-border sm:min-h-24 sm:gap-4 sm:px-6 sm:py-4">
            <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center border  text-primary [&_svg]:size-6">
                <span className="flex size-5 items-center justify-center">
                  <DiscordIcon />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold tracking-tight sm:text-lg">
                  Discord publishing
                </span>
                <span className="mt-1 block line-clamp-2 text-xs font-normal leading-4 text-muted-foreground sm:text-sm sm:leading-5">
                  Connect a webhook and publish generated posts in one click.
                </span>
              </span>
              <span
                className={`hidden shrink-0 items-center gap-2 border px-3 py-2 text-[11px] font-semibold tracking-wide sm:inline-flex ${
                  discordConnections.length > 0
                    ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                <span
                  className={`size-1 ${
                    discordConnections.length > 0
                      ? "bg-emerald-500"
                      : "bg-muted-foreground/50"
                  }`}
                />
                {discordConnections.length > 0
                  ? `${discordConnections.length} CONNECTED`
                  : "NOT CONNECTED"}
              </span>
            </span>
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <div className="min-w-0 space-y-5 p-3 sm:space-y-7 sm:p-6">
              <ConnectionList
                connections={discordConnections}
                deletingId={deletingId}
                onDisconnect={disconnect}
              />

              <div>
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">
                      Add a Discord destination
                    </h3>
                    <p className="mt-1 wrap-break-words text-sm leading-5 text-muted-foreground">
                      Create a webhook under Server Settings &gt; Integrations
                      &gt; Webhooks, then paste its URL below.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid min-w-0 items-start gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] sm:gap-5">
                  <div className="min-w-0 space-y-2">
                    <label
                      htmlFor="discord-channel-label"
                      className="text-xs font-semibold"
                    >
                      Channel label
                    </label>
                    <div className="relative mt-2 min-w-0">
                      <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="discord-channel-label"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="e.g. Product updates"
                        maxLength={80}
                        disabled={savingProvider !== null}
                        className="h-11 w-full min-w-0 rounded-none bg-background pl-10"
                      />
                    </div>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <label
                      htmlFor="discord-webhook-url"
                      className="text-xs font-semibold"
                    >
                      Webhook URL
                    </label>
                    <div className="relative mt-2 min-w-0">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="discord-webhook-url"
                        type="password"
                        value={webhookUrl}
                        onChange={(event) => setWebhookUrl(event.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                        autoComplete="off"
                        disabled={savingProvider !== null}
                        className="h-11 w-full min-w-0 rounded-none bg-background pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex min-w-0 flex-col gap-4 border border-border bg-background/70 p-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                  <p className="flex min-w-0 items-start gap-3 text-xs leading-5 text-muted-foreground sm:items-center">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-700 sm:mt-0 sm:size-6" />
                    The webhook is encrypted before storage and is never sent to
                    the AI provider.
                  </p>
                  <Button
                    type="button"
                    className="h-11 w-full shrink-0 rounded-none sm:w-auto sm:min-w-48"
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
              </div>

              <div className="flex min-w-0 flex-col gap-4 border border-border bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center border border-border text-muted-foreground">
                    <CircleHelp className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Need help?</div>
                    <div className="text-xs text-muted-foreground">
                      Learn how to create a Discord webhook.
                    </div>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-none sm:w-auto"
                >
                  <a
                    href={DISCORD_WEBHOOK_DOCS_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View docs
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section className="wrap-break-words border border-border bg-muted/15 p-3 text-sm leading-6 text-muted-foreground sm:p-5">
        <h2 className="mb-1 font-semibold text-foreground">
          X, Reddit, and LinkedIn
        </h2>
        GitLoud opens X, Reddit, and LinkedIn composers with generated text. Use
        the native share button for installed apps and media. Their direct APIs
        are not connected yet. Next, GitLoud will add direct LinkedIn
        integration and automated content generation from connected GitHub
        activity.
      </section>

      <section className="flex h-80 min-w-0 flex-col gap-4 border border-border bg-background p-3 shadow-xs sm:h-96 sm:p-5">
        <div className="shrink-0 space-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <History className="size-4" />
            Recent publications
          </h2>
          <p className="text-sm text-muted-foreground">
            The latest direct publishing attempts from your account.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {publications.length === 0 ? (
            <div className="border border-dashed border-border p-4 text-sm text-muted-foreground">
              No direct publications yet.
            </div>
          ) : (
            <div className="space-y-2">
              {publications.map((publication) => (
                <div
                  key={publication.id}
                  className="flex min-w-0 items-start justify-between gap-3 border border-border bg-muted/20 p-3 sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {socialProviderLabels[publication.provider]}
                      {publication.connectionName
                        ? ` / ${publication.connectionName}`
                        : ""}
                    </div>
                    <div className="wrap-break-words text-xs text-muted-foreground">
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
                    <Button
                      asChild
                      variant="outline"
                      size="icon-sm"
                      className="shrink-0 rounded-none"
                    >
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
        </div>
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1 bg-primary" />
        <h3 className="text-base font-semibold">Connected destinations</h3>
      </div>
      <div className="space-y-2">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="flex min-h-20 min-w-0 items-center justify-between gap-3 border border-border bg-card/20 p-3 sm:min-h-24 sm:gap-4 sm:px-4 sm:py-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center border  text-primary [&_svg]:size-6">
                <span className="flex size-5 items-center justify-center">
                  <DiscordIcon />
                </span>
              </span>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold sm:text-base">
                  {connection.displayName}
                </div>
                <div className="truncate text-xs text-muted-foreground sm:text-sm">
                  Webhook ending {connection.externalAccountId.slice(-6)}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-none text-muted-foreground hover:border-destructive/50 hover:text-destructive"
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
    </div>
  );
}
