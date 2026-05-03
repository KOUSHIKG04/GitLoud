"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export function ProfileSync() {
  const { isLoaded, isSignedIn } = useUser();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || syncedRef.current) {
      return;
    }

    syncedRef.current = true;

    void fetch("/api/profile/sync", { method: "POST" })
      .then((res) => {
        if (!res.ok) {
          syncedRef.current = false;
        }
      })
      .catch(() => {
        syncedRef.current = false;
      });
  }, [isLoaded, isSignedIn]);

  return null;
}
