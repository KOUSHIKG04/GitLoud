import type { ComponentType } from "react";
import { History, Plus, Settings } from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
};

// Three destinations, no nesting: make something, find it again, configure.
export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "New generation",
    href: "/dashboard",
    icon: Plus,
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: History,
    isActive: (pathname) =>
      pathname.startsWith("/dashboard/history") ||
      pathname.startsWith("/dashboard/generations"),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    isActive: (pathname) => pathname.startsWith("/dashboard/settings"),
  },
];

export function getDashboardHeaderTitle(pathname: string) {
  return (
    dashboardNavItems.find((item) => item.isActive(pathname))?.label ??
    "Dashboard"
  );
}
