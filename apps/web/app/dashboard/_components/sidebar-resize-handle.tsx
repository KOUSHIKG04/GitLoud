"use client";

import { useSidebar } from "@repo/ui/components/sidebar";
import { useRef, type PointerEvent } from "react";

export const DEFAULT_SIDEBAR_WIDTH = 256;
export const MIN_SIDEBAR_WIDTH = 208;
export const MAX_SIDEBAR_WIDTH = 384;
export const SIDEBAR_WIDTH_STORAGE_KEY = "gitloud-sidebar-width";

function startResize(event: PointerEvent<HTMLButtonElement>) {
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
}

export function SidebarResizeHandle({
  onResize,
  side = "left",
}: {
  onResize: (width: number) => void;
  side?: "left" | "right";
}) {
  const { isMobile, state } = useSidebar();
  const latestWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);

  if (isMobile || state === "collapsed") {
    return null;
  }

  function resize(event: PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const adjustedX =
      side === "right" ? window.innerWidth - event.clientX : event.clientX;
    const nextWidth = Math.min(
      MAX_SIDEBAR_WIDTH,
      Math.max(MIN_SIDEBAR_WIDTH, adjustedX),
    );

    latestWidthRef.current = nextWidth;
    onResize(nextWidth);
  }

  function stopResize(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    try {
      window.localStorage.setItem(
        SIDEBAR_WIDTH_STORAGE_KEY,
        String(latestWidthRef.current),
      );
    } catch (error) {
      console.warn("Could not persist sidebar width", error);
    }
  }

  return (
    <button
      type="button"
      aria-label="Resize sidebar"
      title="Drag to resize sidebar"
      className={[
        "absolute inset-y-0 z-30 hidden w-2 cursor-col-resize touch-none md:block after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 hover:after:bg-sidebar-ring",
        side === "right" ? "-left-1" : "-right-1",
      ].join(" ")}
      onPointerDown={startResize}
      onPointerMove={resize}
      onPointerUp={stopResize}
      onPointerCancel={stopResize}
    />
  );
}
