"use client";

import { m, LazyMotion, domAnimation } from "motion/react";
import { GitPullRequest } from "lucide-react";
import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import {
  DiscordIcon,
  LinkedInIcon,
  RedditIcon,
  XIcon,
} from "@/assets/social-icons";

export function WorkflowDiagram() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="w-full mt-8 select-none">
        <div className="relative w-full hidden md:block">
          <svg
            className="w-full h-auto pointer-events-none block"
            viewBox="0 0 800 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <marker
                id="arrow"
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

            <path
              d="M 100 200 L 240 200"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />

            <path
              d="M 390 200 L 478 200 L 478 50 L 700 50"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
            <m.path
              d="M 390 200 L 478 200 L 478 50 L 700 50"
              className="stroke-primary opacity-90"
              strokeWidth="2.5"
              strokeDasharray="45 415"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [460, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />
            <m.path
              d="M 390 200 L 478 200 L 478 50 L 700 50"
              stroke="#FFF"
              strokeWidth="1.0"
              strokeDasharray="45 415"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [460, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />

            <path
              d="M 390 200 L 478 200 L 478 150 L 700 150"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
            <m.path
              d="M 390 200 L 478 200 L 478 150 L 700 150"
              className="stroke-primary opacity-90"
              strokeWidth="2.5"
              strokeDasharray="40 320"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [360, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />
            <m.path
              d="M 390 200 L 478 200 L 478 150 L 700 150"
              stroke="#FFF"
              strokeWidth="1.0"
              strokeDasharray="40 320"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [360, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />

            <path
              d="M 390 200 L 478 200 L 478 250 L 700 250"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
            <m.path
              d="M 390 200 L 478 200 L 478 250 L 700 250"
              className="stroke-primary opacity-90"
              strokeWidth="2.5"
              strokeDasharray="40 320"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [360, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />
            <m.path
              d="M 390 200 L 478 200 L 478 250 L 700 250"
              stroke="#FFF"
              strokeWidth="1.0"
              strokeDasharray="40 320"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [360, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />

            <path
              d="M 390 200 L 478 200 L 478 350 L 700 350"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
            <m.path
              d="M 390 200 L 478 200 L 478 350 L 700 350"
              className="stroke-primary opacity-90"
              strokeWidth="2.5"
              strokeDasharray="45 415"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [460, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />
            <m.path
              d="M 390 200 L 478 200 L 478 350 L 700 350"
              stroke="#FFF"
              strokeWidth="1.0"
              strokeDasharray="45 415"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [460, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />

            <foreignObject
              x="50"
              y="175"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="border border-border/80 rounded-none shadow-md w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <GithubIconIcon className="text-foreground" />
              </div>
            </foreignObject>

            <foreignObject
              x="100"
              y="192"
              width="140"
              height="16"
              className="pointer-events-none"
            >
              <m.div
                className="text-primary flex items-center"
                animate={{ x: [0, 124] }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 1.5,
                }}
              >
                <GitPullRequest className="size-4" />
              </m.div>
            </foreignObject>

            <foreignObject
              x="240"
              y="175"
              width="150"
              height="50"
              className="pointer-events-auto"
            >
              <div className="relative w-full h-full">
                <div className="absolute -inset-1 rounded-none bg-neutral-700/50 opacity-10 blur-sm animate-pulse"></div>
                <div className="relative border border-border px-4 py-4 rounded-none flex items-center justify-center w-full h-full">
                  <span className="text-primary text-base tracking-wider font-sans">
                    GitLoud
                  </span>
                </div>
              </div>
            </foreignObject>

            <foreignObject
              x="700"
              y="25"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border/80 rounded-none shadow-md w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <RedditIcon />
              </div>
            </foreignObject>

            <foreignObject
              x="700"
              y="125"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border/80 rounded-none shadow-md w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <XIcon />
              </div>
            </foreignObject>

            <foreignObject
              x="700"
              y="225"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border/80 rounded-none shadow-md w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <LinkedInIcon />
              </div>
            </foreignObject>

            <foreignObject
              x="700"
              y="325"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border/80 rounded-none shadow-md w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <DiscordIcon />
              </div>
            </foreignObject>
          </svg>
        </div>

        <div className="relative w-full max-w-[300px] mx-auto block md:hidden mt-6">
          <svg
            className="w-full h-auto pointer-events-none block"
            viewBox="0 0 300 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 150 70 L 150 180"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />

            <foreignObject
              x="125"
              y="20"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="border border-border/80 rounded-none shadow-md w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <GithubIconIcon className="text-foreground" />
              </div>
            </foreignObject>

            <foreignObject
              x="142"
              y="70"
              width="16"
              height="110"
              className="pointer-events-none"
            >
              <m.div
                className="text-primary flex justify-center"
                animate={{ y: [0, 94] }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 1.5,
                }}
              >
                <GitPullRequest className="size-4" />
              </m.div>
            </foreignObject>

            <foreignObject
              x="90"
              y="180"
              width="120"
              height="80"
              className="pointer-events-auto"
            >
              <div className="relative group w-full h-full">
                <div className="absolute -inset-1 rounded-none bg-neutral-700/50 opacity-10 blur-sm animate-pulse"></div>
                <div className="relative border border-border px-3 py-3 rounded-none flex items-center justify-center shadow-lg w-full h-full">
                  <span className="text-primary text-sm tracking-wider">
                    GitLoud
                  </span>
                </div>
              </div>
            </foreignObject>

            <path
              d="M 150 260 L 150 280 L 75 280 L 75 300"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
            <m.path
              d="M 150 260 L 150 280 L 75 280 L 75 300"
              className="stroke-primary opacity-90"
              strokeWidth="2.5"
              strokeDasharray="20 95"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [115, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.0,
              }}
            />
            <m.path
              d="M 150 260 L 150 280 L 75 280 L 75 300"
              stroke="#FFF"
              strokeWidth="1.0"
              strokeDasharray="20 95"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [115, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.0,
              }}
            />

            <path
              d="M 150 260 L 150 280 L 225 280 L 225 300"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
            <m.path
              d="M 150 260 L 150 280 L 225 280 L 225 300"
              className="stroke-primary opacity-90"
              strokeWidth="2.5"
              strokeDasharray="20 95"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [115, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.0,
              }}
            />
            <m.path
              d="M 150 260 L 150 280 L 225 280 L 225 300"
              stroke="#FFF"
              strokeWidth="1.0"
              strokeDasharray="20 95"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [115, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.0,
              }}
            />

            <path
              d="M 150 260 L 150 380 L 75 380 L 75 400"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
            <m.path
              d="M 150 260 L 150 380 L 75 380 L 75 400"
              className="stroke-primary opacity-90"
              strokeWidth="2.5"
              strokeDasharray="30 185"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [215, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />
            <m.path
              d="M 150 260 L 150 380 L 75 380 L 75 400"
              stroke="#FFF"
              strokeWidth="1.0"
              strokeDasharray="30 185"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [215, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />

            <path
              d="M 150 260 L 150 380 L 225 380 L 225 400"
              className="stroke-primary opacity-15"
              strokeWidth="1.5"
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
            <m.path
              d="M 150 260 L 150 380 L 225 380 L 225 400"
              className="stroke-primary opacity-90"
              strokeWidth="2.5"
              strokeDasharray="30 185"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [215, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />
            <m.path
              d="M 150 260 L 150 380 L 225 380 L 225 400"
              stroke="#FFF"
              strokeWidth="1.0"
              strokeDasharray="30 185"
              strokeLinejoin="miter"
              strokeLinecap="square"
              animate={{ strokeDashoffset: [215, 0] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 2.2,
              }}
            />

            <foreignObject
              x="50"
              y="300"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border/80 rounded-none shadow-sm w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <RedditIcon />
              </div>
            </foreignObject>

            <foreignObject
              x="200"
              y="300"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border/80 rounded-none shadow-sm w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <XIcon />
              </div>
            </foreignObject>

            <foreignObject
              x="50"
              y="400"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border/80 rounded-none shadow-md w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <LinkedInIcon />
              </div>
            </foreignObject>

            <foreignObject
              x="200"
              y="400"
              width="50"
              height="50"
              className="pointer-events-auto"
            >
              <div className="bg-card border border-border/80 rounded-none shadow-md w-full h-full flex items-center justify-center shrink-0 [&_svg]:size-5">
                <DiscordIcon />
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>
    </LazyMotion>
  );
}
