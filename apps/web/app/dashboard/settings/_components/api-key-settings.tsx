"use client";

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
  UserKey,
  Loader2,
  Settings,
  Trash2,
} from "lucide-react";
import {
  providerLabels,
  useApiKeySettings,
} from "../_hooks/use-api-key-settings";
import { DotMatrixLoader } from "@/components/DotMatrixLoader";

export function ApiKeySettings() {
  const {
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
  } = useApiKeySettings();

  if (loading) {
    return <DotMatrixLoader className="min-h-64" label="Loading settings" />;
  }

  if (!data) {
    return (
      <section className="rounded-sm border border-border bg-background p-4 text-sm text-muted-foreground shadow-xs sm:p-5">
        AI key settings are unavailable right now.
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-sm border border-border bg-background p-5 shadow-xs">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <UserKey className="size-4" />
          Custom AI Key
        </h2>
        <p className="text-sm text-muted-foreground">
          Run generation using your own supported provider API key.
        </p>
      </div>

      {data.credentials.length > 0 && (
        <div className="space-y-2">
          {data.credentials.map((credential) => (
            <div
              key={credential.provider}
              className="flex items-center justify-between rounded-sm border bg-muted/20 p-3"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {providerLabels[credential.provider]} key saved
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {credential.keyPreview}
                  {credential.model ? ` • ${credential.model}` : ""}
                </p>
              </div>

              <Button
                variant="destructive"
                size="icon-sm"
                onClick={() => void deleteAiKey(credential.provider)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 w-full justify-between rounded-sm"
              disabled={savingKey}
            >
              <span className="flex items-center gap-2">
                <UserKey className="size-4 text-muted-foreground" />
                {providerLabels[selectedProvider]}
              </span>

              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width)"
          >
            {data.supportedProviders.map((provider) => (
              <DropdownMenuItem
                key={provider}
                onSelect={() => setSelectedProvider(provider)}
              >
                {providerLabels[provider]}

                {provider === selectedProvider && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          type="password"
          placeholder={`${providerLabels[selectedProvider]} API key`}
          value={apiKey}
          disabled={savingKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      {/* Model + Save */}
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <Input
          placeholder="Model (optional)"
          value={model}
          disabled={savingKey}
          onChange={(e) => setModel(e.target.value)}
        />

        <Button
          className="w-full py-[19.5px]"
          disabled={savingKey || !apiKey.trim()}
          onClick={saveAiKey}
        >
          {savingKey ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Settings className="size-4" />
          )}

          {selectedCredential ? "Replace Key" : "Save Key"}
        </Button>
      </div>
    </section>
  );
}
