"use client";

import { useAuth } from "@clerk/nextjs";
import type {
  AiCredential,
  AiCredentialsResponse,
  AiProvider,
} from "@repo/shared/ai-credentials";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { getApiError } from "@/lib/api-response";

export const providerLabels = {
  gemini: "Gemini",
  anthropic: "Anthropic",
  openai: "OpenAI",
  openrouter: "OpenRouter",
} satisfies Record<AiProvider, string>;

export function useApiKeySettings() {
  const { getToken } = useAuth();
  const [data, setData] = useState<AiCredentialsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<AiProvider>("gemini");
  const [model, setModel] = useState("");

  const selectedCredential = useMemo(
    () =>
      data?.credentials.find(
        (credential) => credential.provider === selectedProvider,
      ) ?? null,
    [data, selectedProvider],
  );

  const updateCredentials = useCallback((credentials: AiCredential[]) => {
    setData((current) =>
      current
        ? {
            ...current,
            credentials,
          }
        : current,
    );
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/ai-credentials", {}, getToken);
      const value = (await response.json()) as
        | AiCredentialsResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(getApiError(value, "Could not load AI settings"));
      }

      setData(value as AiCredentialsResponse);
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

  const saveAiKey = useCallback(async () => {
    setSavingKey(true);

    try {
      const response = await apiFetch(
        "/ai-credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: selectedProvider,
            apiKey,
            model: model || undefined,
          }),
        },
        getToken,
      );
      const value = (await response.json()) as
        | { credentials: AiCredential[] }
        | { error?: string };

      if (!response.ok) {
        throw new Error(getApiError(value, "Could not save AI key"));
      }

      toast.success(`${providerLabels[selectedProvider]} key saved`);
      setApiKey("");
      updateCredentials("credentials" in value ? value.credentials : []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save AI key",
      );
    } finally {
      setSavingKey(false);
    }
  }, [apiKey, getToken, model, selectedProvider, updateCredentials]);

  const deleteAiKey = useCallback(
    async (provider: AiProvider) => {
      try {
        const response = await apiFetch(
          `/ai-credentials/${provider}`,
          { method: "DELETE" },
          getToken,
        );
        const value = (await response.json()) as
          | { credentials: AiCredential[] }
          | { error?: string };

        if (!response.ok) {
          toast.error(getApiError(value, "Could not delete AI key"));
          return;
        }

        toast.success(`${providerLabels[provider]} key deleted`);
        updateCredentials("credentials" in value ? value.credentials : []);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not delete AI key",
        );
      }
    },
    [getToken, updateCredentials],
  );

  return {
    apiKey,
    data,
    deleteAiKey,
    loading,
    model,
    saveAiKey,
    savingKey,
    selectedCredential,
    selectedProvider,
    setApiKey,
    setModel,
    setSelectedProvider,
  };
}
