"use client";

import { AppLogo } from "@/assets/AppLogo";

import { UserProfileMenu } from "@/components/UserProfileMenu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import {
  ChevronDown,
  ChevronUp,
  Home,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  dashboardOptions,
  secondaryNavigationItems,
  settingsOptions,
  type DashboardSidebarItem,
} from "./dashboard-navigation";
import { SidebarResizeHandle } from "./sidebar-resize-handle";

export function DashboardSidebar({
  onResize,
}: {
  onResize: (width: number) => void;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const isDashboardActive =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/github-activity") ||
    pathname.startsWith("/dashboard/generations");
  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <Sidebar
      collapsible="icon"
      className="border-border/70 [&_[data-sidebar=group-action]]:rounded-none [&_[data-sidebar=group-label]]:rounded-none [&_[data-sidebar=menu-action]]:rounded-none [&_[data-sidebar=menu-button]]:rounded-none [&_[data-sidebar=menu-sub-button]]:rounded-none"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip={getSidebarTooltip("GitLoud")}
            >
              <Link href="/dashboard">
                <span className="flex size-8 shrink-0 items-center justify-center bg-transparent">
                  <AppLogo className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">GitLoud</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={getSidebarTooltip("Landing Page")}
                >
                  <Link href="/">
                    <Home />
                    <span>Landing Page</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-1">
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {state === "collapsed" ? (
                dashboardOptions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive(pathname)}
                        tooltip={getSidebarTooltip(item.label)}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isDashboardActive}
                    tooltip={getSidebarTooltip("Get Generated")}
                    onClick={() => setDashboardOpen((open) => !open)}
                    className="bg-transparent hover:bg-sidebar-accent data-active:bg-transparent data-active:font-normal data-active:text-sidebar-foreground"
                  >
                    <LayoutDashboard />
                    <span>Get Generated</span>
                    <ChevronDown
                      className={[
                        "ms-auto transition-transform group-data-[collapsible=icon]:hidden",
                        dashboardOpen ? "rotate-180" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  </SidebarMenuButton>
                  {dashboardOpen ? (
                    <DashboardOptionsSubmenu
                      items={dashboardOptions}
                      pathname={pathname}
                    />
                  ) : null}
                </SidebarMenuItem>
              )}

              {secondaryNavigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive(pathname)}
                      tooltip={getSidebarTooltip(item.label)}
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
        <SidebarMenu>
          {state === "collapsed" ? (
            settingsOptions.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive(pathname)}
                    tooltip={getSidebarTooltip(item.label)}
                  >
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })
          ) : (
            <SidebarMenuItem className="flex flex-col-reverse">
              <SidebarMenuButton
                isActive={isSettingsActive}
                tooltip={getSidebarTooltip("Settings")}
                onClick={() => setSettingsOpen((open) => !open)}
                className="bg-transparent hover:bg-sidebar-accent data-active:bg-transparent data-active:font-normal data-active:text-sidebar-foreground"
              >
                <Settings />
                <span>Settings</span>
                <ChevronUp
                  className={[
                    "ms-auto transition-transform group-data-[collapsible=icon]:hidden",
                    settingsOpen ? "" : "rotate-180",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </SidebarMenuButton>
              {settingsOpen ? (
                <DashboardOptionsSubmenu
                  items={settingsOptions}
                  pathname={pathname}
                  className="mb-1 mt-0"
                />
              ) : null}
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        <div className="flex w-full items-center gap-2 group-data-[collapsible=icon]:flex-col">
          <UserProfileMenu
            accountMenu
            className="h-9 w-0 min-w-0 flex-1 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:flex-none"
          />
        </div>
      </SidebarFooter>
      <SidebarResizeHandle onResize={onResize} side="left" />
    </Sidebar>
  );
}

function getSidebarTooltip(label: string) {
  return {
    children: label,
    sideOffset: 8,
    className: "rounded-none",
  };
}

function DashboardOptionsSubmenu({
  items,
  pathname,
  className,
}: {
  items: DashboardSidebarItem[];
  pathname: string;
  className?: string;
}) {
  return (
    <SidebarMenuSub className={className ?? "mt-1"}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <SidebarMenuSubItem key={item.href}>
            <SidebarMenuSubButton asChild isActive={item.isActive(pathname)}>
              <Link href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </SidebarMenuSub>
  );
}
