import { ProfileSync } from "@/components/auth/ProfileSync";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProfileSync />
      {children}
    </>
  );
}
