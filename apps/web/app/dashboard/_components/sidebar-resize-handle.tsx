"use client";

import { useSidebar } from "@repo/ui/components/sidebar";
import { useRef, type PointerEvent } from "react";

export const DEFAULT_SIDEBAR_WIDTH = 256;
export const MIN_SIDEBAR_WIDTH = 208;
export const MAX_SIDEBAR_WIDTH = 384;
export const SIDEBAR_WIDTH_STORAGE_KEY = "gitloud-sidebar-width";

export function SidebarResizeHandle({
  onResize,
}: {
  onResize: (width: number) => void;
}) {
  const { isMobile, state } = useSidebar();
  const latestWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);

  if (isMobile || state === "collapsed") {
    return null;
  }

  function startResize(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function resize(event: PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const nextWidth = Math.min(
      MAX_SIDEBAR_WIDTH,
      Math.max(MIN_SIDEBAR_WIDTH, event.clientX),
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
    window.localStorage.setItem(
      SIDEBAR_WIDTH_STORAGE_KEY,
      String(latestWidthRef.current),
    );
  }

  return (
    <button
      type="button"
      aria-label="Resize sidebar"
      title="Drag to resize sidebar"
      className="absolute inset-y-0 -right-1 z-30 hidden w-2 cursor-col-resize touch-none md:block after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 hover:after:bg-sidebar-ring"
      onPointerDown={startResize}
      onPointerMove={resize}
      onPointerUp={stopResize}
      onPointerCancel={stopResize}
    />
  );
}
