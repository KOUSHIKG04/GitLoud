"use client";

import dynamic from "next/dynamic";

export const LazyMotionCursor = dynamic(
  () => import("./MotionCursor").then((module) => module.MotionCursor),
  { ssr: false },
);
