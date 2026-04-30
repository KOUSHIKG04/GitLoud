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

    function updateEnabled() {
      setEnabled(canHover.matches);
    }

    function updatePosition(event: PointerEvent) {
      cursorX.set(event.clientX - 10);
      cursorY.set(event.clientY - 10);
    }

    updateEnabled();
    canHover.addEventListener("change", updateEnabled);
    window.addEventListener("pointermove", updatePosition);

    return () => {
      canHover.removeEventListener("change", updateEnabled);
      window.removeEventListener("pointermove", updatePosition);
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
