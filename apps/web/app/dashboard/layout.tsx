import { ProfileSync } from "@/features/auth/components/profile-sync";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProfileSync />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
