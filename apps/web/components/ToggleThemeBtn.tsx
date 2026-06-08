"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@repo/ui/lib/utils";

export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "size-8 rounded-none p-0",
        showLabel && "h-9 w-full justify-start gap-2 px-2",
        className,
      )}
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
      {showLabel ? (
        <span className="truncate text-sm font-medium" suppressHydrationWarning>
          {isDark ? "Light theme" : "Dark theme"}
        </span>
      ) : null}
    </Button>
  );
}
