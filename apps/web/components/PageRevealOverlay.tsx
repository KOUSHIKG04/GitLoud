"use client";

import { LiquidEther } from "@repo/ui/components/liquid-ether";
import { useEffect, useState } from "react";

export function PageRevealOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none fixed inset-0 z-40 bg-background transition-all duration-700 ease-out",
        isVisible ? "opacity-100 blur-0" : "opacity-0 blur-sm",
      ].join(" ")}
    >
      <LiquidEther className="fixed inset-0 opacity-80" />
    </div>
  );
}
