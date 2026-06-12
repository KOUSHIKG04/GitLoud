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
        <SidebarInset className="min-h-dvh bg-transparent">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-border px-4">
            <div className="bg-card">
              <SidebarTrigger className="rounded-none" />
            </div>
            <div className="min-w-0 sm:hidden">
              <p className="truncate text-xs text-muted-foreground">
                {mobileHeaderTitle}
              </p>
            </div>
          </header>
          <main className="min-h-[calc(100dvh-3.5rem)] [&_button]:rounded-none [&_input]:rounded-none [&_textarea]:rounded-none">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
