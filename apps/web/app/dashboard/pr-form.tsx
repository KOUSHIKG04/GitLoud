"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { githubPrOrCommitUrlSchema } from "@repo/shared/github";
import { type FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { Loader2 } from "lucide-react";

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
  | {
      type: "done";
      data: Pick<GenerateResponse, "sourceType" | "generatedContentId">;
    }
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

  async function generate(values: FormValues) {
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

      toast.error(message, {
        id: toastId,
        duration: 7000,
        action: {
          label: "Retry",
          onClick: () => {
            void generate(values);
          },
        },
      });
    }
  }

  async function onSubmit(values: FormValues) {
    await generate(values);
  }

  function onInvalid(formErrors: FieldErrors<FormValues>) {
    const message =
      formErrors.url?.message ??
      formErrors.context?.message ??
      "Check the form and try again";

    toast.error(message, {
      duration: 7000,
    });
  }

  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="flex flex-col"
        >
          <div className="space-y-5 p-4 sm:p-6">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="pr-url">GitHub PR or commit URL</Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Paste a public pull request or commit link.
                </p>
              </div>

              <Input
                id="pr-url"
                type="url"
                placeholder="https://github.com/owner/repo/pull/123 or /commit/abc123"
                disabled={isSubmitting}
                className={errors.url ? "border-destructive" : undefined}
                {...register("url")}
              />

            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="context">Extra context</Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Add tone, audience, or what you learned.
                </p>
              </div>

              <textarea
                id="context"
                placeholder="Example: I learned this today, explain it like a learning update..."
                disabled={isSubmitting}
                className="custom-scrollbar min-h-36 w-full resize-y rounded-md border bg-background p-3 text-sm leading-6 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("context")}
              />

            </div>
          </div>

          <div className="flex items-center justify-end border-t bg-muted/20 px-4 py-3 sm:px-6">
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Generate
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
