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
    toast.error(error.message || "Could not load generated content", {
      duration: 7000,
    });
  }, [error]);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto flex w-full max-w-5xl justify-end px-4 py-8">
        <Button type="button" onClick={reset}>
          Retry
        </Button>
      </section>
    </main>
  );
}
