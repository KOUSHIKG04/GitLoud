"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/theme-provider";

type Theme = "light" | "dark" | "system";

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
