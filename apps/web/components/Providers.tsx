"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/lib/theme-provider";

type Theme = "light" | "dark" | "system";

/**
 * Renders third-party provider contexts (QueryClient and Theme) around the application layout.
 *
 * @param props - Element properties.
 * @param props.children - Child elements to wrap.
 * @param props.initialTheme - The default theme to inject.
 * @returns Wrapped component hierarchy.
 */
export function Providers({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
