"use client";

import { useAuth } from "@clerk/nextjs";
import { useSidebar } from "@repo/ui/components/sidebar";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { XPostLength } from "@repo/shared/generations";
import { apiFetch } from "@/lib/api/client";
import { startBackendDelayToast } from "@/lib/api/delay-toast";
import {
  GenerationRequestError,
  readProgressStream,
  wait,
} from "@/features/generate/lib/generation-stream";

export type GenerationOptions = {
  context: string;
  xPostLength: XPostLength;
};

/**
 * One way to generate: 1 GitHub URL goes to /pr, 2 to 5 go to /pr/combined.
 * Shows progress in a toast and opens the result when it is ready.
 */
export function useGenerate() {
  const { getToken } = useAuth();
  const { push, refresh } = useRouter();
  const { setOpen, setOpenMobile } = useSidebar();
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(
    async (urls: string[], options: GenerationOptions) => {
      if (urls.length === 0) {
        toast.error("Add a GitHub pull request or commit first");
        return;
      }

      const toastId = toast.loading("Fetching GitHub item...");
      const clearBackendDelayToast = startBackendDelayToast(toastId);
      const minimumLoaderTime = wait(2500);
      const isCombined = urls.length > 1;

      setGenerating(true);

      try {
        const response = await apiFetch(
          isCombined ? "/pr/combined" : "/pr",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...(isCombined ? { urls } : { url: urls[0] }),
              context: options.context.trim() || undefined,
              xPostLength: options.xPostLength,
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
        // Clear cached dashboard pages so History and Recent include this one.
        refresh();
        push(`/dashboard/generations/${data.generatedContentId}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        const appRequired =
          error instanceof GenerationRequestError &&
          error.code === "github_app_required";

        toast.error(message, {
          id: toastId,
          duration: 7000,
          action: {
            label: appRequired ? "Connect GitHub" : "Retry",
            onClick: () => {
              if (appRequired) {
                push("/dashboard/settings#github");
                return;
              }

              void generate(urls, options);
            },
          },
        });
      } finally {
        clearBackendDelayToast();
        setGenerating(false);
      }
    },
    [getToken, push, refresh, setOpen, setOpenMobile],
  );

  return { generate, generating };
}
