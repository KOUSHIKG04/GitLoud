"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { startBackendDelayToast } from "@/lib/api-delay-toast";
import { getApiError } from "@/lib/api-response";
import { useSidebar } from "@repo/ui/components/sidebar";
import {
  readProgressStream,
  uploadMedia,
  wait,
} from "../_components/pr-form-generation";
import { getMediaValidationError } from "../_components/pr-form-validation";
import type {
  ActivityType,
  GenerationStep,
  GitHubActivityItem,
  GitHubActivityResponse,
  GitHubInstallation,
  GitHubInstallationsResponse,
  XPostLength,
} from "../_components/github-activity-types";

export function useGitHubActivityDashboard() {
  const { getToken } = useAuth();
  const { push } = useRouter();
  const { setOpen, setOpenMobile } = useSidebar();
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [canUsePrivateRepos, setCanUsePrivateRepos] = useState(false);
  const [selectedRepositoryId, setSelectedRepositoryIdState] = useState("");
  const [activityType, setActivityTypeState] =
    useState<ActivityType>("pull-requests");

  const selectedRepositoryIdRef = useRef(selectedRepositoryId);
  const activityTypeRef = useRef(activityType);
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

  const selectedRepository = useMemo(
    () =>
      repositories.find((repository) => repository.id === selectedRepositoryId),
    [repositories, selectedRepositoryId],
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.url === selectedItemUrl),
    [items, selectedItemUrl],
  );

  const activityTypeLabel =
    activityType === "pull-requests" ? "Pull requests" : "Commits";
  const isPremiumXPost = xPostLength === "premium";

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
          throw new Error(getApiError(data, "Could not load GitHub items"));
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
      const nextRepositories = githubData.installations.flatMap(
        (installation) => installation.repositories,
      );
      const nextRepositoryIds = new Set(
        nextRepositories.map((repository) => repository.id),
      );
      const firstRepositoryId = nextRepositories[0]?.id ?? "";

      setCanUsePrivateRepos(githubData.canUsePrivateRepos);
      setInstallations(githubData.installations);
      
      const currentSelectedId = selectedRepositoryIdRef.current;
      const nextActive = currentSelectedId && nextRepositoryIds.has(currentSelectedId)
        ? currentSelectedId
        : firstRepositoryId;

      selectedRepositoryIdRef.current = nextActive;
      setSelectedRepositoryIdState(nextActive);
      if (nextActive) {
        void loadActivity(nextActive, activityTypeRef.current);
      } else {
        setItems([]);
        setSelectedItemUrl("");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load repositories",
      );
    } finally {
      setLoadingInstallations(false);
      setHasLoadedInstallations(true);
    }
  }, [getToken, loadActivity]);

  const setSelectedRepositoryId = useCallback(
    (repositoryId: string) => {
      selectedRepositoryIdRef.current = repositoryId;
      setSelectedRepositoryIdState(repositoryId);
      if (!repositoryId) {
        setItems([]);
        setSelectedItemUrl("");
      } else {
        void loadActivity(repositoryId, activityTypeRef.current);
      }
    },
    [loadActivity],
  );

  const setActivityType = useCallback(
    (type: ActivityType) => {
      activityTypeRef.current = type;
      setActivityTypeState(type);
      if (selectedRepositoryIdRef.current) {
        void loadActivity(selectedRepositoryIdRef.current, type);
      }
    },
    [loadActivity],
  );

  useEffect(() => {
    void loadInstallations();
  }, [loadInstallations]);

  const generateFromSelectedItem = useCallback(async () => {
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
      setOpen(false);
      setOpenMobile(false);
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
  }, [context, getToken, push, selectedItem, selectedMedia, xPostLength, setOpen, setOpenMobile]);

  const onMediaChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const clearSelectedMedia = useCallback(() => {
    setSelectedMedia(null);
    mediaAttachmentIdRef.current = null;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const goToCustomizeStep = useCallback(() => {
    if (!selectedItem) {
      toast.error("Select a pull request or commit first");
      return;
    }

    setGenerationStep("customize");
  }, [selectedItem]);

  return {
    activityType,
    activityTypeLabel,
    canUsePrivateRepos,
    clearSelectedMedia,
    context,
    fileInputRef,
    generateFromSelectedItem,
    generating,
    generationStep,
    goToCustomizeStep,
    hasLoadedInstallations,
    isPremiumXPost,
    items,
    loadInstallations,
    loadingActivity,
    loadingInstallations,
    onMediaChange,
    repositories,
    repositoryMenuOpen,
    selectedItem,
    selectedItemUrl,
    selectedMedia,
    selectedRepository,
    selectedRepositoryId,
    setActivityType,
    setContext,
    setGenerationStep,
    setRepositoryMenuOpen,
    setSelectedItemUrl,
    setSelectedRepositoryId,
    setXPostLength,
  };
}
