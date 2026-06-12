import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  redirect("/dashboard/settings/github-app");
}
