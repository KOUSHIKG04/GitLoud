"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { usePathname } from "next/navigation";
import { type CSSProperties, type ReactNode } from "react";
import { useDashboardSidebarWidth } from "../_hooks/use-dashboard-sidebar-width";
import { DashboardSidebar } from "./dashboard-sidebar";
import { getDashboardHeaderTitle } from "./dashboard-navigation";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setSidebarWidth, sidebarWidth } = useDashboardSidebarWidth();
  const mobileHeaderTitle = getDashboardHeaderTitle(pathname);

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": `${sidebarWidth}px`,
          } as CSSProperties
        }
      >
        <DashboardSidebar onResize={setSidebarWidth} />
        <SidebarInset className="min-h-dvh bg-transparent min-w-0 w-full">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-border px-4">
            <div className="rounded-sm bg-card">
              <SidebarTrigger className="rounded-sm" />
            </div>
            <div className="min-w-0 sm:hidden">
              <p className="truncate text-xs text-muted-foreground">
                {mobileHeaderTitle}
              </p>
            </div>
          </header>
          <main
            data-dashboard-shell
            className="min-h-[calc(100dvh-3.5rem)] min-w-0 w-full [&[data-dashboard-shell]_button]:rounded-sm [&[data-dashboard-shell]_input]:rounded-sm [&[data-dashboard-shell]_textarea]:rounded-sm"
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
