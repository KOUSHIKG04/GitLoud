"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { githubPullRequestUrlSchema } from "@repo/shared/github";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PullRequestResult } from "@repo/shared/pull-request";
import type { GeneratedContent } from "@repo/shared/generated-content";

const formSchema = z.object({
  url: githubPullRequestUrlSchema,
});

type FormValues = z.infer<typeof formSchema>;
type GenerateResponse = {
  pullRequest: PullRequestResult;
  generatedContent: GeneratedContent;
};

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
          <div className="space-y-2">
            <p className="break-all text-sm text-muted-foreground">
              {result.pullRequest.owner}/{result.pullRequest.repo} #
              {result.pullRequest.number}
            </p>

            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {result.pullRequest.title}
            </h2>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground">Author</p>
              <p className="break-all font-medium">
                {result.pullRequest.author ?? "Unknown"}
              </p>
            </div>

            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground">State</p>
              <p className="font-medium capitalize">
                {result.pullRequest.state}
              </p>
            </div>

            <div className="rounded-xl border p-3 sm:col-span-2 lg:col-span-1">
              <p className="text-muted-foreground">Files</p>
              <p className="font-medium">{result.pullRequest.changedFiles}</p>
            </div>
          </div>

          <div className="rounded-xl border p-3 text-sm">
            <p className="text-muted-foreground">Changes</p>
            <p className="font-medium">
              +{result.pullRequest.additions} -{result.pullRequest.deletions}{" "}
              across {result.pullRequest.changedFiles} files
            </p>
          </div>

          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href={result.pullRequest.url} target="_blank" rel="noreferrer">
              Open on GitHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold tracking-tight">
              Generated Content
            </h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <ContentCard title="Short summary">
                {result.generatedContent.shortSummary}
              </ContentCard>

              <ContentCard title="Technical summary">
                {result.generatedContent.technicalSummary}
              </ContentCard>

              <div className="rounded-xl border p-4">
                <h4 className="mb-2 font-medium">Features</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                  {result.generatedContent.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border p-4">
                <h4 className="mb-2 font-medium">Technologies used</h4>
                <ul className="flex flex-wrap gap-2">
                  {result.generatedContent.techUsed.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <ContentCard title="X/Twitter post">
                {result.generatedContent.tweet}
              </ContentCard>

              <ContentCard title="LinkedIn post">
                {result.generatedContent.linkedInPost}
              </ContentCard>

              <ContentCard title="Reddit post">
                {result.generatedContent.redditPost}
              </ContentCard>

              <ContentCard title="Portfolio bullet">
                {result.generatedContent.portfolioBullet}
              </ContentCard>

              <ContentCard title="Changelog entry">
                {result.generatedContent.changelogEntry}
              </ContentCard>

              <ContentCard title="Beginner-friendly explanation">
                {result.generatedContent.beginnerSummary}
              </ContentCard>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ContentCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4">
      <h4 className="mb-2 font-medium">{title}</h4>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
