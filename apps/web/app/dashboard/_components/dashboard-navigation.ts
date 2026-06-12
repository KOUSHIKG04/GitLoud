import { GithubIconIcon } from "@repo/ui/components/icons/logos-github-icon";
import type { ComponentType } from "react";
import { GitBranch, History, KeyRound, LayoutDashboard } from "lucide-react";

export type DashboardSidebarItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  requiresPro?: boolean;
  isActive: (pathname: string) => boolean;
};

export const dashboardOptions: DashboardSidebarItem[] = [
  {
    label: "Quick Generate",
    href: "/dashboard",
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "GitHub Integration",
    href: "/dashboard/github-activity",
    icon: GitBranch,
    requiresPro: true,
    isActive: (pathname) => pathname.startsWith("/dashboard/github-activity"),
  },
];

export const secondaryNavigationItems: DashboardSidebarItem[] = [
  {
    label: "Generations",
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
    requiresPro: true,
    isActive: (pathname) =>
      pathname.startsWith("/dashboard/settings/github-app"),
  },
  {
    label: "My API Key",
    href: "/dashboard/settings/api-key",
    icon: KeyRound,
    requiresPro: true,
    isActive: (pathname) => pathname.startsWith("/dashboard/settings/api-key"),
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
