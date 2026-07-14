"use client";

import { useEffect, useRef, useState } from "react";

export function ResponsiveTitle({ title }: { title: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [displayTitle, setDisplayTitle] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const getDisplayTitle = () => {
      const maxWidth = parent.clientWidth;
      if (maxWidth === 0) {
        return title;
      }

      // 1. Get the computed font styles of the container to measure accurately
      const computedStyle = window.getComputedStyle(container);
      const font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
      context.font = font;

      // 2. Measure full title width synchronously using canvas context
      const fullWidth = context.measureText(title).width;

      // If it fits inside the true client width, show the full title
      if (fullWidth <= maxWidth) {
        return title;
      }

      const titleCodePoints = Array.from(title);
      // 3. Binary search to find the maximum characters that fit within maxWidth
      let low = 0;
      let high = titleCodePoints.length;
      let bestFit = "";

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const testText = titleCodePoints.slice(0, mid).join("") + "...";
        const testWidth = context.measureText(testText).width;

        if (testWidth <= maxWidth) {
          bestFit = testText;
          low = mid + 1; // Try to fit more characters
        } else {
          high = mid - 1; // Fit fewer characters
        }
      }

      return bestFit || titleCodePoints.slice(0, 5).join("") + "...";
    };

    const updateTruncation = () => {
      setDisplayTitle(getDisplayTitle());
    };

    // Run initial truncation calculation
    updateTruncation();

    // 4. Set up ResizeObserver on the parent container.
    const resizeObserver = new ResizeObserver(() => {
      updateTruncation();
    });
    
    resizeObserver.observe(parent);

    return () => {
      resizeObserver.disconnect();
    };
  }, [title]);

  return (
    <span
      ref={containerRef}
      className="block w-full whitespace-nowrap overflow-hidden text-foreground font-normal tracking-tighter"
      title={title}
      suppressHydrationWarning
    >
      {displayTitle}
    </span>
  );
}
