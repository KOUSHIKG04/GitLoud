"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function ProfileSync() {
  const { isLoaded, isSignedIn } = useUser();
  const syncedRef = useRef(false);
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/profile/sync", { method: "POST" });

      if (!response.ok) {
        throw new Error("Could not sync profile");
      }

      return true;
    },
    retry: false,
    onSuccess: () => {
      queryClient.setQueryData(["profile-sync"], true);
    },
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn || syncedRef.current) {
      return;
    }

    syncedRef.current = true;
    mutate(undefined, {
      onError: () => {
        syncedRef.current = false;
      },
    });
  }, [isLoaded, isSignedIn, mutate]);

  return null;
}
