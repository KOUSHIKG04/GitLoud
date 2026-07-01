"use client";

import { Header } from "@/components/Header";
import { QuestionMarkIcon } from "../home/GeneratorSection";
import { motion } from "motion/react";

export function AuthShell({
  children,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="grid min-h-[calc(100vh-3.5rem)] md:grid-cols-[1fr_1px_1fr]">
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <div className="hidden md:block bg-border" />

        <div className="flex justify-center items-center px-8 md:px-16 py-12 bg-transparent [--pattern-fg:var(--color-gray-950)]/5 dark:[--pattern-fg:var(--color-white)]/10 bg-[repeating-linear-gradient(45deg,var(--pattern-fg),var(--pattern-fg)_1px,transparent_1px,transparent_10px)]">
          <div className="max-w-lg ">
            <div className="flex flex-col gap-8 min-h-36 min-w-50 items-center justify-center bg-background p-3 text-sm leading-6 text-muted-foreground">
              <motion.div
                style={{ perspective: 1000 }}
                animate={{
                  rotateY: [0, 180, 360],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <QuestionMarkIcon size={40} />
              </motion.div>
              {/* <div>Dev --&gt; WIP</div> */}
              <div>W I P</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
