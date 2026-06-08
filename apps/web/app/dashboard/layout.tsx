import { ProfileSync } from "@/components/auth/ProfileSync";
import { DashboardShell } from "./_components/dashboard-shell";

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
