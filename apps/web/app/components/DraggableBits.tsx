"use client";

import { motion } from "framer-motion";

const bits = [
  { label: "git", className: "left-[20%] top-[20%]", icon: "git", move: [8, -14] },
  {
    label: "GitHub",
    className: "right-[28%] top-[14%]",
    icon: "github",
    move: [-10, 10],
  },
  {
    label: "Discord",
    className: "left-[10%] bottom-[34%]",
    social: "discord",
    move: [14, 8],
  },
  { label: "X", className: "right-[8%] bottom-[34%]", social: "x", move: [-8, 14] },
  {
    label: "LinkedIn",
    className: "left-[28%] bottom-[10%]",
    social: "linkedin",
    move: [12, -8],
  },
  {
    label: "Reddit",
    className: "right-[28%] bottom-[8%]",
    social: "reddit",
    move: [-14, -8],
  },
];

export function DraggableBits() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-6 overflow-visible sm:inset-10"
    >
      {bits.map((bit, index) => (
        <motion.div
          key={bit.label}
          drag
          dragMomentum={false}
          animate={{
            x: [0, bit.move[0], 0],
            y: [0, bit.move[1], 0],
          }}
          transition={{
            duration: 5 + index * 0.35,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          whileDrag={{ scale: 1.08, transition: { duration: 0.1 } }}
          className={[
            "pointer-events-auto absolute flex size-10 cursor-grab select-none items-center justify-center rounded-md border bg-card text-xs font-semibold text-muted-foreground shadow-sm active:cursor-grabbing",
            bit.className,
          ].join(" ")}
        >
          {bit.icon === "git" ? (
            <GitIcon />
          ) : bit.icon === "github" ? (
            <GitHubIcon />
          ) : bit.social === "x" ? (
            <XIcon />
          ) : bit.social === "linkedin" ? (
            <LinkedInIcon />
          ) : bit.social === "discord" ? (
            <DiscordIcon />
          ) : bit.social === "reddit" ? (
            <RedditIcon />
          ) : (
            bit.label
          )}
        </motion.div>
      ))}
    </div>
  );
}

function GitIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 overflow-visible text-[#F05032]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M23.55 10.93 13.06.45a1.55 1.55 0 0 0-2.19 0L8.69 2.63l2.76 2.76a1.84 1.84 0 0 1 2.33 2.35l2.66 2.66a1.84 1.84 0 1 1-1.1 1.04l-2.48-2.48v6.53a1.84 1.84 0 1 1-1.5-.05V8.85a1.84 1.84 0 0 1-.99-2.41L7.65 3.72.45 10.92a1.55 1.55 0 0 0 0 2.19l10.49 10.48a1.55 1.55 0 0 0 2.19 0l10.42-10.42a1.55 1.55 0 0 0 0-2.24Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 overflow-visible text-black dark:text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.78c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 overflow-visible text-black dark:text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.9 2h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.3L6.4 20H3.3l7.3-8.4L3 2h6.5l4.4 5.7L18.9 2Zm-1.1 16.2h1.7L8.6 3.7H6.8l11 14.5Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 overflow-visible text-[#5865F2]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19.54 5.34A16.2 16.2 0 0 0 15.6 4.1l-.19.38a14.8 14.8 0 0 1 3.47 1.74 11.3 11.3 0 0 0-4.21-1.32 12 12 0 0 0-5.35 0 11.4 11.4 0 0 0-4.22 1.32A14.8 14.8 0 0 1 8.58 4.5l-.18-.4a16.2 16.2 0 0 0-3.95 1.24C1.95 9.1 1.27 12.75 1.6 16.35a16 16 0 0 0 4.85 2.46l.97-1.58a10.4 10.4 0 0 1-1.53-.73l.36-.28c2.95 1.38 6.13 1.38 9.04 0l.36.28c-.49.29-1 .53-1.53.73l.97 1.58a16 16 0 0 0 4.86-2.46c.4-4.18-.68-7.8-2.4-11.01ZM8.25 14.13c-.94 0-1.7-.86-1.7-1.92s.74-1.92 1.7-1.92c.95 0 1.72.87 1.7 1.92 0 1.06-.75 1.92-1.7 1.92Zm7.5 0c-.94 0-1.7-.86-1.7-1.92s.75-1.92 1.7-1.92c.96 0 1.72.87 1.7 1.92 0 1.06-.74 1.92-1.7 1.92Z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 overflow-visible text-[#FF4500]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21 11.5a2.5 2.5 0 0 0-4.23-1.8 10.4 10.4 0 0 0-4.1-1.02l.7-3.3 2.32.5a1.9 1.9 0 1 0 .17-.8l-2.77-.59a.43.43 0 0 0-.5.33l-.82 3.85a10.5 10.5 0 0 0-4.54 1.03A2.5 2.5 0 1 0 4.5 13.8c-.03.18-.05.37-.05.56 0 3.13 3.4 5.67 7.55 5.67s7.55-2.54 7.55-5.67c0-.19-.02-.38-.05-.56A2.5 2.5 0 0 0 21 11.5ZM8.75 13.45a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm6.16 3.43c-.82.82-2.37.88-2.91.88s-2.09-.06-2.91-.88a.45.45 0 0 1 .64-.64c.52.52 1.66.62 2.27.62s1.75-.1 2.27-.62a.45.45 0 1 1 .64.64Zm.34-3.43a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 overflow-visible text-[#0A66C2]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6.94 8.98H3.72V20h3.22V8.98ZM5.33 7.48a1.86 1.86 0 1 0 0-3.72 1.86 1.86 0 0 0 0 3.72ZM20.28 20h-3.21v-5.36c0-1.28-.03-2.93-1.78-2.93-1.79 0-2.06 1.4-2.06 2.84V20h-3.21V8.98h3.08v1.5h.04c.43-.81 1.48-1.67 3.04-1.67 3.25 0 3.86 2.14 3.86 4.93V20h.24Z" />
    </svg>
  );
}
