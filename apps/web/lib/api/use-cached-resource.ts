"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";

type Updater<T> = T | null | ((current: T | null) => T | null);

/**
 * Loads one API resource through the React Query cache, scoped to the signed-in
 * user. Revisiting a screen shows the cached data immediately and refreshes it
 * in the background, instead of starting empty behind a loader.
 *
 * `loading` is true only when nothing is cached yet.
 */
export function useCachedResource<T>(
  name: string,
  fetcher: () => Promise<T>,
  errorMessage: string,
) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => [name, userId] as const, [name, userId]);

  const query = useQuery({
    queryKey,
    queryFn: fetcher,
    enabled: Boolean(userId),
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(
        query.error instanceof Error ? query.error.message : errorMessage,
      );
    }
  }, [query.error, errorMessage]);

  const setData = useCallback(
    (next: Updater<T>) => {
      queryClient.setQueryData<T>(queryKey, (old) => {
        const value =
          typeof next === "function"
            ? (next as (current: T | null) => T | null)(old ?? null)
            : next;
        return value ?? undefined;
      });
    },
    [queryClient, queryKey],
  );

  const { refetch } = query;
  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    data: query.data ?? null,
    loading: query.isPending,
    refreshing: query.isFetching,
    setData,
    reload,
  };
}
