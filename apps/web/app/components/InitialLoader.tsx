"use client";

import { GitLoudLoadingLogo } from "@/assest/GitLoudLoadingLogo";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function InitialLoader() {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideTimeout = window.setTimeout(() => {
      setVisible(false);
    }, 3000);

    const unmountTimeout = window.setTimeout(() => {
      setMounted(false);
    }, 3500);

    return () => {
      window.clearTimeout(hideTimeout);
      window.clearTimeout(unmountTimeout);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/70" />
      <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-border/55" />
      <div className="pointer-events-none absolute inset-y-8 left-1/2 w-px bg-border/45" />

      <motion.div
        className="relative flex w-full max-w-sm flex-col items-center px-6 text-center"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.18,
            },
          },
        }}
      >
        <motion.div
          className="gitloud-loader-orbit relative grid size-36 place-items-center sm:size-44"
          variants={{
            hidden: { opacity: 0, scale: 0.88, y: 10 },
            show: {
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.55, ease: "easeOut" },
            },
          }}
        >
          <span className="gitloud-loader-ring gitloud-loader-ring-outer" />
          <span className="gitloud-loader-ring gitloud-loader-ring-inner" />
          <GitLoudLoadingLogo className="gitloud-loading-logo relative z-10 h-24 w-24 drop-shadow-[0_18px_28px_rgba(250,204,21,0.28)] sm:h-28 sm:w-28" />
        </motion.div>

        <motion.div
          className="mt-8 w-full space-y-4"
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: "easeOut" },
            },
          }}
        >
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.28em] text-primary"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.35, ease: "easeOut" },
              },
            }}
          >
            GitLoud
          </motion.p>
          <motion.p
            className="text-2xl font-black uppercase leading-none text-foreground sm:text-4xl"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: "easeOut" },
              },
            }}
          >
            Preparing workspace
          </motion.p>
          <div className="mx-auto h-1 w-44 overflow-hidden rounded-full bg-muted sm:w-56">
            <span className="gitloud-loader-progress block h-full rounded-full bg-primary" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
