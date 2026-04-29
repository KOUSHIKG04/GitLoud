"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { githubPrOrCommitUrlSchema } from "@repo/shared/github";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PullRequestResult } from "@repo/shared/pull-request";
import type { GeneratedContent } from "@repo/shared/generated-content";
import type { CommitResult } from "@repo/shared/commit";
import {
  ContentBlock,
  ContentListBlock,
  InfoCard,
} from "@/dashboard/form-helper";
import { ExternalLink } from "lucide-react";

const formSchema = z.object({
  url: githubPrOrCommitUrlSchema,
  context: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PullRequestGenerateResponse = {
  sourceType: "pull-request";
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

export function PrForm() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.info("Copied Text");
    } catch (error) {
      toast.error("Couldn't copy to clipboard. Please copy manually.");
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setResult(null);

    const toastId = toast.loading("Fetching GitHub item...");

    try {
      const response = await axios.post<GenerateResponse>("/api/pr", {
        url: values.url,
        context: values.context,
      });

      setResult(response.data);
      toast.success("GitHub item fetched successfully", {
        id: toastId,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? "Failed to fetch GitHub item")
        : "Something went wrong";

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
              className="min-h-24 w-full resize-y rounded-md border bg-background p-3 text-sm leading-6 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      {result ? (
        <section className="space-y-6 rounded-2xl border bg-background p-4 shadow-sm sm:p-6">
          {result.sourceType === "pull-request" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="break-all text-sm text-muted-foreground">
                  Pull request: {result.metadata.owner}/{result.metadata.repo} #
                  {result.metadata.number}
                </p>

                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {result.metadata.title}
                </h2>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard
                  label="Author"
                  value={result.metadata.author ?? "Unknown"}
                />
                <InfoCard label="Type" value="Pull Request" />
                <InfoCard
                  label="Files"
                  value={String(result.metadata.changedFiles)}
                />
              </div>

              <div className="rounded-xl border p-3 text-sm">
                <p className="text-muted-foreground">Changes</p>
                <p className="font-medium">
                  +{result.metadata.additions} -{result.metadata.deletions}{" "}
                  across {result.metadata.changedFiles} files
                </p>
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={result.metadata.url} target="_blank" rel="noreferrer">
                  Open on GitHub
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="break-all text-sm text-muted-foreground">
                  Commit: {result.metadata.owner}/{result.metadata.repo}{" "}
                  {result.metadata.shortSha}
                </p>

                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {result.metadata.message.split("\n")[0]}
                </h2>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard
                  label="Author"
                  value={result.metadata.author ?? "Unknown"}
                />
                <InfoCard label="Type" value="Commit" />
                <InfoCard
                  label="Files"
                  value={String(result.metadata.changedFiles)}
                />
              </div>

              <div className="rounded-xl border p-3 text-sm">
                <p className="text-muted-foreground">Changes</p>
                <p className="font-medium">
                  +{result.metadata.additions} -{result.metadata.deletions}{" "}
                  across {result.metadata.changedFiles} files
                </p>
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={result.metadata.url} target="_blank" rel="noreferrer">
                  Open on GitHub
                </a>
              </Button>
            </div>
          )}

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold tracking-tight">
              Generated Content
            </h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <ContentBlock
                title="Short summary"
                value={result.generatedContent.shortSummary}
                onCopy={copyText}
              />

              <ContentBlock
                title="Technical summary"
                value={result.generatedContent.technicalSummary}
                onCopy={copyText}
              />

              <ContentListBlock
                title="Features"
                values={result.generatedContent.features}
                onCopy={copyText}
              />

              <ContentListBlock
                title="Technologies used"
                values={result.generatedContent.techUsed}
                onCopy={copyText}
              />

              <ContentBlock
                title="X/Twitter post"
                value={result.generatedContent.tweet}
                onCopy={copyText}
              />

              <ContentBlock
                title="LinkedIn post"
                value={result.generatedContent.linkedInPost}
                onCopy={copyText}
              />

              <ContentBlock
                title="Reddit post"
                value={result.generatedContent.redditPost}
                onCopy={copyText}
              />

              <ContentBlock
                title="Portfolio bullet"
                value={result.generatedContent.portfolioBullet}
                onCopy={copyText}
              />

              <ContentBlock
                title="Changelog entry"
                value={result.generatedContent.changelogEntry}
                onCopy={copyText}
              />

              <ContentBlock
                title="Beginner-friendly explanation"
                value={result.generatedContent.beginnerSummary}
                onCopy={copyText}
              />
            </div>
          </div>

          <ShareLinks result={result} />
        </section>
      ) : null}
    </div>
  );
}

function createShareUrls(input: {
  url: string;
  title: string;
  tweet: string;
  linkedInPost: string;
  redditPost: string;
}) {
  const encodedUrl = encodeURIComponent(input.url);
  const encodedTitle = encodeURIComponent(input.title);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      input.tweet,
    )}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };
}

function getSourceUrl(result: GenerateResponse) {
  return result.metadata.url;
}

function getSourceTitle(result: GenerateResponse) {
  if (result.sourceType === "pull-request") {
    return result.metadata.title;
  }

  return result.metadata.message.split("\n")[0] || result.metadata.shortSha;
}

function ShareLinks({ result }: { result: GenerateResponse }) {
  const shareUrls = createShareUrls({
    url: getSourceUrl(result),
    title: getSourceTitle(result),
    tweet: result.generatedContent.tweet,
    linkedInPost: result.generatedContent.linkedInPost,
    redditPost: result.generatedContent.redditPost,
  });

  return (
    <section className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold tracking-tight">Share</h3>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href={shareUrls.twitter} target="_blank" rel="noreferrer">
            Share on X/Twitter
            <ExternalLink className="ml-2 size-4" />
          </a>
        </Button>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href={shareUrls.linkedIn} target="_blank" rel="noreferrer">
            Share on LinkedIn
            <ExternalLink className="ml-2 size-4" />
          </a>
        </Button>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href={shareUrls.reddit} target="_blank" rel="noreferrer">
            Share on Reddit
            <ExternalLink className="ml-2 size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
