"use client";

import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import { GitPullRequest } from "lucide-react";
import { LazyMotion, domAnimation, m } from "motion/react";
import type { ReactNode } from "react";
import {
  DiscordIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
} from "@/assets/social-icons";

const OUTPUT_ROUTE_DURATION = 2.4;
const OUTPUT_SEQUENCE_DURATION = OUTPUT_ROUTE_DURATION * 4;

interface AnimatedPathProps {
  d: string;
  delay?: number;
}

function AnimatedPath({ d, delay = 0 }: AnimatedPathProps) {
  return (
    <>
      <path
        d={d}
        className="stroke-border"
        strokeWidth="1"
        strokeLinecap="round"
        markerEnd="url(#workflow-arrow)"
      />
      <path
        d={d}
        className="stroke-primary"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="0.055 0.945"
        opacity="0"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-0.945;-0.945"
          keyTimes="0;0.25;1"
          begin={`${delay}s`}
          dur={`${OUTPUT_SEQUENCE_DURATION}s`}
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;0.008;0.245;0.25;1"
          begin={`${delay}s`}
          dur={`${OUTPUT_SEQUENCE_DURATION}s`}
          repeatCount="indefinite"
        />
      </path>
    </>
  );
}

export function WorkflowDiagram() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative mt-8 w-full select-none overflow-hidden border-border/70 ">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 "
        />

        <div className="relative pt-3 sm:px-5 sm:pt-5">
          <WorkflowDiagramDesktop />
          <WorkflowDiagramMobile />
        </div>
      </div>
    </LazyMotion>
  );
}

function WorkflowMarker() {
  return (
    <defs>
      <marker
        id="workflow-arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="hsl(var(--primary))" />
      </marker>
    </defs>
  );
}

function WorkflowDiagramDesktop() {
  return (
    <div className="relative hidden w-full md:block">
      <svg
        className="pointer-events-none block h-auto w-full -translate-x-4 lg:-translate-x-6"
        viewBox="0 0 800 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <WorkflowMarker />

        <path
          d="M 92 200 L 220 200"
          className="stroke-border"
          strokeWidth="1"
          strokeLinecap="round"
          markerEnd="url(#workflow-arrow)"
        />

        <AnimatedPath
          d="M 380 200 H 468 Q 478 200 478 190 V 60 Q 478 50 488 50 H 700"
          delay={0}
        />
        <AnimatedPath
          d="M 380 200 H 468 Q 478 200 478 190 V 160 Q 478 150 488 150 H 700"
          delay={OUTPUT_ROUTE_DURATION}
        />
        <AnimatedPath
          d="M 380 200 H 468 Q 478 200 478 210 V 240 Q 478 250 488 250 H 700"
          delay={OUTPUT_ROUTE_DURATION * 2}
        />
        <AnimatedPath
          d="M 380 200 H 468 Q 478 200 478 210 V 340 Q 478 350 488 350 H 700"
          delay={OUTPUT_ROUTE_DURATION * 3}
        />

        <foreignObject x="32" y="170" width="60" height="60">
          <SourceNode />
        </foreignObject>

        <foreignObject x="92" y="192" width="128" height="16">
          <m.div
            className="flex items-center text-primary"
            animate={{ x: [0, 112] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1.6 }}
          >
            <GitPullRequest className="size-4" />
          </m.div>
        </foreignObject>

        <foreignObject x="220" y="166" width="160" height="68">
          <GitLoudNode />
        </foreignObject>

        <foreignObject x="700" y="20" width="60" height="60">
          <PlatformNode label="Reddit">
            <RedditIcon />
          </PlatformNode>
        </foreignObject>
        <foreignObject x="700" y="120" width="60" height="60">
          <PlatformNode label="X">
            <XIcon />
          </PlatformNode>
        </foreignObject>
        <foreignObject x="700" y="220" width="60" height="60">
          <PlatformNode label="LinkedIn">
            <LinkedInIcon />
          </PlatformNode>
        </foreignObject>
        <foreignObject x="700" y="320" width="60" height="60">
          <PlatformNode label="Discord">
            <DiscordIcon />
          </PlatformNode>
        </foreignObject>
      </svg>
    </div>
  );
}

function WorkflowDiagramMobile() {
  return (
    <div className="relative mx-auto block w-full max-w-[320px] md:hidden">
      <svg
        className="pointer-events-none block h-auto w-full"
        viewBox="0 0 320 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <WorkflowMarker />

        <path
          d="M 160 76 L 160 178"
          className="stroke-border"
          strokeWidth="1"
          strokeLinecap="round"
          markerEnd="url(#workflow-arrow)"
        />

        <foreignObject x="130" y="16" width="60" height="60">
          <SourceNode />
        </foreignObject>

        <foreignObject x="152" y="76" width="16" height="102">
          <m.div
            className="flex justify-center text-primary"
            animate={{ y: [0, 86] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1.6 }}
          >
            <GitPullRequest className="size-4" />
          </m.div>
        </foreignObject>

        <foreignObject x="80" y="178" width="160" height="68">
          <GitLoudNode />
        </foreignObject>

        <AnimatedPath
          d="M 160 246 V 268 Q 160 278 150 278 H 88 Q 78 278 78 288 V 308"
          delay={0}
        />
        <AnimatedPath
          d="M 160 246 V 268 Q 160 278 170 278 H 232 Q 242 278 242 288 V 308"
          delay={OUTPUT_ROUTE_DURATION}
        />
        <AnimatedPath
          d="M 160 246 V 384 Q 160 394 150 394 H 88 Q 78 394 78 404 V 424"
          delay={OUTPUT_ROUTE_DURATION * 2}
        />
        <AnimatedPath
          d="M 160 246 V 384 Q 160 394 170 394 H 232 Q 242 394 242 404 V 424"
          delay={OUTPUT_ROUTE_DURATION * 3}
        />

        <foreignObject x="48" y="308" width="60" height="60">
          <PlatformNode label="Reddit">
            <RedditIcon />
          </PlatformNode>
        </foreignObject>
        <foreignObject x="212" y="308" width="60" height="60">
          <PlatformNode label="X">
            <XIcon />
          </PlatformNode>
        </foreignObject>
        <foreignObject x="48" y="424" width="60" height="60">
          <PlatformNode label="LinkedIn">
            <LinkedInIcon />
          </PlatformNode>
        </foreignObject>
        <foreignObject x="212" y="424" width="60" height="60">
          <PlatformNode label="Discord">
            <DiscordIcon />
          </PlatformNode>
        </foreignObject>
      </svg>
    </div>
  );
}

function SourceNode() {
  return (
    <div className="flex border border-border rounded-sm size-full items-center justify-center bg-background/95 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] ring-1 ring-border/90 [&_svg]:size-5">
      <GithubIconIcon className="text-foreground" />
    </div>
  );
}

function GitLoudNode() {
  return (
    <div className="relative border border-border rounded-sm flex size-full items-center justify-center overflow-hidden bg-background/95 shadow-[0_22px_55px_-28px_hsl(var(--primary)/0.65)] ring-1 ring-primary/35">
      <m.span
        aria-hidden="true"
        className="absolute inset-y-0 w-12 bg-primary/10 blur-lg"
        animate={{ x: [-70, 190] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 2.8 }}
      />
      <span className="relative flex items-center gap-2 text-sm font-semibold tracking-[0.12em] text-primary">
        <span className="size-1.5 bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
        GITLOUD
      </span>
    </div>
  );
}

function PlatformNode({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      aria-label={label}
      className="flex size-full border border-border rounded-sm items-center justify-center bg-background/95 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] ring-1 ring-border/90 transition-colors hover:bg-foreground/5 [&_svg]:size-5"
    >
      {children}
    </div>
  );
}
