"use client";

import { DotmSquare4 } from "@repo/ui/components/dotm-square-4";
import { cn } from "@/lib/utils";

interface DotMatrixLoaderProps {
  className?: string;
  size?: number;
  dotSize?: number;
  color?: string;
  label?: string;
}

export function DotMatrixLoader({
  className,
  size = 30,
  dotSize = 6,
  color = "var(--primary)",
  label = "Loading...",
}: DotMatrixLoaderProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <DotmSquare4 color={color} size={size} dotSize={dotSize} />
    </div>
  );
}
