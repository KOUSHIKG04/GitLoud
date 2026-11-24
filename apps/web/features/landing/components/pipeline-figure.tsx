import { Check } from "lucide-react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import {
  DiscordIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
} from "@/components/icons/social-icons";
import { AppLogo } from "@/components/icons/AppLogo";

/** typing: the link types in · reading: GitLoud works · done: posts land. */
export type PipelinePhase = "typing" | "reading" | "done";

export const DEMO_LINK = "github.com/your-org/app/pull/43";

const outputs: Array<{ label: string; Icon: ComponentType }> = [
  { label: "X post", Icon: XIcon },
  { label: "LinkedIn post", Icon: LinkedInIcon },
  { label: "Reddit post", Icon: RedditIcon },
  { label: "Discord post", Icon: DiscordIcon },
];

// Post cards light top to bottom with shrinking gaps (a wave, not a queue).
const OUTPUT_DELAYS = [0, 90, 160, 210];

/**
 * The typing demo: a link types into the pull request card, the GitLoud
 * card lights while it reads the diff, then the four posts light up.
 * `phase` null renders the finished state (paused / reduced motion).
 */
export function PipelineFigure({
  phase,
  typed,
}: {
  phase: PipelinePhase | null;
  typed: number;
}) {
  const finished = phase === null;
  const reading = phase === "reading";
  const done = finished || phase === "done";
  const engineReached = finished || reading || phase === "done";
  const link = finished ? DEMO_LINK : DEMO_LINK.slice(0, typed);
  const typing = phase === "typing";

  return (
    <div
      className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_3rem_auto_3rem_minmax(0,1fr)] md:gap-0"
      aria-hidden="true"
    >
      {/* Source: a link typing into the pull request card */}
      <Keycap lit={typing || finished} className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GithubIconIcon className="size-4 text-foreground" />
          <span>Paste a link</span>
        </div>
        <div className="mt-2 flex h-9 items-center rounded-md border border-white/10 bg-black/40 px-3 font-mono text-xs text-foreground">
          <span className="truncate">{link}</span>
          {typing ? (
            <span className="ml-px inline-block h-4 w-px animate-pulse bg-primary" />
          ) : null}
        </div>
      </Keycap>

      <Connector active={engineReached} />

      {/* GitLoud: just the mark; it lights while reading the diff */}
      <Keycap
        lit={engineReached}
        className="mx-auto flex items-center justify-center px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
          <AppLogo className="size-4" />
          GITLOUD
        </span>
      </Keycap>

      <Connector active={done} />

      {/* Posts: always shown, light up top to bottom when ready */}
      <ul className="grid gap-2 max-md:grid-cols-2">
        {outputs.map(({ label, Icon }, index) => {
          const delay: CSSProperties = {
            transitionDelay:
              done && !finished ? `${OUTPUT_DELAYS[index]}ms` : "0ms",
          };

          return (
            <li key={label}>
              <Keycap lit={done} style={delay} className="px-3 py-2.5">
                <span className="flex items-center gap-3 [&_svg]:size-4">
                  <Icon />
                  <span className="flex-1 text-sm text-foreground">
                    {label}
                  </span>
                  <Check
                    style={delay}
                    className={cn(
                      "size-4 text-primary transition-opacity duration-300",
                      done ? "opacity-100" : "opacity-0",
                    )}
                  />
                </span>
              </Keycap>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Keycap material: lit top edge, dark bottom band for thickness. When a card
// lights it rises with a soft drop shadow, its surface lightens and its
// border sharpens. Neutral only: no yellow edge, glow or underline.
function Keycap({
  lit,
  className,
  style,
  children,
}: {
  lit: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-linear-to-b from-neutral-800 to-neutral-950 transition-[border-color,transform,box-shadow] duration-500 ease-out",
        lit
          ? "-translate-y-1 border-white/25 shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_-4px_0_rgb(0_0_0/0.55),0_10px_24px_-8px_rgb(0_0_0/0.8)]"
          : "border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.1),inset_0_-4px_0_rgb(0_0_0/0.55),0_0_0_0_rgb(0_0_0/0)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        style={style}
        className={cn(
          "pointer-events-none absolute inset-0 bg-white/7 transition-opacity duration-500 ease-out",
          lit ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// A hairline with a yellow fill that draws when active. Horizontal on
// desktop, vertical between stacked parts on phones.
function Connector({ active }: { active: boolean }) {
  return (
    <div className="relative mx-auto h-8 w-px md:h-px md:w-full">
      <span className="absolute inset-0 bg-border" />
      <span
        className={cn(
          "absolute inset-0 origin-top bg-primary transition-transform duration-500 ease-out md:origin-left",
          active ? "scale-100" : "max-md:scale-y-0 md:scale-x-0",
        )}
      />
    </div>
  );
}
