"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useEffect, useSyncExternalStore } from "react";

export function MotionCursor() {
  const enabled = useCursorEnabled();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 28, stiffness: 450 });
  const springY = useSpring(cursorY, { damping: 28, stiffness: 450 });

  useEffect(() => {
    function updatePosition(event: PointerEvent) {
      cursorX.set(event.clientX - 10);
      cursorY.set(event.clientY - 10);
    }

    if (!enabled) return;

    window.addEventListener("pointermove", updatePosition);

    return () => {
      window.removeEventListener("pointermove", updatePosition);
    };
  }, [cursorX, cursorY, enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-100 size-5 rounded-full border border-black bg-black/10 dark:border-primary/80 dark:bg-primary/10 dark:mix-blend-difference"
        style={{
          x: springX,
          y: springY,
        }}
      />
    </LazyMotion>
  );
}

function useCursorEnabled() {
  return useSyncExternalStore(
    subscribeToCursorPreference,
    getCursorPreference,
    () => false,
  );
}

function subscribeToCursorPreference(onStoreChange: () => void) {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  canHover.addEventListener("change", onStoreChange);
  reduceMotion.addEventListener("change", onStoreChange);

  return () => {
    canHover.removeEventListener("change", onStoreChange);
    reduceMotion.removeEventListener("change", onStoreChange);
  };
}

function getCursorPreference() {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  return canHover.matches && !reduceMotion.matches;
}
