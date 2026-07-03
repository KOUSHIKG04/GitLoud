"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleToggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => {
        ready: Promise<void>;
      };
    };

    if (
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    const transition = doc.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            "polygon(110% 0, 100% 0, 100% 100%, 140% 100%)",
            "polygon(-40% 0, 100% 0, 100% 100%, -10% 100%)",
          ],
        },
        {
          duration: 1000,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled
        className={cn(
          "size-8 rounded-xs p-0 opacity-50",
          showLabel && "h-9 w-full justify-start gap-2 px-2",
          className,
        )}
      >
        <div className="size-4" />
        {showLabel ? (
          <span className="truncate text-sm font-medium">Theme</span>
        ) : null}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={handleToggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "border-none size-8 rounded-xs p-0 transition-transform duration-200 active:scale-95",
        showLabel && "h-9 w-full justify-start gap-2 px-2",
        className,
      )}
    >
      <span
        className="relative flex items-center justify-center size-4"
        aria-hidden="true"
      >
        <Sun
          className={cn(
            "size-4 transition-all duration-300 ease-out",
            isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0",
          )}
        />
        <Moon
          className={cn(
            "absolute size-4 transition-all duration-300 ease-out",
            isDark ? "rotate-90 scale-0" : "rotate-0 scale-100",
          )}
        />
      </span>
      {showLabel ? (
        <span className="truncate text-sm font-medium ml-2">
          {isDark ? "Light theme" : "Dark theme"}
        </span>
      ) : null}
    </Button>
  );
}
