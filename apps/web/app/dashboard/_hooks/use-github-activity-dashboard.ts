"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
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
  GitHubActivityResponse,
  GitHubInstallation,
  GitHubInstallationsResponse,
  XPostLength,
} from "../_components/github-activity-types";

type DashboardSelectionState = {
  activityType: ActivityType;
  generationStep: GenerationStep;
  selectedItemUrl: string;
  selectedRepositoryId: string;
};

type DashboardSelectionAction =
  | { type: "activity-type-selected"; activityType: ActivityType }
  | { type: "generation-step-selected"; generationStep: GenerationStep }
  | { type: "item-url-selected"; selectedItemUrl: string }
  | { type: "repository-loaded"; selectedRepositoryId: string }
  | { type: "repository-selected"; selectedRepositoryId: string };

const initialDashboardSelection: DashboardSelectionState = {
  activityType: "pull-requests",
  generationStep: "select",
  selectedItemUrl: "",
  selectedRepositoryId: "",
};

function dashboardSelectionReducer(
  state: DashboardSelectionState,
  action: DashboardSelectionAction,
): DashboardSelectionState {
  switch (action.type) {
    case "activity-type-selected":
      return {
        ...state,
        activityType: action.activityType,
        generationStep: "select",
        selectedItemUrl: "",
      };
    case "generation-step-selected":
      return {
        ...state,
        generationStep: action.generationStep,
      };
    case "item-url-selected":
      return {
        ...state,
        selectedItemUrl: action.selectedItemUrl,
      };
    case "repository-loaded":
      return {
        ...state,
        selectedRepositoryId: action.selectedRepositoryId,
      };
    case "repository-selected":
      return {
        ...state,
        generationStep: "select",
        selectedItemUrl: "",
        selectedRepositoryId: action.selectedRepositoryId,
      };
  }
}

export function useGitHubActivityDashboard() {
  const { getToken } = useAuth();
  const { push } = useRouter();
  const { setOpen, setOpenMobile } = useSidebar();
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [canUsePrivateRepos, setCanUsePrivateRepos] = useState(false);
  const [selection, dispatchSelection] = useReducer(
    dashboardSelectionReducer,
    initialDashboardSelection,
  );
  const {
    activityType,
    generationStep,
    selectedItemUrl,
    selectedRepositoryId,
  } = selection;

  const selectedRepositoryIdRef = useRef(selectedRepositoryId);
  const [context, setContext] = useState("");
  const [xPostLength, setXPostLength] = useState<XPostLength>("standard");
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [repositoryMenuOpen, setRepositoryMenuOpen] = useState(false);
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [hasLoadedInstallations, setHasLoadedInstallations] = useState(false);
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

  const activityQuery = useQuery({
    queryKey: ["github-activity", selectedRepositoryId, activityType],
    queryFn: async () => {
      const params = new URLSearchParams({
        repositoryId: selectedRepositoryId,
        type: activityType,
      });
      const response = await apiFetch(
        `/github/activity?${params.toString()}`,
        {},
        getToken,
      );
      const data = (await response.json()) as
        | GitHubActivityResponse
        | { error?: string };

      if (!response.ok) {
        const message = getApiError(data, "Could not load GitHub items");
        toast.error(message);
        throw new Error(message);
      }

      return (data as GitHubActivityResponse).items;
    },
    enabled: hasLoadedInstallations && Boolean(selectedRepositoryId),
    retry: false,
  });

  const items = useMemo(() => activityQuery.data ?? [], [activityQuery.data]);

  const selectedItem = useMemo(
    () => items.find((item) => item.url === selectedItemUrl),
    [items, selectedItemUrl],
  );

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
      const nextActive =
        currentSelectedId && nextRepositoryIds.has(currentSelectedId)
          ? currentSelectedId
          : firstRepositoryId;

      selectedRepositoryIdRef.current = nextActive;
      dispatchSelection({
        type: "repository-loaded",
        selectedRepositoryId: nextActive,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load repositories",
      );
    } finally {
      setLoadingInstallations(false);
      setHasLoadedInstallations(true);
    }
  }, [getToken]);

  const handleSelectedRepositoryIdChange = useCallback(
    (repositoryId: string) => {
      selectedRepositoryIdRef.current = repositoryId;
      dispatchSelection({
        type: "repository-selected",
        selectedRepositoryId: repositoryId,
      });
    },
    [],
  );

  const handleActivityTypeChange = useCallback(
    (type: ActivityType) => {
      dispatchSelection({
        type: "activity-type-selected",
        activityType: type,
      });
    },
    [],
  );

  const handleSelectedItemUrlChange = useCallback((url: string) => {
    dispatchSelection({
      type: "item-url-selected",
      selectedItemUrl: url,
    });
  }, []);

  const handleGenerationStepChange = useCallback((step: GenerationStep) => {
    dispatchSelection({
      type: "generation-step-selected",
      generationStep: step,
    });
  }, []);

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

    handleGenerationStepChange("customize");
  }, [handleGenerationStepChange, selectedItem]);

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
    loadingActivity: activityQuery.isFetching,
    loadingInstallations,
    onMediaChange,
    repositories,
    repositoryMenuOpen,
    selectedItem,
    selectedItemUrl,
    selectedMedia,
    selectedRepository,
    selectedRepositoryId,
    setActivityType: handleActivityTypeChange,
    setContext,
    setGenerationStep: handleGenerationStepChange,
    setRepositoryMenuOpen,
    setSelectedItemUrl: handleSelectedItemUrlChange,
    setSelectedRepositoryId: handleSelectedRepositoryIdChange,
    setXPostLength,
  };
}
