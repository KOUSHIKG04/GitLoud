"use client";

import { DashboardGetStartedButton } from "../DashboardGetStartedButton";
import { Button } from "@repo/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Clipboard, Share2, ArrowRight } from "lucide-react";
import {
  DiscordIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
} from "@/assets/social-icons";
import { cn } from "@/lib/utils";

const MOCK_CONTENT = {
  shortSummary:
    "Summary:\nThis pull request adds passkey (WebAuthn) authentication support to the application. It integrates the @simplewebauthn library, adds database schema changes to store credential public keys, and introduces API endpoints for credential registration and verification. This enables biometric logins like FaceID and TouchID alongside the existing passwordless email authentication.",
  changelogEntry:
    "### Added\n- Support for Passkey (WebAuthn) biometric authentication (FaceID, TouchID, Windows Hello).\n- Database schema updates for secure cryptographic credential storage.\n- API endpoints for registration and login challenges and verification.\n- User interface elements to register/sign in using passkeys.",
};

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

export function ContentExamplesSection() {
  return (
    <>
      <section className="px-4  pb-20 sm:px-6 lg:px-20">
        <div className="mx-auto max-w-6xl space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            GENERATED CONTENT
          </h2>

          <div className="tracking-tighter mx-auto max-w-5xl bg-card border border-border p-4 mt-2 font-mono text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            <span className="text-foreground font-semibold block mb-1">
              <p className="flex items-center gap-2 ">
                <span className="text-muted-foreground text-sm tracking-tight">
                  PULL REQUEST #43
                </span>
              </p>
              feat: add WebAuthn (Passkey) support for biometric authentication
              (#43)
            </span>
          </div>

          <Accordion
            type="multiple"
            defaultValue={["short-summary", "changelog-entry"]}
            className="grid items-start gap-4 md:grid-cols-2"
          >
            <MockContentBlock
              valueKey="short-summary"
              title="Short summary"
              value={MOCK_CONTENT.shortSummary}
            />

            <MockContentBlock
              valueKey="changelog-entry"
              title="Changelog entry"
              value={MOCK_CONTENT.changelogEntry}
            />
          </Accordion>
        </div>
      </section>

      <div className="h-px bg-border w-full" />

      <section className="px-4 py-16 sm:px-6 lg:px-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to{" "}
            <span
              className={cn(
                "after:-rotate-8 after:skew-8 after:absolute after:bg-primary after:-z-10 after:inset-0 after:content-[''] after:w-full after:h-full",
                "text-center tracking-tight inline-block relative z-10",
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
      className="tracking-tighter border bg-card px-5 text-card-foreground shadow-sm"
    >
      <AccordionTrigger className="uppercase  text-[17px] font-semibold leading-6 hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6 pb-4">
          <p className="min-h-[180px] whitespace-pre-wrap wrap-break-word text-base leading-7 text-muted-foreground">
            {value}
          </p>

          <div className="flex flex-wrap gap-2">
            {actionButtons.map((btn) => (
              <Button
                key={btn.key}
                variant="outline"
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
