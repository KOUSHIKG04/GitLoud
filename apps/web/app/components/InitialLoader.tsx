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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.div
        className="flex flex-col items-center gap-6 px-4 sm:flex-row sm:gap-9"
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
          variants={{
            hidden: { opacity: 0, x: -28 },
            show: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.45, ease: "easeOut" },
            },
          }}
        >
          <GitLoudLoadingLogo
            size={152}
            className="h-32 w-32 drop-shadow-sm sm:h-40 sm:w-40"
          />
        </motion.div>

        <motion.div
          className="space-y-2 text-center sm:text-left"
          variants={{
            hidden: { opacity: 0, x: 22 },
            show: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.4, ease: "easeOut" },
            },
          }}
        >
          <motion.p
            className="gitloud-loading-title text-2xl font-black uppercase leading-none text-muted-foreground sm:text-4xl"
            variants={{
              hidden: { opacity: 0, x: 14 },
              show: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.4, ease: "easeOut" },
              },
            }}
          >
            Preparing GitLoud
          </motion.p>
          <motion.p
            className="max-w-xs text-sm leading-6 text-muted-foreground sm:text-base"
            variants={{
              hidden: { opacity: 0, x: 14 },
              show: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.4, ease: "easeOut" },
              },
            }}
          >
            Turning code changes into clear updates...
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
