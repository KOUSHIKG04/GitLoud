"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { githubPullRequestUrlSchema } from "@repo/shared/github";
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
  url: githubPullRequestUrlSchema,
});

type FormValues = z.infer<typeof formSchema>;

type PullRequestGenerateResponse = {
  sourceType: "pull-request";
  pullRequest: PullRequestResult;
  generatedContent: GeneratedContent;
};

type CommitGenerateResponse = {
  sourceType: "commit";
  commit: CommitResult;
  generatedContent: GeneratedContent;
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
    },
  });

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setResult(null);

    const toastId = toast.loading("Fetching pull request...");

    try {
      const response = await axios.post<GenerateResponse>("/api/pr", {
        url: values.url,
      });

      setResult(response.data);
      toast.success("Pull request fetched successfully", {
        id: toastId,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? "Failed to fetch PR")
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
            <Label htmlFor="pr-url">GitHub pull request URL</Label>

            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                id="pr-url"
                type="url"
                placeholder="https://github.com/owner/repo/pull/123"
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
                  Pull request: {result.pullRequest.owner}/
                  {result.pullRequest.repo} #{result.pullRequest.number}
                </p>

                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {result.pullRequest.title}
                </h2>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard
                  label="Author"
                  value={result.pullRequest.author ?? "Unknown"}
                />
                <InfoCard label="Type" value="Pull Request" />
                <InfoCard
                  label="Files"
                  value={String(result.pullRequest.changedFiles)}
                />
              </div>

              <div className="rounded-xl border p-3 text-sm">
                <p className="text-muted-foreground">Changes</p>
                <p className="font-medium">
                  +{result.pullRequest.additions} -
                  {result.pullRequest.deletions} across{" "}
                  {result.pullRequest.changedFiles} files
                </p>
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a
                  href={result.pullRequest.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on GitHub
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="break-all text-sm text-muted-foreground">
                  Commit: {result.commit.owner}/{result.commit.repo}{" "}
                  {result.commit.shortSha}
                </p>

                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {result.commit.message.split("\n")[0]}
                </h2>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard
                  label="Author"
                  value={result.commit.author ?? "Unknown"}
                />
                <InfoCard label="Type" value="Commit" />
                <InfoCard
                  label="Files"
                  value={String(result.commit.changedFiles)}
                />
              </div>

              <div className="rounded-xl border p-3 text-sm">
                <p className="text-muted-foreground">Changes</p>
                <p className="font-medium">
                  +{result.commit.additions} -{result.commit.deletions} across{" "}
                  {result.commit.changedFiles} files
                </p>
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={result.commit.url} target="_blank" rel="noreferrer">
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
        </section>
      ) : null}
    </div>
  );
}
