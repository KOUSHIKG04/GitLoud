"use client";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
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
    toast.error(error.message || "Could not load history", {
      duration: 7000,
    });
  }, [error]);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">GitLoud</p>
            <p className="text-sm text-muted-foreground">
              Could not load history.
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
