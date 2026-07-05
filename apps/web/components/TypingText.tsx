"use client";

import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useState } from "react";

export function TypingText({
  text,
  duration = 2.5,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const progress = useMotionValue(0);

  useMotionValueEvent(progress, "change", (latest) => {
    setDisplayed(text.slice(0, Math.round(latest)));
  });

  useEffect(() => {
    setDisplayed("");
    progress.jump(0);

    const controls = animate(progress, text.length, {
      duration,
      ease: "linear",
    });

    return () => controls.stop();
  }, [text, duration, progress]);

  return (
    <p className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse">▋</span>
      )}
    </p>
  );
}
