import type { ReactNode } from "react";
import { CommitBranchIcon } from "@/assets/CommitBranchIcon";
import {
  CalendarDays,
  CircleDot,
  FileDiff,
  GitPullRequest,
  Minus,
  Plus,
  User,
} from "lucide-react";

interface SourceMetadataPanelProps {
  source: {
    url: string;
    changedFiles: number;
    additions: number;
    deletions: number;
    createdAt: string;
    author?: string | null;
    owner: string;
    repo: string;
    number?: number;
    shortSha?: string;
    state?: string | null;
  };
  sourceType: "PULL_REQUEST" | "COMMIT" | "COMBINED";
  sourceCount?: number;
}

const sourceDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatSourceDate(value: string) {
  return sourceDateFormatter.format(new Date(value));
}

export function SourceMetadataPanel({
  source,
  sourceType,
  sourceCount,
}: SourceMetadataPanelProps) {
  const sourceReference =
    sourceType === "PULL_REQUEST"
      ? source.number
        ? `#${source.number}`
        : undefined
      : sourceType === "COMMIT"
        ? (source.shortSha ?? undefined)
        : `${sourceCount ?? 0} sources`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 overflow-hidden border bg-background">
        <SourceStat
          label="Files changed"
          value={source.changedFiles.toLocaleString()}
          icon={<FileDiff className="size-4" />}
        />
        <SourceStat
          label="Additions"
          value={`+${source.additions.toLocaleString()}`}
          icon={<Plus className="size-4" />}
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
        <SourceStat
          label="Deletions"
          value={`-${source.deletions.toLocaleString()}`}
          icon={<Minus className="size-4" />}
          valueClassName="text-red-600 dark:text-red-400"
        />
      </div>

      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        {sourceReference ? (
          <SourceMeta
            icon={
              sourceType === "PULL_REQUEST" ? (
                <GitPullRequest className="size-4" />
              ) : (
                <CommitBranchIcon className="size-4" />
              )
            }
            label={
              sourceType === "COMBINED"
                ? "Combined"
                : sourceType === "PULL_REQUEST"
                  ? "Pull request"
                  : "Commit"
            }
            value={sourceReference}
          />
        ) : null}
        {source.author ? (
          <SourceMeta
            icon={<User className="size-4" />}
            label="Author"
            value={source.author}
          />
        ) : null}
        {sourceType === "PULL_REQUEST" && source.state ? (
          <SourceMeta
            icon={<CircleDot className="size-4" />}
            label="State"
            value={source.state}
          />
        ) : null}
        <SourceMeta
          icon={<CalendarDays className="size-4" />}
          label="Saved"
          value={formatSourceDate(source.createdAt)}
        />
      </div>
    </div>
  );
}

function SourceStat({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div
      className="flex min-h-16 flex-col items-center justify-center gap-1.5 border-r p-2 text-center last:border-r-0"
      aria-label={`${label}: ${value}`}
      title={label}
    >
      <span className="flex size-7 items-center justify-center bg-muted text-muted-foreground">
        {icon}
      </span>
      <span
        className={["text-base font-semibold", valueClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function SourceMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="flex min-h-14 items-center gap-3 border bg-background px-3 py-2">
      <span className="flex size-8 shrink-0 items-center justify-center bg-muted text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="block break-all font-medium text-foreground">
          {value}
        </span>
      </span>
    </span>
  );
}
