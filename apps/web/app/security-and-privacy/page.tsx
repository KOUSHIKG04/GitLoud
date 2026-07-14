import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SecurityPrivacyContent } from "./_components/security-privacy-content";

export const metadata: Metadata = {
  title: "Security & Privacy",
  description:
    "Security, privacy, and trust information for GitLoud private repository access.",
  alternates: {
    canonical: "/security-and-privacy",
  },
};

type SecurityPageSearchParams = {
  tab?: string;
};

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<SecurityPageSearchParams>;
}) {
  const { tab } = await searchParams;
  const initialTab = tab === "privacy" ? "privacy" : "security";

  return (
    <main className="min-h-dvh text-foreground">
      <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
        <Header />
        <SecurityPrivacyContent initialTab={initialTab} />
      </div>
      <Footer />
    </main>
  );
}
