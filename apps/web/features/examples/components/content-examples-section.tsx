"use client";

import type { ReactNode } from "react";
import { DashboardGetStartedButton } from "@/components/DashboardGetStartedButton";
import { Button } from "@repo/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { ArrowDown, ArrowRight, Clipboard, Share2 } from "lucide-react";
import {
  DiscordIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
} from "@/components/icons/social-icons";
import { cn } from "@repo/ui/lib/utils";
import { TypingText } from "@/features/examples/components/typing-text";
import { PR43_EXAMPLE } from "@/features/examples/lib/pr-43-example";

const actionButtons = [
  {
    key: "copy",
    icon: <Clipboard className="size-4" />,
    title: "Copy content",
  },
  { key: "twitter", icon: <XIcon />, title: "Share on X" },
  { key: "linkedIn", icon: <LinkedInIcon />, title: "Share on LinkedIn" },
  { key: "reddit", icon: <RedditIcon />, title: "Share on Reddit" },
  { key: "discord", icon: <DiscordIcon />, title: "Open Discord" },
  {
    key: "share",
    icon: <Share2 className="size-4" />,
    title: "Share with another app",
  },
];

export function ContentExamplesSection({ children }: { children?: ReactNode }) {
  return (
    <>
      <section className="px-4 pb-20 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="mx-auto mt-2 max-w-5xl rounded-sm border border-border bg-card p-4 font-mono">
            <div className="flex items-center gap-1 mb-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                For <ArrowRight size={14} className="mt-0.25" />
              </span>{" "}
              <span className="mt-0.5">PULL REQUEST #43</span>
            </div>
            <div className="text-sm font-semibold leading-relaxed text-foreground">
              feat: add WebAuthn (Passkey) support for biometric authentication
              (#43)
            </div>
          </div>
          <h2 className="mt-6 flex items-center gap-2 text-lg tracking-normal text-foreground">
            Generated Content below
            <span>
              <ArrowDown size={16} />
            </span>
          </h2>
          <Accordion
            type="multiple"
            defaultValue={["short-summary", "changelog-entry"]}
            className="grid items-start gap-4 md:grid-cols-2"
          >
            <MockContentBlock
              valueKey="short-summary"
              title="Short summary"
              value={PR43_EXAMPLE.shortSummary}
            />

            <MockContentBlock
              valueKey="changelog-entry"
              title="Changelog entry"
              value={PR43_EXAMPLE.changelogEntry}
            />
          </Accordion>
        </div>
      </section>

      {children}

      <div className="h-px bg-border w-full" />

      <section className="px-4 py-16 sm:px-6 lg:px-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ready to{" "}
            <span
              className={cn(
                "after:rotate-8 after:-skew-8 after:absolute after:bg-primary after:-z-10 after:inset-0 after:content-[''] after:w-full after:h-full",
                "text-center inline-block relative z-10",
              )}
            >
              generate yours?
            </span>{" "}
          </h2>
          <p className="text-base text-muted-foreground">
            GitLoud generates many formats including X posts, LinkedIn updates,
            Discord alerts, portfolio bullets, and release changelogs. Create
            yours and see all of them in one place!
          </p>
          <div className="flex justify-center pt-2">
            <DashboardGetStartedButton />
          </div>
        </div>
      </section>
    </>
  );
}

function MockContentBlock({
  valueKey,
  title,
  value,
}: {
  valueKey: string;
  title: string;
  value: string;
}) {
  return (
    <AccordionItem
      value={valueKey}
      className="border bg-card px-5 text-card-foreground shadow-2xl shadow-primary/5 last:border-b"
    >
      <AccordionTrigger className="uppercase text-[17px] font-semibold leading-6 hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6 pb-4">
          <div className="min-h-[180px]">
            <TypingText
              key={valueKey}
              text={value}
              duration={5.5}
              className="whitespace-pre-wrap wrap-break-word text-base leading-7 text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {actionButtons.map((btn) => (
              <Button
                key={btn.key}
                variant="ghost"
                size="sm"
                className="size-9 border-0 bg-transparent p-0 shadow-xs hover:bg-muted rounded-[3px] flex items-center justify-center disabled:pointer-events-auto disabled:cursor-not-allowed"
                title={btn.title}
                disabled
              >
                {btn.icon}
              </Button>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
