"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BillingActions } from "@/components/BillingActions";
import { Button } from "@repo/ui/components/button";
import { Lock, LoaderCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { startBackendDelayToast } from "@/lib/api-delay-toast";
import { getApiError } from "@/lib/api-response";
import { readProgressStream, uploadMedia, wait } from "./pr-form-generation";
import { getMediaValidationError } from "./pr-form-validation";
import { GitHubActivityControls } from "./github-activity-controls";
import { GitHubActivityCustomizeStep } from "./github-activity-customize-step";
import { GitHubActivityFooter } from "./github-activity-footer";
import { GitHubActivitySelectionStep } from "./github-activity-selection-step";
import type {
  ActivityType,
  GenerationStep,
  GitHubActivityItem,
  GitHubActivityResponse,
  GitHubInstallation,
  GitHubInstallationsResponse,
  XPostLength,
} from "./github-activity-types";

export function GitHubActivityPanel() {
  const { getToken } = useAuth();
  const { push } = useRouter();
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [canUsePrivateRepos, setCanUsePrivateRepos] = useState(false);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState("");
  const [activityType, setActivityType] =
    useState<ActivityType>("pull-requests");
  const [items, setItems] = useState<GitHubActivityItem[]>([]);
  const [selectedItemUrl, setSelectedItemUrl] = useState("");
  const [context, setContext] = useState("");
  const [xPostLength, setXPostLength] = useState<XPostLength>("standard");
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [generationStep, setGenerationStep] =
    useState<GenerationStep>("select");
  const [repositoryMenuOpen, setRepositoryMenuOpen] = useState(false);
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [hasLoadedInstallations, setHasLoadedInstallations] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaAttachmentIdRef = useRef<string | null>(null);

  const repositories = useMemo(
    () =>
      installations.flatMap((installation) =>
        installation.repositories.map((repository) => ({
          ...repository,
          accountLogin: installation.accountLogin,
        })),
      ),
    [installations],
  );
  const selectedRepository = repositories.find(
    (repository) => repository.id === selectedRepositoryId,
  );
  const selectedItem = items.find((item) => item.url === selectedItemUrl);
  const activityTypeLabel =
    activityType === "pull-requests" ? "Pull requests" : "Commits";
  const isPremiumXPost = xPostLength === "premium";

  const loadInstallations = useCallback(async () => {
    setLoadingInstallations(true);

    try {
      const response = await apiFetch("/github/installations", {}, getToken);
      const data = (await response.json()) as
        | GitHubInstallationsResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not load repositories"));
      }

      const githubData = data as GitHubInstallationsResponse;

      setCanUsePrivateRepos(githubData.canUsePrivateRepos);
      setInstallations(githubData.installations);

      const firstRepository = githubData.installations.flatMap(
        (installation) => installation.repositories,
      )[0];

      setSelectedRepositoryId(
        (current) => current || firstRepository?.id || "",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load repositories",
      );
    } finally {
      setLoadingInstallations(false);
      setHasLoadedInstallations(true);
    }
  }, [getToken]);

  const loadActivity = useCallback(
    async (repositoryId: string, type: ActivityType) => {
      setLoadingActivity(true);
      setSelectedItemUrl("");
      setGenerationStep("select");

      try {
        const params = new URLSearchParams({ repositoryId, type });
        const response = await apiFetch(
          `/github/activity?${params.toString()}`,
          {},
          getToken,
        );
        const data = (await response.json()) as
          | GitHubActivityResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            getApiError(data, "Could not load GitHub items"),
          );
        }

        setItems((data as GitHubActivityResponse).items);
      } catch (error) {
        setItems([]);
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load GitHub items",
        );
      } finally {
        setLoadingActivity(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    void loadInstallations();
  }, [loadInstallations]);

  useEffect(() => {
    if (!selectedRepositoryId) {
      setItems([]);
      setSelectedItemUrl("");
      return;
    }

    void loadActivity(selectedRepositoryId, activityType);
  }, [activityType, loadActivity, selectedRepositoryId]);

  async function generateFromSelectedItem() {
    if (!selectedItem) {
      toast.error("Select a pull request or commit first");
      return;
    }

    const toastId = toast.loading("Fetching GitHub item...");
    const clearBackendDelayToast = startBackendDelayToast(toastId);
    const minimumLoaderTime = wait(2500);

    setGenerating(true);

    try {
      let mediaAttachmentId: string | undefined;

      if (selectedMedia) {
        if (mediaAttachmentIdRef.current) {
          mediaAttachmentId = mediaAttachmentIdRef.current;
        } else {
          toast.loading("Uploading media attachment...", { id: toastId });
          const mediaAttachment = await uploadMedia(selectedMedia, getToken);
          mediaAttachmentId = mediaAttachment.id;
          mediaAttachmentIdRef.current = mediaAttachmentId;
        }
      }

      const response = await apiFetch(
        "/pr",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: selectedItem.url,
            context,
            xPostLength,
            mediaAttachmentId,
          }),
        },
        getToken,
      );
      const data = await readProgressStream(response, (message) => {
        toast.loading(message, { id: toastId });
      });

      await minimumLoaderTime;
      toast.success("Content generated successfully", { id: toastId });
      push(`/dashboard/generations/${data.generatedContentId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      toast.error(message, {
        id: toastId,
        duration: 7000,
        action: {
          label: "Retry",
          onClick: () => {
            void generateFromSelectedItem();
          },
        },
      });
    } finally {
      clearBackendDelayToast();
      setGenerating(false);
    }
  }

  function onMediaChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedMedia(null);
      mediaAttachmentIdRef.current = null;
      return;
    }

    const validationError = getMediaValidationError(file);

    if (validationError) {
      toast.error(validationError, { duration: 7000 });
      event.target.value = "";
      mediaAttachmentIdRef.current = null;
      return;
    }

    mediaAttachmentIdRef.current = null;
    setSelectedMedia(file);
  }

  function clearSelectedMedia() {
    setSelectedMedia(null);
    mediaAttachmentIdRef.current = null;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function goToCustomizeStep() {
    if (!selectedItem) {
      toast.error("Select a pull request or commit first");
      return;
    }

    setGenerationStep("customize");
  }

  if (!hasLoadedInstallations) {
    return (
      <section
        className="flex min-h-[calc(100dvh-12rem)] items-center justify-center"
        role="status"
        aria-label="Loading GitHub activity dashboard"
      >
        <LoaderCircle
          className="size-9 animate-spin text-primary sm:size-10"
          aria-hidden="true"
        />
      </section>
    );
  }

  if (!canUsePrivateRepos) {
    return (
      <section className="flex min-h-[28rem] items-center justify-center border bg-card p-6 text-card-foreground shadow-sm">
        <div className="w-full max-w-md space-y-5 text-center">
          <div className="mx-auto flex size-12 items-center justify-center border bg-background text-muted-foreground">
            <Lock className="size-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Pro dashboard locked
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              GitHub activity generation is available for Pro users. Upgrade to
              connect the GitHub App, browse synced commits and pull requests,
              and generate without manually pasting links.
            </p>
          </div>
          <BillingActions />
        </div>
      </section>
    );
  }

  if (repositories.length === 0) {
    return (
      <section className="space-y-3 border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <h2 className="text-base font-semibold">GitHub activity</h2>
        <p className="text-sm text-muted-foreground">
          Connect and sync the GitLoud GitHub App in settings to generate
          directly from selected repositories.
        </p>
        <Button asChild variant="outline" size="sm">
          <a href="/dashboard/settings">Open settings</a>
        </Button>
      </section>
    );
  }

  return (
    <section className="border bg-card text-card-foreground shadow-sm">
      <form
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          void generateFromSelectedItem();
        }}
      >
        <div className="space-y-6 p-4 sm:p-6">
          <GitHubActivityControls
            activityType={activityType}
            activityTypeLabel={activityTypeLabel}
            generating={generating}
            loadingInstallations={loadingInstallations}
            loadInstallations={loadInstallations}
            repositories={repositories}
            repositoryMenuOpen={repositoryMenuOpen}
            selectedRepository={selectedRepository}
            selectedRepositoryId={selectedRepositoryId}
            setActivityType={setActivityType}
            setRepositoryMenuOpen={setRepositoryMenuOpen}
            setSelectedRepositoryId={setSelectedRepositoryId}
          />

          {generationStep === "select" ? (
            <GitHubActivitySelectionStep
              activityType={activityType}
              items={items}
              loadingActivity={loadingActivity}
              selectedItemUrl={selectedItemUrl}
              setSelectedItemUrl={setSelectedItemUrl}
            />
          ) : (
            <GitHubActivityCustomizeStep
              context={context}
              generating={generating}
              selectedItem={selectedItem}
              setContext={setContext}
              setGenerationStep={setGenerationStep}
            />
          )}
        </div>

        {generationStep === "select" ? (
          <div className="flex justify-end border-t bg-muted/20 px-4 py-3 sm:px-6">
            <Button
              type="button"
              className="min-w-32"
              disabled={!selectedItem || loadingActivity}
              onClick={goToCustomizeStep}
            >
              NEXT
            </Button>
          </div>
        ) : (
          <GitHubActivityFooter
            clearSelectedMedia={clearSelectedMedia}
            fileInputRef={fileInputRef}
            isPremiumXPost={isPremiumXPost}
            isSubmitting={generating}
            onMediaChange={onMediaChange}
            selectedMedia={selectedMedia}
            setXPostLength={setXPostLength}
            submitDisabled={!selectedItem || generating}
          />
        )}
      </form>
    </section>
  );
}
