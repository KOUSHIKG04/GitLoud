"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { githubPrOrCommitUrlSchema } from "@repo/shared/github";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeneratedContent } from "@repo/shared/generated-content";

import { useRouter } from "next/navigation";

const formSchema = z.object({
  url: githubPrOrCommitUrlSchema,
  context: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PullRequestGenerateResponse = {
  sourceType: "pull-request";
  generatedContentId: string;
  generatedContent: GeneratedContent;
  metadata: {
    owner: string;
    repo: string;
    number: number;
    title: string;
    author?: string;
    url: string;
    state: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  };
};

type CommitGenerateResponse = {
  sourceType: "commit";
  generatedContentId: string;
  generatedContent: GeneratedContent;
  metadata: {
    owner: string;
    repo: string;
    sha: string;
    shortSha: string;
    message: string;
    author: string | null;
    url: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  };
};

type GenerateResponse = PullRequestGenerateResponse | CommitGenerateResponse;

type ProgressEvent =
  | { type: "progress"; message: string }
  | { type: "done"; data: Pick<GenerateResponse, "sourceType" | "generatedContentId"> }
  | { type: "error"; message: string };

async function readProgressStream(
  response: Response,
  onProgress: (message: string) => void,
) {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to fetch GitHub item");
  }

  if (!response.body) {
    throw new Error("Response stream is unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const event = JSON.parse(line) as ProgressEvent;

      if (event.type === "progress") {
        onProgress(event.message);
      }

      if (event.type === "error") {
        throw new Error(event.message);
      }

      if (event.type === "done") {
        return event.data;
      }
    }
  }

  throw new Error("Generation finished without a result");
}

export function PrForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      url: "",
      context: "",
    },
  });


  async function onSubmit(values: FormValues) {
    setSubmitError(null);

    const toastId = toast.loading("Fetching GitHub item...");

    try {
      const response = await fetch("/api/pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: values.url,
          context: values.context,
        }),
      });

      const data = await readProgressStream(response, (message) => {
        toast.loading(message, { id: toastId });
      });

      toast.success("Content generated successfully", {
        id: toastId,
      });
      router.push(`/dashboard/generations/${data.generatedContentId}`);
      
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      setSubmitError(message);

      toast.error(message, {
        id: toastId,
      });
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pr-url">GitHub PR or commit URL</Label>

            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                id="pr-url"
                type="url"
                placeholder="https://github.com/owner/repo/pull/123 or /commit/abc123"
                disabled={isSubmitting}
                className={
                  errors.url ? "border-destructive md:flex-1" : "md:flex-1"
                }
                {...register("url")}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? "Fetching..." : "Generate"}
              </Button>
            </div>

            {errors.url ? (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Extra context</Label>

            <textarea
              id="context"
              placeholder="Example: I learned this today, explain it like a learning update..."
              disabled={isSubmitting}
              className="custom-scrollbar min-h-32 w-full resize-y rounded-md border bg-background p-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("context")}
            />

            {errors.context ? (
              <p className="text-sm text-destructive">
                {errors.context.message}
              </p>
            ) : null}
          </div>
        </form>
      </div>

      {submitError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

    </div>
  );
}
