"use client";

import { useAuth } from "@clerk/nextjs";
import type {
  SocialConnection,
  SocialConnectionsResponse,
  SocialProvider,
  SocialPublication,
  SocialPublicationsResponse,
} from "@repo/shared/social";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { getApiError } from "@/lib/api/response";
import { useCachedResource } from "@/lib/api/use-cached-resource";

export const socialProviderLabels = {
  discord: "Discord",
} satisfies Record<SocialProvider, string>;

export function useSocialSettings() {
  const { getToken } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savingProvider, setSavingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, loading, setData } = useCachedResource<{
    connections: SocialConnection[];
    publications: SocialPublication[];
  }>(
    "social-settings",
    async () => {
      const [connectionsResponse, publicationsResponse] = await Promise.all([
        apiFetch("/social/connections", {}, getToken),
        apiFetch("/social/publications?limit=10", {}, getToken),
      ]);
      const connectionsValue = (await connectionsResponse.json()) as
        | SocialConnectionsResponse
        | { error?: string };
      const publicationsValue = (await publicationsResponse.json()) as
        | SocialPublicationsResponse
        | { error?: string };

      if (!connectionsResponse.ok) {
        throw new Error(
          getApiError(connectionsValue, "Could not load social accounts"),
        );
      }

      if (!publicationsResponse.ok) {
        throw new Error(
          getApiError(publicationsValue, "Could not load publication history"),
        );
      }

      return {
        connections: (connectionsValue as SocialConnectionsResponse)
          .connections,
        publications: (publicationsValue as SocialPublicationsResponse)
          .publications,
      };
    },
    "Could not load social settings",
  );
  const connections = data?.connections ?? [];
  const publications = data?.publications ?? [];
  const setConnections = useCallback(
    (next: SocialConnection[]) =>
      setData((current) => ({
        connections: next,
        publications: current?.publications ?? [],
      })),
    [setData],
  );

  const connectDiscord = useCallback(async () => {
    setSavingProvider("discord");

    try {
      const response = await apiFetch(
        "/social/discord/connect",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl,
            displayName: displayName.trim() || undefined,
          }),
        },
        getToken,
      );
      const value = (await response.json()) as
        | SocialConnectionsResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(getApiError(value, "Could not connect Discord"));
      }

      setConnections((value as SocialConnectionsResponse).connections);
      setWebhookUrl("");
      setDisplayName("");
      toast.success("Discord channel connected");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not connect Discord",
      );
    } finally {
      setSavingProvider(null);
    }
  }, [displayName, getToken, setConnections, webhookUrl]);

  const disconnect = useCallback(
    async (connection: SocialConnection) => {
      const providerLabel = socialProviderLabels[connection.provider];

      if (
        !window.confirm(
          `Disconnect ${connection.displayName}? Existing ${providerLabel} posts will not be deleted.`,
        )
      ) {
        return;
      }

      setDeletingId(connection.id);

      try {
        const response = await apiFetch(
          `/social/connections/${connection.id}`,
          { method: "DELETE" },
          getToken,
        );
        const value = (await response.json()) as
          | SocialConnectionsResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            getApiError(value, `Could not disconnect ${providerLabel}`),
          );
        }

        setConnections((value as SocialConnectionsResponse).connections);
        toast.success(`${providerLabel} disconnected`);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Could not disconnect ${providerLabel}`,
        );
      } finally {
        setDeletingId(null);
      }
    },
    [getToken, setConnections],
  );

  return {
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
  };
}
