"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import { apiFetch } from "@/lib/api-client";
import {
  Check,
  ChevronDown,
  GitBranch,
  KeyRound,
  Loader2,
  RefreshCw,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type GitHubRepository = {
  id: string;
  owner: string;
  repo: string;
};

type GitHubInstallation = {
  id: string;
  installationId: string;
  accountLogin: string;
  accountType: string;
  repositorySelection: string;
  updatedAt: string;
  repositories: GitHubRepository[];
};

type GitHubInstallationsResponse = {
  plan: string;
  canUsePrivateRepos: boolean;
  installations: GitHubInstallation[];
};

type AiCredential = {
  provider: AiProvider;
  model: string | null;
  keyPreview: string;
  updatedAt: string;
};

type AiProvider = "gemini" | "anthropic" | "openai" | "openrouter";

type AiCredentialsResponse = {
  plan: string;
  canUseOwnAiKey: boolean;
  supportedProviders: AiProvider[];
  credentials: AiCredential[];
};

const providerLabels = {
  gemini: "Gemini",
  anthropic: "Anthropic",
  openai: "OpenAI",
  openrouter: "OpenRouter",
} satisfies Record<AiProvider, string>;

export function SettingsClient() {
  const { getToken } = useAuth();
  const [githubData, setGithubData] =
    useState<GitHubInstallationsResponse | null>(null);
  const [aiData, setAiData] = useState<AiCredentialsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<AiProvider>("gemini");
  const [model, setModel] = useState("");

  const selectedCredential = useMemo(
    () =>
      aiData?.credentials.find(
        (credential) => credential.provider === selectedProvider,
      ) ?? null,
    [aiData, selectedProvider],
  );

  const loadSettings = useCallback(async () => {
    setLoading(true);

    try {
      const [githubResponse, aiResponse] = await Promise.all([
        apiFetch("/github/installations", {}, getToken),
        apiFetch("/ai-credentials", {}, getToken),
      ]);

      const githubJson = (await githubResponse.json()) as
        | GitHubInstallationsResponse
        | { error?: string };
      const aiJson = (await aiResponse.json()) as
        | AiCredentialsResponse
        | { error?: string };

      if (!githubResponse.ok) {
        throw new Error(
          getResponseError(githubJson, "Could not load GitHub settings"),
        );
      }

      if (!aiResponse.ok) {
        throw new Error(getResponseError(aiJson, "Could not load AI settings"));
      }

      setGithubData(githubJson as GitHubInstallationsResponse);
      setAiData(aiJson as AiCredentialsResponse);
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
    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !data.url) {
      toast.error(
        getResponseError(data, "Could not start GitHub installation"),
      );
      return;
    }

    window.location.href = data.url;
  }

  async function syncGitHub() {
    setSyncing(true);

    try {
      const response = await apiFetch(
        "/github/sync-installation",
        { method: "POST" },
        getToken,
      );
      const data = (await response.json()) as {
        synced?: Array<{ repositoryCount: number }>;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          getResponseError(data, "Could not sync GitHub repositories"),
        );
      }

      const totalRepos =
        data.synced?.reduce((sum, item) => sum + item.repositoryCount, 0) ?? 0;
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

  async function removeInstallation(id: string) {
    const response = await apiFetch(
      `/github/installations/${id}`,
      { method: "DELETE" },
      getToken,
    );
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(
        getResponseError(data, "Could not remove GitHub installation"),
      );
      return;
    }

    toast.success("GitHub installation removed");
    await loadSettings();
  }

  async function removeRepository(
    installationId: string,
    repositoryId: string,
  ) {
    const response = await apiFetch(
      `/github/installations/${installationId}/repositories/${repositoryId}`,
      { method: "DELETE" },
      getToken,
    );
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(getResponseError(data, "Could not remove repository access"));
      return;
    }

    toast.success("Repository removed from GitLoud access");
    await loadSettings();
  }

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
      const data = (await response.json()) as
        | { credentials: AiCredential[] }
        | { error?: string };

      if (!response.ok) {
        throw new Error(getResponseError(data, "Could not save AI key"));
      }

      toast.success(`${providerLabels[selectedProvider]} key saved`);
      setApiKey("");
      setAiData((current) =>
        current
          ? {
              ...current,
              credentials: "credentials" in data ? data.credentials : [],
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
    const data = (await response.json()) as
      | { credentials: AiCredential[] }
      | { error?: string };

    if (!response.ok) {
      toast.error(getResponseError(data, "Could not delete AI key"));
      return;
    }

    toast.success(`${providerLabels[provider]} key deleted`);
    setAiData((current) =>
      current
        ? {
            ...current,
            credentials: "credentials" in data ? data.credentials : [],
          }
        : current,
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center border border-border bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-4 border border-border bg-background p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <GitBranch className="size-4" />
              GitHub
            </h2>
            <p className="text-sm text-muted-foreground">
              Private repository access uses your GitHub App installation.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={syncGitHub}
              disabled={syncing || !githubData?.canUsePrivateRepos}
            >
              {syncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              SYNC
            </Button>
            <Button
              size="sm"
              onClick={connectGitHub}
              disabled={!githubData?.canUsePrivateRepos}
            >
              <GitBranch className="size-4" />
              CONNECT
            </Button>
          </div>
        </div>

        {!githubData?.canUsePrivateRepos ? (
          <Notice text="Private repositories are available on the Pro plan." />
        ) : null}

        <div className="space-y-3">
          {githubData?.installations.length ? (
            githubData.installations.map((installation) => (
              <div
                key={installation.id}
                className="space-y-3 border border-border bg-muted/20 p-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">
                      {installation.accountLogin}
                    </div>
                    <div className="text-xs uppercase text-muted-foreground">
                      {installation.accountType} /{" "}
                      {installation.repositorySelection}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Remove GitHub installation"
                    title="Remove GitHub installation"
                    onClick={() => void removeInstallation(installation.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <RepositoryDropdown
                  installation={installation}
                  onRemoveRepository={(repositoryId) =>
                    void removeRepository(installation.id, repositoryId)
                  }
                />
              </div>
            ))
          ) : (
            <Notice text="No GitHub App installation is connected yet." />
          )}
        </div>
      </section>

      <section className="space-y-4 border border-border bg-background p-4 shadow-xs sm:p-5">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="size-4" />
            Custom AI Key
          </h2>
          <p className="text-sm text-muted-foreground">
            Pro users can run generation with their own provider key.
          </p>
        </div>

        {!aiData?.canUseOwnAiKey ? (
          <Notice text="Custom AI keys are available on the Pro plan." />
        ) : null}

        {aiData?.credentials.length ? (
          <div className="space-y-2">
            {aiData.credentials.map((credential) => (
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-between rounded-none border-input bg-background px-2.5 text-sm font-normal"
                disabled={!aiData?.canUseOwnAiKey || savingKey}
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="size-4 text-muted-foreground" />
                  {providerLabels[selectedProvider]}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width) rounded-none"
            >
              {/* <DropdownMenuLabel>AI provider</DropdownMenuLabel> */}
              {/* <DropdownMenuSeparator /> */}
              {(aiData?.supportedProviders ?? ["gemini"]).map((provider) => (
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
            disabled={!aiData?.canUseOwnAiKey || savingKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
          <Input
            className="rounded-none"
            placeholder="Model, optional"
            value={model}
            disabled={!aiData?.canUseOwnAiKey || savingKey}
            onChange={(event) => setModel(event.target.value)}
          />
          <Button
            className="w-full"
            disabled={!aiData?.canUseOwnAiKey || savingKey || !apiKey.trim()}
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
    </div>
  );
}

function RepositoryDropdown({
  installation,
  onRemoveRepository,
}: {
  installation: GitHubInstallation;
  onRemoveRepository: (repositoryId: string) => void;
}) {
  const repositoryCount = installation.repositories.length;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-between rounded-none border-input bg-background px-2.5 text-sm font-normal"
          disabled={repositoryCount === 0}
        >
          <span>
            {repositoryCount
              ? `${repositoryCount} selected repositories`
              : "No repositories synced yet"}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) rounded-none"
      >
        <DropdownMenuLabel>Installed repositories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {installation.repositories.map((repository) => (
          <DropdownMenuItem
            key={repository.id}
            className="rounded-none"
            onSelect={(event) => event.preventDefault()}
          >
            <GitBranch className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              {repository.owner}/{repository.repo}
            </span>
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              aria-label={`Remove ${repository.owner}/${repository.repo}`}
              title={`Remove ${repository.owner}/${repository.repo}`}
              onClick={(event) => {
                event.stopPropagation();
                onRemoveRepository(repository.id);
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function getResponseError(value: unknown, fallback: string) {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return fallback;
}
