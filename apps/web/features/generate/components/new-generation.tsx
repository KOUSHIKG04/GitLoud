"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { FolderGit2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { githubPrOrCommitUrlSchema } from "@repo/shared/github";
import { RepoPicker } from "@/features/github-activity/components/repo-picker";
import {
  GenerationOptionsPanel,
  useGenerationOptions,
} from "@/features/generate/components/generation-options";
import { useGenerate } from "@/features/generate/lib/use-generate";

/**
 * The one place to generate: paste a GitHub link, or pick up to five items
 * from a connected repository. Options are shared by both and closed by
 * default.
 */
export function NewGeneration() {
  const { generate, generating } = useGenerate();
  const { options, setContext, setXPostLength } = useGenerationOptions();
  const [url, setUrl] = useState("");
  const [source, setSource] = useState<"link" | "repos">("link");

  function onSubmitLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = githubPrOrCommitUrlSchema.safeParse(url.trim());

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ??
          "Paste a GitHub pull request or commit link",
        { duration: 7000 },
      );
      return;
    }

    void generate([parsed.data], options);
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Generate from"
        className="inline-flex rounded-sm border border-border p-1"
      >
        <SourceTab
          active={source === "link"}
          onClick={() => setSource("link")}
          icon={<Link2 className="size-4" aria-hidden="true" />}
          label="Paste a link"
        />
        <SourceTab
          active={source === "repos"}
          onClick={() => setSource("repos")}
          icon={<FolderGit2 className="size-4" aria-hidden="true" />}
          label="Pick from your repos"
        />
      </div>

      {source === "link" ? (
        <form onSubmit={onSubmitLink} className="space-y-2">
          <label htmlFor="github-url" className="sr-only">
            GitHub pull request or commit URL
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="github-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={generating}
              placeholder="https://github.com/owner/repo/pull/123"
              className="h-11 flex-1 rounded-sm bg-background"
            />
            <Button
              type="submit"
              className="h-11 sm:min-w-36"
              disabled={generating || url.trim() === ""}
            >
              {generating ? "GENERATING…" : "GENERATE"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A pull request or commit link. Public repositories work straight
            away; private ones need GitHub connected in Settings.
          </p>
        </form>
      ) : (
        <RepoPicker
          generating={generating}
          onGenerate={(urls) => void generate(urls, options)}
        />
      )}

      <GenerationOptionsPanel
        options={options}
        setContext={setContext}
        setXPostLength={setXPostLength}
        disabled={generating}
      />
    </div>
  );
}

function SourceTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-2 rounded-sm bg-muted px-3 py-1.5 text-sm text-foreground"
          : "inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {icon}
      {label}
    </button>
  );
}
