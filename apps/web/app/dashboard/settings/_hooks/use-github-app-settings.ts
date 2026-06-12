"use client";

import { useAuth } from "@clerk/nextjs";
import type { GitHubInstallationsResponse } from "@repo/shared/github-app";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { getApiError } from "@/lib/api-response";

export function useGitHubAppSettings() {
  const { getToken } = useAuth();
  const [data, setData] = useState<GitHubInstallationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnectingInstallationId, setDisconnectingInstallationId] =
    useState<string | null>(null);

  const hasConnectedGitHub = useMemo(
    () => (data?.installations.length ?? 0) > 0,
    [data],
  );

  const loadSettings = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/github/installations", {}, getToken);
      const value = (await response.json()) as
        | GitHubInstallationsResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(getApiError(value, "Could not load GitHub settings"));
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

  const connectGitHub = useCallback(async () => {
    const response = await apiFetch("/github/install-url", {}, getToken);
    const value = (await response.json()) as {
      url?: string;
      error?: string;
    };

    if (!response.ok || !value.url) {
      toast.error(getApiError(value, "Could not start GitHub installation"));
      return;
    }

    window.location.href = value.url;
  }, [getToken]);

  const syncGitHub = useCallback(async () => {
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
  }, [getToken, loadSettings]);

  const disconnectInstallation = useCallback(
    async (id: string) => {
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
          error instanceof Error
            ? error.message
            : "Could not disconnect GitHub",
        );
      } finally {
        setDisconnectingInstallationId(null);
      }
    },
    [getToken, loadSettings],
  );

  return {
    connectGitHub,
    data,
    disconnectingInstallationId,
    disconnectInstallation,
    hasConnectedGitHub,
    loading,
    syncGitHub,
    syncing,
  };
}
