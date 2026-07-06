"use client";

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
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGitHubAppSettings } from "../_hooks/use-github-app-settings";
import { DotMatrixLoader } from "@/components/DotMatrixLoader";

export function GitHubAppSettings() {
  const router = useRouter();
  const {
    connectGitHub,
    data,
    disconnectingInstallationId,
    disconnectInstallation,
    hasConnectedGitHub,
    loading,
    syncGitHub,
    syncing,
  } = useGitHubAppSettings();

  useEffect(() => {
    toast.info(
      <p className="text-[12px] font-light tracking-tight ml-2">
        Review security notes before connecting private repositories.
      </p>,
      {
        id: "github-app-security-notes",
        duration: 8000,
        action: {
          label: (
            <p className="uppercase font-medium text-[10px]">Review notes</p>
          ),
          onClick: () => router.push("/security-and-privacy"),
        },
      },
    );
    }, [router]);


  if (loading) {
    return <DotMatrixLoader className="min-h-64" label="Loading settings" />;
  }

  if (!data) {
    return (
      <section className="border border-border bg-background p-4 text-sm text-muted-foreground shadow-xs sm:p-5">
        GitHub App settings are unavailable right now.
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        {hasConnectedGitHub ? (
          data.installations.map((installation) => {
            const accountLogin = installation.accountLogin || "Unknown";
            const initial = installation.accountLogin
              ? installation.accountLogin.slice(0, 1).toUpperCase()
              : "?";

            return (
              <div
                key={installation.id}
                className="grid min-w-0 gap-4 border border-border bg-background p-4 shadow-xs xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center"
              >
                <div className="grid min-w-0 gap-8 sm:grid-cols-[auto_minmax(5rem,1fr)] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-lg font-semibold text-primary">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold tracking-tight">
                        {accountLogin}
                      </div>
                      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                        <Users className="size-4 text-primary" />
                        {installation.accountType} /{" "}
                        {installation.repositorySelection}
                      </div>
                    </div>
                  </div>

                  <div className="border border-border bg-muted/20 px-3 py-3">
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

                <div className="grid grid-cols-2 min-w-0 gap-3 border-border xl:grid-cols-1 xl:border-l xl:pl-4 xl:w-48">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-10 w-full justify-between gap-2 px-3"
                  >
                    <a
                      href={installation.manageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between w-full"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="size-4" />
                        <span className="truncate text-left text-[11px] font-medium uppercase tracking-wider">
                          MANAGE ACCESS
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0" />
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-10 w-full justify-between gap-2 px-3"
                    disabled={disconnectingInstallationId === installation.id}
                    onClick={() => void disconnectInstallation(installation.id)}
                  >
                    <span className="flex items-center gap-2">
                      {disconnectingInstallationId === installation.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Unplug className="size-4" />
                      )}
                      <span className="truncate text-left text-[11px] font-medium uppercase tracking-wider">
                        DISCONNECT
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 opacity-60" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            No GitHub App installation is connected yet.
          </div>
        )}
      </div>

      <div className="grid gap-4 border border-border bg-background p-4 shadow-xs sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center border border-border bg-muted/30">
            <GithubIconIcon className="size-6" />
          </div>
          <p className="max-w-lg self-center text-sm leading-6 text-muted-foreground">
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
    </section>
  );
}
