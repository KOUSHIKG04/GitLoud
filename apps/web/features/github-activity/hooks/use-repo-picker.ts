"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { getApiError } from "@/lib/api/response";
import { useCachedResource } from "@/lib/api/use-cached-resource";
import {
  GITHUB_INSTALLATIONS_RESOURCE,
  fetchGitHubInstallations,
} from "@/lib/api/github-installations";
import type {
  ActivityType,
  GitHubActivityResponse,
  GitHubInstallation,
} from "@/features/github-activity/lib/github-activity-types";

type DashboardSelectionState = {
  activityType: ActivityType;
  selectedItemUrls: string[];
  selectedRepositoryId: string;
};

type DashboardSelectionAction =
  | { type: "activity-type-selected"; activityType: ActivityType }
  | { type: "item-url-toggled"; selectedItemUrl: string }
  | { type: "repository-loaded"; selectedRepositoryId: string }
  | { type: "repository-selected"; selectedRepositoryId: string };

const initialDashboardSelection: DashboardSelectionState = {
  activityType: "pull-requests",
  selectedItemUrls: [],
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
        selectedItemUrls: [],
      };
    case "item-url-toggled":
      return {
        ...state,
        selectedItemUrls: state.selectedItemUrls.includes(
          action.selectedItemUrl,
        )
          ? state.selectedItemUrls.filter(
              (url) => url !== action.selectedItemUrl,
            )
          : state.selectedItemUrls.length < 5
            ? [...state.selectedItemUrls, action.selectedItemUrl]
            : state.selectedItemUrls,
      };
    case "repository-loaded":
      return {
        ...state,
        selectedRepositoryId: action.selectedRepositoryId,
      };
    case "repository-selected":
      return {
        ...state,
        selectedItemUrls: [],
        selectedRepositoryId: action.selectedRepositoryId,
      };
  }
}

/**
 * Repository picker state: connected repositories, the chosen repository and
 * type, its recent items, and up to five selected item URLs.
 */
export function useRepoPicker() {
  const { getToken } = useAuth();
  const installationsResource = useCachedResource(
    GITHUB_INSTALLATIONS_RESOURCE,
    () => fetchGitHubInstallations(getToken),
    "Could not load repositories",
  );
  const installations: GitHubInstallation[] = useMemo(
    () => installationsResource.data?.installations ?? [],
    [installationsResource.data],
  );
  const [selection, dispatchSelection] = useReducer(
    dashboardSelectionReducer,
    initialDashboardSelection,
  );
  const { activityType, selectedItemUrls, selectedRepositoryId } = selection;

  const selectedRepositoryIdRef = useRef(selectedRepositoryId);
  const [repositoryMenuOpen, setRepositoryMenuOpen] = useState(false);
  const hasLoadedInstallations = !installationsResource.loading;
  const loadingInstallations = installationsResource.refreshing;
  const loadInstallations = installationsResource.reload;

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

  const selectedItems = useMemo(() => {
    const selectedItemUrlSet = new Set(selectedItemUrls);
    return items.filter((item) => selectedItemUrlSet.has(item.url));
  }, [items, selectedItemUrls]);

  const activityTypeLabel =
    activityType === "pull-requests" ? "Pull requests" : "Commits";

  // Keep the chosen repository when it still exists; otherwise pick the first.
  useEffect(() => {
    if (!installationsResource.data) return;

    const repositoryIds = new Set(
      repositories.map((repository) => repository.id),
    );
    const current = selectedRepositoryIdRef.current;
    const next =
      current && repositoryIds.has(current)
        ? current
        : (repositories[0]?.id ?? "");

    if (next !== current) {
      selectedRepositoryIdRef.current = next;
      dispatchSelection({
        type: "repository-loaded",
        selectedRepositoryId: next,
      });
    }
  }, [installationsResource.data, repositories]);

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

  const handleActivityTypeChange = useCallback((type: ActivityType) => {
    dispatchSelection({
      type: "activity-type-selected",
      activityType: type,
    });
  }, []);

  const handleSelectedItemUrlChange = useCallback((url: string) => {
    dispatchSelection({
      type: "item-url-toggled",
      selectedItemUrl: url,
    });
  }, []);

  return {
    activityType,
    activityTypeLabel,
    hasLoadedInstallations,
    items,
    loadInstallations,
    loadingActivity: activityQuery.isFetching,
    loadingInstallations,
    repositories,
    repositoryMenuOpen,
    selectedItemUrls,
    selectedItems,
    selectedRepository,
    selectedRepositoryId,
    setActivityType: handleActivityTypeChange,
    setRepositoryMenuOpen,
    setSelectedItemUrl: handleSelectedItemUrlChange,
    setSelectedRepositoryId: handleSelectedRepositoryIdChange,
  };
}
