"use client";

import { useAuth } from "@clerk/nextjs";
import type {
  AiCredential,
  AiCredentialsResponse,
  AiProvider,
} from "@repo/shared/ai-credentials";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import {
  Check,
  ChevronDown,
  KeyRound,
  Loader2,
  Settings,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { getApiError } from "@/lib/api-response";
import { ProSettingLock } from "./pro-setting-lock";
import { SettingsLoading } from "./settings-loading";

const providerLabels = {
  gemini: "Gemini",
  anthropic: "Anthropic",
  openai: "OpenAI",
  openrouter: "OpenRouter",
} satisfies Record<AiProvider, string>;

const dropdownContentClass =
  "w-(--radix-dropdown-menu-trigger-width) max-h-none overflow-hidden rounded-none";

export function ApiKeySettings() {
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

  async function saveAiKey() {
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
      setData((current) =>
        current
          ? {
              ...current,
              credentials: "credentials" in value ? value.credentials : [],
            }
          : current,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save AI key",
      );
    } finally {
      setSavingKey(false);
    }
  }

  async function deleteAiKey(provider: AiProvider) {
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
    setData((current) =>
      current
        ? {
            ...current,
            credentials: "credentials" in value ? value.credentials : [],
          }
        : current,
    );
  }

  if (loading) {
    return <SettingsLoading />;
  }

  if (!data?.canUseOwnAiKey) {
    return (
      <ProSettingLock description="Upgrade to save and use your own AI provider API key." />
    );
  }

  return (
    <section className="min-w-0 space-y-4 border border-border bg-background p-4 shadow-xs sm:p-5">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <KeyRound className="size-4" />
          Custom AI Key
        </h2>
        <p className="text-sm text-muted-foreground">
          Pro users can run generation with their own provider key.
        </p>
      </div>

      {data.credentials.length ? (
        <div className="space-y-2">
          {data.credentials.map((credential) => (
            <div
              key={credential.provider}
              className="flex items-center justify-between border border-border bg-muted/20 p-3"
            >
              <div>
                <div className="font-medium">
                  {providerLabels[credential.provider]} key saved
                </div>
                <div className="text-xs text-muted-foreground">
                  {credential.keyPreview}
                  {credential.model ? ` / ${credential.model}` : ""}
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon-sm"
                aria-label={`Delete ${providerLabels[credential.provider]} key`}
                title={`Delete ${providerLabels[credential.provider]} key`}
                onClick={() => void deleteAiKey(credential.provider)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="grid min-w-0 gap-3 xl:grid-cols-[0.85fr_1.15fr]">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full min-w-0 justify-between rounded-none border-input bg-background px-2.5 text-sm font-normal"
                disabled={savingKey}
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="size-4 text-muted-foreground" />
                  {providerLabels[selectedProvider]}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={dropdownContentClass}>
              {data.supportedProviders.map((provider) => (
                <DropdownMenuItem
                  key={provider}
                  className="rounded-none"
                  onSelect={() => setSelectedProvider(provider)}
                >
                  <span>{providerLabels[provider]}</span>
                  {provider === selectedProvider ? (
                    <Check className="ml-auto size-4" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            type="password"
            className="rounded-none"
            placeholder={`${providerLabels[selectedProvider]} API key`}
            value={apiKey}
            disabled={savingKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
        </div>
        <Input
          className="rounded-none"
          placeholder="Model, optional"
          value={model}
          disabled={savingKey}
          onChange={(event) => setModel(event.target.value)}
        />
        <Button
          className="w-full"
          disabled={savingKey || !apiKey.trim()}
          onClick={saveAiKey}
        >
          {savingKey ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Settings className="size-4" />
          )}
          {selectedCredential ? "REPLACE KEY" : "SAVE KEY"}
        </Button>
      </div>
    </section>
  );
}
