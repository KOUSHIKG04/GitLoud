import Link from "next/link";
import { format } from "date-fns";
import type { GenerationHistoryItem } from "@repo/shared/generations";
import { getGenerationHistory } from "@/features/generations/lib/generations-api";

const RECENT_COUNT = 5;

function describe(generation: GenerationHistoryItem) {
  const combined = generation.combinedSources ?? [];
  const source = generation.pullRequest ?? generation.commit ?? combined[0];

  if (!source) return null;

  const title =
    generation.sourceType === "COMBINED"
      ? `${combined.length} changes: ${combined[0]?.title ?? "Combined GitHub update"}`
      : generation.sourceType === "PULL_REQUEST" && generation.pullRequest
        ? generation.pullRequest.title
        : (generation.commit?.message ?? "").split("\n")[0];

  const kind =
    generation.sourceType === "COMBINED"
      ? "Combined"
      : generation.sourceType === "PULL_REQUEST"
        ? "Pull request"
        : "Commit";

  return { title, kind, repo: `${source.owner}/${source.repo}` };
}

/**
 * The latest generations under the New box, so reopening a recent result
 * needs no navigation. Renders nothing if history cannot be loaded.
 */
export async function RecentGenerations() {
  let generations: GenerationHistoryItem[];

  try {
    const history = await getGenerationHistory({ page: "1" });
    generations = history.generations.slice(0, RECENT_COUNT);
  } catch {
    return null;
  }

  if (generations.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="recent-heading" className="text-base font-semibold">
          Recent
        </h2>
        <Link
          href="/dashboard/history"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          View all
        </Link>
      </div>

      <ul className="divide-y divide-border rounded-sm border border-border">
        {generations.map((generation) => {
          const info = describe(generation);
          if (!info) return null;

          return (
            <li key={generation.id}>
              <Link
                href={`/dashboard/generations/${generation.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{info.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {info.kind} · {info.repo}
                  </span>
                </span>
                <time
                  dateTime={generation.createdAt}
                  className="shrink-0 text-xs tabular-nums text-muted-foreground"
                >
                  {format(new Date(generation.createdAt), "d MMM")}
                </time>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
