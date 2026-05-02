"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function MotionCursor() {
  const [enabled, setEnabled] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 28, stiffness: 450 });
  const springY = useSpring(cursorY, { damping: 28, stiffness: 450 });

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateEnabled() {
      const matches = canHover.matches && !reduceMotion.matches;
      setEnabled(matches);
      if (matches) {
        window.addEventListener("pointermove", updatePosition);
      } else {
        window.removeEventListener("pointermove", updatePosition);
      }
    }

    function updatePosition(event: PointerEvent) {
      cursorX.set(event.clientX - 10);
      cursorY.set(event.clientY - 10);
    }

    updateEnabled();
    canHover.addEventListener("change", updateEnabled);
    reduceMotion.addEventListener("change", updateEnabled);

    return () => {
      window.removeEventListener("pointermove", updatePosition);
      canHover.removeEventListener("change", updateEnabled);
      reduceMotion.removeEventListener("change", updateEnabled);
    };
  }, [cursorX, cursorY]);

  if (!enabled) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] size-5 rounded-full border border-black bg-black/10 dark:border-primary/80 dark:bg-primary/10 dark:mix-blend-difference"
      style={{
        x: springX,
        y: springY,
      }}
    />
  );
}
