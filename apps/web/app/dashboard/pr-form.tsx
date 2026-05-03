"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { githubPrOrCommitUrlSchema } from "@repo/shared/github";
import { type FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GeneratedContent } from "@repo/shared/generated-content";
import { ChevronRight, Info, Loader2, Upload, X } from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
} from "react";
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

type UploadedMediaAttachment = {
  id: string;
  secureUrl: string;
  resourceType: string;
  fileName: string;
  mimeType: string;
  bytes: number;
};

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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadMedia(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/media", {
    method: "POST",
    body: formData,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error ?? "Could not upload media");
  }

  return body.mediaAttachment as UploadedMediaAttachment;
}

export function PrForm({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaAttachmentIdRef = useRef<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      context: "",
    },
  });

  async function generate(values: FormValues) {
    const toastId = toast.loading("Fetching GitHub item...");
    const minimumLoaderTime = wait(2500);

    try {
      let mediaAttachmentId: string | undefined;

      if (selectedMedia) {
        if (mediaAttachmentIdRef.current) {
          mediaAttachmentId = mediaAttachmentIdRef.current;
        } else {
          toast.loading("Uploading media attachment...", { id: toastId });
          const mediaAttachment = await uploadMedia(selectedMedia);
          mediaAttachmentId = mediaAttachment.id;
          mediaAttachmentIdRef.current = mediaAttachmentId;
        }
      }

      const response = await fetch("/api/pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: values.url,
          context: values.context,
          mediaAttachmentId,
        }),
      });

      const data = await readProgressStream(response, (message) => {
        toast.loading(message, { id: toastId });
      });

      await minimumLoaderTime;

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

  function onMediaChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedMedia(null);
      mediaAttachmentIdRef.current = null;
      return;
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      toast.error("Upload an image or video file", { duration: 7000 });
      event.target.value = "";
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Media file must be 25MB or smaller", { duration: 7000 });
      event.target.value = "";
      return;
    }

    setSelectedMedia(file);
  }

  function clearSelectedMedia() {
    setSelectedMedia(null);
    mediaAttachmentIdRef.current = null;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    <div
      {...props}
      className={["w-full space-y-6", className].filter(Boolean).join(" ")}
    >
      <div className="border bg-card text-card-foreground shadow-sm">
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="flex flex-col"
        >
          <div className="space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center">
                <p className="my-1 gap-1 text-md leading-5 text-foreground flex items-center">
                  <ChevronRight size={10} className="hidden sm:block" /> Paste a
                  Github pull request or commit link.
                </p>
              </div>

              <div className="relative">
                <Input
                  id="pr-url"
                  type="url"
                  placeholder=""
                  disabled={isSubmitting}
                  className={
                    errors.url
                      ? "border-destructive rounded-none pr-9 placeholder:text-xs focus-visible:ring-1"
                      : "rounded-none bg-background pr-9 placeholder:text-xs focus-visible:ring-1"
                  }
                  {...register("url")}
                />
                <span
                  title="Supported links: https://github.com/owner/repo/pull/123 or https://github.com/owner/repo/commit/abc123"
                  aria-label="Supported link types"
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 animate-pulse text-black drop-shadow-[0_0_8px_rgba(0,0,0,0.45)] dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.75)]"
                >
                  <Info className="size-4" aria-hidden="true" />
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center">
                <p className="gap-1 text-[13px] leading-5 text-muted-foreground flex items-center">
                  Extra context: Add tone, audience, or what you learned.
                </p>
              </div>

              <div className="relative">
                <ChevronRight
                  className="absolute left-3 top-3 text-muted-foreground"
                  size={14}
                />
                <textarea
                  id="context"
                  placeholder='Add tone, audience, or what you learned (e.g., "I learned this today explain it as a learning update")'
                  disabled={isSubmitting}
                  className="custom-scrollbar min-h-36 w-full resize-y rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("context")}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                className="hidden"
                disabled={isSubmitting}
                onChange={onMediaChange}
              />

              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={isSubmitting}
                onClick={() => fileInputRef.current?.click()}
                className="border-none bg-background text-foreground hover:bg-background/90 hover:text-foreground dark:bg-background dark:text-foreground"
                aria-label="Upload media here to include it when sharing generated posts."
                title="Upload media here to include it when sharing generated posts."
              >
                <Upload className="size-4" />
              </Button>

              {selectedMedia ? (
                <div className="flex min-w-0 items-center text-xs text-muted-foreground">
                  <span className="max-w-44 truncate">
                    {selectedMedia.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 rounded-none"
                    disabled={isSubmitting}
                    onClick={clearSelectedMedia}
                    aria-label="Remove selected media"
                    title="Remove selected media"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-32 flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              GENERATE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
