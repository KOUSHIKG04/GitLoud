"use client";

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
      <div className="relative inline-block overflow-hidden text-4xl font-bold uppercase tracking-[0.2em] text-muted-foreground sm:text-6xl">
        <span>LOADING</span>
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden whitespace-nowrap text-foreground"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2.8,
            ease: "easeInOut",
          }}
        >
          LOADING
        </motion.span>
      </div>
    </motion.div>
  );
}
