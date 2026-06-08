"use client";

import { Button } from "@repo/ui/components/button";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    toast.error(error.message || "Could not load generated content", {
      duration: 7000,
    });
  }, [error]);

  return (
    <main className="min-h-[calc(100dvh-3.5rem)]">
      <section className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4 pb-8 pt-0">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">GitLoud</p>
            <p className="text-sm text-muted-foreground">
              Could not load generated content.
            </p>
          </div>

          <Button type="button" onClick={reset}>
            RETRY
          </Button>
        </div>
      </section>
    </main>
  );
}
