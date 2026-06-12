"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

export function PaymentsComingSoon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn("block w-full cursor-not-allowed", className)}
            aria-label="Pro is launching globally soon. International payments are currently being activated. Stay tuned."
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8} className="rounded-none">
          Pro is launching globally soon. International payments are currently
          being activated. Stay tuned.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
