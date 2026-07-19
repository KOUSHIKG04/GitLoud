"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@repo/ui/components/input";
import { ChevronRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { startBackendDelayToast } from "@/lib/api-delay-toast";
import {
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
} from "react";
import { PrFormFooter } from "./pr-form-footer";
import {
  GenerationRequestError,
  readProgressStream,
  uploadMedia,
  wait,
} from "./pr-form-generation";
import { formSchema, type FormValues } from "./pr-form.schema";
import { getMediaValidationError, onInvalid } from "./pr-form-validation";
import { useSidebar } from "@repo/ui/components/sidebar";

/**
 * Renders the PR generation form and coordinates media upload before generation.
 */
export function PrForm({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const { push } = useRouter();
  const { getToken } = useAuth();
  const { setOpen, setOpenMobile } = useSidebar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaAttachmentIdRef = useRef<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      context: "",
      xPostLength: "standard",
    },
  });
  const xPostLength = watch("xPostLength");
  const isPremiumXPost = xPostLength === "premium";

  /**
   * Generates content for the submitted GitHub URL and optional media attachment.
   */
  async function generate(values: FormValues) {
    const toastId = toast.loading("Fetching GitHub item...");
    const clearBackendDelayToast = startBackendDelayToast(toastId);
    const minimumLoaderTime = wait(2500);

    try {
      let mediaAttachmentId: string | undefined;

      if (selectedMedia) {
        if (mediaAttachmentIdRef.current) {
          mediaAttachmentId = mediaAttachmentIdRef.current;
        } else {
          toast.loading("Uploading media attachment...", { id: toastId });
          const mediaAttachment = await uploadMedia(selectedMedia, getToken);
          mediaAttachmentId = mediaAttachment.id;
          mediaAttachmentIdRef.current = mediaAttachmentId;
        }
      }

      const response = await apiFetch(
        "/pr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: values.url,
            context: values.context,
            mediaAttachmentId,
            xPostLength: values.xPostLength,
          }),
        },
        getToken,
      );

      const data = await readProgressStream(response, (message) => {
        toast.loading(message, { id: toastId });
      });

      await minimumLoaderTime;

      toast.success("Content generated successfully", {
        id: toastId,
      });

      setOpen(false);
      setOpenMobile(false);

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
              push("/dashboard/settings/github-app");
              return;
            }

            void generate(values);
          },
        },
      });
    } finally {
      clearBackendDelayToast();
    }
  }

  /**
   * Tracks the selected media file and clears any cached upload when it changes.
   */
  function onMediaChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedMedia(null);
      mediaAttachmentIdRef.current = null;
      return;
    }

    const validationError = getMediaValidationError(file);

    if (validationError) {
      toast.error(validationError, { duration: 7000 });
      event.target.value = "";
      mediaAttachmentIdRef.current = null;
      return;
    }

    mediaAttachmentIdRef.current = null;
    setSelectedMedia(file);
  }

  /**
   * Clears the selected media file and any uploaded attachment reference.
   */
  function clearSelectedMedia() {
    setSelectedMedia(null);
    mediaAttachmentIdRef.current = null;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /**
   * Handles validated form submission.
   */
  async function onSubmit(values: FormValues) {
    await generate(values);
  }

  return (
    <div
      {...props}
      className={["w-full space-y-6", className].filter(Boolean).join(" ")}
    >
      <div className="border rounded-sm bg-card text-card-foreground shadow-sm">
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="flex min-h-105 flex-col"
        >
          <div className="flex-1 space-y-6 p-4">
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
              <p className="text-xs leading-5 text-muted-foreground">
                Public repository links work without the GitHub App. For a
                private repository,{" "}
                <Link
                  href="/dashboard/settings/github-app"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  connect GitHub
                </Link>{" "}
                and grant access to that repository.
              </p>
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
                  className="custom-scrollbar min-h-36 w-full resize-y border border-input bg-background pl-8 pr-3 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("context")}
                />
              </div>
            </div>
          </div>

          <PrFormFooter
            clearSelectedMedia={clearSelectedMedia}
            fileInputRef={fileInputRef}
            isPremiumXPost={isPremiumXPost}
            isSubmitting={isSubmitting}
            onMediaChange={onMediaChange}
            registerXPostLength={register("xPostLength")}
            selectedMedia={selectedMedia}
            setValue={setValue}
          />
        </form>
      </div>
    </div>
  );
}
