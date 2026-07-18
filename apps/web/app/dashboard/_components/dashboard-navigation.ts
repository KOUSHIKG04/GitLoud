import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import type { ComponentType } from "react";
import {
  GitBranch,
  History,
  UserKey,
  LayoutDashboard,
  Share2,
} from "lucide-react";

export type DashboardSidebarItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
};

export const dashboardOptions: DashboardSidebarItem[] = [
  {
    label: "Quick Generation's",
    href: "/dashboard",
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "GitHub Integration",
    href: "/dashboard/github-activity",
    icon: GitBranch,
    isActive: (pathname) => pathname.startsWith("/dashboard/github-activity"),
  },
];

export const secondaryNavigationItems: DashboardSidebarItem[] = [
  {
    label: "Generation's History",
    href: "/dashboard/history",
    icon: History,
    isActive: (pathname) => pathname.startsWith("/dashboard/history"),
  },
];

export const settingsOptions: DashboardSidebarItem[] = [
  {
    label: "GitHub App",
    href: "/dashboard/settings/github-app",
    icon: GithubIconIcon,
    isActive: (pathname) =>
      pathname.startsWith("/dashboard/settings/github-app"),
  },
  {
    label: "My API Key",
    href: "/dashboard/settings/api-key",
    icon: UserKey,
    isActive: (pathname) => pathname.startsWith("/dashboard/settings/api-key"),
  },
  {
    label: "Social Accounts",
    href: "/dashboard/settings/social",
    icon: Share2,
    isActive: (pathname) => pathname.startsWith("/dashboard/settings/social"),
  },
];

export function getDashboardHeaderTitle(pathname: string) {
  const activeDashboardOption = dashboardOptions.find((item) =>
    item.isActive(pathname),
  );

  if (activeDashboardOption) {
    return `Dashboard > ${activeDashboardOption.label}`;
  }

  const activeSettingsOption = settingsOptions.find((item) =>
    item.isActive(pathname),
  );

  if (activeSettingsOption) {
    return `Settings > ${activeSettingsOption.label}`;
  }

  const activeSecondaryItem = secondaryNavigationItems.find((item) =>
    item.isActive(pathname),
  );

  return activeSecondaryItem?.label ?? "Dashboard";
}
