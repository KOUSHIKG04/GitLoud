"use client";

import { cn } from "#lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function LiquidEther({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-white dark:bg-background",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_36%,rgba(0,0,0,0.18),transparent_24%),radial-gradient(circle_at_88%_72%,rgba(0,0,0,0.12),transparent_26%),linear-gradient(135deg,#fff_0%,#fff_100%)] dark:bg-[radial-gradient(circle_at_20%_22%,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent_28%),radial-gradient(circle_at_80%_72%,color-mix(in_oklab,var(--muted-foreground)_18%,transparent),transparent_30%),linear-gradient(135deg,color-mix(in_oklab,var(--background)_94%,black)_0%,color-mix(in_oklab,var(--card)_76%,black)_100%)]" />
      <div className="absolute -left-1/4 top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full bg-black/18 blur-3xl opacity-75 animate-[liquid-ether-drift_16s_ease-in-out_infinite] dark:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] dark:opacity-70" />
      <div className="absolute -right-1/4 top-1/3 h-[38rem] w-[38rem] rounded-full bg-black/12 blur-3xl opacity-75 animate-[liquid-ether-drift_18s_ease-in-out_infinite_reverse] dark:h-[36rem] dark:w-[36rem] dark:bg-[color-mix(in_oklab,var(--muted-foreground)_16%,transparent)] dark:opacity-100" />
      <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/10 blur-2xl opacity-65 animate-[liquid-ether-pulse_10s_ease-in-out_infinite] dark:bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)] dark:opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_48%,transparent_0%,rgba(0,0,0,0.08)_72%)] dark:hidden" />
      <div className="absolute inset-0 opacity-[0.09] dark:opacity-[0.07] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute inset-0 dark:bg-[radial-gradient(circle_at_center,transparent_0%,color-mix(in_oklab,var(--background)_72%,black)_76%)]" />
    </div>
  );
}
