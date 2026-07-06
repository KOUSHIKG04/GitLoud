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
  const [state, setState] = useState(() => ({ text, displayed: "" }));
  const progress = useMotionValue(0);

  const displayed = state.text === text ? state.displayed : "";

  useMotionValueEvent(progress, "change", (latest) => {
    setState({ text, displayed: text.slice(0, Math.round(latest)) });
  });

  useEffect(() => {
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
