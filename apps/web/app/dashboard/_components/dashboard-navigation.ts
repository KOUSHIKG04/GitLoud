import {
  GitBranch,
  History,
  KeyRound,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export type DashboardSidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

export const dashboardOptions: DashboardSidebarItem[] = [
  {
    label: "Free",
    href: "/dashboard",
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "Paid",
    href: "/dashboard/github-activity",
    icon: GitBranch,
    isActive: (pathname) =>
      pathname.startsWith("/dashboard/github-activity"),
  },
];

export const secondaryNavigationItems: DashboardSidebarItem[] = [
  {
    label: "History",
    href: "/dashboard/history",
    icon: History,
    isActive: (pathname) => pathname.startsWith("/dashboard/history"),
  },
];

export const settingsOptions: DashboardSidebarItem[] = [
  {
    label: "GitHub App",
    href: "/dashboard/settings/github-app",
    icon: GitBranch,
    isActive: (pathname) =>
      pathname.startsWith("/dashboard/settings/github-app"),
  },
  {
    label: "My API Key",
    href: "/dashboard/settings/api-key",
    icon: KeyRound,
    isActive: (pathname) =>
      pathname.startsWith("/dashboard/settings/api-key"),
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
