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
import { PR43_EXAMPLE } from "@/features/examples/lib/pr-43-example";

export type PipelineStage = 0 | 1 | 2;

const outputs: Array<{ label: string; Icon: ComponentType }> = [
  { label: "X post", Icon: XIcon },
  { label: "LinkedIn post", Icon: LinkedInIcon },
  { label: "Reddit post", Icon: RedditIcon },
  { label: "Discord post", Icon: DiscordIcon },
];

// Output rows light top to bottom with shrinking gaps (a wave, not a queue).
const OUTPUT_DELAYS = [0, 70, 120, 160];

const status: Record<PipelineStage, string> = {
  0: "Waiting for a link",
  1: "Reading the diff",
  2: "Posts ready",
};

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

/**
 * GitHub link → GitLoud → four outputs, drawn in HTML so it fills the column.
 * `stage` null renders the finished state (paused / reduced motion).
 */
export function PipelineFigure({ stage }: { stage: PipelineStage | null }) {
  const at = (s: PipelineStage) => stage === null || stage >= s;
  const sourceLit = at(0);
  const engineLit = at(1);
  const outputsLit = at(2);

  return (
    <div
      className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,0.8fr)_3rem_minmax(0,1fr)] md:gap-0"
      aria-hidden="true"
    >
      {/* Source: the pull request */}
      <Keycap lit={sourceLit} className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GithubIconIcon className="size-4 text-foreground" />
          <span className="font-mono">Pull request #{PR43_EXAMPLE.number}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-foreground">
          feat: add WebAuthn (Passkey) support for biometric authentication
        </p>
      </Keycap>

      {/* Connector 1: the PR token travels to GitLoud */}
      <Connector active={engineLit} direction="horizontal">
        <span
          className={cn(
            "absolute top-1/2 h-0.5 w-10 -translate-y-1/2 rounded-full bg-linear-to-r from-transparent to-primary transition-[left,opacity] duration-700 ease-out max-md:left-1/2 max-md:h-10 max-md:w-0.5 max-md:-translate-x-1/2 max-md:bg-linear-to-b",
            engineLit ? "md:left-[calc(100%-2.5rem)]" : "md:left-0",
            stage === 1 || stage === null ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="absolute -right-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-primary max-md:top-auto max-md:-bottom-0.5 max-md:left-1/2 max-md:-translate-x-1/2 max-md:translate-y-0" />
        </span>
      </Connector>

      {/* GitLoud */}
      <Keycap
        lit={engineLit}
        className="flex flex-col items-center justify-center px-4 py-5 text-center"
      >
        <span className="flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-primary">
          <AppLogo className="size-4" />
          GITLOUD
        </span>
        <span
          className="mt-2 block text-xs text-muted-foreground"
          aria-live="polite"
        >
          {status[stage ?? 2]}
        </span>
      </Keycap>

      {/* Connector 2: fans out to the outputs */}
      <Connector active={outputsLit} direction="fan" />

      {/* Outputs */}
      <ul className="grid gap-2 max-md:grid-cols-2">
        {outputs.map(({ label, Icon }, index) => {
          const delay = {
            transitionDelay: outputsLit ? `${OUTPUT_DELAYS[index]}ms` : "0ms",
          };

          return (
            <li key={label}>
              <Keycap lit={outputsLit} style={delay} className="px-3 py-2.5">
                <span className="flex items-center gap-3 [&_svg]:size-4">
                  <Icon />
                  <span className="flex-1 text-sm text-foreground">
                    {label}
                  </span>
                  <Check
                    style={delay}
                    className={cn(
                      "size-4 text-primary transition-opacity duration-300",
                      outputsLit ? "opacity-100" : "opacity-0",
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

// A hairline with a yellow fill that draws when active. Horizontal on
// desktop, vertical between stacked parts on phones.
function Connector({
  active,
  direction,
  children,
}: {
  active: boolean;
  direction: "horizontal" | "fan";
  children?: ReactNode;
}) {
  return (
    <div className="relative mx-auto h-8 w-px md:h-px md:w-full">
      <span className="absolute inset-0 bg-border" />
      <span
        className={cn(
          "absolute inset-0 origin-top bg-primary transition-transform ease-out md:origin-left",
          direction === "fan" ? "duration-400" : "duration-600",
          active ? "scale-100" : "max-md:scale-y-0 md:scale-x-0",
        )}
      />
      {children}
    </div>
  );
}
