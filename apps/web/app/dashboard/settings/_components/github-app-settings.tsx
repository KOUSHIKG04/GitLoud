"use client";

import { useAuth } from "@clerk/nextjs";
import type { GitHubInstallationsResponse } from "@repo/shared/github-app";
import { Button } from "@repo/ui/components/button";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import {
  ChevronRight,
  Database,
  ExternalLink,
  GitBranch,
  Loader2,
  RefreshCw,
  Unplug,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { getApiError } from "@/lib/api-response";
import { Notice } from "./notice";
import { ProSettingLock } from "./pro-setting-lock";
import { SettingsLoading } from "./settings-loading";

export function GitHubAppSettings() {
  const { getToken } = useAuth();
  const [data, setData] = useState<GitHubInstallationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnectingInstallationId, setDisconnectingInstallationId] =
    useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/github/installations", {}, getToken);
      const value = (await response.json()) as
        | GitHubInstallationsResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          getApiError(value, "Could not load GitHub settings"),
        );
      }

      setData(value as GitHubInstallationsResponse);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load settings",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function connectGitHub() {
    const response = await apiFetch("/github/install-url", {}, getToken);
    const value = (await response.json()) as {
      url?: string;
      error?: string;
    };

    if (!response.ok || !value.url) {
      toast.error(
        getApiError(value, "Could not start GitHub installation"),
      );
      return;
    }

    window.location.href = value.url;
  }

  async function syncGitHub() {
    setSyncing(true);

    try {
      const response = await apiFetch(
        "/github/sync-installation",
        { method: "POST" },
        getToken,
      );
      const value = (await response.json()) as {
        synced?: Array<{ repositoryCount: number }>;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          getApiError(value, "Could not sync GitHub repositories"),
        );
      }

      const totalRepos =
        value.synced?.reduce((sum, item) => sum + item.repositoryCount, 0) ?? 0;
      toast.success(`Synced ${totalRepos} repositories`);
      await loadSettings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not sync GitHub",
      );
    } finally {
      setSyncing(false);
    }
  }

  async function disconnectInstallation(id: string) {
    setDisconnectingInstallationId(id);

    try {
      const response = await apiFetch(
        `/github/installations/${id}`,
        { method: "DELETE" },
        getToken,
      );
      const value = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(
          getApiError(value, "Could not disconnect GitHub App"),
        );
      }

      toast.success("GitHub App disconnected");
      await loadSettings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not disconnect GitHub",
      );
    } finally {
      setDisconnectingInstallationId(null);
    }
  }

  if (loading) {
    return <SettingsLoading />;
  }

  if (!data?.canUsePrivateRepos) {
    return (
      <ProSettingLock description="Upgrade to connect the GitHub App and use selected private repositories." />
    );
  }

  const hasConnectedGitHub = data.installations.length > 0;

  return (
    <section className="space-y-5">
      <div className="grid gap-4 border border-border bg-background p-4 shadow-xs sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center border border-border bg-muted/30">
            <GithubIconIcon className="size-6" />
          </div>
          <p className="max-w-sm self-center text-sm leading-6 text-muted-foreground">
            Private repository access uses your GitHub App installation.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 min-w-24"
            onClick={syncGitHub}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            SYNC
          </Button>
          <Button
            variant={hasConnectedGitHub ? "outline" : "default"}
            size="sm"
            className="h-9 min-w-32"
            onClick={connectGitHub}
            disabled={hasConnectedGitHub}
          >
            <GitBranch className="size-4" />
            {hasConnectedGitHub ? "CONNECTED" : "CONNECT"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {hasConnectedGitHub ? (
          data.installations.map((installation) => (
            <div
              key={installation.id}
              className="grid min-w-0 gap-4 border border-border bg-background p-4 shadow-xs xl:grid-cols-[minmax(0,1fr)_minmax(12rem,14rem)] xl:items-center"
            >
              <div className="grid min-w-0 gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="flex size-12 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-lg font-semibold text-primary">
                  {installation.accountLogin.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 px-3">
                  <div className="text-base font-semibold tracking-tight">
                    {installation.accountLogin}
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <Users className="size-4 text-primary" />
                    {installation.accountType} /{" "}
                    {installation.repositorySelection}
                  </div>
                </div>
                <div className="border border-border bg-muted/20 px-3 py-3 sm:col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center bg-primary/10 text-primary">
                      <Database className="size-3.5" />
                    </span>
                    <span className="text-sm">
                      <span className="font-semibold">
                        {installation.repositories.length}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        repositories synced.
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-3 border-border xl:border-l xl:pl-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-10 w-full justify-start gap-2 px-3"
                >
                  <a
                    href={installation.manageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    <span className="min-w-0 flex-1 truncate text-left">
                      MANAGE ACCESS
                    </span>
                    <ChevronRight className="size-4 shrink-0" />
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-10 w-full justify-start gap-2 px-3"
                  disabled={
                    disconnectingInstallationId === installation.id
                  }
                  onClick={() => void disconnectInstallation(installation.id)}
                >
                  {disconnectingInstallationId === installation.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Unplug className="size-4" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-left">
                    DISCONNECT
                  </span>
                  <ChevronRight className="size-4 shrink-0" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <Notice text="No GitHub App installation is connected yet." />
        )}
      </div>
    </section>
  );
}
