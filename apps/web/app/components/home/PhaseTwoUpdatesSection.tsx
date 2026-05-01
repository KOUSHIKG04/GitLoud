"use client";

import { motion } from "framer-motion";

const updates = [
  "Private repositories",
  "GitHub App access",
  "Edit and save",
  "Version history",
  "Sentry monitoring",
  "Background jobs",
  "Notifications",
  "Mobile app",
];

export function PhaseTwoUpdatesSection() {
  return (
    <section className="overflow-hidden border-t bg-background px-4 py-16 sm:px-6 lg:px-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="grid gap-4 lg:grid-cols-[0.7fr_1.1fr] lg:items-end">
          <div className="space-y-3">
            <p className="text-sm font-semibold">PHASE 2 UPDATES</p>
            <h2 className="relative inline-block max-w-md text-xl font-bold tracking-tight text-muted-foreground sm:text-2xl">
              Private repo support soon!
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-r from-foreground via-chart-2 to-foreground bg-clip-text text-transparent"
                animate={{
                  clipPath: [
                    "inset(0 100% 0 0)",
                    "inset(0 0% 0 0)",
                    "inset(0 0% 0 0)",
                    "inset(0 100% 0 0)",
                  ],
                }}
                transition={{
                  duration: 3.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.4,
                }}
              >
                Private repo support soon!
              </motion.span>
            </h2>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            GitLoud currently supports public GitHub links. Phase 2 starts with
            private repository access through GitHub App permissions, then adds
            editing, saved drafts, monitoring, automation, and mobile workflows.
          </p>
        </div>

        <div className="bg-background py-5">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 28,
              ease: "linear",
              repeat: Infinity,
            }}
            className="flex w-max items-center gap-4 whitespace-nowrap"
          >
            {[...updates, ...updates].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wide text-card-foreground shadow-sm sm:text-sm"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
