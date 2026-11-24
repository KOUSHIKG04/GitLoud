import { ProfileSync } from "@/features/auth/components/profile-sync";
import { BackendWakeScreen } from "@/features/dashboard/components/backend-wake-screen";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProfileSync />
      <BackendWakeScreen />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
