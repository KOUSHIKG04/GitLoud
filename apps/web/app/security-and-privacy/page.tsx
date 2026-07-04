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

export default function SecurityPage() {
  return (
    <main className="min-h-dvh text-foreground">
      <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
        <Header />
        <SecurityPrivacyContent />
      </div>
      <Footer />
    </main>
  );
}
