"use client";

import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef } from "react";

export function TypingText({
  text,
  duration = 2.5,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) {
  const progress = useMotionValue(0);
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(progress, "change", (latest) => {
    const round = Math.round(latest);
    if (textRef.current) {
      textRef.current.textContent = text.slice(0, round);
    }
    if (cursorRef.current) {
      cursorRef.current.style.display = round < text.length ? "inline" : "none";
    }
  });

  useEffect(() => {
    progress.jump(0);
    if (textRef.current) {
      textRef.current.textContent = "";
    }
    if (cursorRef.current) {
      cursorRef.current.style.display = "inline";
    }

    const controls = animate(progress, text.length, {
      duration,
      ease: "linear",
    });

    return () => controls.stop();
  }, [text, duration, progress]);

  return (
    <p className={className}>
      <span ref={textRef} />
      <span ref={cursorRef} className="animate-pulse">▋</span>
    </p>
  );
}
