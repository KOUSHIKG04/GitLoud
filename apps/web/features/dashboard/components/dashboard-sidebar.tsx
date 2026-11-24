"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { AppLogo } from "@/components/icons/AppLogo";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { dashboardNavItems } from "@/features/dashboard/lib/dashboard-navigation";
import { SidebarResizeHandle } from "@/features/dashboard/components/sidebar-resize-handle";

export function DashboardSidebar({
  onResize,
}: {
  onResize: (width: number) => void;
}) {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-border/70 **:data-[sidebar=menu-button]:rounded-sm"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip={tooltip("GitLoud home")}
            >
              <Link href="/">
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <AppLogo className="size-5" />
                </span>
                <span className="truncate font-semibold">GitLoud</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardNavItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive(pathname)}
                      tooltip={tooltip(item.label)}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserProfileMenu
          accountMenu
          className="h-9 w-full min-w-0 group-data-[collapsible=icon]:size-8"
        />
      </SidebarFooter>
      <SidebarResizeHandle onResize={onResize} side="left" />
    </Sidebar>
  );
}

function tooltip(label: string) {
  return { children: label, sideOffset: 8, className: "rounded-sm" };
}
