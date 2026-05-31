"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useTheme } from "@/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="size-8 rounded-none p-0"
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </Button>
  );
}
